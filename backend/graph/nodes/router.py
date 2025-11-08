"""Router node: Intent classification and entity extraction."""

from typing import Literal

from langchain_core.messages import SystemMessage
from pydantic import BaseModel, Field

from config.constants import (
    INTENT_SCOUTING_REPORT,
    INTENT_STATS_QUERY,
    INTENT_TERMINATE,
    INTENT_TEXT_RESPONSE,
    LEAGUE_CCAA,
    LEAGUE_CEBL,
    LEAGUE_HOOPQUEENS,
    LEAGUE_USPORTS,
)
from graph.configuration import get_router_llm
from graph.prompts.router import ROUTER_PROMPT
from graph.state import AgentState

IntentType = Literal["stats_query", "scouting_report", "text_response", "terminate"]
LeagueType = Literal["CEBL", "U SPORTS", "CCAA", "HoopQueens"]


class RouterOutput(BaseModel):
    """Structured output for router classification."""

    intent: IntentType = Field(
        description=f"User's intent: {INTENT_STATS_QUERY}, {INTENT_SCOUTING_REPORT}, {INTENT_TEXT_RESPONSE}, {INTENT_TERMINATE}"
    )
    player_name: str | None = Field(
        default=None,
        description="Player name from current message OR conversation history (always populate from history when available)",
    )
    league: LeagueType = Field(
        default=LEAGUE_CEBL,
        description=f"League: {LEAGUE_CEBL}, {LEAGUE_USPORTS}, {LEAGUE_CCAA}, {LEAGUE_HOOPQUEENS} (always populate from history when available)",
    )
    season: str = Field(
        default="2025",
        description="Season year (default '2025', always populate from history when available)",
    )
    query_context: str | None = Field(
        default=None,
        description="Query goal OR what's needed if insufficient info",
    )


async def router(state: AgentState) -> dict:
    """
    Classify user intent and extract entities with conversation awareness.

    Multi-turn routing logic:
    1. Use LLM to classify intent from full conversation history
    2. LLM can see AI messages from stats_lookup/scout nodes for context
    3. If intent is "extract_player_from_results", extract from query_result
    4. If intent is "terminate", signal final response generation
    5. Track routing iterations for debugging

    Args:
        state: Current agent state with messages, query_result, routing_iteration

    Returns:
        State update with intent, entities, player_name, league, routing_iteration
    """
    llm = get_router_llm()
    llm_with_structured_output = llm.with_structured_output(RouterOutput)

    user_query = state["messages"][-1].content
    query_result = state.get("query_result")
    routing_iteration = state.get("routing_iteration", 0) + 1

    print(f"\n{'=' * 80}")
    print(f"[ROUTER] Iteration {routing_iteration}")
    print(f"{'=' * 80}")
    print(f"[ROUTER] Current query: {user_query[:150]}")
    print(f"[ROUTER] Message history ({len(state['messages'])} messages):")
    for i, msg in enumerate(state["messages"]):
        msg_type = msg.__class__.__name__
        content_preview = str(msg.content)[:100].replace("\n", " ")
        print(f"  [{i}] {msg_type}: {content_preview}")
    print(f"[ROUTER] Query result present: {query_result is not None}")
    print(f"{'=' * 80}\n")

    try:
        result: RouterOutput = await llm_with_structured_output.ainvoke(
            [SystemMessage(content=ROUTER_PROMPT), *state["messages"]]
        )  # type: ignore

        print(f"[ROUTER] Intent: {result.intent}")
        print(f"[ROUTER] Entities: player={result.player_name}, league={result.league}, season={result.season}")

        entities = {
            "player_name": result.player_name,
            "league": result.league,
            "season": result.season or "2025",
            "query_context": result.query_context,
        }

        return {
            "intent": result.intent,
            "entities": entities,
            "player_name": result.player_name,
            "league": result.league,
            "user_query": user_query,
            "routing_iteration": routing_iteration,
        }

    except Exception as e:
        print(f"[ROUTER ERROR] {e}")
        return {
            "intent": INTENT_TEXT_RESPONSE,
            "entities": {"query_context": "error"},
            "error": f"Intent classification failed: {str(e)}",
            "routing_iteration": routing_iteration,
        }
