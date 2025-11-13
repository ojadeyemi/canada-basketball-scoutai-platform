"""Agent streaming service for NDJSON responses with interrupt support."""

import json

from fastapi import Request
from fastapi.encoders import jsonable_encoder
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Command

from app.schemas.agent import ChatInput
from config.constants import (
    ERROR,
    ERROR_AUTHENTICATION,
    ERROR_CONNECTION,
    ERROR_EXPIRED_TOKEN,
    ERROR_GENERIC,
    ERROR_INVALID_REQUEST,
    ERROR_RATE_LIMIT,
    ERROR_TIMEOUT,
    NODE,
    OUTPUT,
)

# TODO:
# 1. Fix scouting report URL generation for production environment.
# 2. Increase the vertical size/height of the generated scouting report PDF.
# 3. Add a timestamp or unique identifier to the PDF filename to prevent overwrites.


async def event_generator(chat_input: ChatInput, request: Request):
    """
    Stream LangGraph events as NDJSON with interrupt resume support.

    Args:
        chat_input: Chat input with user_input, session_id, is_resume, interrupt_type
        request: FastAPI request object (to access app.state)

    Yields:
        JSON lines: {"node": "router", "output": {...}}
    """
    config: RunnableConfig = {
        "configurable": {"thread_id": chat_input.session_id},
        "recursion_limit": 50,
    }

    graph: CompiledStateGraph = request.app.state.scouting_graph

    # Handle resume vs normal input
    # When is_resume=true, we're resuming from an interrupt() call in the graph.
    # The Command(resume=value) tells LangGraph to continue from the interrupted node
    # and pass the value to the next interrupt() invocation in that node.
    # See graph/graph.py:confirm_scouting_report for interrupt usage.
    if chat_input.is_resume:
        user_input_state = Command(resume=chat_input.user_input)
    else:
        user_input_state = {"messages": [HumanMessage(content=str(chat_input.user_input))]}

    try:
        async for event in graph.astream(user_input_state, config, stream_mode="updates"):
            for node_name, node_output in event.items():
                yield (json.dumps({NODE: node_name, OUTPUT: jsonable_encoder(node_output)}) + "\n")

    except Exception as e:
        error_message = _get_error_message(e)
        print(f"[ERROR] {type(e).__name__}: {e}")
        yield json.dumps({NODE: ERROR, OUTPUT: error_message}) + "\n"


def _get_error_message(exception: Exception) -> str:
    """Map exception types to user-friendly error messages."""
    error_str = str(exception)
    exception_type = type(exception).__name__

    # Token/credential errors
    if any(keyword in error_str for keyword in ["ExpiredToken", "InvalidToken", "expired", "invalid_grant"]):
        return ERROR_EXPIRED_TOKEN

    # Authentication errors
    if any(keyword in exception_type for keyword in ["AuthenticationError", "Unauthorized"]) or any(
        keyword in error_str for keyword in ["401", "unauthorized", "forbidden"]
    ):
        return ERROR_AUTHENTICATION

    # Connection errors
    if any(keyword in exception_type for keyword in ["ConnectionError", "NetworkError"]) or any(
        keyword in error_str for keyword in ["connection", "network", "unreachable", "refused"]
    ):
        return ERROR_CONNECTION

    # Timeout errors
    if any(keyword in exception_type for keyword in ["TimeoutError", "Timeout"]) or "timeout" in error_str.lower():
        return ERROR_TIMEOUT

    # Rate limit errors
    if any(keyword in exception_type for keyword in ["RateLimitError"]) or any(
        keyword in error_str for keyword in ["rate limit", "429", "too many requests"]
    ):
        return ERROR_RATE_LIMIT

    # Invalid request errors
    if any(keyword in exception_type for keyword in ["ValidationError", "ValueError"]):
        return ERROR_INVALID_REQUEST

    # Generic fallback
    return ERROR_GENERIC
