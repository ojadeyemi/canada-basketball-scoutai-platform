"""Statistical calculation utilities for player and team metrics.

This module provides pure functions for calculating advanced stats,
team context metrics, and league-specific statistics. All functions
are stateless and accept raw data inputs.
"""

from statistics import stdev
from typing import Any

from ..schemas.player import (
    AdvancedStats,
    LeagueComparison,
    LeagueSpecificStats,
    TeamContextStats,
)


def calculate_advanced_stats(
    player_stats: dict[str, Any], league: str
) -> AdvancedStats:
    """
    Calculate advanced statistical metrics for a player.

    Args:
        player_stats: Raw player statistics for a season
        league: League name (affects field names)

    Returns:
        AdvancedStats object with calculated metrics
    """
    # Extract stats based on league-specific field names
    if league in ["usports", "ccaa"]:
        points = player_stats.get("total_points", 0)
        fga = player_stats.get("field_goal_attempted", 0)
        fta = player_stats.get("free_throws_attempted", 0)
        fgm = player_stats.get("field_goal_made", 0)
        three_pm = player_stats.get("three_pointers_made", 0)
        assists = player_stats.get("assists", 0)
        turnovers = player_stats.get("turnovers", 0)
    elif league == "cebl":
        points = player_stats.get("points", 0) or 0
        fga = player_stats.get("field_goals_attempted", 0) or 0
        fta = player_stats.get("free_throws_attempted", 0) or 0
        fgm = player_stats.get("field_goals_made", 0) or 0
        three_pm = player_stats.get("three_points_made", 0) or 0
        assists = player_stats.get("assists", 0) or 0
        turnovers = player_stats.get("turnovers", 0) or 0
    else:
        # HoopQueens or unknown
        points = player_stats.get("total_points", 0) or 0
        fga = player_stats.get("total_fg_attempted", 0) or 0
        fta = player_stats.get("total_ft_attempted", 0) or 0
        fgm = player_stats.get("total_fg_made", 0) or 0
        three_pm = player_stats.get("total_3p_made", 0) or 0
        assists = player_stats.get("total_assists", 0) or 0
        turnovers = player_stats.get("total_turnovers", 0) or 0

    # True Shooting Percentage: Points / (2 * (FGA + 0.44 * FTA))
    ts_pct = None
    ts_denominator = 2 * (fga + 0.44 * fta)
    if ts_denominator > 0:
        ts_pct = round(points / ts_denominator, 3)

    # Effective Field Goal Percentage: (FGM + 0.5 * 3PM) / FGA
    efg_pct = None
    if fga > 0:
        efg_pct = round((fgm + 0.5 * three_pm) / fga, 3)

    # Assist-to-Turnover Ratio
    ast_to_ratio = None
    if turnovers > 0:
        ast_to_ratio = round(assists / turnovers, 2)

    # Usage Rate (simplified): (FGA + 0.44 * FTA + TO) - would need team stats for proper calculation
    # We'll calculate this in team context instead
    usage_rate = None

    return AdvancedStats(
        true_shooting_pct=ts_pct,
        effective_fg_pct=efg_pct,
        assist_to_turnover_ratio=ast_to_ratio,
        usage_rate=usage_rate,  # Calculated in team context
    )


