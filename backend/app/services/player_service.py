"""Player detail service for fetching complete player information."""

from typing import Any

from config.constants import MENS_LEAGUE, WOMENS_LEAGUE, LeagueCategory

from ..db.sqlite import execute_query
from ..schemas.player import PlayerDetail, PlayerSeasonStats, ShotAttempt, ShotChartData
from .stats_calculator import (
    calculate_advanced_stats,
    calculate_league_comparison,
    calculate_league_specific_stats,
    calculate_team_context_stats,
)
from .team_service import get_team_stats


def _get_league_distributions(league: str, season: str) -> dict[str, Any] | None:
    """
    Get league averages and distributions for PPG, RPG, APG, and TS% for a given season.

    Args:
        league: League name (usports, ccaa, cebl, hoopqueens)
        season: Season identifier (format varies by league)

    Returns:
        Dict with keys: ppg, rpg, apg, ts_pct (averages) and
        ppg_dist, rpg_dist, apg_dist, ts_pct_dist (distributions)
    """
    league = league.lower()

    if league == "cebl":
        # CEBL stores season as integer (e.g., 2024)
        query = """
            SELECT
                CAST(points AS REAL) / games_played as ppg,
                CAST(rebounds AS REAL) / games_played as rpg,
                CAST(assists AS REAL) / games_played as apg,
                CAST(points AS REAL) as total_points,
                CAST(field_goals_attempted AS REAL) as total_fga,
                CAST(free_throws_attempted AS REAL) as total_fta
            FROM players
            WHERE games_played > 5 AND season = ?
        """
        try:
            season_int = int(season)
        except (ValueError, TypeError):
            return None
        rows = execute_query(league, query, (season_int,))

    elif league in ["usports", "ccaa"]:
        # U SPORTS/CCAA stores season as string (e.g., "2024-25")
        query = """
            SELECT
                CAST(total_points AS REAL) / games_played as ppg,
                CAST(total_rebounds AS REAL) / games_played as rpg,
                CAST(assists AS REAL) / games_played as apg,
                CAST(total_points AS REAL) as total_points,
                CAST(field_goal_attempted AS REAL) as total_fga,
                CAST(free_throws_attempted AS REAL) as total_fta
            FROM player_stats
            WHERE games_played > 5 AND season = ? AND season_type = 'regular'
        """
        rows = execute_query(league, query, (season,))

    elif league == "hoopqueens":
        # HoopQueens stores season as integer (e.g., 2025)
        query = """
            SELECT
                pb.player_id,
                AVG(pb.points) as ppg,
                AVG(pb.total_rebounds) as rpg,
                AVG(pb.assists) as apg,
                SUM(pb.points) as total_points,
                SUM(pb.field_goals_attempted) as total_fga,
                SUM(pb.free_throws_attempted) as total_fta,
                COUNT(DISTINCT pb.game_id) as games_played
            FROM playerboxscore pb
            JOIN game g ON pb.game_id = g.id
            WHERE g.season = ?
            GROUP BY pb.player_id
            HAVING games_played > 5
        """
        try:
            season_int = int(season)
        except (ValueError, TypeError):
            return None
        rows = execute_query(league, query, (season_int,))
    else:
        return None

    if not rows:
        return None

    # Extract distributions
    ppg_dist = [float(row.get("ppg", 0) or 0) for row in rows]
    rpg_dist = [float(row.get("rpg", 0) or 0) for row in rows]
    apg_dist = [float(row.get("apg", 0) or 0) for row in rows]

    # Calculate TS% for each player and build distribution
    ts_pct_dist = []
    for row in rows:
        total_points = row.get("total_points", 0) or 0
        total_fga = row.get("total_fga", 0) or 0
        total_fta = row.get("total_fta", 0) or 0

        ts_denominator = 2 * (total_fga + 0.44 * total_fta)
        if ts_denominator > 0:
            ts_pct = total_points / ts_denominator
            ts_pct_dist.append(float(ts_pct))

    # Calculate averages
    avg_ppg = sum(ppg_dist) / len(ppg_dist) if ppg_dist else 0
    avg_rpg = sum(rpg_dist) / len(rpg_dist) if rpg_dist else 0
    avg_apg = sum(apg_dist) / len(apg_dist) if apg_dist else 0
    avg_ts_pct = sum(ts_pct_dist) / len(ts_pct_dist) if ts_pct_dist else None

    return {
        "ppg": float(avg_ppg),
        "rpg": float(avg_rpg),
        "apg": float(avg_apg),
        "ts_pct": float(avg_ts_pct) if avg_ts_pct is not None else None,
        "ppg_dist": ppg_dist,
        "rpg_dist": rpg_dist,
        "apg_dist": apg_dist,
        "ts_pct_dist": ts_pct_dist if ts_pct_dist else None,
    }


def _get_league_averages(league: str, season: str) -> dict[str, float | None] | None:
    """
    Get league averages for PPG, RPG, APG, and TS% for a given season.

    DEPRECATED: Use _get_league_distributions() for new code to get percentiles.

    Args:
        league: League name (usports, ccaa, cebl, hoopqueens)
        season: Season identifier (format varies by league)

    Returns:
        Dict with keys: ppg, rpg, apg, ts_pct (or None if not calculable)
    """
    result = _get_league_distributions(league, season)
    if not result:
        return None

    return {
        "ppg": result["ppg"],
        "rpg": result["rpg"],
        "apg": result["apg"],
        "ts_pct": result["ts_pct"],
    }


async def get_player_details(league: str, player_id: str) -> PlayerDetail | None:
    """
    Get detailed player information including stats across all seasons.

    Args:
        league: League name (usports, ccaa, cebl, hoopqueens)
        player_id: Player identifier (format varies by league)

    Returns:
        PlayerDetail object or None if not found
    """
    import asyncio

    league = league.lower()

    if league in ["usports", "ccaa"]:
        return await asyncio.to_thread(_get_usports_ccaa_details, league, player_id)
    elif league == "cebl":
        return await asyncio.to_thread(_get_cebl_details, player_id)
    elif league == "hoopqueens":
        return await asyncio.to_thread(_get_hoopqueens_details, player_id)

    return None


