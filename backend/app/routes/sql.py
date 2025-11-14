"""Endpoint to run raw SQL queries and manage database operations."""

import ast
import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.db.sqlite import (
    get_database_schema,
)
from app.db.sqlite import (
    get_db_connection as get_sqlite_connection,
)
from app.schemas import LeagueType
from config.constants import DEFAULT_SEASON
from graph.nodes.stats_lookup import get_db_connection

router = APIRouter(prefix="/api/data", tags=["Data & SQL"])


def parse_sql_error(error_message: str) -> str:
    """
    Parse SQLite OperationalError and return user-friendly message.

    Handles common patterns:
    - near "X": syntax error
    - unrecognized token: "X"
    - incomplete input
    """
    error_str = str(error_message)

    # Pattern 1: near "X": syntax error
    match = re.search(r'near "([^"]+)":\s*syntax error', error_str)
    if match:
        token = match.group(1)
        return f"SQL syntax error near '{token}'"

    # Pattern 2: unrecognized token: "X"
    match = re.search(r'unrecognized token:\s*"([^"]+)"', error_str)
    if match:
        token = match.group(1)
        return f"Unrecognized token: '{token}'"

    # Pattern 3: incomplete input
    if "incomplete input" in error_str.lower():
        return "Incomplete SQL query - check for missing closing brackets or keywords"

    # Pattern 4: Extract from [SQL: ...] if available
    match = re.search(r"\[SQL:\s*([^\]]+)\]", error_str)
    if match:
        sql_snippet = match.group(1).strip()[:100]  # Limit to 100 chars
        return f"SQL error in query: {sql_snippet}"

    # Fallback: clean up the error message
    # Remove SQLAlchemy traceback URLs
    clean_msg = re.sub(r"\(Background on this error.*?\)", "", error_str)
    # Remove (sqlite3.OperationalError) prefix
    clean_msg = re.sub(r"\(sqlite3\.\w+\)\s*", "", clean_msg)
    # Remove [SQL: ...] block
    clean_msg = re.sub(r"\[SQL:.*?\]", "", clean_msg)

    return clean_msg.strip() or "SQL query error"


class SQLQueryInput(BaseModel):
    sql_query: str
    db_name: str


@router.post("/query")
async def run_sql_query(data: SQLQueryInput):
    """
    Execute a raw SQL query against a specified database.
    """
    try:
        db = get_db_connection(data.db_name)
        raw_results = db.run(data.sql_query, fetch="all", include_columns=True)

        if isinstance(raw_results, str):
            query_data = ast.literal_eval(raw_results)
        elif isinstance(raw_results, list):
            query_data = raw_results
        else:
            query_data = []

        return query_data
    except Exception as e:
        # Return both clean and raw error messages for better UX
        raw_error = str(e)
        clean_error = parse_sql_error(raw_error)
        raise HTTPException(
            status_code=400,
            detail={"message": clean_error, "raw_error": raw_error},
        )


@router.get("/schema/{league}")
async def get_schema(league: str):
    """
    Get database schema for autocomplete and type hints.
    Returns table names with column metadata.
    """
    try:
        schema = get_database_schema(league)
        return schema
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# === NEW ENDPOINTS FOR DATA EXPLORER ===


class TableMetadata(BaseModel):
    """Metadata for a database table."""

    name: str
    row_count: int
    requires_season: bool
    latest_season: Optional[str | int] = None
    available_seasons: list[str | int] = []
    columns: list[str]


class TableListResponse(BaseModel):
    """Response for listing tables."""

    league: str
    tables: list[TableMetadata]


