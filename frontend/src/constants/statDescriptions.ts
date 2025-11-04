/**
 * Statistical descriptions and color ranges for player stats.
 *
 * 5-tier color system:
 * - red: Poor
 * - orange: Below Average
 * - yellow: Average
 * - green: Good
 * - blue: Elite
 */

export type StatColor = "red" | "orange" | "yellow" | "green" | "blue";
export type StatLabel = "Poor" | "Below Average" | "Average" | "Good" | "Elite";
export type League = "usports" | "ccaa" | "cebl" | "hoopqueens";
export type Position = "guard" | "forward" | "center" | "unknown";

export interface StatRange {
  min: number;
  max: number;
  color: StatColor;
  label: StatLabel;
}

export interface StatInfo {
  name: string;
  description: string;
  formula?: string;
  higherIsBetter: boolean;
  /**
   * Ranges can be league-specific or position-specific.
   * If both are provided, position takes precedence.
   */
  ranges?: StatRange[];
  leagueRanges?: Record<League, StatRange[]>;
  positionRanges?: Record<Position, StatRange[]>;
}

// ====================
// Scoring Stats
// ====================

const PPG_RANGES: Record<League, StatRange[]> = {
  usports: [
    { min: 0, max: 6, color: "red", label: "Poor" },
    { min: 6, max: 10, color: "orange", label: "Below Average" },
    { min: 10, max: 14, color: "yellow", label: "Average" },
    { min: 14, max: 18, color: "green", label: "Good" },
    { min: 18, max: Infinity, color: "blue", label: "Elite" },
  ],
  ccaa: [
    { min: 0, max: 6, color: "red", label: "Poor" },
    { min: 6, max: 10, color: "orange", label: "Below Average" },
    { min: 10, max: 14, color: "yellow", label: "Average" },
    { min: 14, max: 18, color: "green", label: "Good" },
    { min: 18, max: Infinity, color: "blue", label: "Elite" },
  ],
  cebl: [
    { min: 0, max: 7, color: "red", label: "Poor" },
    { min: 7, max: 11, color: "orange", label: "Below Average" },
    { min: 11, max: 15, color: "yellow", label: "Average" },
    { min: 15, max: 19, color: "green", label: "Good" },
    { min: 19, max: Infinity, color: "blue", label: "Elite" },
  ],
  hoopqueens: [
    { min: 0, max: 6, color: "red", label: "Poor" },
    { min: 6, max: 10, color: "orange", label: "Below Average" },
    { min: 10, max: 14, color: "yellow", label: "Average" },
    { min: 14, max: 18, color: "green", label: "Good" },
    { min: 18, max: Infinity, color: "blue", label: "Elite" },
  ],
};

const FG_PCT_RANGES: StatRange[] = [
  { min: 0, max: 0.38, color: "red", label: "Poor" },
  { min: 0.38, max: 0.43, color: "orange", label: "Below Average" },
  { min: 0.43, max: 0.48, color: "yellow", label: "Average" },
  { min: 0.48, max: 0.53, color: "green", label: "Good" },
  { min: 0.53, max: 1.0, color: "blue", label: "Elite" },
];

const THREE_PT_PCT_RANGES: StatRange[] = [
  { min: 0, max: 0.28, color: "red", label: "Poor" },
  { min: 0.28, max: 0.32, color: "orange", label: "Below Average" },
  { min: 0.32, max: 0.36, color: "yellow", label: "Average" },
  { min: 0.36, max: 0.4, color: "green", label: "Good" },
  { min: 0.4, max: 1.0, color: "blue", label: "Elite" },
];

const FT_PCT_RANGES: StatRange[] = [
  { min: 0, max: 0.6, color: "red", label: "Poor" },
  { min: 0.6, max: 0.7, color: "orange", label: "Below Average" },
  { min: 0.7, max: 0.78, color: "yellow", label: "Average" },
  { min: 0.78, max: 0.85, color: "green", label: "Good" },
  { min: 0.85, max: 1.0, color: "blue", label: "Elite" },
];

// ====================
// Rebounding Stats
// ====================