def _get_usports_ccaa_details(league: str, player_id: str) -> PlayerDetail | None:
    """Get U SPORTS/CCAA player details."""
    # player_id format: "E.Shadkami_Toronto_York_usports" (firstname.lastname_school1_school2_league)
    try:
        # Split by underscore and extract components
        parts = player_id.split("_")
        if len(parts) < 2:
            return None

        # First part is "firstname.lastname"
        name_part = parts[0]
        if "." not in name_part:
            return None

        firstname_initial, last_name = name_part.split(".", 1)

        # Remaining parts are schools and league (last element is league)
        # We don't need schools anymore since we're querying by name only
    except Exception:
        return None

    # Get all seasons for this player (same firstname_initial, last_name across ALL schools)
    query = """
        SELECT
            season,
            season_type,
            school as team,
            games_played,
            games_started,
            total_points,
            total_rebounds,
            offensive_rebounds,
            defensive_rebounds,
            assists,
            field_goal_made,
            field_goal_attempted,
            field_goal_percentage,
            three_pointers_made,
            three_pointers_attempted,
            three_pointers_percentage,
            free_throws_made,
            free_throws_attempted,
            free_throws_percentage,
            steals,
            blocks,
            turnovers,
            personal_fouls,
            minutes_played,
            league,
            disqualifications,
            assist_to_turnover_ratio
        FROM player_stats
        WHERE firstname_initial = ? AND last_name = ?
        ORDER BY season DESC, season_type ASC
    """

    rows = execute_query(league, query, (firstname_initial, last_name))

    if not rows:
        return None

    # Determine league category from the first record
    league_category: LeagueCategory | None = None
    gender_from_db = rows[0].get("league")
    if gender_from_db:
        league_category = MENS_LEAGUE if gender_from_db == "mens" else WOMENS_LEAGUE  # type: ignore

    # Convert to PlayerSeasonStats with enhanced metrics
    seasons = []
    for row in rows:
        gp = row.get("games_played") or 1  # Avoid division by zero

        # Calculate advanced stats
        advanced_stats = calculate_advanced_stats(row, league)

        # Get team stats for context
        team_stats = get_team_stats(league, row["team"], row["season"])

        # Prepare per-game stats dict for team context calculation
        player_pg_stats = {
            "ppg": row["total_points"] / gp if row.get("total_points") else 0,
            "rpg": row["total_rebounds"] / gp if row.get("total_rebounds") else 0,
            "apg": row["assists"] / gp if row.get("assists") else 0,
            "spg": row["steals"] / gp if row.get("steals") else 0,
            "bpg": row["blocks"] / gp if row.get("blocks") else 0,
            "mpg": row["minutes_played"] / gp if row.get("minutes_played") else 0,
            "field_goal_attempted": row.get("field_goal_attempted", 0) / gp,
            "free_throws_attempted": row.get("free_throws_attempted", 0) / gp,
            "turnovers": row.get("turnovers", 0) / gp,
            "games_played": gp,
        }

        # Calculate team context stats
        team_context, usage_rate = calculate_team_context_stats(player_pg_stats, team_stats, league)
        if usage_rate is not None:
            advanced_stats.usage_rate = usage_rate

        # Calculate playoff performance delta for this season
        playoff_delta = None
        if row.get("season_type") == "playoffs":
            # Find corresponding regular season stats for the same season year
            current_season_year = row["season"]
            regular_season_row = next(
                (r for r in rows if r["season"] == current_season_year and r.get("season_type") == "regular"),
                None,
            )

            if regular_season_row:
                reg_gp = regular_season_row.get("games_played") or 1
                playoff_gp = row.get("games_played") or 1

                # Calculate deltas (playoff - regular season)
                playoff_delta = {
                    "ppg": (
                        (row.get("total_points") or 0) / playoff_gp
                        - (regular_season_row.get("total_points") or 0) / reg_gp
                    ),
                    "rpg": (
                        (row.get("total_rebounds") or 0) / playoff_gp
                        - (regular_season_row.get("total_rebounds") or 0) / reg_gp
                    ),
                    "apg": ((row.get("assists") or 0) / playoff_gp - (regular_season_row.get("assists") or 0) / reg_gp),
                    "fg_pct": (
                        (row.get("field_goal_percentage") or 0) - (regular_season_row.get("field_goal_percentage") or 0)
                    ),
                    "games_played": playoff_gp,
                }

        # Calculate league-specific stats
        league_specific = calculate_league_specific_stats(league, player_stats=row, playoff_delta=playoff_delta)

        # Calculate league comparison (player vs league average) - only for regular season
        league_comparison = None
        if row.get("season_type") == "regular":
            league_data = _get_league_distributions(league, row["season"])
            if league_data and league_data["ppg"] and league_data["rpg"] and league_data["apg"]:
                player_ppg = player_pg_stats["ppg"]
                player_rpg = player_pg_stats["rpg"]
                player_apg = player_pg_stats["apg"]
                player_ts_pct = advanced_stats.true_shooting_pct

                league_comparison = calculate_league_comparison(
                    player_ppg=player_ppg,
                    player_rpg=player_rpg,
                    player_apg=player_apg,
                    player_ts_pct=player_ts_pct,
                    league_avg_ppg=league_data["ppg"],
                    league_avg_rpg=league_data["rpg"],
                    league_avg_apg=league_data["apg"],
                    league_avg_ts_pct=league_data["ts_pct"],
                    league_ppg_distribution=league_data.get("ppg_dist"),
                    league_rpg_distribution=league_data.get("rpg_dist"),
                    league_apg_distribution=league_data.get("apg_dist"),
                    league_ts_pct_distribution=league_data.get("ts_pct_dist"),
                )

        season_stats = PlayerSeasonStats(
            season=row["season"],
            season_type=row.get("season_type"),
            team=row["team"],
            # Core counting stats
            games_played=row.get("games_played"),
            games_started=row.get("games_started"),
            total_minutes=row.get("minutes_played"),
            minutes_per_game=round(row["minutes_played"] / gp, 1) if row.get("minutes_played") else None,
            # Scoring (totals)
            total_points=row.get("total_points"),
            total_field_goals_made=row.get("field_goal_made"),
            total_field_goals_attempted=row.get("field_goal_attempted"),
            total_three_pointers_made=row.get("three_pointers_made"),
            total_three_pointers_attempted=row.get("three_pointers_attempted"),
            total_free_throws_made=row.get("free_throws_made"),
            total_free_throws_attempted=row.get("free_throws_attempted"),
            # Scoring (per game)
            points_per_game=round(row["total_points"] / gp, 1) if row.get("total_points") else None,
            field_goal_percentage=row.get("field_goal_percentage", 0) / 100
            if row.get("field_goal_percentage") is not None
            else None,
            three_point_percentage=row.get("three_pointers_percentage", 0) / 100
            if row.get("three_pointers_percentage") is not None
            else None,
            free_throw_percentage=row.get("free_throws_percentage", 0) / 100
            if row.get("free_throws_percentage") is not None
            else None,
            # Rebounds (totals)
            total_rebounds=row.get("total_rebounds"),
            total_offensive_rebounds=row.get("offensive_rebounds"),
            total_defensive_rebounds=row.get("defensive_rebounds"),
            # Rebounds (per game)
            rebounds_per_game=round(row["total_rebounds"] / gp, 1) if row.get("total_rebounds") else None,
            offensive_rebounds_per_game=round(row["offensive_rebounds"] / gp, 1)
            if row.get("offensive_rebounds")
            else None,
            defensive_rebounds_per_game=round(row["defensive_rebounds"] / gp, 1)
            if row.get("defensive_rebounds")
            else None,
            # Playmaking & Defense (totals)
            total_assists=row.get("assists"),
            total_steals=row.get("steals"),
            total_blocks=row.get("blocks"),
            total_turnovers=row.get("turnovers"),
            total_personal_fouls=row.get("personal_fouls"),
            # Playmaking & Defense (per game)
            assists_per_game=round(row["assists"] / gp, 1) if row.get("assists") else None,
            steals_per_game=round(row["steals"] / gp, 1) if row.get("steals") else None,
            blocks_per_game=round(row["blocks"] / gp, 1) if row.get("blocks") else None,
            turnovers_per_game=round(row["turnovers"] / gp, 1) if row.get("turnovers") else None,
            personal_fouls_per_game=round(row["personal_fouls"] / gp, 1) if row.get("personal_fouls") else None,
            # Enhanced stats
            advanced_stats=advanced_stats,
            team_context=team_context,
            league_specific=league_specific,
            league_comparison=league_comparison,
        )
        seasons.append(season_stats)

    # Calculate career stats (aggregate all seasons)
    career_stats = _calculate_career_stats(rows, league)

    return PlayerDetail(
        player_id=player_id,
        full_name=f"{firstname_initial}. {last_name}",
        league_category=league_category,
        league=league,
        position=None,  # Not available in player_stats table
        seasons=seasons,
        career_stats=career_stats,
        nationality=None,  # Not available in U SPORTS/CCAA DB
        birth_date=None,  # Not available in U SPORTS/CCAA DB
        age=None,  # Not available in U SPORTS/CCAA DB
        photo_url=None,  # Not available in U SPORTS/CCAA DB
        current_team=seasons[0].team if seasons else None,  # Most recent team
    )


