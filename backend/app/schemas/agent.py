"""Agent chat schemas."""

from typing import Literal

from pydantic import BaseModel, Field

InterruptType = Literal[
    "player_selection_for_scouting",
    "scouting_confirmation",
]


class ChatInput(BaseModel):
    """Chat input with interrupt resume support."""

    user_input: str | int | bool = Field(
        ...,
        description="User message OR interrupt resume value (str/int/bool)",
    )
    session_id: str = Field(..., description="Session thread ID")
    is_resume: bool = Field(False, description="True if resuming from interrupt")
    interrupt_type: InterruptType | None = Field(
        None,
        description="Type of interrupt being resumed",
    )
