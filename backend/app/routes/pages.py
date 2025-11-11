"""Static page routes."""

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(tags=["Pages"])


@router.get("/ui", include_in_schema=False)
async def serve_debug_ui():
    """
    Serve the debug UI for interacting with the AI scouting agent.

    Returns:
        FileResponse: The HTML file response.
    """
    html_path = Path("app/static/index.html")
    if not html_path.exists():
        raise HTTPException(status_code=404, detail="UI file not found")
    return FileResponse(html_path)
