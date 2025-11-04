export const AGENT_NODES = {
  ROUTER: "router",
  STATS_LOOKUP: "stats_lookup",
  CONFIRM_SCOUTING_REPORT: "confirm_scouting_report",
  SCOUT: "scout",
  GENERATE_RESPONSE: "generate_response",
  ERROR: "error",
  INTERRUPT: "__interrupt__",
} as const;

export const INTERRUPT_TYPES = {
  PLAYER_SELECTION: "player_selection_for_scouting",
  SCOUTING_CONFIRMATION: "scouting_confirmation",
} as const;

export const INTENT_TYPES = {
  STATS_QUERY: "stats_query",
  SCOUTING_REPORT: "scouting_report",
  TEXT_RESPONSE: "text_response",
  EXTRACT_PLAYER: "extract_player_from_results",
  CONTINUE_CHAIN: "continue_chain",
  TERMINATE: "terminate",
} as const;

export const INTENT_MESSAGES: Record<string, string[]> = {
  [INTENT_TYPES.STATS_QUERY]: [
    "Analyzing player statistics...",
    "Crunching the numbers...",
    "Looking up performance data...",
    "Searching through game stats...",
    "Diving into the data...",
  ],
  [INTENT_TYPES.SCOUTING_REPORT]: [
    "Preparing scouting analysis...",
    "Gathering player profile...",
    "Building comprehensive report...",
    "Analyzing player potential...",
    "Compiling scouting insights...",
  ],
  [INTENT_TYPES.TEXT_RESPONSE]: [
    "Processing your question...",
    "Thinking about this...",
    "Working on your request...",
    "Analyzing your query...",
  ],
  [INTENT_TYPES.EXTRACT_PLAYER]: [
    "Identifying player from results...",
    "Matching player records...",
    "Refining search results...",
  ],
  [INTENT_TYPES.CONTINUE_CHAIN]: [
    "Continuing analysis...",
    "Processing next step...",
    "Moving forward...",
  ],
  [INTENT_TYPES.TERMINATE]: ["Wrapping up...", "Finalizing response..."],
};

export type AgentNodeType = (typeof AGENT_NODES)[keyof typeof AGENT_NODES];
export type InterruptType =
  (typeof INTERRUPT_TYPES)[keyof typeof INTERRUPT_TYPES];