def _get_cebl_details(player_id: str) -> PlayerDetail | None:
    """Get CEBL player details."""
    # Get all seasons for this player
    query = """
        SELECT
            season,
            full_name,
            team_name_en as team,
            position,
            nationality,
            birth_date,
            age,
            photo_url,
            games_played,
            CAST(points AS REAL) as points,
            CAST(rebounds AS REAL) as rebounds,
            CAST(offensive_rebounds AS REAL) as offensive_rebounds,
            CAST(defensive_rebounds AS REAL) as defensive_rebounds,
            CAST(assists AS REAL) as assists,
            CAST(field_goals_made AS REAL) as field_goals_made,
            CAST(field_goals_attempted AS REAL) as field_goals_attempted,
            CAST(field_goal_percentage AS REAL) as field_goal_percentage,
            CAST(three_points_made AS REAL) as three_points_made,
            CAST(three_points_attempted AS REAL) as three_points_attempted,
            CAST(three_point_percentage AS REAL) as three_point_percentage,
            CAST(free_throws_made AS REAL) as free_throws_made,
            CAST(free_throws_attempted AS REAL) as free_throws_attempted,
            CAST(free_throw_percentage AS REAL) as free_throw_percentage,
            CAST(steals AS REAL) as steals,
            CAST(blocks AS REAL) as blocks,
            CAST(turnovers AS REAL) as turnovers,
            CAST(fouls AS REAL) as fouls,
            CAST(minutes AS REAL) as minutes,
            CAST(double_doubles AS INTEGER) as double_doubles,
            CAST(triple_doubles AS INTEGER) as triple_doubles,
            CAST(target_scores AS INTEGER) as target_scores
        FROM players
        WHERE player_id = ?
        ORDER BY season DESC
    """

    rows = execute_query("cebl", query, (int(player_id),))

    if not rows:
        return None

    full_name = rows[0]["full_name"]
    position = rows[0].get("position")

    # Extract and validate biographical data from first row
    nationality = rows[0].get("nationality")
    birth_date = rows[0].get("birth_date")
    age = int(rows[0]["age"]) if rows[0].get("age") else None
    photo_url_raw = rows[0].get("photo_url")

    # Validate photo URL (must be valid HTTP/HTTPS URL)
    photo_url = None
    if photo_url_raw and isinstance(photo_url_raw, str) and photo_url_raw.strip():
        if photo_url_raw.startswith(("http://", "https://")):
            photo_url = photo_url_raw.strip()

    # Get current team (most recent season)
    current_team = rows[0].get("team")

    # Get game-level aggregates per season for advanced metrics
    game_stats_query = """
        SELECT
            pb.season,
            SUM(pb.two_point_field_goals_made) as total_2pt_made,
            SUM(pb.two_point_field_goals_attempted) as total_2pt_attempted,
            SUM(pb.second_chance_points) as total_second_chance_points,
            SUM(pb.fast_break_points) as total_fast_break_points,
            SUM(pb.points_in_the_paint) as total_points_in_paint,
            SUM(pb.fouls_drawn) as total_fouls_drawn,
            AVG(pb.plus_minus) as avg_plus_minus,
            COUNT(DISTINCT pb.game_id) as boxscore_games
        FROM player_boxscores pb
        WHERE pb.player_name = ?
        GROUP BY pb.season
        ORDER BY pb.season DESC
    """

    game_stats_rows = execute_query("cebl", game_stats_query, (full_name,))

    # Create a mapping of season -> game stats for easy lookup
    game_stats_by_season = {}
    for game_row in game_stats_rows:
        season_key = str(game_row["season"])
        game_stats_by_season[season_key] = game_row

    # Convert to PlayerSeasonStats with enhanced metrics
    seasons = []
    for row in rows:
        gp = row.get("games_played") or 1

        # Calculate advanced stats
        advanced_stats = calculate_advanced_stats(row, "cebl")

        # Get team stats for context
        team_stats = get_team_stats("cebl", row["team"], str(row["season"]))

        # Prepare stats dict for team context calculation (expects per-game values)
        player_pg_stats = {
            "ppg": row["points"] / gp if row.get("points") else 0,
            "rpg": row["rebounds"] / gp if row.get("rebounds") else 0,
            "apg": row["assists"] / gp if row.get("assists") else 0,
            "spg": row["steals"] / gp if row.get("steals") else 0,
            "bpg": row["blocks"] / gp if row.get("blocks") else 0,
            "mpg": row["minutes"] / gp if row.get("minutes") else 0,
            "fga_pg": row.get("field_goals_attempted", 0) / gp,
            "fta_pg": row.get("free_throws_attempted", 0) / gp,
            "tov_pg": row.get("turnovers", 0) / gp,
            "games_played": gp,
        }

        # Calculate team context stats
        team_context, usage_rate = calculate_team_context_stats(player_pg_stats, team_stats, "cebl")
        if usage_rate is not None:
            advanced_stats.usage_rate = usage_rate

        # Get game-level stats for this season
        season_key = str(row["season"])
        game_aggregates = game_stats_by_season.get(season_key)

        # Calculate league-specific stats (CEBL has unique stats)
        league_specific = calculate_league_specific_stats("cebl", player_stats=row, game_aggregates=game_aggregates)

        # Calculate league comparison (player vs league average)
        league_comparison = None
        league_data = _get_league_distributions("cebl", str(row["season"]))
        if league_data and league_data["ppg"] and league_data["rpg"] and league_data["apg"]:
            player_ppg = player_pg_stats["ppg"]
            player_rpg = player_pg_stats["rpg"]
            player_apg = player_pg_stats["apg"]
            player_ts_pct = advanced_stats.true_shooting_pct

            league_comparison = calculate_league_comparison(
                player_ppg=player_ppg,
                player_rpg=player_rpg,
                player_apg=player_apg,
                player_ts_pct=player_ts_pct,
                league_avg_ppg=league_data["ppg"],
                league_avg_rpg=league_data["rpg"],
                league_avg_apg=league_data["apg"],
                league_avg_ts_pct=league_data["ts_pct"],
                league_ppg_distribution=league_data.get("ppg_dist"),
                league_rpg_distribution=league_data.get("rpg_dist"),
                league_apg_distribution=league_data.get("apg_dist"),
                league_ts_pct_distribution=league_data.get("ts_pct_dist"),
            )

        season_stats = PlayerSeasonStats(
            season=str(row["season"]),
            team=row["team"],
            # Core counting stats
            games_played=row.get("games_played"),
            games_started=None,  # Not available in CEBL data
            total_minutes=int(row.get("minutes", 0)) if row.get("minutes") else None,
            minutes_per_game=round(row["minutes"] / gp, 1) if row.get("minutes") else None,
            # Scoring (totals)
            total_points=int(float(row["points"])) if row.get("points") else None,
            total_field_goals_made=int(float(row["field_goals_made"])) if row.get("field_goals_made") else None,
            total_field_goals_attempted=int(float(row["field_goals_attempted"]))
            if row.get("field_goals_attempted")
            else None,
            total_three_pointers_made=int(float(row["three_points_made"])) if row.get("three_points_made") else None,
            total_three_pointers_attempted=int(float(row["three_points_attempted"]))
            if row.get("three_points_attempted")
            else None,
            total_free_throws_made=int(float(row["free_throws_made"])) if row.get("free_throws_made") else None,
            total_free_throws_attempted=int(float(row["free_throws_attempted"]))
            if row.get("free_throws_attempted")
            else None,
            # Scoring (per game)
            points_per_game=round(row["points"] / gp, 1) if row.get("points") else None,
            field_goal_percentage=row.get("field_goal_percentage", 0) / 100
            if row.get("field_goal_percentage") is not None
            else None,
            three_point_percentage=row.get("three_point_percentage", 0) / 100
            if row.get("three_point_percentage") is not None
            else None,
            free_throw_percentage=row.get("free_throw_percentage", 0) / 100
            if row.get("free_throw_percentage") is not None
            else None,
            # Rebounds (totals)
            total_rebounds=int(float(row["rebounds"])) if row.get("rebounds") else None,
            total_offensive_rebounds=int(float(row["offensive_rebounds"])) if row.get("offensive_rebounds") else None,
            total_defensive_rebounds=int(float(row["defensive_rebounds"])) if row.get("defensive_rebounds") else None,
            # Rebounds (per game)
            rebounds_per_game=round(row["rebounds"] / gp, 1) if row.get("rebounds") else None,
            offensive_rebounds_per_game=round(row["offensive_rebounds"] / gp, 1)
            if row.get("offensive_rebounds")
            else None,
            defensive_rebounds_per_game=round(row["defensive_rebounds"] / gp, 1)
            if row.get("defensive_rebounds")
            else None,
            # Playmaking & Defense (totals)
            total_assists=int(float(row["assists"])) if row.get("assists") else None,
            total_steals=int(float(row["steals"])) if row.get("steals") else None,
            total_blocks=int(float(row["blocks"])) if row.get("blocks") else None,
            total_turnovers=int(float(row["turnovers"])) if row.get("turnovers") else None,
            total_personal_fouls=int(float(row["fouls"])) if row.get("fouls") else None,
            # Playmaking & Defense (per game)
            assists_per_game=round(row["assists"] / gp, 1) if row.get("assists") else None,
            steals_per_game=round(row["steals"] / gp, 1) if row.get("steals") else None,
            blocks_per_game=round(row["blocks"] / gp, 1) if row.get("blocks") else None,
            turnovers_per_game=round(row["turnovers"] / gp, 1) if row.get("turnovers") else None,
            personal_fouls_per_game=round(row["fouls"] / gp, 1) if row.get("fouls") else None,
            # Enhanced stats
            advanced_stats=advanced_stats,
            team_context=team_context,
            league_specific=league_specific,
            league_comparison=league_comparison,
        )
        seasons.append(season_stats)

    # Calculate career stats
    career_stats = _calculate_career_stats(rows, "cebl")

    return PlayerDetail(
        player_id=player_id,
        full_name=full_name,
        league_category=MENS_LEAGUE,
        league="cebl",
        position=position,
        seasons=seasons,
        career_stats=career_stats,
        nationality=nationality,
        birth_date=birth_date,
        age=age,
        photo_url=photo_url,
        current_team=current_team,
    )


