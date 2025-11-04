/**
 * Mapping from common stat abbreviations to STAT_DESCRIPTIONS keys
 */
export const STAT_KEY_MAPPING: Record<string, string> = {
  // Core Counting Stats
  PPG: "points_per_game",
  RPG: "rebounds_per_game",
  APG: "assists_per_game",
  SPG: "steals_per_game",
  BPG: "blocks_per_game",
  TPG: "turnovers_per_game",
  FPG: "personal_fouls_per_game",

  // Shooting Percentages
  "FG%": "field_goal_percentage",
  "3P%": "three_point_percentage",
  "3PT%": "three_point_percentage",
  "FT%": "free_throw_percentage",

  // Advanced Stats
  "TS%": "true_shooting_pct",
  "eFG%": "effective_fg_pct",
  "AST/TO": "assist_to_turnover_ratio",
  "USG%": "usage_rate",

  // Minutes & Games
  MPG: "minutes_per_game",
  GP: "games_played",
  GS: "games_started",
  MIN: "total_minutes",

  // Rebounding Breakdown
  ORB: "offensive_rebounds_per_game",
  ORPG: "offensive_rebounds_per_game",
  DRB: "defensive_rebounds_per_game",
  DRPG: "defensive_rebounds_per_game",

  // Team Context
  "Points Share": "points_share",
  "Rebounds Share": "rebounds_share",
  "Assists Share": "assists_share",
  "Minutes Share": "minutes_share",

  // League-Specific
  "Plus/Minus": "plus_minus",
  "Plus/Minus Avg": "plus_minus_avg",
  "Double Doubles": "double_doubles",
  "Triple Doubles": "triple_doubles",
  "Double-Double Rate": "double_double_rate",
  "Triple-Double Rate": "triple_double_rate",
  "Target Score Rate": "target_score_rate",
  "Fouls Drawn Per Game": "fouls_drawn_per_game",
  "2PT FG%": "two_point_percentage",
  "2-Point Rate": "two_point_rate",
  "Consistency Score": "consistency_score",
  "Foul Drawing Efficiency": "foul_drawing_efficiency",
  "Plus/Minus Min": "plus_minus_min",
  "Plus/Minus Max": "plus_minus_max",
  "DQ Rate": "dq_rate",
  "Disqualification Rate": "dq_rate",

  // Playoff Deltas
  "PPG Delta": "playoff_ppg_delta",
  "RPG Delta": "playoff_rpg_delta",
  "APG Delta": "playoff_apg_delta",
  "FG% Delta": "playoff_fg_pct_delta",
};