def calculate_team_context_stats(
    player_stats: dict[str, Any], team_stats: dict[str, Any] | None, league: str
) -> tuple[TeamContextStats | None, float | None]:
    """
    Calculate player's statistical contribution relative to team.

    Args:
        player_stats: Raw player statistics for a season
        team_stats: Team statistics for the same season/team
        league: League name (affects field names)

    Returns:
        Tuple of (TeamContextStats object or None, usage_rate or None)
    """
    if not team_stats:
        return None, None

    # Extract player stats based on league
    # All leagues now pass per-game stats in the dict
    if league in ["usports", "ccaa"]:
        player_ppg = player_stats.get("ppg", 0) or 0
        player_rpg = player_stats.get("rpg", 0) or 0
        player_apg = player_stats.get("apg", 0) or 0
        player_spg = player_stats.get("spg", 0) or 0
        player_bpg = player_stats.get("bpg", 0) or 0
        player_mpg = player_stats.get("mpg", 0) or 0
        player_fga = player_stats.get("field_goal_attempted", 0) or 0
        player_fta = player_stats.get("free_throws_attempted", 0) or 0
        player_tov = player_stats.get("turnovers", 0) or 0
        # games_played = player_stats.get("games_played", 1) or 1
    elif league == "cebl":
        # CEBL passes per-game values already calculated
        player_ppg = player_stats.get("ppg", 0) or 0
        player_rpg = player_stats.get("rpg", 0) or 0
        player_apg = player_stats.get("apg", 0) or 0
        player_spg = player_stats.get("spg", 0) or 0
        player_bpg = player_stats.get("bpg", 0) or 0
        player_mpg = player_stats.get("mpg", 0) or 0
        player_fga = player_stats.get("fga_pg", 0) or 0
        player_fta = player_stats.get("fta_pg", 0) or 0
        player_tov = player_stats.get("tov_pg", 0) or 0
        # games_played = player_stats.get("games_played", 1) or 1
    else:
        # HoopQueens passes per-game values
        player_ppg = player_stats.get("total_points", 0) or 0
        player_rpg = player_stats.get("total_rebounds", 0) or 0
        player_apg = player_stats.get("total_assists", 0) or 0
        player_spg = player_stats.get("total_steals", 0) or 0
        player_bpg = player_stats.get("total_blocks", 0) or 0
        player_mpg = player_stats.get("total_minutes", 0) or 0
        player_fga = player_stats.get("total_fg_attempted", 0) or 0
        player_fta = player_stats.get("total_ft_attempted", 0) or 0
        player_tov = player_stats.get("total_turnovers", 0) or 0
        # games_played = player_stats.get("games_played", 1) or 1

    # Extract team stats (per game)
    team_ppg = team_stats.get("points_per_game", 0) or team_stats.get("ppg", 0) or 0
    team_rpg = team_stats.get("rebounds_per_game", 0) or team_stats.get("rpg", 0) or 0
    team_apg = team_stats.get("assists_per_game", 0) or team_stats.get("apg", 0) or 0
    team_spg = team_stats.get("steals_per_game", 0) or team_stats.get("spg", 0) or 0
    team_bpg = team_stats.get("blocks_per_game", 0) or team_stats.get("bpg", 0) or 0
    team_fga = (
        team_stats.get("field_goals_attempted_per_game", 0)
        or team_stats.get("fga_per_game", 0)
        or 0
    )

    # Calculate percentage shares
    points_share = round((player_ppg / team_ppg) * 100, 1) if team_ppg > 0 else None
    rebounds_share = round((player_rpg / team_rpg) * 100, 1) if team_rpg > 0 else None
    assists_share = round((player_apg / team_apg) * 100, 1) if team_apg > 0 else None
    steals_share = round((player_spg / team_spg) * 100, 1) if team_spg > 0 else None
    blocks_share = round((player_bpg / team_bpg) * 100, 1) if team_bpg > 0 else None

    # Minutes share: player minutes / (total game minutes / 5 players) * 100
    # Assuming 40-minute games (adjust if needed)
    available_minutes_per_game = 40  # minutes per game for one player position
    minutes_share = (
        round((player_mpg / available_minutes_per_game) * 100, 1)
        if player_mpg > 0
        else None
    )

    # Shooting volume share
    shooting_volume_share = (
        round((player_fga / team_fga) * 100, 1) if team_fga > 0 else None
    )

    # Calculate usage rate (requires team stats)
    usage_rate = None
    if team_fga > 0:
        team_fta = (
            team_stats.get("free_throws_attempted_per_game", 0)
            or team_stats.get("fta_per_game", 0)
            or 0
        )
        team_tov = (
            team_stats.get("turnovers_per_game", 0)
            or team_stats.get("tov_per_game", 0)
            or 0
        )

        player_possessions = player_fga + 0.44 * player_fta + player_tov
        team_possessions = team_fga + 0.44 * team_fta + team_tov

        if team_possessions > 0:
            usage_rate = round((player_possessions / team_possessions) * 100, 1)

    return TeamContextStats(
        points_share=points_share,
        rebounds_share=rebounds_share,
        assists_share=assists_share,
        steals_share=steals_share,
        blocks_share=blocks_share,
        minutes_share=minutes_share,
        shooting_volume_share=shooting_volume_share,
    ), usage_rate  # Return usage_rate separately to update AdvancedStats


