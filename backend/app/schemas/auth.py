"""Authentication schemas."""

from pydantic import BaseModel, Field


class PasswordVerifyRequest(BaseModel):
    """Request body for password verification."""

    password: str = Field(..., description="Password to verify", min_length=1)


class PasswordVerifyResponse(BaseModel):
    """Response for password verification."""

    success: bool = Field(..., description="Whether password is correct")
    message: str = Field(..., description="Status message")
