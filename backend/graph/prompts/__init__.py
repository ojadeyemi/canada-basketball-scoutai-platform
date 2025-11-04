"""Graph prompts module - system prompts for LangGraph nodes."""

from graph.prompts.generate_response import GENERATE_RESPONSE_PROMPT
from graph.prompts.router import ROUTER_PROMPT
from graph.prompts.scout import SCOUT_PROMPT
from graph.prompts.stats_lookup import SQL_AGENT_PROMPT

__all__ = [
    "ROUTER_PROMPT",
    "SQL_AGENT_PROMPT",
    "SCOUT_PROMPT",
    "GENERATE_RESPONSE_PROMPT",
]