const RPG_POSITION_RANGES: Record<Position, StatRange[]> = {
  guard: [
    { min: 0, max: 2, color: "red", label: "Poor" },
    { min: 2, max: 3.5, color: "orange", label: "Below Average" },
    { min: 3.5, max: 5, color: "yellow", label: "Average" },
    { min: 5, max: 6.5, color: "green", label: "Good" },
    { min: 6.5, max: Infinity, color: "blue", label: "Elite" },
  ],
  forward: [
    { min: 0, max: 3, color: "red", label: "Poor" },
    { min: 3, max: 5, color: "orange", label: "Below Average" },
    { min: 5, max: 7, color: "yellow", label: "Average" },
    { min: 7, max: 9, color: "green", label: "Good" },
    { min: 9, max: Infinity, color: "blue", label: "Elite" },
  ],
  center: [
    { min: 0, max: 4, color: "red", label: "Poor" },
    { min: 4, max: 6, color: "orange", label: "Below Average" },
    { min: 6, max: 8, color: "yellow", label: "Average" },
    { min: 8, max: 10, color: "green", label: "Good" },
    { min: 10, max: Infinity, color: "blue", label: "Elite" },
  ],
  unknown: [
    { min: 0, max: 2.5, color: "red", label: "Poor" },
    { min: 2.5, max: 4, color: "orange", label: "Below Average" },
    { min: 4, max: 6, color: "yellow", label: "Average" },
    { min: 6, max: 8, color: "green", label: "Good" },
    { min: 8, max: Infinity, color: "blue", label: "Elite" },
  ],
};

// ====================
// Playmaking & Defense Stats
// ====================

const APG_POSITION_RANGES: Record<Position, StatRange[]> = {
  guard: [
    { min: 0, max: 2, color: "red", label: "Poor" },
    { min: 2, max: 3.5, color: "orange", label: "Below Average" },
    { min: 3.5, max: 5, color: "yellow", label: "Average" },
    { min: 5, max: 6.5, color: "green", label: "Good" },
    { min: 6.5, max: Infinity, color: "blue", label: "Elite" },
  ],
  forward: [
    { min: 0, max: 1, color: "red", label: "Poor" },
    { min: 1, max: 2, color: "orange", label: "Below Average" },
    { min: 2, max: 3, color: "yellow", label: "Average" },
    { min: 3, max: 4.5, color: "green", label: "Good" },
    { min: 4.5, max: Infinity, color: "blue", label: "Elite" },
  ],
  center: [
    { min: 0, max: 0.5, color: "red", label: "Poor" },
    { min: 0.5, max: 1, color: "orange", label: "Below Average" },
    { min: 1, max: 2, color: "yellow", label: "Average" },
    { min: 2, max: 3.5, color: "green", label: "Good" },
    { min: 3.5, max: Infinity, color: "blue", label: "Elite" },
  ],
  unknown: [
    { min: 0, max: 1.5, color: "red", label: "Poor" },
    { min: 1.5, max: 2.5, color: "orange", label: "Below Average" },
    { min: 2.5, max: 3.5, color: "yellow", label: "Average" },
    { min: 3.5, max: 5, color: "green", label: "Good" },
    { min: 5, max: Infinity, color: "blue", label: "Elite" },
  ],
};

const SPG_RANGES: StatRange[] = [
  { min: 0, max: 0.5, color: "red", label: "Poor" },
  { min: 0.5, max: 1, color: "orange", label: "Below Average" },
  { min: 1, max: 1.5, color: "yellow", label: "Average" },
  { min: 1.5, max: 2, color: "green", label: "Good" },
  { min: 2, max: Infinity, color: "blue", label: "Elite" },
];

const BPG_POSITION_RANGES: Record<Position, StatRange[]> = {
  guard: [
    { min: 0, max: 0.1, color: "red", label: "Poor" },
    { min: 0.1, max: 0.3, color: "orange", label: "Below Average" },
    { min: 0.3, max: 0.5, color: "yellow", label: "Average" },
    { min: 0.5, max: 0.8, color: "green", label: "Good" },
    { min: 0.8, max: Infinity, color: "blue", label: "Elite" },
  ],
  forward: [
    { min: 0, max: 0.3, color: "red", label: "Poor" },
    { min: 0.3, max: 0.6, color: "orange", label: "Below Average" },
    { min: 0.6, max: 1, color: "yellow", label: "Average" },
    { min: 1, max: 1.5, color: "green", label: "Good" },
    { min: 1.5, max: Infinity, color: "blue", label: "Elite" },
  ],
  center: [
    { min: 0, max: 0.5, color: "red", label: "Poor" },
    { min: 0.5, max: 1, color: "orange", label: "Below Average" },
    { min: 1, max: 1.5, color: "yellow", label: "Average" },
    { min: 1.5, max: 2.5, color: "green", label: "Good" },
    { min: 2.5, max: Infinity, color: "blue", label: "Elite" },
  ],
  unknown: [
    { min: 0, max: 0.3, color: "red", label: "Poor" },
    { min: 0.3, max: 0.6, color: "orange", label: "Below Average" },
    { min: 0.6, max: 1, color: "yellow", label: "Average" },
    { min: 1, max: 1.5, color: "green", label: "Good" },
    { min: 1.5, max: Infinity, color: "blue", label: "Elite" },
  ],
};