def _get_hoopqueens_details(player_id: str) -> PlayerDetail | None:
    """Get HoopQueens player details."""
    # First get player info
    player_query = """
        SELECT
            p.id,
            p.media_name as full_name,
            p.position,
            p.season,
            p.nationality,
            p.birth_date,
            t.name as team
        FROM player p
        LEFT JOIN team t ON p.team_id = t.id
        WHERE p.id = ?
    """

    player_rows = execute_query("hoopqueens", player_query, (int(player_id),))

    if not player_rows:
        return None

    player_info = player_rows[0]

    # Extract biographical data
    nationality = player_info.get("nationality")
    birth_date = player_info.get("birth_date")
    current_team = player_info.get("team")

    # Get aggregated stats from playerboxscore for each season
    stats_query = """
        SELECT
            g.season,
            COUNT(DISTINCT pb.game_id) as games_played,
            SUM(pb.points) as total_points,
            SUM(pb.total_rebounds) as total_rebounds,
            SUM(pb.offensive_rebounds) as total_offensive_rebounds,
            SUM(pb.defensive_rebounds) as total_defensive_rebounds,
            SUM(pb.assists) as total_assists,
            SUM(pb.field_goals_made) as total_fg_made,
            SUM(pb.field_goals_attempted) as total_fg_attempted,
            SUM(pb.three_pointers_made) as total_3p_made,
            SUM(pb.three_pointers_attempted) as total_3p_attempted,
            SUM(pb.free_throws_made) as total_ft_made,
            SUM(pb.free_throws_attempted) as total_ft_attempted,
            SUM(pb.steals) as total_steals,
            SUM(pb.blocks) as total_blocks,
            SUM(pb.turnovers) as total_turnovers,
            SUM(pb.fouls) as total_fouls,
            SUM(pb.minutes) as total_minutes
        FROM playerboxscore pb
        JOIN game g ON pb.game_id = g.id
        WHERE pb.player_id = ?
        GROUP BY g.season
        ORDER BY g.season DESC
    """

    stats_rows = execute_query("hoopqueens", stats_query, (int(player_id),))

    # Get game-by-game logs for variance calculations (per season)
    game_logs_query = """
        SELECT
            g.season,
            pb.points,
            pb.plus_minus,
            pb.fouls_drawn,
            pb.field_goals_attempted
        FROM playerboxscore pb
        JOIN game g ON pb.game_id = g.id
        WHERE pb.player_id = ?
        ORDER BY g.season DESC, g.date DESC
    """

    game_logs = execute_query("hoopqueens", game_logs_query, (int(player_id),))

    # Group game logs by season for per-season calculations
    game_logs_by_season = {}
    for log in game_logs:
        season_key = str(log["season"])
        if season_key not in game_logs_by_season:
            game_logs_by_season[season_key] = []
        game_logs_by_season[season_key].append(log)

    # Convert to PlayerSeasonStats with enhanced metrics
    seasons = []
    for row in stats_rows:
        gp = row.get("games_played") or 1

        # Calculate percentages
        fg_pct = None
        if row.get("total_fg_attempted") and row["total_fg_attempted"] > 0:
            fg_pct = round(row["total_fg_made"] / row["total_fg_attempted"], 3)

        three_pct = None
        if row.get("total_3p_attempted") and row["total_3p_attempted"] > 0:
            three_pct = round(row["total_3p_made"] / row["total_3p_attempted"], 3)

        ft_pct = None
        if row.get("total_ft_attempted") and row["total_ft_attempted"] > 0:
            ft_pct = round(row["total_ft_made"] / row["total_ft_attempted"], 3)

        # Calculate advanced stats
        advanced_stats = calculate_advanced_stats(row, "hoopqueens")

        # Get team stats for context
        team_stats = get_team_stats("hoopqueens", player_info["team"], str(row["season"]))

        # Prepare per-game stats dict for team context calculation
        player_pg_stats = {
            "total_points": row.get("total_points", 0) / gp,
            "total_rebounds": row.get("total_rebounds", 0) / gp,
            "total_assists": row.get("total_assists", 0) / gp,
            "total_steals": row.get("total_steals", 0) / gp,
            "total_blocks": row.get("total_blocks", 0) / gp,
            "total_minutes": row.get("total_minutes", 0) / gp,
            "total_fg_attempted": row.get("total_fg_attempted", 0) / gp,
            "total_ft_attempted": row.get("total_ft_attempted", 0) / gp,
            "total_turnovers": row.get("total_turnovers", 0) / gp,
            "games_played": gp,
        }

        # Calculate team context stats
        team_context, usage_rate = calculate_team_context_stats(player_pg_stats, team_stats, "hoopqueens")
        if usage_rate is not None:
            advanced_stats.usage_rate = usage_rate

        # Get game logs for this season
        season_key = str(row["season"])
        season_game_logs = game_logs_by_season.get(season_key, [])

        # Calculate league-specific stats (HoopQueens has plus/minus, variance)
        league_specific = calculate_league_specific_stats("hoopqueens", game_logs=season_game_logs)

        # Calculate league comparison (player vs league average)
        league_comparison = None
        league_data = _get_league_distributions("hoopqueens", str(row["season"]))
        if league_data and league_data["ppg"] and league_data["rpg"] and league_data["apg"]:
            player_ppg = player_pg_stats["total_points"]
            player_rpg = player_pg_stats["total_rebounds"]
            player_apg = player_pg_stats["total_assists"]
            player_ts_pct = advanced_stats.true_shooting_pct

            league_comparison = calculate_league_comparison(
                player_ppg=player_ppg,
                player_rpg=player_rpg,
                player_apg=player_apg,
                player_ts_pct=player_ts_pct,
                league_avg_ppg=league_data["ppg"],
                league_avg_rpg=league_data["rpg"],
                league_avg_apg=league_data["apg"],
                league_avg_ts_pct=league_data["ts_pct"],
                league_ppg_distribution=league_data.get("ppg_dist"),
                league_rpg_distribution=league_data.get("rpg_dist"),
                league_apg_distribution=league_data.get("apg_dist"),
                league_ts_pct_distribution=league_data.get("ts_pct_dist"),
            )

        season_stats = PlayerSeasonStats(
            season=str(row["season"]),
            team=player_info["team"],
            # Core counting stats
            games_played=row.get("games_played"),
            games_started=None,  # Not tracked in HoopQueens
            total_minutes=int(row.get("total_minutes", 0)) if row.get("total_minutes") else None,
            minutes_per_game=round(row["total_minutes"] / gp, 1) if row.get("total_minutes") else None,
            # Scoring (totals)
            total_points=row.get("total_points"),
            total_field_goals_made=row.get("total_fg_made"),
            total_field_goals_attempted=row.get("total_fg_attempted"),
            total_three_pointers_made=row.get("total_3p_made"),
            total_three_pointers_attempted=row.get("total_3p_attempted"),
            total_free_throws_made=row.get("total_ft_made"),
            total_free_throws_attempted=row.get("total_ft_attempted"),
            # Scoring (per game)
            points_per_game=round(row["total_points"] / gp, 1) if row.get("total_points") else None,
            field_goal_percentage=fg_pct,
            three_point_percentage=three_pct,
            free_throw_percentage=ft_pct,
            # Rebounds (totals)
            total_rebounds=row.get("total_rebounds"),
            total_offensive_rebounds=row.get("total_offensive_rebounds"),
            total_defensive_rebounds=row.get("total_defensive_rebounds"),
            # Rebounds (per game)
            rebounds_per_game=round(row["total_rebounds"] / gp, 1) if row.get("total_rebounds") else None,
            offensive_rebounds_per_game=round(row["total_offensive_rebounds"] / gp, 1)
            if row.get("total_offensive_rebounds")
            else None,
            defensive_rebounds_per_game=round(row["total_defensive_rebounds"] / gp, 1)
            if row.get("total_defensive_rebounds")
            else None,
            # Playmaking & Defense (totals)
            total_assists=row.get("total_assists"),
            total_steals=row.get("total_steals"),
            total_blocks=row.get("total_blocks"),
            total_turnovers=row.get("total_turnovers"),
            total_personal_fouls=row.get("total_fouls"),
            # Playmaking & Defense (per game)
            assists_per_game=round(row["total_assists"] / gp, 1) if row.get("total_assists") else None,
            steals_per_game=round(row["total_steals"] / gp, 1) if row.get("total_steals") else None,
            blocks_per_game=round(row["total_blocks"] / gp, 1) if row.get("total_blocks") else None,
            turnovers_per_game=round(row["total_turnovers"] / gp, 1) if row.get("total_turnovers") else None,
            personal_fouls_per_game=round(row["total_fouls"] / gp, 1) if row.get("total_fouls") else None,
            # Enhanced stats
            advanced_stats=advanced_stats,
            team_context=team_context,
            league_specific=league_specific,
            league_comparison=league_comparison,
        )
        seasons.append(season_stats)

    # Calculate career stats
    career_stats = _calculate_career_stats_from_seasons(seasons) if seasons else []

    return PlayerDetail(
        player_id=player_id,
        full_name=player_info["full_name"],
        league_category=WOMENS_LEAGUE,
        league="hoopqueens",
        position=player_info.get("position"),
        seasons=seasons,
        career_stats=career_stats,
        nationality=nationality,
        birth_date=birth_date,
        age=None,  # Not available in HoopQueens DB
        photo_url=None,  # Not available in HoopQueens DB
        current_team=current_team,
    )


