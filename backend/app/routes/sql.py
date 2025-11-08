"""Endpoint to run raw SQL queries."""

import ast

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from graph.nodes.stats_lookup import get_db_connection

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])


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
        raise HTTPException(status_code=400, detail=str(e))
