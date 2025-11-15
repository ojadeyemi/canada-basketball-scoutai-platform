"""Application constants."""

# ============================================================================
# INTENT TYPES
# ============================================================================

from typing import Literal

INTENT_STATS_QUERY = "stats_query"
INTENT_SCOUTING_REPORT = "scouting_report"
INTENT_TEXT_RESPONSE = "text_response"
INTENT_EXTRACT_PLAYER = "extract_player_from_results"
INTENT_CONTINUE_CHAIN = "continue_chain"
INTENT_TERMINATE = "terminate"

VALID_INTENTS = [
    INTENT_STATS_QUERY,
    INTENT_SCOUTING_REPORT,
    INTENT_TEXT_RESPONSE,
    INTENT_EXTRACT_PLAYER,
    INTENT_CONTINUE_CHAIN,
    INTENT_TERMINATE,
]


# ============================================================================
# LEAGUE NAMES
# ============================================================================

LEAGUE_CEBL = "CEBL"
LEAGUE_USPORTS = "U SPORTS"
LEAGUE_CCAA = "CCAA"
LEAGUE_HOOPQUEENS = "HoopQueens"

VALID_LEAGUES = [
    LEAGUE_CEBL,
    LEAGUE_USPORTS,
    LEAGUE_CCAA,
    LEAGUE_HOOPQUEENS,
]

LEAGUE_DB_MAP = {
    "cebl": "cebl",
    "usports": "usports",
    "ccaa": "ccaa",
    "hoopqueens": "hoopqueens",
}


# ============================================================================
# NODE NAMES
# ============================================================================

NODE_ROUTER = "router"
NODE_STATS_LOOKUP = "stats_lookup"
NODE_CONFIRM_SCOUTING = "confirm_scouting_report"
NODE_SCOUT = "scout"
NODE_GENERATE_RESPONSE = "generate_response"


# ============================================================================
# RESPONSE TYPES
# ============================================================================

RESPONSE_TYPE_TEXT = "text_response"
RESPONSE_TYPE_QUERY_RESULT = "query_result"
RESPONSE_TYPE_SCOUTING_PLAN = "scouting_report_plan"


# ============================================================================
# PDF JOB STATUSES
# ============================================================================

STATUS_PENDING = "pending"
STATUS_PROCESSING = "processing"
STATUS_GENERATING_PDF = "generating_pdf"
STATUS_UPLOADING = "uploading"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"

PDF_JOB_STATUSES = [
    STATUS_PENDING,
    STATUS_PROCESSING,
    STATUS_GENERATING_PDF,
    STATUS_UPLOADING,
    STATUS_COMPLETED,
    STATUS_FAILED,
]


# ============================================================================
# INTERRUPT TYPES
# ============================================================================

INTERRUPT_PLAYER_SELECTION_SCOUTING = "player_selection_for_scouting"
INTERRUPT_SCOUTING_CONFIRMATION = "scouting_confirmation"

INTERRUPT_TYPES = [
    INTERRUPT_PLAYER_SELECTION_SCOUTING,
    INTERRUPT_SCOUTING_CONFIRMATION,
]


# ============================================================================
# NDJSON STREAM KEYS
# ============================================================================

NODE = "node"
OUTPUT = "output"
ERROR = "error"


# ============================================================================
# ERROR MESSAGES
# ============================================================================

ERROR_EXPIRED_TOKEN = "LLM credentials have expired."
ERROR_CONNECTION = "Connection error occurred."
ERROR_TIMEOUT = "Request timed out."
ERROR_RATE_LIMIT = "Rate limit exceeded."
ERROR_INVALID_REQUEST = "Invalid request to LLM provider."
ERROR_AUTHENTICATION = "Authentication failed."
ERROR_GENERIC = "An error occurred."


# ============================================================================
# DATABASE DEFAULTS
# ============================================================================

DEFAULT_SEASON = "2024-25"

# League Categories
MENS_LEAGUE = "mens"
WOMENS_LEAGUE = "womens"
LeagueCategory = Literal["mens", "womens"]