def _calculate_career_stats(rows: list[dict[str, Any]], league: str) -> list[PlayerSeasonStats]:
    """Calculate aggregated career statistics from raw database rows, grouped by season_type."""
    if not rows:
        return []

    # Group rows by season_type
    season_type_groups: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        season_type = row.get("season_type") or "regular"
        if season_type not in season_type_groups:
            season_type_groups[season_type] = []
        season_type_groups[season_type].append(row)

    career_stats_list = []

    # Calculate stats for each season_type
    for season_type, type_rows in season_type_groups.items():
        career_stat = _calculate_career_stats_for_type(type_rows, league, season_type)
        if career_stat:
            career_stats_list.append(career_stat)

    # Calculate grand total (all season types combined)
    total_career_stat = _calculate_career_stats_for_type(rows, league, "total")
    if total_career_stat:
        career_stats_list.append(total_career_stat)

    return career_stats_list


def _calculate_career_stats_for_type(
    rows: list[dict[str, Any]], league: str, season_type: str
) -> PlayerSeasonStats | None:
    """Calculate career stats for a specific season type."""
    if not rows:
        return None

    total_gp = sum(row.get("games_played") or 0 for row in rows)
    if total_gp == 0:
        return None

    if league in ["usports", "ccaa"]:
        total_points = sum(row.get("total_points") or 0 for row in rows)
        total_rebounds = sum(row.get("total_rebounds") or 0 for row in rows)
        total_offensive_rebounds = sum(row.get("offensive_rebounds") or 0 for row in rows)
        total_defensive_rebounds = sum(row.get("defensive_rebounds") or 0 for row in rows)
        total_assists = sum(row.get("assists") or 0 for row in rows)
        total_steals = sum(row.get("steals") or 0 for row in rows)
        total_blocks = sum(row.get("blocks") or 0 for row in rows)
        total_turnovers = sum(row.get("turnovers") or 0 for row in rows)
        total_fouls = sum(row.get("personal_fouls") or 0 for row in rows)
        total_minutes = sum(row.get("minutes_played") or 0 for row in rows)
        total_fg_made = sum(row.get("field_goal_made") or 0 for row in rows)
        total_fg_attempted = sum(row.get("field_goal_attempted") or 0 for row in rows)
        total_three_made = sum(row.get("three_pointers_made") or 0 for row in rows)
        total_three_attempted = sum(row.get("three_pointers_attempted") or 0 for row in rows)
        total_ft_made = sum(row.get("free_throws_made") or 0 for row in rows)
        total_ft_attempted = sum(row.get("free_throws_attempted") or 0 for row in rows)

        # Weighted average for percentages - divide by 100 to convert to decimal (0-1 scale)
        fg_pct = (
            sum((row.get("field_goal_percentage") or 0) / 100 * (row.get("games_played") or 0) for row in rows)
            / total_gp
        )
        three_pct = (
            sum((row.get("three_pointers_percentage") or 0) / 100 * (row.get("games_played") or 0) for row in rows)
            / total_gp
        )
        ft_pct = (
            sum((row.get("free_throws_percentage") or 0) / 100 * (row.get("games_played") or 0) for row in rows)
            / total_gp
        )

    elif league == "cebl":
        total_points = sum(row.get("points") or 0 for row in rows)
        total_rebounds = sum(row.get("rebounds") or 0 for row in rows)
        total_offensive_rebounds = sum(row.get("offensive_rebounds") or 0 for row in rows)
        total_defensive_rebounds = sum(row.get("defensive_rebounds") or 0 for row in rows)
        total_assists = sum(row.get("assists") or 0 for row in rows)
        total_steals = sum(row.get("steals") or 0 for row in rows)
        total_blocks = sum(row.get("blocks") or 0 for row in rows)
        total_turnovers = sum(row.get("turnovers") or 0 for row in rows)
        total_fouls = sum(row.get("fouls") or 0 for row in rows)
        total_minutes = sum(row.get("minutes") or 0 for row in rows)
        total_fg_made = sum(row.get("field_goals_made") or 0 for row in rows)
        total_fg_attempted = sum(row.get("field_goals_attempted") or 0 for row in rows)
        total_three_made = sum(row.get("three_points_made") or 0 for row in rows)
        total_three_attempted = sum(row.get("three_points_attempted") or 0 for row in rows)
        total_ft_made = sum(row.get("free_throws_made") or 0 for row in rows)
        total_ft_attempted = sum(row.get("free_throws_attempted") or 0 for row in rows)

        # Weighted average for percentages - divide by 100 to convert to decimal (0-1 scale)
        fg_pct = (
            sum((row.get("field_goal_percentage") or 0) / 100 * (row.get("games_played") or 0) for row in rows)
            / total_gp
        )
        three_pct = (
            sum((row.get("three_point_percentage") or 0) / 100 * (row.get("games_played") or 0) for row in rows)
            / total_gp
        )
        ft_pct = (
            sum((row.get("free_throw_percentage") or 0) / 100 * (row.get("games_played") or 0) for row in rows)
            / total_gp
        )

    else:
        return None

    # Set season label based on type
    season_label_map = {
        "regular": "Career - Regular Season",
        "playoffs": "Career - Playoffs",
        "championship": "Career - Championship",
        "total": "Career - Total",
    }
    season_label = season_label_map.get(season_type, f"Career - {season_type.title()}")

    return PlayerSeasonStats(
        season=season_label,
        season_type=season_type,
        team="All Teams",
        games_played=total_gp,
        # Total stats
        total_minutes=int(total_minutes) if total_minutes else None,
        total_points=int(total_points),
        total_rebounds=int(total_rebounds),
        total_offensive_rebounds=int(total_offensive_rebounds) if total_offensive_rebounds else None,
        total_defensive_rebounds=int(total_defensive_rebounds) if total_defensive_rebounds else None,
        total_assists=int(total_assists),
        total_steals=int(total_steals),
        total_blocks=int(total_blocks),
        total_turnovers=int(total_turnovers),
        total_personal_fouls=int(total_fouls) if total_fouls else None,
        total_field_goals_made=int(total_fg_made) if total_fg_made else None,
        total_field_goals_attempted=int(total_fg_attempted) if total_fg_attempted else None,
        total_three_pointers_made=int(total_three_made) if total_three_made else None,
        total_three_pointers_attempted=int(total_three_attempted) if total_three_attempted else None,
        total_free_throws_made=int(total_ft_made) if total_ft_made else None,
        total_free_throws_attempted=int(total_ft_attempted) if total_ft_attempted else None,
        # Per-game stats
        minutes_per_game=round(total_minutes / total_gp, 1) if total_minutes else None,
        points_per_game=round(total_points / total_gp, 1),
        rebounds_per_game=round(total_rebounds / total_gp, 1),
        offensive_rebounds_per_game=round(total_offensive_rebounds / total_gp, 1) if total_offensive_rebounds else None,
        defensive_rebounds_per_game=round(total_defensive_rebounds / total_gp, 1) if total_defensive_rebounds else None,
        assists_per_game=round(total_assists / total_gp, 1),
        steals_per_game=round(total_steals / total_gp, 1),
        blocks_per_game=round(total_blocks / total_gp, 1),
        turnovers_per_game=round(total_turnovers / total_gp, 1),
        personal_fouls_per_game=round(total_fouls / total_gp, 1) if total_fouls else None,
        # Percentages
        field_goal_percentage=round(fg_pct, 3) if fg_pct else None,
        three_point_percentage=round(three_pct, 3) if three_pct else None,
        free_throw_percentage=round(ft_pct, 3) if ft_pct else None,
    )