const TOV_PG_RANGES: StatRange[] = [
  { min: 0, max: 1, color: "blue", label: "Elite" }, // Lower is better!
  { min: 1, max: 1.5, color: "green", label: "Good" },
  { min: 1.5, max: 2.5, color: "yellow", label: "Average" },
  { min: 2.5, max: 3.5, color: "orange", label: "Below Average" },
  { min: 3.5, max: Infinity, color: "red", label: "Poor" },
];

// ====================
// Advanced Stats
// ====================

const TRUE_SHOOTING_PCT_RANGES: StatRange[] = [
  { min: 0, max: 0.45, color: "red", label: "Poor" },
  { min: 0.45, max: 0.5, color: "orange", label: "Below Average" },
  { min: 0.5, max: 0.55, color: "yellow", label: "Average" },
  { min: 0.55, max: 0.6, color: "green", label: "Good" },
  { min: 0.6, max: 1.0, color: "blue", label: "Elite" },
];

const EFFECTIVE_FG_PCT_RANGES: StatRange[] = [
  { min: 0, max: 0.42, color: "red", label: "Poor" },
  { min: 0.42, max: 0.47, color: "orange", label: "Below Average" },
  { min: 0.47, max: 0.52, color: "yellow", label: "Average" },
  { min: 0.52, max: 0.57, color: "green", label: "Good" },
  { min: 0.57, max: 1.0, color: "blue", label: "Elite" },
];

const AST_TO_RATIO_RANGES: StatRange[] = [
  { min: 0, max: 1, color: "red", label: "Poor" },
  { min: 1, max: 1.5, color: "orange", label: "Below Average" },
  { min: 1.5, max: 2, color: "yellow", label: "Average" },
  { min: 2, max: 2.5, color: "green", label: "Good" },
  { min: 2.5, max: Infinity, color: "blue", label: "Elite" },
];

const USAGE_RATE_RANGES: StatRange[] = [
  { min: 0, max: 15, color: "red", label: "Poor" },
  { min: 15, max: 20, color: "orange", label: "Below Average" },
  { min: 20, max: 25, color: "yellow", label: "Average" },
  { min: 25, max: 30, color: "green", label: "Good" },
  { min: 30, max: 100, color: "blue", label: "Elite" },
];

// ====================
// Team Context Stats
// ====================

const POINTS_SHARE_RANGES: StatRange[] = [
  { min: 0, max: 10, color: "red", label: "Poor" },
  { min: 10, max: 15, color: "orange", label: "Below Average" },
  { min: 15, max: 20, color: "yellow", label: "Average" },
  { min: 20, max: 25, color: "green", label: "Good" },
  { min: 25, max: 100, color: "blue", label: "Elite" },
];

const REBOUNDS_SHARE_RANGES: StatRange[] = [
  { min: 0, max: 8, color: "red", label: "Poor" },
  { min: 8, max: 12, color: "orange", label: "Below Average" },
  { min: 12, max: 16, color: "yellow", label: "Average" },
  { min: 16, max: 20, color: "green", label: "Good" },
  { min: 20, max: 100, color: "blue", label: "Elite" },
];

const ASSISTS_SHARE_RANGES: StatRange[] = [
  { min: 0, max: 10, color: "red", label: "Poor" },
  { min: 10, max: 15, color: "orange", label: "Below Average" },
  { min: 15, max: 20, color: "yellow", label: "Average" },
  { min: 20, max: 25, color: "green", label: "Good" },
  { min: 25, max: 100, color: "blue", label: "Elite" },
];

