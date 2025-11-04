"""LangGraph state definition with TypedDict and Annotated reducers."""

from typing import Annotated, Literal, Sequence, TypedDict

from langchain_core.messages.base import BaseMessage
from langgraph.graph import add_messages

from graph.schemas.scouting import ScoutingReport
from graph.schemas.visualization import QueryResult

IntentType = Literal[
    "stats_query",
    "scouting_report",
    "text_response",
    "extract_player_from_results",
    "continue_chain",
    "terminate",
]

ResponseType = Literal[
    "text_response",
    "query_result",
    "scouting_report_plan",
]


class AgentResponse(TypedDict, total=False):
    """Final response structure from generate_response node."""

    response_type: ResponseType
    main_response: str
    query_result: QueryResult | None
    scouting_report: dict | None
    pdf_url: str | None
    chart_config: dict | None
    data: list[dict] | None


class AgentState(TypedDict):
    """Main agent conversation state with auto-merging reducers."""

    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_query: str
    intent: IntentType | None
    entities: dict | None
    player_id: str | int | None
    player_name: str | None
    league: str | None
    query_result: QueryResult | None
    scouting_report_confirmed: bool
    scouting_report: ScoutingReport | None
    pdf_url: str | None
    error: str | None
    routing_iteration: int
    response: AgentResponse | None