def _calculate_career_stats_from_seasons(
    seasons: list[PlayerSeasonStats],
) -> list[PlayerSeasonStats]:
    """Calculate career stats from already-calculated season stats."""
    if not seasons:
        return []

    total_gp = sum(s.games_played or 0 for s in seasons)
    if total_gp == 0:
        return []

    # Aggregate total stats
    sum_total_points = sum(s.total_points or 0 for s in seasons)
    sum_total_rebounds = sum(s.total_rebounds or 0 for s in seasons)
    sum_total_offensive_rebounds = sum(s.total_offensive_rebounds or 0 for s in seasons)
    sum_total_defensive_rebounds = sum(s.total_defensive_rebounds or 0 for s in seasons)
    sum_total_assists = sum(s.total_assists or 0 for s in seasons)
    sum_total_steals = sum(s.total_steals or 0 for s in seasons)
    sum_total_blocks = sum(s.total_blocks or 0 for s in seasons)
    sum_total_turnovers = sum(s.total_turnovers or 0 for s in seasons)
    sum_total_fouls = sum(s.total_personal_fouls or 0 for s in seasons)
    sum_total_minutes = sum(s.total_minutes or 0 for s in seasons)
    sum_total_fg_made = sum(s.total_field_goals_made or 0 for s in seasons)
    sum_total_fg_attempted = sum(s.total_field_goals_attempted or 0 for s in seasons)
    sum_total_three_made = sum(s.total_three_pointers_made or 0 for s in seasons)
    sum_total_three_attempted = sum(s.total_three_pointers_attempted or 0 for s in seasons)
    sum_total_ft_made = sum(s.total_free_throws_made or 0 for s in seasons)
    sum_total_ft_attempted = sum(s.total_free_throws_attempted or 0 for s in seasons)

    # Weighted averages for per-game stats
    total_ppg = sum((s.points_per_game or 0) * (s.games_played or 0) for s in seasons)
    total_rpg = sum((s.rebounds_per_game or 0) * (s.games_played or 0) for s in seasons)
    total_apg = sum((s.assists_per_game or 0) * (s.games_played or 0) for s in seasons)
    total_spg = sum((s.steals_per_game or 0) * (s.games_played or 0) for s in seasons)
    total_bpg = sum((s.blocks_per_game or 0) * (s.games_played or 0) for s in seasons)
    total_tpg = sum((s.turnovers_per_game or 0) * (s.games_played or 0) for s in seasons)
    total_mpg = sum((s.minutes_per_game or 0) * (s.games_played or 0) for s in seasons)

    total_fg_pct = sum((s.field_goal_percentage or 0) * (s.games_played or 0) for s in seasons)
    total_three_pct = sum((s.three_point_percentage or 0) * (s.games_played or 0) for s in seasons)
    total_ft_pct = sum((s.free_throw_percentage or 0) * (s.games_played or 0) for s in seasons)

    # For HoopQueens/CEBL which don't have season_type in DB, return single career total
    return [
        PlayerSeasonStats(
            season="Career - Total",
            season_type="total",
            team="All Teams",
            games_played=total_gp,
            # Total stats
            total_minutes=int(sum_total_minutes) if sum_total_minutes else None,
            total_points=int(sum_total_points),
            total_rebounds=int(sum_total_rebounds),
            total_offensive_rebounds=int(sum_total_offensive_rebounds) if sum_total_offensive_rebounds else None,
            total_defensive_rebounds=int(sum_total_defensive_rebounds) if sum_total_defensive_rebounds else None,
            total_assists=int(sum_total_assists),
            total_steals=int(sum_total_steals),
            total_blocks=int(sum_total_blocks),
            total_turnovers=int(sum_total_turnovers),
            total_personal_fouls=int(sum_total_fouls) if sum_total_fouls else None,
            total_field_goals_made=int(sum_total_fg_made) if sum_total_fg_made else None,
            total_field_goals_attempted=int(sum_total_fg_attempted) if sum_total_fg_attempted else None,
            total_three_pointers_made=int(sum_total_three_made) if sum_total_three_made else None,
            total_three_pointers_attempted=int(sum_total_three_attempted) if sum_total_three_attempted else None,
            total_free_throws_made=int(sum_total_ft_made) if sum_total_ft_made else None,
            total_free_throws_attempted=int(sum_total_ft_attempted) if sum_total_ft_attempted else None,
            # Per-game stats
            minutes_per_game=round(total_mpg / total_gp, 1) if total_mpg else None,
            points_per_game=round(total_ppg / total_gp, 1),
            rebounds_per_game=round(total_rpg / total_gp, 1),
            assists_per_game=round(total_apg / total_gp, 1),
            steals_per_game=round(total_spg / total_gp, 1) if total_spg else None,
            blocks_per_game=round(total_bpg / total_gp, 1) if total_bpg else None,
            turnovers_per_game=round(total_tpg / total_gp, 1) if total_tpg else None,
            # Percentages
            field_goal_percentage=round(total_fg_pct / total_gp, 3) if total_fg_pct else None,
            three_point_percentage=round(total_three_pct / total_gp, 3) if total_three_pct else None,
            free_throw_percentage=round(total_ft_pct / total_gp, 3) if total_ft_pct else None,
        )
    ]