def calculate_league_specific_stats(
    league: str,
    player_stats: dict[str, Any] | None = None,
    game_logs: list[dict[str, Any]] | None = None,
    game_aggregates: dict[str, Any] | None = None,
    playoff_delta: dict[str, int | float] | None = None,
) -> LeagueSpecificStats:
    """
    Calculate league-specific statistics.

    Args:
        league: League name
        player_stats: Season-aggregated player stats (for CEBL, U SPORTS/CCAA)
        game_logs: Game-by-game data (for HoopQueens variance calculations)
        game_aggregates: Per-season aggregated game-level stats (for CEBL boxscores)
        playoff_delta: Playoff vs regular season performance differences (for U SPORTS/CCAA)

    Returns:
        LeagueSpecificStats object with league-specific metrics
    """
    league_stats = LeagueSpecificStats()

    if league == "cebl" and player_stats:
        # CEBL-specific stats from database (players table)
        league_stats.double_doubles = player_stats.get("double_doubles")
        league_stats.triple_doubles = player_stats.get("triple_doubles")
        league_stats.target_scores = player_stats.get("target_scores")

        games_played = player_stats.get("games_played", 1) or 1

        # Calculate rate stats from counting stats
        if league_stats.double_doubles is not None:
            league_stats.double_double_rate = round(
                (league_stats.double_doubles / games_played) * 100, 1
            )
        if league_stats.triple_doubles is not None:
            league_stats.triple_double_rate = round(
                (league_stats.triple_doubles / games_played) * 100, 1
            )
        if league_stats.target_scores is not None:
            league_stats.target_score_rate = round(
                (league_stats.target_scores / games_played) * 100, 1
            )

        # Process game-level aggregates (from player_boxscores table)
        if game_aggregates:
            # Plus/minus average
            if game_aggregates.get("avg_plus_minus") is not None:
                league_stats.plus_minus_avg = round(
                    game_aggregates["avg_plus_minus"], 1
                )

            # Fouls drawn per game
            if game_aggregates.get("total_fouls_drawn"):
                league_stats.fouls_drawn_per_game = round(
                    game_aggregates["total_fouls_drawn"] / games_played, 1
                )

            # Situational scoring (per game)
            if game_aggregates.get("total_second_chance_points"):
                league_stats.second_chance_points = round(
                    game_aggregates["total_second_chance_points"] / games_played, 1
                )
            if game_aggregates.get("total_fast_break_points"):
                league_stats.fast_break_points = round(
                    game_aggregates["total_fast_break_points"] / games_played, 1
                )
            if game_aggregates.get("total_points_in_paint"):
                league_stats.points_in_paint = round(
                    game_aggregates["total_points_in_paint"] / games_played, 1
                )

            # 2-point shooting stats
            total_2pt_made = game_aggregates.get("total_2pt_made", 0) or 0
            total_2pt_attempted = game_aggregates.get("total_2pt_attempted", 0) or 0

            if total_2pt_attempted > 0:
                league_stats.two_point_percentage = round(
                    (total_2pt_made / total_2pt_attempted) * 100, 1
                )

            # 2-point rate (% of FGA that are 2-pointers)
            total_3pt_attempted = player_stats.get("three_points_attempted", 0) or 0
            total_fga = total_2pt_attempted + total_3pt_attempted
            if total_fga > 0:
                league_stats.two_point_rate = round(
                    (total_2pt_attempted / total_fga) * 100, 1
                )

    elif league == "hoopqueens" and game_logs:
        # HoopQueens-specific stats from game logs
        games_played = len(game_logs)

        if games_played > 0:
            # Plus/minus stats
            plus_minus_values = [game.get("plus_minus", 0) or 0 for game in game_logs]
            total_plus_minus = sum(plus_minus_values)
            league_stats.plus_minus = round(total_plus_minus / games_played, 1)

            # Plus/minus range (min/max)
            if plus_minus_values:
                league_stats.plus_minus_min = min(plus_minus_values)
                league_stats.plus_minus_max = max(plus_minus_values)

            # Fouls drawn per game
            total_fouls_drawn = sum(
                game.get("fouls_drawn", 0) or 0 for game in game_logs
            )
            league_stats.fouls_drawn_per_game = round(
                total_fouls_drawn / games_played, 1
            )

            # Foul drawing efficiency (fouls drawn per FGA)
            total_fga = sum(
                game.get("field_goals_attempted", 0) or 0 for game in game_logs
            )
            if total_fga > 0:
                league_stats.foul_drawing_efficiency = round(
                    total_fouls_drawn / total_fga, 3
                )

            # PPG variance and consistency score
            ppg_values = [game.get("points", 0) or 0 for game in game_logs]
            if len(ppg_values) > 1:
                mean_ppg = sum(ppg_values) / len(ppg_values)
                std_ppg = stdev(ppg_values)
                league_stats.ppg_variance = round(std_ppg, 1)

                # Consistency score (Coefficient of Variation)
                # Lower = more consistent
                if mean_ppg > 0:
                    league_stats.consistency_score = round(
                        (std_ppg / mean_ppg) * 100, 1
                    )

    elif league in ["usports", "ccaa"] and player_stats:
        # U SPORTS/CCAA-specific stats
        league_stats.conference = player_stats.get("conference")
        league_stats.disqualifications = player_stats.get("disqualifications")

        # DQ rate (disqualifications per 100 games)
        if league_stats.disqualifications:
            games_played = player_stats.get("games_played", 1) or 1
            league_stats.dq_rate = round(
                (league_stats.disqualifications / games_played) * 100, 2
            )

        # Playoff performance delta
        if playoff_delta:
            league_stats.playoff_ppg_delta = round(playoff_delta.get("ppg", 0), 1)
            league_stats.playoff_rpg_delta = round(playoff_delta.get("rpg", 0), 1)
            league_stats.playoff_apg_delta = round(playoff_delta.get("apg", 0), 1)
            league_stats.playoff_fg_pct_delta = round(playoff_delta.get("fg_pct", 0), 1)
            league_stats.playoff_sample_size = playoff_delta.get("games_played")  # type: ignore

    return league_stats


