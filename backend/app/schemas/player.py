"""Player profile and stats schemas."""

from typing import Any
from pydantic import BaseModel, Field


class PlayerSearchResult(BaseModel):
    """Player search result item."""

    player_id: str | int
    full_name: str
    league: str
    teams: list[str] = Field(
        default_factory=list
    )  # All teams/schools player played for
    seasons: list[str] = Field(default_factory=list)  # All seasons player played
    positions: list[str] = Field(default_factory=list)  # All positions (if available)
    matches: list[str] = Field(default_factory=list)  # Fields that matched the search

    # Biographical data (for quick filtering in search results)
    nationality: str | None = None  # ISO country code (e.g., "CAN", "USA")
    age: int | None = None  # Current age
    photo_url: str | None = None  # Player photo URL (CEBL only)


class Award(BaseModel):
    """Player award."""

    season: str
    level: str  # "League" or "University"
    awards: str


class Season(BaseModel):
    """Playing career season."""

    season: str
    team: str
    jersey_number: int | None = None
    eligibility: int | None = None
    team_finish: str | None = None
    league_record: str | None = None
    overall_record: str | None = None


class SeasonStats(BaseModel):
    """Season statistics."""

    season: str
    gp_gs: str  # "22-20" (GP-GS)
    mins: int | None = None
    mpg: float | None = None
    three_pt_made_attempted: str | None = None
    three_pt_pct: float | None = None
    fg_made_attempted: str | None = None
    fg_pct: float | None = None
    ft_made_attempted: str | None = None
    ft_pct: float | None = None
    rebounds: int | None = None
    rpg: float | None = None
    pf: int | None = None
    assists: int | None = None
    turnovers: int | None = None
    blocks: int | None = None
    steals: int | None = None
    points: int | None = None
    ppg: float | None = None


class CareerHigh(BaseModel):
    """Career high statistic."""

    stat: str  # "Points", "Rebounds", etc.
    value: int | float
    date: str
    opponent: str


class USportsPlayerProfile(BaseModel):
    """U SPORTS player profile (from web scraping)."""

    full_name: str
    hometown: str | None = None
    position: str | None = None
    height: str | None = None  # e.g., "5-10"
    highschool: str | None = None
    awards: list[Award] | None = None
    playing_career: list[Season] | None = None
    career_regular_stats: list[SeasonStats] | None = None
    career_playoff_stats: list[SeasonStats] | None = None
    overall_stats: SeasonStats | None = None
    career_highs: dict[str, list[CareerHigh]] | None = None
    last_game_played: str | None = None


class CEBLPlayerProfile(BaseModel):
    """CEBL player profile (from SDK)."""

    id: int
    full_name: str
    nationality: str | None = None
    birth_date: str | None = None
    age: int | None = None
    photo_url: str | None = None
    team_id: int | None = None
    team_name_en: str | None = None
    team_short_name_en: str | None = None
    position: str | None = None
    jersey_number: int | None = None


class PlayerProfile(BaseModel):
    """Unified player profile."""

    player_id: str | int
    full_name: str
    league: str
    position: str | None = None
    height: str | None = None
    hometown: str | None = None
    team: str | None = None
    season: str | None = None
    photo_url: str | None = None
    additional_data: dict[str, Any] | None = None  # League-specific data


class AdvancedStats(BaseModel):
    """Advanced calculated metrics."""

    true_shooting_pct: float | None = None
    effective_fg_pct: float | None = None
    assist_to_turnover_ratio: float | None = None
    usage_rate: float | None = None  # Simplified estimate


class TeamContextStats(BaseModel):
    """Player's statistical contribution relative to team."""

    points_share: float | None = None  # % of team points
    rebounds_share: float | None = None  # % of team rebounds
    assists_share: float | None = None  # % of team assists
    steals_share: float | None = None  # % of team steals
    blocks_share: float | None = None  # % of team blocks
    minutes_share: float | None = None  # % of available minutes
    shooting_volume_share: float | None = None  # % of team FGA


