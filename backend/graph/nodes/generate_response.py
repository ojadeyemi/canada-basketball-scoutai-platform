"""Generate response node: Final node that formats output based on state."""

from typing import Any

from langchain_core.messages import SystemMessage
from pydantic import BaseModel, Field

from config.constants import (
    INTENT_SCOUTING_REPORT,
    INTENT_STATS_QUERY,
    RESPONSE_TYPE_QUERY_RESULT,
    RESPONSE_TYPE_SCOUTING_PLAN,
    RESPONSE_TYPE_TEXT,
)
from graph.configuration import get_llm
from graph.prompts.generate_response import GENERATE_RESPONSE_PROMPT
from graph.state import AgentResponse, AgentState


class TextResponseOutput(BaseModel):
    """Structured output for LLM-generated text responses."""

    main_response: str = Field(description="Natural language response to user")


async def generate_response(state: AgentState) -> dict[str, Any]:
    """
    Generate final response based on state.

    This node consolidates all state into a deterministic AgentResponse:
    - Extracts data from query_result, scouting_report
    - Uses LLM only for main_response text generation
    - Returns typed AgentResponse with response_type and conditional fields

    Args:
        state: Current agent state

    Returns:
        State update with AgentResponse
    """
    intent = state.get("intent")
    entities = state.get("entities", {})
    query_context = entities.get("query_context") if entities else None
    query_result = state.get("query_result")
    scouting_report = state.get("scouting_report")
    pdf_url = state.get("pdf_url")
    error = state.get("error")

    if error:
        response: AgentResponse = {
            "response_type": RESPONSE_TYPE_TEXT,
            "main_response": f"I encountered an error: {error}. Please try rephrasing your question.",
        }
        return {"response": response}

    if intent == INTENT_STATS_QUERY and query_result:
        data = query_result.data if hasattr(query_result, "data") else []  # type: ignore
        chart_config = (
            query_result.chart_config if hasattr(query_result, "chart_config") else None  # type: ignore
        )
        summary_text = (
            query_result.summary_text  # type: ignore
            if hasattr(query_result, "summary_text")
            else "Query completed successfully."
        )

        response: AgentResponse = {
            "response_type": RESPONSE_TYPE_QUERY_RESULT,
            "main_response": summary_text,
            "data": data,  # type: ignore
            "chart_config": chart_config,  # type: ignore
            "query_result": query_result.model_dump()  # type: ignore
            if hasattr(query_result, "model_dump")
            else query_result,  # type: ignore
        }
        return {"response": response}

    if intent == INTENT_SCOUTING_REPORT and scouting_report:
        player_name = state.get("player_name", "Player")
        main_text = f"Scouting report generated for {player_name}."

        if pdf_url:
            main_text += " PDF available for download."

        response: AgentResponse = {
            "response_type": RESPONSE_TYPE_SCOUTING_PLAN,
            "main_response": main_text,
            "scouting_report": scouting_report.model_dump()  # type: ignore
            if hasattr(scouting_report, "model_dump")
            else scouting_report,  # type: ignore
            "pdf_url": pdf_url,  # type: ignore
        }
        return {"response": response}

    llm = get_llm(model="gemini-2.5-flash", temperature=0.7)

    additional_context = ""
    if query_context:
        if (
            "needs" in query_context.lower()
            or "clarify" in query_context.lower()
            or "missing" in query_context.lower()
        ):
            additional_context = f"\n\nIMPORTANT: {query_context}\nThe user's query needs more information. Politely ask them to provide missing details (player name, league, or season)."
        else:
            additional_context = f"\n\nQuery context: {query_context}"

    system_prompt = GENERATE_RESPONSE_PROMPT.format(
        additional_context=additional_context
    )

    try:
        llm_with_struct = llm.with_structured_output(TextResponseOutput)
        response_output: TextResponseOutput = await llm_with_struct.ainvoke(  # type: ignore
            [SystemMessage(content=system_prompt), *state["messages"]]
        )

        response: AgentResponse = {
            "response_type": RESPONSE_TYPE_TEXT,
            "main_response": response_output.main_response,
        }
        return {"response": response}

    except Exception:
        response: AgentResponse = {
            "response_type": RESPONSE_TYPE_TEXT,
            "main_response": "I'm here to help with Canada Basketball scouting. How can I assist you?",
        }
        return {"response": response}
