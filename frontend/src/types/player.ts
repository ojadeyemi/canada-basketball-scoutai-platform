export interface PlayerSearchResult {
  player_id: string | number;
  full_name: string;
  league: string;
  teams: string[];
  seasons: string[];
  positions: string[];
  matches: string[];
  nationality?: string;
  age?: number; // CEBL only
}

export interface AdvancedStats {
  true_shooting_pct?: number;
  effective_fg_pct?: number;
  assist_to_turnover_ratio?: number;
  usage_rate?: number;
}

export interface TeamContextStats {
  points_share?: number; // % of team points
  rebounds_share?: number; // % of team rebounds
  assists_share?: number; // % of team assists
  steals_share?: number; // % of team steals
  blocks_share?: number; // % of team blocks
  minutes_share?: number; // % of available minutes
  shooting_volume_share?: number; // % of team FGA
}

export interface LeagueSpecificStats {
  // CEBL
  double_doubles?: number;
  triple_doubles?: number;
  target_scores?: number;
  second_chance_points?: number;
  fast_break_points?: number;
  points_in_paint?: number;
  double_double_rate?: number; // % of games with double-double
  triple_double_rate?: number; // % of games with triple-double
  target_score_rate?: number; // % of games with target score (Elam Ending wins)
  plus_minus_avg?: number; // Average +/- per game
  fouls_drawn_per_game?: number; // Fouls drawn per game
  two_point_percentage?: number; // 2PT FG%
  two_point_rate?: number; // % of FGA that are 2-pointers

  // HoopQueens
  plus_minus?: number;
  ppg_variance?: number; // Consistency metric (std deviation)
  consistency_score?: number; // Coefficient of variation (lower = more consistent)
  foul_drawing_efficiency?: number; // Fouls drawn per FGA
  plus_minus_min?: number; // Worst single-game +/-
  plus_minus_max?: number; // Best single-game +/-

  // U SPORTS/CCAA
  conference?: string;
  disqualifications?: number;
  dq_rate?: number; // Disqualifications per 100 games
  playoff_ppg_delta?: number; // PPG difference (playoff - regular)
  playoff_rpg_delta?: number; // RPG difference
  playoff_apg_delta?: number; // APG difference
  playoff_fg_pct_delta?: number; // FG% difference (percentage points)
  playoff_sample_size?: number; // Number of playoff games
}

interface LeagueComparison {
  ppg_vs_avg: number; // Points above/below league average
  rpg_vs_avg: number; // Rebounds above/below league average
  apg_vs_avg: number; // Assists above/below league average
  ts_pct_vs_avg: number; // True shooting % difference (percentage points)
  ppg_pct_diff: number; // % difference from league average
  rpg_pct_diff: number; // % difference from league average
  apg_pct_diff: number; // % difference from league average
  ppg_percentile: number; // Percentile rank (0-100)
  rpg_percentile: number; // Percentile rank
  apg_percentile: number; // Percentile rank
  ts_pct_percentile: number; // Percentile rank
}

export interface PlayerSeasonStats {
  season: string;
  season_type?: string; // "regular" | "playoffs" | "championship" | "total"
  team?: string;

  // Core counting stats
  games_played?: number;
  games_started?: number;
  total_minutes?: number;
  minutes_per_game?: number;

  // Scoring (totals)
  total_points?: number;
  total_field_goals_made?: number;
  total_field_goals_attempted?: number;
  total_three_pointers_made?: number;
  total_three_pointers_attempted?: number;
  total_free_throws_made?: number;
  total_free_throws_attempted?: number;

  // Scoring (per game)
  points_per_game?: number;
  field_goal_percentage?: number;
  three_point_percentage?: number;
  free_throw_percentage?: number;

  // Rebounds (totals)
  total_rebounds?: number;
  total_offensive_rebounds?: number;
  total_defensive_rebounds?: number;

  // Rebounds (per game)
  rebounds_per_game?: number;
  offensive_rebounds_per_game?: number;
  defensive_rebounds_per_game?: number;

  // Playmaking & Defense (totals)
  total_assists?: number;
  total_steals?: number;
  total_blocks?: number;
  total_turnovers?: number;
  total_personal_fouls?: number;

  // Playmaking & Defense (per game)
  assists_per_game?: number;
  steals_per_game?: number;
  blocks_per_game?: number;
  turnovers_per_game?: number;
  personal_fouls_per_game?: number;

  // Advanced metrics
  advanced_stats?: AdvancedStats;

  // Team context
  team_context?: TeamContextStats;

  // League-specific stats
  league_specific?: LeagueSpecificStats;

  // League comparison (scouting context)
  league_comparison?: LeagueComparison;
}

interface PlayerAdditionalInfo {
  hometown?: string;
  height?: string;
  highschool?: string;
  nationality?: string;
  birth_date?: string;
  age?: number;
  photo_url?: string;
}

export interface PlayerDetail {
  player_id: string | number;
  full_name: string;
  league: string;
  position?: string;
  seasons: PlayerSeasonStats[];
  career_stats: PlayerSeasonStats[];
  additional_info?: PlayerAdditionalInfo;
  nationality?: string; // ISO country code
  birth_date?: string; // ISO format (YYYY-MM-DD)
  age?: number;
  photo_url?: string; // Validated HTTP/HTTPS URL
  current_team?: string; // Most recent team
  height?: string;
}

export interface ShotAttempt {
  x: number;
  y: number;
  made: boolean;
  shot_type: string;
  quarter: number;
  season: number;
}

export interface ShotChartData {
  player_id: number;
  full_name: string;
  shots: ShotAttempt[];
  seasons: number[];
}