class LeagueSpecificStats(BaseModel):
    """Stats unique to specific leagues."""

    # CEBL - Counting Stats
    double_doubles: int | None = None
    triple_doubles: int | None = None
    target_scores: int | None = None
    second_chance_points: float | None = None  # Per game
    fast_break_points: float | None = None  # Per game
    points_in_paint: float | None = None  # Per game

    # CEBL - Rate Stats (NEW)
    double_double_rate: float | None = None  # Percentage of games with double-double
    triple_double_rate: float | None = None  # Percentage of games with triple-double
    target_score_rate: float | None = None  # Percentage of games with target score
    plus_minus_avg: float | None = None  # Average plus/minus per game
    fouls_drawn_per_game: float | None = None  # Fouls drawn per game

    # CEBL - Shooting Stats (NEW)
    two_point_percentage: float | None = None  # 2PT FG%
    two_point_rate: float | None = None  # % of FGA that are 2PT

    # HoopQueens - Performance Stats
    plus_minus: float | None = None  # Average plus/minus (legacy field)
    ppg_variance: float | None = None  # Consistency metric (std deviation)

    # HoopQueens - Advanced Stats (NEW)
    consistency_score: float | None = (
        None  # Coefficient of variation (lower = more consistent)
    )
    foul_drawing_efficiency: float | None = None  # Fouls drawn per FGA
    plus_minus_min: int | None = None  # Worst single-game plus/minus
    plus_minus_max: int | None = None  # Best single-game plus/minus

    # U SPORTS/CCAA - Context Stats
    conference: str | None = None
    disqualifications: int | None = None

    # U SPORTS/CCAA - Advanced Stats (NEW)
    dq_rate: float | None = None  # Disqualifications per 100 games

    # U SPORTS/CCAA - Playoff Performance (NEW)
    playoff_ppg_delta: float | None = (
        None  # Points per game difference (playoff - regular)
    )
    playoff_rpg_delta: float | None = None  # Rebounds per game difference
    playoff_apg_delta: float | None = None  # Assists per game difference
    playoff_fg_pct_delta: float | None = None  # FG% difference (in percentage points)
    playoff_sample_size: int | None = None  # Number of playoff games


class LeagueComparison(BaseModel):
    """Player's performance relative to league average for scouting context."""

    # Absolute differences from league average
    ppg_vs_avg: float | None = None  # e.g., +7.2 (player is 7.2 PPG above league avg)
    rpg_vs_avg: float | None = None
    apg_vs_avg: float | None = None
    ts_pct_vs_avg: float | None = None  # In percentage points

    # Percentage differences from league average
    ppg_pct_diff: float | None = None  # e.g., +47.0 (player is 47% higher than avg)
    rpg_pct_diff: float | None = None
    apg_pct_diff: float | None = None

    # Percentile ranks (0-100, where 100 = best)
    ppg_percentile: int | None = None  # e.g., 85 (85th percentile)
    rpg_percentile: int | None = None
    apg_percentile: int | None = None
    ts_pct_percentile: int | None = None


class PlayerSeasonStats(BaseModel):
    """Statistics for a single season."""

    season: str
    season_type: str | None = (
        None  # "regular", "playoffs", "championship", or "total" for career aggregates
    )
    team: str | None = None

    # Core counting stats
    games_played: int | None = None
    games_started: int | None = None
    total_minutes: int | None = None
    minutes_per_game: float | None = None

    # Scoring (totals)
    total_points: int | None = None
    total_field_goals_made: int | None = None
    total_field_goals_attempted: int | None = None
    total_three_pointers_made: int | None = None
    total_three_pointers_attempted: int | None = None
    total_free_throws_made: int | None = None
    total_free_throws_attempted: int | None = None

    # Scoring (per game)
    points_per_game: float | None = None
    field_goal_percentage: float | None = None
    three_point_percentage: float | None = None
    free_throw_percentage: float | None = None

    # Rebounds (totals)
    total_rebounds: int | None = None
    total_offensive_rebounds: int | None = None
    total_defensive_rebounds: int | None = None

    # Rebounds (per game)
    rebounds_per_game: float | None = None
    offensive_rebounds_per_game: float | None = None
    defensive_rebounds_per_game: float | None = None

    # Playmaking & Defense (totals)
    total_assists: int | None = None
    total_steals: int | None = None
    total_blocks: int | None = None
    total_turnovers: int | None = None
    total_personal_fouls: int | None = None

    # Playmaking & Defense (per game)
    assists_per_game: float | None = None
    steals_per_game: float | None = None
    blocks_per_game: float | None = None
    turnovers_per_game: float | None = None
    personal_fouls_per_game: float | None = None

    # Advanced metrics
    advanced_stats: AdvancedStats | None = None

    # Team context
    team_context: TeamContextStats | None = None

    # League-specific stats
    league_specific: LeagueSpecificStats | None = None

    # League comparison (for scouting context)
    league_comparison: LeagueComparison | None = None


class PlayerDetail(BaseModel):
    """Detailed player information with stats across all seasons."""

    player_id: str | int
    full_name: str
    league: str
    position: str | None = None
    seasons: list[PlayerSeasonStats] = Field(default_factory=list)
    career_stats: list[PlayerSeasonStats] = Field(
        default_factory=list
    )  # Career totals by season_type (regular, playoffs, championship, total)
    additional_info: dict[str, Any] = Field(
        default_factory=dict
    )  # League-specific data

    # Biographical data (for player detail header)
    nationality: str | None = None  # ISO country code (e.g., "CAN", "USA")
    birth_date: str | None = None  # ISO format: "1994-04-20"
    age: int | None = None  # Current age
    photo_url: str | None = None  # Validated URL or None
    current_team: str | None = None  # Most recent team
    height: str | None = None  # e.g., "6-3" (future enhancement)


class ShotAttempt(BaseModel):
    x: float
    y: float
    made: bool
    shot_type: str
    quarter: int
    season: int


class ShotChartData(BaseModel):
    player_id: int
    full_name: str
    shots: list[ShotAttempt]
    seasons: list[int]
