export type LeagueDBName = "cebl" | "usports" | "ccaa" | "hoopqueens";

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface DatabaseSchema {
  tables: TableSchema[];
}

// ============================================================================
// INTENT & RESPONSE TYPES
// ============================================================================

type IntentType =
  | "stats_query"
  | "scouting_report"
  | "text_response"
  | "extract_player_from_results"
  | "continue_chain"
  | "terminate";

type League = "CEBL" | "U SPORTS" | "CCAA" | "HoopQueens" | "OCAA" | "PACWEST";

type ChartType = "bar" | "line" | "table" | "radar" | "pie";

// ============================================================================
// ROUTER NODE OUTPUT
// ============================================================================

export interface RouterOutput {
  node: "router";
  intent: IntentType;
  entities: {
    player_name?: string;
    league?: string;
    season?: string;
    query_context?: string;
  };
  player_name: string | null;
  league: string | null;
  user_query: string;
  routing_iteration: number;
  work_complete: boolean;
  error?: string;
}

// ============================================================================
// STATS_LOOKUP NODE OUTPUT
// ============================================================================

export interface ChartConfig {
  chart_type: ChartType;
  x_column: string | null;
  y_columns: string[];
  title: string;
  subtitle: string | null;
  color_scheme: string[] | null;
  legend_position: "top" | "bottom" | "left" | "right" | "none";
  x_axis_label: string | null;
  y_axis_label: string | null;
  value_format: "number" | "percentage" | "decimal";
  show_data_labels: boolean;
  sortable: boolean;
  paginated: boolean;
}

export interface QueryResult {
  data: Record<string, any>[];
  sql_query: string | undefined;
  db_name: LeagueDBName;
  chart_config: ChartConfig | undefined;
  summary_text: string;
}

interface StatsLookupOutput {
  node: "stats_lookup";
  query_result: QueryResult;
  error: string | null;
}

// ============================================================================
// CONFIRM_SCOUTING_REPORT NODE OUTPUT (INTERRUPTS)
// ============================================================================

export interface PlayerSelectionInterrupt {
  type: "player_selection_for_scouting";
  message: string;
  search_results: Array<{
    player_id: string;
    full_name: string;
    league: string;
    teams: string[];
    seasons: string[];
    positions: string[];
    matches: string[];
    nationality: string | null;
    age: number | null;
    photo_url: string | null;
  }>;
}

export interface ScoutingConfirmationInterrupt {
  node: "confirm_scouting_report";
  type: "scouting_confirmation";
  player_name: string;
  player_id: string;
  league: string;
  message: string;
}

interface ConfirmScoutingSuccess {
  node: "confirm_scouting_report";
  player_id: string;
  player_name: string;
  league: string;
  scouting_report_confirmed: true;
}

interface ConfirmScoutingError {
  node: "confirm_scouting_report";
  error: string;
  scouting_report_confirmed: false;
}

export type ConfirmScoutingOutput =
  | PlayerSelectionInterrupt
  | ScoutingConfirmationInterrupt
  | ConfirmScoutingSuccess
  | ConfirmScoutingError;

// ============================================================================
// SCOUT NODE OUTPUT
// ============================================================================

interface PlayerProfile {
  name: string;
  position: string | null;
  jersey_number: string | null;
  height: string | null;
  weight: string | null;
  date_of_birth: string | null;
  age: number | null;
  current_team: string;
  league: League;
  player_photo_url: string | null;
}

interface StrengthWeakness {
  title: string;
  description: string;
}

interface TrajectoryPoint {
  season: string;
  ppg: number;
  trend_description: string;
  percentage_change: number | null;
}

interface NationalTeamAssessment {
  team_type: string;
  fit_rating:
    | "Strong Fit"
    | "Good Fit"
    | "Depth Consideration"
    | "Developmental"
    | "Not Recommended";
  rationale: string;
}

interface FinalRecommendation {
  verdict_title: string;
  summary: string;
  best_use_cases: string[];
  overall_grade_domestic: string;
  overall_grade_national: string;
}

export interface ScoutingReport {
  report_id: string;
  generated_at: string;
  player_profile: PlayerProfile;
  player_detail: any | null; // Full PlayerDetail from search API
  archetype: string;
  archetype_description: string;
  strengths: StrengthWeakness[];
  weaknesses: StrengthWeakness[];
  trajectory_analysis: TrajectoryPoint[];
  trajectory_summary: string;
  national_team_assessments: NationalTeamAssessment[];
  final_recommendation: FinalRecommendation;
}

interface ScoutSuccess {
  node: "scout";
  scouting_report: ScoutingReport;
  pdf_url: string | null;
  error: null;
}

interface ScoutError {
  node: "scout";
  scouting_report: null;
  pdf_url: null;
  error: string;
}
type ScoutOutput = ScoutSuccess | ScoutError;

// ============================================================================
// GENERATE_RESPONSE NODE OUTPUT
// ============================================================================

interface TextResponse {
  node: "generate_response";
  response_type: "text_response";
  main_response: string;
}

interface QueryResultResponse {
  node: "generate_response";
  response_type: "query_result";
  main_response: string;
  data: Record<string, any>[];
  chart_config: ChartConfig | null;
  query_result: QueryResult;
}

export interface ScoutingReportResponse {
  node: "generate_response";
  response_type: "scouting_report_plan";
  main_response: string;
  scouting_report: ScoutingReport;
  pdf_url: string | null;
}

export type GenerateResponseOutput =
  | TextResponse
  | QueryResultResponse
  | ScoutingReportResponse;

// ============================================================================
// UNION OF ALL NODE OUTPUTS
// ============================================================================

export type AgentNodeOutput =
  | RouterOutput
  | StatsLookupOutput
  | ConfirmScoutingOutput
  | ScoutOutput
  | GenerateResponseOutput;
