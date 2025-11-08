"""Team statistics service for fetching team-level data.

This module provides functions to query team statistics from
league databases, used for calculating player team context metrics.
"""

from typing import Any

from ..db.sqlite import execute_query


def get_team_stats(league: str, team: str, season: str) -> dict[str, Any] | None:
    """
    Get team statistics for a specific season.

    Args:
        league: League name (usports, ccaa, cebl, hoopqueens)
        team: Team name or ID
        season: Season identifier

    Returns:
        Dictionary with team per-game stats or None if not found
    """
    league = league.lower()

    if league in ["usports", "ccaa"]:
        return _get_usports_ccaa_team_stats(league, team, season)
    elif league == "cebl":
        return _get_cebl_team_stats(team, season)
    elif league == "hoopqueens":
        return _get_hoopqueens_team_stats(team, season)

    return None


def _get_usports_ccaa_team_stats(league: str, team: str, season: str) -> dict[str, Any] | None:
    """Get U SPORTS/CCAA team statistics."""
    query = """
        SELECT
            points_per_game as ppg,
            field_goal_attempted,
            free_throws_attempted,
            games_played,
            total_rebounds_per_game as rpg,
            assists_per_game as apg,
            turnovers_per_game as tov_per_game,
            steals_per_game as spg,
            blocks_per_game as bpg
        FROM team_stats
        WHERE team_name = ? AND season = ?
        LIMIT 1
    """

    rows = execute_query(league, query, (team, season))

    if not rows:
        return None

    row = rows[0]
    games_played = row.get("games_played", 1) or 1

    # Calculate per-game stats
    return {
        "ppg": row.get("ppg"),
        "fga_per_game": round(row.get("field_goal_attempted", 0) / games_played, 1)
        if row.get("field_goal_attempted")
        else None,
        "fta_per_game": round(row.get("free_throws_attempted", 0) / games_played, 1)
        if row.get("free_throws_attempted")
        else None,
        "rpg": row.get("rpg"),
        "apg": row.get("apg"),
        "tov_per_game": row.get("tov_per_game"),
        "spg": row.get("spg"),
        "bpg": row.get("bpg"),
    }


def _get_cebl_team_stats(team: str, season: str) -> dict[str, Any] | None:
    """Get CEBL team statistics."""
    query = """
        SELECT
            games_played,
            CAST(points_for AS REAL) as total_points,
            CAST(field_goals_attempted AS REAL) as total_fga,
            CAST(free_throws_attempted AS REAL) as total_fta,
            CAST(rebounds AS REAL) as total_rebounds,
            CAST(assists AS REAL) as total_assists,
            CAST(turn_overs AS REAL) as total_turnovers,
            CAST(steals AS REAL) as total_steals,
            CAST(blocks AS REAL) as total_blocks
        FROM teams
        WHERE name_en = ? AND season = ?
        LIMIT 1
    """

    rows = execute_query("cebl", query, (team, int(season)))

    if not rows:
        return None

    row = rows[0]
    games_played = row.get("games_played", 1) or 1

    # Extract values and convert to float (SQLite CAST may return strings)
    total_points = float(row.get("total_points") or 0)
    total_fga = float(row.get("total_fga") or 0)
    total_fta = float(row.get("total_fta") or 0)
    total_rebounds = float(row.get("total_rebounds") or 0)
    total_assists = float(row.get("total_assists") or 0)
    total_turnovers = float(row.get("total_turnovers") or 0)
    total_steals = float(row.get("total_steals") or 0)
    total_blocks = float(row.get("total_blocks") or 0)

    # Calculate per-game stats
    return {
        "ppg": round(total_points / games_played, 1) if total_points else None,
        "fga_per_game": round(total_fga / games_played, 1) if total_fga else None,
        "fta_per_game": round(total_fta / games_played, 1) if total_fta else None,
        "rpg": round(total_rebounds / games_played, 1) if total_rebounds else None,
        "apg": round(total_assists / games_played, 1) if total_assists else None,
        "tov_per_game": round(total_turnovers / games_played, 1) if total_turnovers else None,
        "spg": round(total_steals / games_played, 1) if total_steals else None,
        "bpg": round(total_blocks / games_played, 1) if total_blocks else None,
    }


def _get_hoopqueens_team_stats(team: str, season: str) -> dict[str, Any] | None:
    """Get HoopQueens team statistics by aggregating game box scores."""
    # First get team_id from team name
    team_query = """
        SELECT id FROM team WHERE name = ?
        LIMIT 1
    """

    team_rows = execute_query("hoopqueens", team_query, (team,))

    if not team_rows:
        return None

    team_id = team_rows[0]["id"]

    # Aggregate team box scores for the season
    stats_query = """
        SELECT
            COUNT(DISTINCT tb.game_id) as games_played,
            AVG(tb.final_score) as ppg,
            AVG(tb.field_goals_attempted) as fga_per_game,
            AVG(tb.free_throws_attempted) as fta_per_game,
            AVG(tb.total_rebounds) as rpg,
            AVG(tb.assists) as apg,
            AVG(tb.turnovers) as tov_per_game,
            AVG(tb.steals) as spg,
            AVG(tb.blocks) as bpg
        FROM teamboxscore tb
        JOIN game g ON tb.game_id = g.id
        WHERE tb.team_id = ? AND g.season = ?
    """

    stats_rows = execute_query("hoopqueens", stats_query, (team_id, int(season)))

    if not stats_rows or stats_rows[0]["games_played"] == 0:
        return None

    # Round averages
    stats = stats_rows[0]
    return {
        "ppg": round(stats["ppg"], 1) if stats.get("ppg") else None,
        "fga_per_game": round(stats["fga_per_game"], 1) if stats.get("fga_per_game") else None,
        "fta_per_game": round(stats["fta_per_game"], 1) if stats.get("fta_per_game") else None,
        "rpg": round(stats["rpg"], 1) if stats.get("rpg") else None,
        "apg": round(stats["apg"], 1) if stats.get("apg") else None,
        "tov_per_game": round(stats["tov_per_game"], 1) if stats.get("tov_per_game") else None,
        "spg": round(stats["spg"], 1) if stats.get("spg") else None,
        "bpg": round(stats["bpg"], 1) if stats.get("bpg") else None,
    }
