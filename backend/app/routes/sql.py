"""Endpoint to run raw SQL queries."""

import ast
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.sqlite import get_database_schema
from graph.nodes.stats_lookup import get_db_connection

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])


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


@router.post("/run-sql")
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


@router.get("/schema/{db_name}")
async def get_schema(db_name: str):
    """
    Get database schema for autocomplete and type hints.
    Returns table names with column metadata.
    """
    try:
        schema = get_database_schema(db_name)
        return schema
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