def get_shot_chart_data(player_id: int):
    query = """
        SELECT
            p.player_id,
            p.full_name,
            pb.season,
            pb.period as quarter,
            pb.x,
            pb.y,
            pb.success as made,
            pb.action_type as shot_type
        FROM play_by_play pb
        JOIN players p ON pb.player_name = p.full_name AND pb.season = p.season
        WHERE p.player_id = ?
          AND pb.action_type IN ('2pt', '3pt')
          AND pb.x IS NOT NULL
          AND pb.y IS NOT NULL
        ORDER BY pb.season DESC, pb.period ASC
    """

    rows = execute_query("cebl", query, (player_id,))

    if not rows:
        return ShotChartData(player_id=player_id, full_name="", shots=[], seasons=[])

    player_id_val = rows[0]["player_id"]
    full_name = rows[0]["full_name"]

    shots = [
        ShotAttempt(
            x=float(row["x"]),
            y=float(row["y"]),
            made=bool(row["made"]),
            shot_type=row["shot_type"],
            quarter=row["quarter"],
            season=row["season"],
        )
        for row in rows
    ]

    seasons = sorted(set(row["season"] for row in rows), reverse=True)

    return ShotChartData(player_id=player_id_val, full_name=full_name, shots=shots, seasons=seasons)


