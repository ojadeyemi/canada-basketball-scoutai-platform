"""SQLite database connectors for league databases."""

import sqlite3
from pathlib import Path
from typing import Any

# Database paths
DB_DIR = Path(__file__).parent.parent.parent / "db"

LEAGUE_DBS = {
    "usports": DB_DIR / "usports.db",
    "ccaa": DB_DIR / "ccaa.db",
    "hoopqueens": DB_DIR / "hoopqueens.db",
    "cebl": DB_DIR / "cebl.db",
}


def get_db_connection(league: str) -> sqlite3.Connection:
    """
    Get a read-only connection to a league database.

    Args:
        league: League name (usports, ccaa, hoopqueens, cebl)

    Returns:
        SQLite connection

    Raises:
        ValueError: If league is not recognized
        FileNotFoundError: If database file doesn't exist
    """
    league = league.lower()
    if league not in LEAGUE_DBS:
        raise ValueError(f"Unknown league: {league}. Must be one of {list(LEAGUE_DBS.keys())}")

    db_path = LEAGUE_DBS[league]
    if not db_path.exists():
        raise FileNotFoundError(f"Database not found: {db_path}")

    # Open in read-only mode
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn


def execute_query(league: str, query: str, params: tuple = ()) -> list[dict[str, Any]]:
    """
    Execute a read-only SQL query on a league database.

    Args:
        league: League name
        query: SQL query (SELECT only)
        params: Query parameters (for parameterized queries)

    Returns:
        List of rows as dictionaries
    """
    if not query.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed")

    conn = get_db_connection(league)
    try:
        cursor = conn.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        return rows
    finally:
        conn.close()


def get_all_leagues() -> list[str]:
    """Get list of all available league names."""
    return [league for league, path in LEAGUE_DBS.items() if path.exists()]
