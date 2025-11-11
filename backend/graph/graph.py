"""Main LangGraph workflow for Canada Basketball AI Agent."""

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import interrupt

from app.services.search_service import search_players
from config.constants import (
    INTENT_SCOUTING_REPORT,
    INTENT_STATS_QUERY,
    INTENT_TERMINATE,
    INTERRUPT_PLAYER_SELECTION_SCOUTING,
    INTERRUPT_SCOUTING_CONFIRMATION,
    NODE_CONFIRM_SCOUTING,
    NODE_GENERATE_RESPONSE,
    NODE_ROUTER,
    NODE_SCOUT,
    NODE_STATS_LOOKUP,
)
from config.settings import settings
from graph.nodes.generate_response import generate_response
from graph.nodes.router import router
from graph.nodes.scout import scout
from graph.nodes.stats_lookup import stats_lookup
from graph.state import AgentState


def route_after_router(state: AgentState) -> str:
    """
    Determine next node after router based on intent.

    Args:
        state: Current agent state with intent

    Returns:
        Node name to execute next
    """
    intent = state.get("intent")

    if intent == INTENT_TERMINATE:
        return NODE_GENERATE_RESPONSE

    if intent == INTENT_STATS_QUERY:
        return NODE_STATS_LOOKUP
    elif intent == INTENT_SCOUTING_REPORT:
        return NODE_CONFIRM_SCOUTING
    else:
        return NODE_GENERATE_RESPONSE


async def confirm_scouting_report(state: AgentState) -> dict:
    """
    Player selection + confirmation node for scouting reports with human-in-the-loop.

    Uses LangGraph's interrupt() primitive for two-stage user confirmation:
    1. INTERRUPT 1 (player_selection_for_scouting): User selects from search results
    2. INTERRUPT 2 (scouting_confirmation): User confirms report generation

    Args:
        state: Current agent state with player_name, league

    Returns:
        State update with player_id, scouting_report_confirmed, or error
    """
    player_name = state.get("player_name")
    league = state.get("league")

    if not player_name:
        return {
            "error": "No player name provided",
            "scouting_report_confirmed": False,
        }

    try:
        leagues_list = [league.lower().replace(" ", "")] if league else None
        search_results_objects = search_players(
            query=player_name,
            leagues=leagues_list,
            limit=20,
            min_score=80,
        )
        search_results = [result.model_dump() for result in search_results_objects]

    except Exception as e:
        return {
            "error": f"Search failed: {str(e)}",
            "scouting_report_confirmed": False,
        }

    if len(search_results) == 0:
        return {
            "error": f"No players found matching '{player_name}'",
            "scouting_report_confirmed": False,
        }

    user_selection = interrupt(
        {
            "type": INTERRUPT_PLAYER_SELECTION_SCOUTING,
            "message": f"Found {len(search_results)} player(s). Select one:",
            "search_results": search_results,
        }
    )

    if not isinstance(user_selection, int) or user_selection >= len(search_results):
        return {
            "error": "Invalid player selection",
            "scouting_report_confirmed": False,
        }

    selected_player = search_results[user_selection]
    player_id = str(selected_player["player_id"])
    player_name = selected_player["full_name"]
    league = selected_player["league"]

    user_confirmed = interrupt(
        {
            "type": INTERRUPT_SCOUTING_CONFIRMATION,
            "player_name": player_name,
            "player_id": player_id,
            "league": league,
            "message": f"Generate scouting report for {player_name} ({league})? This will analyze stats and generate a PDF.",
        }
    )

    if user_confirmed:
        return {
            "player_id": player_id,
            "player_name": player_name,
            "league": league,
            "scouting_report_confirmed": True,
        }
    else:
        return {
            "scouting_report_confirmed": False,
            "error": "Scouting report cancelled by user",
        }


def route_after_confirmation(state: AgentState) -> str:
    """Route after scouting confirmation."""
    confirmed = state.get("scouting_report_confirmed", False)
    return NODE_SCOUT if confirmed else NODE_GENERATE_RESPONSE


async def build_graph(checkpointer: AsyncPostgresSaver) -> CompiledStateGraph:
    """
    Build and compile the Canada Basketball scouting agent graph.

    Args:
        checkpointer: Postgres checkpointer for session persistence

    Returns:
        Compiled StateGraph
    """
    graph = StateGraph(AgentState)

    graph.add_node(NODE_ROUTER, router)
    graph.add_node(NODE_STATS_LOOKUP, stats_lookup)
    graph.add_node(NODE_CONFIRM_SCOUTING, confirm_scouting_report)
    graph.add_node(NODE_SCOUT, scout)
    graph.add_node(NODE_GENERATE_RESPONSE, generate_response)

    graph.set_entry_point(NODE_ROUTER)

    graph.add_conditional_edges(
        NODE_ROUTER,
        route_after_router,
        {
            NODE_STATS_LOOKUP: NODE_STATS_LOOKUP,
            NODE_CONFIRM_SCOUTING: NODE_CONFIRM_SCOUTING,
            NODE_GENERATE_RESPONSE: NODE_GENERATE_RESPONSE,
        },
    )

    graph.add_conditional_edges(
        NODE_CONFIRM_SCOUTING,
        route_after_confirmation,
        {
            NODE_SCOUT: NODE_SCOUT,
            NODE_GENERATE_RESPONSE: NODE_GENERATE_RESPONSE,
        },
    )

    graph.add_edge(NODE_STATS_LOOKUP, NODE_GENERATE_RESPONSE)
    graph.add_edge(NODE_SCOUT, NODE_GENERATE_RESPONSE)
    graph.add_edge(NODE_GENERATE_RESPONSE, END)

    scouting_agent = graph.compile(checkpointer=checkpointer)

    # Generate graph visualization only in development
    if settings.environment == "development":
        try:
            with open("graph.png", "wb") as f:
                graph_png = scouting_agent.get_graph().draw_mermaid_png()
                f.write(graph_png)
        except Exception:
            pass

    return scouting_agent
