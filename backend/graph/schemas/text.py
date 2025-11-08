"""Text plan schema for text-based responses.

Used for simple lookups, biographical data, or when visualization is not appropriate.
"""

from typing import Any, Literal

from pydantic import BaseModel, Field


class TextPlan(BaseModel):
    """Structured plan for text-based response.

    Used for simple lookups, biographical data, or when visualization is not appropriate.
    """

    response_type: Literal["text_plan"] = Field(default="text_plan", description="Response type discriminator")

    message: str = Field(..., min_length=1, description="Natural language response message")

    # Optional structured data (for tables in text mode)
    data: list[dict[str, Any]] | None = Field(
        default=None, description="Optional tabular data to display alongside text"
    )

    # Optional formatting hints
    format: Literal["markdown", "plain"] | None = Field(
        default="plain", description="Text format hint for frontend rendering"
    )