def _calculate_percentile(value: float, distribution: list[float]) -> int | None:
    """
    Calculate percentile rank of a value within a distribution.

    Args:
        value: The value to rank
        distribution: List of all values in the distribution

    Returns:
        Percentile rank (0-100) or None if distribution is empty
    """
    if not distribution:
        return None

    # Count how many values are strictly less than the player's value
    count_below = sum(1 for v in distribution if v < value)

    # Percentile = (count below / total) * 100
    percentile = (count_below / len(distribution)) * 100

    return round(percentile)


def calculate_league_comparison(
    player_ppg: float,
    player_rpg: float,
    player_apg: float,
    player_ts_pct: float | None,
    league_avg_ppg: float,
    league_avg_rpg: float,
    league_avg_apg: float,
    league_avg_ts_pct: float | None,
    league_ppg_distribution: list[float] | None = None,
    league_rpg_distribution: list[float] | None = None,
    league_apg_distribution: list[float] | None = None,
    league_ts_pct_distribution: list[float] | None = None,
) -> LeagueComparison:
    """
    Calculate player's performance relative to league average for scouting context.

    Args:
        player_ppg: Player points per game
        player_rpg: Player rebounds per game
        player_apg: Player assists per game
        player_ts_pct: Player true shooting percentage (0-1 scale)
        league_avg_ppg: League average points per game
        league_avg_rpg: League average rebounds per game
        league_avg_apg: League average assists per game
        league_avg_ts_pct: League average true shooting percentage (0-1 scale)
        league_ppg_distribution: List of all PPG values in league (for percentile)
        league_rpg_distribution: List of all RPG values in league (for percentile)
        league_apg_distribution: List of all APG values in league (for percentile)
        league_ts_pct_distribution: List of all TS% values in league (for percentile)

    Returns:
        LeagueComparison object with relative performance metrics
    """
    # Calculate absolute differences
    ppg_vs_avg = round(player_ppg - league_avg_ppg, 1) if league_avg_ppg > 0 else None
    rpg_vs_avg = round(player_rpg - league_avg_rpg, 1) if league_avg_rpg > 0 else None
    apg_vs_avg = round(player_apg - league_avg_apg, 1) if league_avg_apg > 0 else None

    ts_pct_vs_avg = None
    if player_ts_pct is not None and league_avg_ts_pct is not None:
        # Convert to percentage points for readability
        ts_pct_vs_avg = round((player_ts_pct - league_avg_ts_pct) * 100, 1)

    # Calculate percentage differences
    ppg_pct_diff = (
        round(((player_ppg / league_avg_ppg) - 1) * 100, 1)
        if league_avg_ppg > 0
        else None
    )
    rpg_pct_diff = (
        round(((player_rpg / league_avg_rpg) - 1) * 100, 1)
        if league_avg_rpg > 0
        else None
    )
    apg_pct_diff = (
        round(((player_apg / league_avg_apg) - 1) * 100, 1)
        if league_avg_apg > 0
        else None
    )

    # Calculate percentile ranks from distributions
    ppg_percentile = (
        _calculate_percentile(player_ppg, league_ppg_distribution)
        if league_ppg_distribution
        else None
    )
    rpg_percentile = (
        _calculate_percentile(player_rpg, league_rpg_distribution)
        if league_rpg_distribution
        else None
    )
    apg_percentile = (
        _calculate_percentile(player_apg, league_apg_distribution)
        if league_apg_distribution
        else None
    )
    ts_pct_percentile = (
        _calculate_percentile(player_ts_pct, league_ts_pct_distribution)
        if player_ts_pct is not None and league_ts_pct_distribution
        else None
    )

    return LeagueComparison(
        ppg_vs_avg=ppg_vs_avg,
        rpg_vs_avg=rpg_vs_avg,
        apg_vs_avg=apg_vs_avg,
        ts_pct_vs_avg=ts_pct_vs_avg,
        ppg_pct_diff=ppg_pct_diff,
        rpg_pct_diff=rpg_pct_diff,
        apg_pct_diff=apg_pct_diff,
        ppg_percentile=ppg_percentile,
        rpg_percentile=rpg_percentile,
        apg_percentile=apg_percentile,
        ts_pct_percentile=ts_pct_percentile,
    )