@router.get("/{league}/tables", response_model=TableListResponse)
async def get_tables(league: str):
    """
    Get list of all tables in a league database with metadata.

    Args:
        league: League name (usports, ccaa, cebl, hoopqueens)

    Returns:
        List of tables with row counts and metadata
    """
    try:
        conn = get_sqlite_connection(league)
        try:
            cursor = conn.cursor()

            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
            table_names = [row[0] for row in cursor.fetchall()]

            tables = []
            for table_name in table_names:
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                row_count = cursor.fetchone()[0]

                # Get columns
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = [row[1] for row in cursor.fetchall()]

                # Check if table has season column
                has_season_column = "season" in columns

                # Get all available seasons if season column exists
                latest_season = None
                available_seasons = []
                if has_season_column:
                    try:
                        cursor.execute(f"SELECT DISTINCT season FROM {table_name} ORDER BY season DESC")
                        seasons = [row[0] for row in cursor.fetchall()]
                        available_seasons = seasons
                        latest_season = seasons[0] if seasons else DEFAULT_SEASON
                    except Exception:
                        latest_season = DEFAULT_SEASON

                # Always require season filter for all tables (default to latest season)
                tables.append(
                    TableMetadata(
                        name=table_name,
                        row_count=row_count,
                        requires_season=True,  # Always require season
                        latest_season=latest_season,
                        available_seasons=available_seasons,
                        columns=columns,
                    )
                )

            return TableListResponse(league=league, tables=tables)
        finally:
            conn.close()

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tables: {str(e)}")


class TableDataResponse(BaseModel):
    """Response for table data."""

    league: str
    table_name: str
    data: list[dict]
    columns: list[str]
    row_count: int
    filters_applied: dict


def _validate_table_name(cursor, table_name: str) -> str:
    """
    Validate and sanitize table name to prevent SQL injection.
    Returns the validated table name or raises HTTPException.
    """
    # Get list of valid tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    valid_tables = [row[0] for row in cursor.fetchall()]

    if table_name not in valid_tables:
        raise HTTPException(
            status_code=404, detail=f"Table '{table_name}' not found. Valid tables: {', '.join(valid_tables)}"
        )

    return table_name


def _convert_season_value(season: str, league: str) -> int | str:
    """
    Convert season to appropriate type based on league.
    CEBL uses integers, others use strings like '2024-25'.
    """
    if league == "cebl":
        try:
            return int(season)
        except ValueError:
            raise HTTPException(
                status_code=400, detail=f"Invalid season format for CEBL. Expected integer (e.g., 2024), got: {season}"
            )
    return season


@router.get("/{league}/{table_name}", response_model=TableDataResponse)
async def get_table_data(
    league: LeagueType,
    table_name: str,
    season: Optional[str] = Query(None, description="Season filter (required for large tables)"),
    limit: Optional[int] = Query(None, description="Limit number of rows returned"),
):
    """
    Get data from a specific table with optional filtering.

    Args:
        league: League name (usports, ccaa, cebl, hoopqueens)
        table_name: Name of the table to query
        season: Optional season filter (required for play_by_play)
        limit: Optional limit on rows returned

    Returns:
        Table data with columns and metadata
    """
    try:
        conn = get_sqlite_connection(league)
        try:
            cursor = conn.cursor()

            # Validate table name (SQL injection protection)
            validated_table = _validate_table_name(cursor, table_name)

            # Get columns
            cursor.execute(f"PRAGMA table_info({validated_table})")
            columns = [row[1] for row in cursor.fetchall()]

            # Build query
            query = f"SELECT * FROM {validated_table}"
            params = []
            filters_applied = {}

            # Apply season filter if provided and column exists
            has_season_column = "season" in columns
            if has_season_column and season:
                season_value = _convert_season_value(season, league)
                query += " WHERE season = ?"
                params.append(season_value)
                filters_applied["season"] = season

            # Apply limit if provided
            if limit:
                query += " LIMIT ?"
                params.append(limit)
                filters_applied["limit"] = limit

            # Execute query
            cursor.execute(query, params)
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

            return TableDataResponse(
                league=league,
                table_name=validated_table,
                data=rows,
                columns=columns,
                row_count=len(rows),
                filters_applied=filters_applied,
            )
        finally:
            conn.close()

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch table data: {str(e)}")