const MINUTES_SHARE_RANGES: StatRange[] = [
  { min: 0, max: 40, color: "red", label: "Poor" },
  { min: 40, max: 55, color: "orange", label: "Below Average" },
  { min: 55, max: 70, color: "yellow", label: "Average" },
  { min: 70, max: 85, color: "green", label: "Good" },
  { min: 85, max: 125, color: "blue", label: "Elite" },
];

// ====================
// League-Specific Stats
// ====================

const PLUS_MINUS_RANGES: StatRange[] = [
  { min: -Infinity, max: -5, color: "red", label: "Poor" },
  { min: -5, max: -1, color: "orange", label: "Below Average" },
  { min: -1, max: 2, color: "yellow", label: "Average" },
  { min: 2, max: 5, color: "green", label: "Good" },
  { min: 5, max: Infinity, color: "blue", label: "Elite" },
];

// ====================
// Main Stat Descriptions Export
// ====================

export const STAT_DESCRIPTIONS: Record<string, StatInfo> = {
  // Core Counting Stats
  points_per_game: {
    name: "Points Per Game",
    description: "Average points scored per game",
    leagueRanges: PPG_RANGES,
    higherIsBetter: true,
  },
  rebounds_per_game: {
    name: "Rebounds Per Game",
    description: "Average total rebounds (offensive + defensive) per game",
    positionRanges: RPG_POSITION_RANGES,
    higherIsBetter: true,
  },
  assists_per_game: {
    name: "Assists Per Game",
    description: "Average assists per game",
    positionRanges: APG_POSITION_RANGES,
    higherIsBetter: true,
  },
  steals_per_game: {
    name: "Steals Per Game",
    description: "Average steals per game",
    ranges: SPG_RANGES,
    higherIsBetter: true,
  },
  blocks_per_game: {
    name: "Blocks Per Game",
    description: "Average blocks per game",
    positionRanges: BPG_POSITION_RANGES,
    higherIsBetter: true,
  },
  turnovers_per_game: {
    name: "Turnovers Per Game",
    description: "Average turnovers committed per game (lower is better)",
    ranges: TOV_PG_RANGES,
    higherIsBetter: false,
  },

  // Shooting Percentages
  field_goal_percentage: {
    name: "Field Goal %",
    description: "Percentage of field goals made out of attempts",
    formula: "FGM / FGA",
    ranges: FG_PCT_RANGES,
    higherIsBetter: true,
  },
  three_point_percentage: {
    name: "Three-Point %",
    description: "Percentage of three-point shots made out of attempts",
    formula: "3PM / 3PA",
    ranges: THREE_PT_PCT_RANGES,
    higherIsBetter: true,
  },
  free_throw_percentage: {
    name: "Free Throw %",
    description: "Percentage of free throws made out of attempts",
    formula: "FTM / FTA",
    ranges: FT_PCT_RANGES,
    higherIsBetter: true,
  },

  // Advanced Stats
  true_shooting_pct: {
    name: "True Shooting %",
    description:
      "Shooting efficiency accounting for 2PT, 3PT, and FT value. More comprehensive than FG%.",
    formula: "PTS / (2 × (FGA + 0.44 × FTA))",
    ranges: TRUE_SHOOTING_PCT_RANGES,
    higherIsBetter: true,
  },
  effective_fg_pct: {
    name: "Effective Field Goal %",
    description:
      "Field goal percentage adjusted for 3-pointers being worth more. Weights 3PT makes as 1.5 FG makes.",
    formula: "(FGM + 0.5 × 3PM) / FGA",
    ranges: EFFECTIVE_FG_PCT_RANGES,
    higherIsBetter: true,
  },
  assist_to_turnover_ratio: {
    name: "Assist-to-Turnover Ratio",
    description:
      "Ratio of assists to turnovers. Measures ball security and playmaking efficiency.",
    formula: "AST / TOV",
    ranges: AST_TO_RATIO_RANGES,
    higherIsBetter: true,
  },
  usage_rate: {
    name: "Usage Rate %",
    description:
      "Percentage of team plays used by player while on court. Measures offensive load.",
    formula: "(FGA + 0.44 × FTA + TOV) / Team Total × 100",
    ranges: USAGE_RATE_RANGES,
    higherIsBetter: true,
  },

  // Team Context Stats
  points_share: {
    name: "Points Share %",
    description:
      "Percentage of team points scored by player. 25%+ indicates elite scoring role.",
    ranges: POINTS_SHARE_RANGES,
    higherIsBetter: true,
  },
  rebounds_share: {
    name: "Rebounds Share %",
    description:
      "Percentage of team rebounds grabbed by player. 20%+ indicates elite rebounding role.",
    ranges: REBOUNDS_SHARE_RANGES,
    higherIsBetter: true,
  },
  assists_share: {
    name: "Assists Share %",
    description:
      "Percentage of team assists by player. 25%+ indicates elite playmaking role.",
    ranges: ASSISTS_SHARE_RANGES,
    higherIsBetter: true,
  },
  minutes_share: {
    name: "Minutes Share %",
    description:
      "Percentage of available minutes played (out of 40 min/game). 85%+ indicates elite usage.",
    ranges: MINUTES_SHARE_RANGES,
    higherIsBetter: true,
  },

  // League-Specific
  plus_minus: {
    name: "Plus/Minus",
    description: "Point differential when player is on court (HoopQueens only)",
    ranges: PLUS_MINUS_RANGES,
    higherIsBetter: true,
  },
  double_doubles: {
    name: "Double Doubles",
    description: "Games with 10+ in two statistical categories (CEBL only)",
    higherIsBetter: true,
  },
  triple_doubles: {
    name: "Triple Doubles",
    description: "Games with 10+ in three statistical categories (CEBL only)",
    higherIsBetter: true,
  },

  // CEBL Advanced Metrics
  double_double_rate: {
    name: "Double-Double Rate",
    description: "Percentage of games with 10+ in two stat categories",
    higherIsBetter: true,
  },
  triple_double_rate: {
    name: "Triple-Double Rate",
    description: "Percentage of games with 10+ in three stat categories",
    higherIsBetter: true,
  },
  target_score_rate: {
    name: "Target Score Rate",
    description: "Percentage of games with target score (Elam Ending wins)",
    higherIsBetter: true,
  },
  plus_minus_avg: {
    name: "Plus/Minus Average",
    description: "Average point differential when player is on court",
    ranges: PLUS_MINUS_RANGES,
    higherIsBetter: true,
  },
  fouls_drawn_per_game: {
    name: "Fouls Drawn Per Game",
    description:
      "Average fouls drawn per game - indicates ability to attack and create contact",
    higherIsBetter: true,
  },
  two_point_percentage: {
    name: "2-Point FG%",
    description: "Field goal percentage on 2-point attempts",
    higherIsBetter: true,
  },
  two_point_rate: {
    name: "2-Point Rate",
    description: "Percentage of field goal attempts that are 2-pointers",
    higherIsBetter: false,
  },

  // HoopQueens Advanced Metrics
  consistency_score: {
    name: "Consistency Score",
    description:
      "Coefficient of variation - lower score indicates more consistent performance game-to-game",
    higherIsBetter: false,
  },
  foul_drawing_efficiency: {
    name: "Foul Drawing Efficiency",
    description:
      "Fouls drawn per field goal attempt - measures ability to get to the free throw line",
    higherIsBetter: true,
  },
  plus_minus_min: {
    name: "Plus/Minus Min",
    description: "Worst single-game plus/minus",
    higherIsBetter: false,
  },
  plus_minus_max: {
    name: "Plus/Minus Max",
    description: "Best single-game plus/minus",
    higherIsBetter: true,
  },

  // U SPORTS/CCAA Advanced Metrics
  dq_rate: {
    name: "Disqualification Rate",
    description: "Disqualifications per 100 games - measures discipline issues",
    higherIsBetter: false,
  },
  playoff_ppg_delta: {
    name: "Playoff PPG Delta",
    description:
      "Scoring increase/decrease in playoffs vs regular season - positive indicates clutch performer",
    higherIsBetter: true,
  },
  playoff_rpg_delta: {
    name: "Playoff RPG Delta",
    description: "Rebounding increase/decrease in playoffs vs regular season",
    higherIsBetter: true,
  },
  playoff_apg_delta: {
    name: "Playoff APG Delta",
    description: "Assist increase/decrease in playoffs vs regular season",
    higherIsBetter: true,
  },
  playoff_fg_pct_delta: {
    name: "Playoff FG% Delta",
    description:
      "Shooting efficiency change in playoffs vs regular season (percentage points)",
    higherIsBetter: true,
  },
};
