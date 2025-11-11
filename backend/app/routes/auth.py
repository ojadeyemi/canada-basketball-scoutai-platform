"""Authentication endpoints."""

from fastapi import APIRouter

from app.schemas.auth import PasswordVerifyRequest, PasswordVerifyResponse
from config.settings import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/verify", response_model=PasswordVerifyResponse, include_in_schema=False)
async def verify_password(data: PasswordVerifyRequest) -> PasswordVerifyResponse:
    """
    Verify agent access password.

    Args:
        data: Password verification request

    Returns:
        Success status and message
    """
    if data.password == settings.agent_password:
        return PasswordVerifyResponse(success=True, message="Authentication successful")

    return PasswordVerifyResponse(success=False, message="Invalid password")
