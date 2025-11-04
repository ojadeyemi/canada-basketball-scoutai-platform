"""Scouting report schemas for Canada Basketball talent identification.

This module contains all schemas related to scouting reports, including:
- ScoutingReport: Comprehensive player evaluation with AI-generated insights
- ScoutingReportPlan: Wrapper for async PDF generation job tracking
"""

from datetime import date, datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field

# Import PlayerDetail from FastAPI app schemas (player stats API response)
from app.schemas.player import PlayerDetail


# ============================================================================
# ENUMS
# ============================================================================


class League(str, Enum):
    """Canadian basketball leagues."""

    CEBL = "CEBL"
    USPORTS = "U SPORTS"
    CCAA = "CCAA"
    OCAA = "OCAA"
    PACWEST = "PACWEST"
    HOOPQUEENS = "HoopQueens"


class Position(str, Enum):
    """Basketball positions."""

    GUARD = "Guard"
    FORWARD = "Forward"
    CENTER = "Center"
    WING = "Wing"
    COMBO_GUARD = "Combo Guard"
    STRETCH_FOUR = "Stretch Four"


class PlayerArchetype(str, Enum):
    """Player archetype classifications."""

    SCORING_PLAYMAKER = "Scoring Playmaker"
    THREE_AND_D = "3&D Wing"
    RIM_PROTECTOR = "Rim Protector"
    FLOOR_GENERAL = "Floor General"
    SLASHER = "Slasher"
    SPOT_UP_SHOOTER = "Spot-Up Shooter"
    STRETCH_BIG = "Stretch Big"
    TWO_WAY_WING = "Two-Way Wing"
    ATHLETIC_FINISHER = "Athletic Finisher"
    POST_SCORER = "Post Scorer"


class NationalTeamFit(str, Enum):
    """National team fit rating."""

    STRONG_FIT = "Strong Fit"
    GOOD_FIT = "Good Fit"
    DEPTH_CONSIDERATION = "Depth Consideration"
    DEVELOPMENTAL = "Developmental"
    NOT_RECOMMENDED = "Not Recommended"


# ============================================================================
# NESTED MODELS
# ============================================================================


class PlayerProfile(BaseModel):
    """Player profile information (basic scouting header)."""

    name: str
    position: str | None = None
    jersey_number: str | None = None
    height: str | None = None
    weight: str | None = None
    date_of_birth: date | None = None
    age: int | None = None
    current_team: str
    league: League
    player_photo_url: str | None = None


class Strength(BaseModel):
    """Player strength with title and description."""

    title: str
    description: str


class Weakness(BaseModel):
    """Player weakness with title and description."""

    title: str
    description: str


class NationalTeamAssessment(BaseModel):
    """National team fit assessment for specific team type."""

    team_type: str  # "Senior 5v5", "U21", "U19", "3x3", "Senior Women 5v5", "U19 Women", "3x3 Women"
    fit_rating: NationalTeamFit
    rationale: str

    class Config:
        """Pydantic config."""

        use_enum_values = True


class TrajectoryPoint(BaseModel):
    """Season-by-season progression point."""

    season: str
    ppg: float
    trend_description: str
    percentage_change: float | None = None


class FinalRecommendation(BaseModel):
    """Final scouting recommendation."""

    verdict_title: str
    summary: str
    best_use_cases: list[str]
    overall_grade_domestic: str  # e.g., "A-", "B+", "C"
    overall_grade_national: str  # e.g., "A-", "B+", "C"


# ============================================================================
# SCOUTING ANALYSIS (LLM-generated fields only)
# ============================================================================


class ScoutingAnalysis(BaseModel):
    """
    AI-generated scouting analysis (subset of ScoutingReport).

    This schema contains ONLY the fields that the LLM should generate.
    Metadata (report_id, generated_at) and player data (player_profile, player_detail)
    are populated separately in the scout node.
    """

    # Talent Evaluation (AI-generated insights)
    archetype: PlayerArchetype
    archetype_description: str

    strengths: list[Strength]  # Each with title + detailed description
    weaknesses: list[Weakness]  # Each with title + detailed description

    # Development Trajectory (AI-generated analysis)
    trajectory_analysis: list[TrajectoryPoint]  # Season-by-season progression
    trajectory_summary: str  # Overall trend narrative

    # National Team Fit (AI-generated assessment)
    national_team_assessments: list[NationalTeamAssessment]  # Multiple team types

    # Final Verdict (AI-generated recommendation)
    final_recommendation: FinalRecommendation

    class Config:
        """Pydantic config."""

        use_enum_values = True


# ============================================================================
# MAIN SCOUTING REPORT
# ============================================================================


class ScoutingReport(BaseModel):
    """
    Comprehensive scouting report for Canada Basketball talent identification.

    This schema is designed to provide actionable insights for:
    1. Domestic league talent evaluation (CEBL, U SPORTS, CCAA, HoopQueens)
    2. National team selection (Senior, U21, U19, 3x3)
    3. Player development tracking

    NOTE: Removed redundant fields (current_season_stats, career_stats, comparative_analysis,
    cebl_data, usports_data) - all this data is now in player_detail field which comes from
    the FastAPI /api/stats/player endpoint.
    """

    report_id: str = Field(
        default_factory=lambda: f"SR-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )
    generated_at: datetime = Field(default_factory=datetime.now)

    # Core Player Information
    player_profile: PlayerProfile

    # Player stats and metrics (from FastAPI stats API)
    player_detail: PlayerDetail | None = None

    # Talent Evaluation (AI-generated insights)
    archetype: PlayerArchetype
    archetype_description: str

    strengths: list[Strength]  # Each with title + detailed description
    weaknesses: list[Weakness]  # Each with title + detailed description

    # Development Trajectory (AI-generated analysis)
    trajectory_analysis: list[TrajectoryPoint]  # Season-by-season progression
    trajectory_summary: str  # Overall trend narrative

    # National Team Fit (AI-generated assessment)
    national_team_assessments: list[NationalTeamAssessment]  # Multiple team types

    # Final Verdict (AI-generated recommendation)
    final_recommendation: FinalRecommendation

    class Config:
        """Pydantic config."""

        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
        }


# ============================================================================
# SCOUTING REPORT PLAN (Job Tracking Wrapper)
# ============================================================================


class ScoutingReportPlan(BaseModel):
    """Plan for asynchronous PDF scouting report generation.

    Wraps the full ScoutingReport schema and tracks background PDF generation job.
    The scouting_report field contains the complete structured report for immediate display,
    while job tracking fields monitor PDF generation status.
    """

    response_type: Literal["scouting_report_plan"] = Field(
        default="scouting_report_plan", description="Response type discriminator"
    )

    # Full scouting report (typed as ScoutingReport)
    scouting_report: ScoutingReport | None = Field(
        default=None, description="Complete ScoutingReport object"
    )

    # Job tracking (for PDF generation)
    job_id: str = Field(..., description="UUID for tracking PDF generation job")
    status: Literal["pending", "processing", "completed", "failed"] = Field(
        default="pending", description="Current PDF generation job status"
    )

    # Optional fields (populated when PDF job completes)
    local_path: str | None = Field(
        default=None, description="Local PDF file path (when PDF ready)"
    )
    error_message: str | None = Field(
        default=None, description="Error details if PDF generation failed"
    )

    # User message
    message: str = Field(
        default="Scouting report generated. PDF is being prepared in the background.",
        description="Status message for user",
    )