def get_shot_chart_data_by_name(player_name: str):
    """
    Get shot chart data for a player by their full name.
    This is used when player_id is ambiguous (e.g., from play_by_play table where
    player_id is actually the jersey number for a specific game).

    Args:
        player_name: Full name of the player as it appears in the players table

    Returns:
        ShotChartData with all shot attempts for the player across all seasons
    """
    query = """
        SELECT
            p.player_id,
            p.full_name,
            pb.season,
            pb.period as quarter,
            pb.x,
            pb.y,
            pb.success as made,
            pb.action_type as shot_type
        FROM play_by_play pb
        JOIN players p ON pb.player_name = p.full_name AND pb.season = p.season
        WHERE p.full_name = ?
          AND pb.action_type IN ('2pt', '3pt')
          AND pb.x IS NOT NULL
          AND pb.y IS NOT NULL
        ORDER BY pb.season DESC, pb.period ASC
    """

    rows = execute_query("cebl", query, (player_name,))

    if not rows:
        # Return empty shot chart data with player name
        return ShotChartData(player_id=0, full_name=player_name, shots=[], seasons=[])

    player_id_val = rows[0]["player_id"]
    full_name = rows[0]["full_name"]

    shots = [
        ShotAttempt(
            x=float(row["x"]),
            y=float(row["y"]),
            made=bool(row["made"]),
            shot_type=row["shot_type"],
            quarter=row["quarter"],
            season=row["season"],
        )
        for row in rows
    ]

    seasons = sorted(set(row["season"] for row in rows), reverse=True)

    return ShotChartData(player_id=player_id_val, full_name=full_name, shots=shots, seasons=seasons)
