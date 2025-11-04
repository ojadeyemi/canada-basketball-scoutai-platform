"""AI agent chat endpoints."""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.schemas.agent import ChatInput
from app.services.agent_service import event_generator

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])


@router.post("/chat")
async def stream_chat(data: ChatInput, request: Request):
    """
    Stream chat responses from the AI scouting agent.

    Returns:
        StreamingResponse with NDJSON format (one JSON object per line)
    """
    if not data.session_id:
        raise HTTPException(status_code=400, detail="No session_id provided")

    return StreamingResponse(
        event_generator(data, request),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
