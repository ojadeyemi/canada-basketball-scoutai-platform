"""Scout node: Generate comprehensive scouting reports with PDF output."""

import ast
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Sequence

import httpx
from config.pdf_constants import PDF_STORAGE_DIR
from graph.configuration import get_scouting_llm
from graph.prompts.scout import SCOUT_PROMPT
from graph.schemas.scouting import (
    League,
    PlayerProfile,
    ScoutingAnalysis,
    ScoutingReport,
)
from graph.state import AgentState
from graph.tools.pdf_generator.pdf_generator import PDFGenerator
from graph.utils.gcs_helpers import generate_signed_url, upload_pdf_to_gcs
from langchain.agents import create_agent
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage


def _summarize_conversation(messages: Sequence[BaseMessage]) -> str:
    """Summarize recent conversation for scouting context."""
    if not messages or len(messages) <= 2:
        return "No prior conversation."

    recent = messages[-6:-1] if len(messages) > 6 else messages[:-1]
    lines = ["**Recent Conversation:**"]
    for msg in recent:
        role = "User" if msg.type == "human" else "Assistant"
        content = str(msg.content)[:150]
        lines.append(f"- {role}: {content}")
    return "\n".join(lines)


def _build_player_profile(player_detail: dict, league: League) -> PlayerProfile:
    """Build PlayerProfile from PlayerDetail API response."""
    return PlayerProfile(
        name=player_detail.get("full_name", "Unknown Player"),
        position=player_detail.get("position"),
        jersey_number=str(player_detail.get("additional_info", {}).get("jersey_number"))
        if player_detail.get("additional_info", {}).get("jersey_number")
        else None,
        height=player_detail.get("height"),
        weight=None,
        date_of_birth=None,
        age=player_detail.get("age"),
        current_team=player_detail.get("current_team", "Unknown Team"),
        league=league,
        player_photo_url=player_detail.get("photo_url"),
    )


async def scout(state: AgentState) -> dict:
    """
    Generate comprehensive scouting report with PDF output.

    Flow:
    1. Fetch player_detail from API using player_id + league
    2. Summarize conversation history
    3. Use create_agent with ScoutingAnalysis structured output
    4. Build full ScoutingReport from ScoutingAnalysis + player_detail
    5. Generate PDF from ScoutingReport
    6. Upload to GCS and get signed URL (fallback to local storage)
    7. Append AI message summarizing scouting analysis
    8. Return scouting_report + pdf_url + AI message

    Args:
        state: Current agent state with player_id, league, player_name, messages

    Returns:
        State update with scouting_report, pdf_url, and AI message
    """
    player_id = state.get("player_id")
    league_str = state.get("league")
    player_name = state.get("player_name", "")
    messages = state.get("messages", [])
    api_base = os.getenv("API_BASE_URL", "http://localhost:8000")

    if not player_id or not league_str:
        return {
            "error": "Missing player_id or league for scouting report generation",
            "scouting_report": None,
            "pdf_url": None,
            "messages": [AIMessage(content="**Scouting Error**: Missing player information.")],
        }

    try:
        league = League(league_str)
    except (ValueError, TypeError):
        league_map = {
            "cebl": League.CEBL,
            "usports": League.USPORTS,
            "u sports": League.USPORTS,
            "ccaa": League.CCAA,
            "ocaa": League.OCAA,
            "pacwest": League.PACWEST,
            "hoopqueens": League.HOOPQUEENS,
        }
        league = league_map.get(str(league_str).lower(), League.CEBL)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            league_path = league.value.lower().replace(" ", "")
            response = await client.get(f"{api_base}/api/search/player/{league_path}/{player_id}")
            response.raise_for_status()
            player_detail_dict = response.json()

    except httpx.TimeoutException:
        return {
            "error": "Request timeout while fetching player data",
            "scouting_report": None,
            "pdf_url": None,
            "messages": [AIMessage(content="**Scouting Error**: Request timeout.")],
        }
    except httpx.HTTPStatusError as e:
        return {
            "error": f"HTTP error {e.response.status_code}: {e.response.text}",
            "scouting_report": None,
            "pdf_url": None,
            "messages": [AIMessage(content=f"**Scouting Error**: HTTP {e.response.status_code}")],
        }
    except Exception as e:
        return {
            "error": f"Failed to fetch player data: {str(e)}",
            "scouting_report": None,
            "pdf_url": None,
            "messages": [AIMessage(content=f"**Scouting Error**: {str(e)}")],
        }

    conversation_summary = _summarize_conversation(messages)

    try:
        llm = get_scouting_llm(temperature=0.3)

        system_message = SCOUT_PROMPT.format(
            player_detail=json.dumps(player_detail_dict, indent=2),
            conversation_summary=conversation_summary,
        )

        agent = create_agent(
            llm,
            tools=[],
            system_prompt=system_message,
            response_format=ScoutingAnalysis,
        )

        agent_input = {
            "messages": [HumanMessage(content=f"Generate a comprehensive scouting analysis for {player_name}.")]
        }

        result = await agent.ainvoke(agent_input)  # type: ignore

        if "structured_response" not in result:
            raise ValueError("Agent did not return structured_response")

        scouting_analysis: ScoutingAnalysis = result["structured_response"]

    except Exception as e:
        error_str = str(e)
        if "message" in error_str:
            # Try to extract message from JSON-like string
            try:
                error_dict = ast.literal_eval(error_str.split("body: ")[-1])
                error_message = error_dict.get("message", error_str)
            except Exception:
                error_message = error_str
        else:
            error_message = error_str

        error_message = error_message[:500]  # Truncate to first 500 chars

        return {
            "error": f"Scouting analysis generation failed: {str(error_message)}",
            "scouting_report": None,
            "pdf_url": None,
            "messages": [AIMessage(content=f"**Scouting Error**: Analysis failed - {str(e)}")],
        }

    try:
        from app.schemas.player import PlayerDetail

        player_detail = PlayerDetail(**player_detail_dict)
        player_profile = _build_player_profile(player_detail_dict, league)

        scouting_report = ScoutingReport(
            report_id=str(uuid.uuid4()),
            generated_at=datetime.now(),
            player_profile=player_profile,
            player_detail=player_detail,
            archetype=scouting_analysis.archetype,
            archetype_description=scouting_analysis.archetype_description,
            strengths=scouting_analysis.strengths,
            weaknesses=scouting_analysis.weaknesses,
            trajectory_analysis=scouting_analysis.trajectory_analysis,
            trajectory_summary=scouting_analysis.trajectory_summary,
            national_team_assessments=scouting_analysis.national_team_assessments,
            final_recommendation=scouting_analysis.final_recommendation,
        )

    except Exception as e:
        return {
            "error": f"Failed to build scouting report: {str(e)}",
            "scouting_report": None,
            "pdf_url": None,
            "messages": [AIMessage(content=f"**Scouting Error**: Report build failed - {str(e)}")],
        }

    pdf_url = None

    try:
        pdf_data = scouting_report.model_dump(mode="json")
        pdf_generator = PDFGenerator()
        safe_player_name = (
            "".join(
                c if c.isalnum() or c in (" ", "-") else "_"
                for c in player_name  # type: ignore
            ).strip()
            or "Unknown_Player"
        )
        pdf_title = f"Scouting_Report_{safe_player_name.replace(' ', '_')}"
        pdf_path = await pdf_generator.generate_pdf(data=pdf_data, pdf_title=pdf_title)

        try:
            gcs_path = upload_pdf_to_gcs(
                local_pdf_path=pdf_path,
                destination_blob_name=f"scouting-reports/{safe_player_name.replace(' ', '-').lower()}.pdf",
            )
            pdf_url = generate_signed_url(gcs_path, expiration_hours=168)

            if Path(pdf_path).exists():
                Path(pdf_path).unlink()

        except Exception:
            local_filename = f"{safe_player_name.replace(' ', '-').lower()}.pdf"
            local_pdf_path = PDF_STORAGE_DIR / local_filename

            import shutil

            shutil.copy(pdf_path, local_pdf_path)
            pdf_url = f"/api/pdf/{PDF_STORAGE_DIR.name}/{local_filename}"

            if Path(pdf_path).exists():
                Path(pdf_path).unlink()

    except Exception:
        pdf_url = None

    ai_summary = f"**Scouting Report Generated** for {player_name} ({league.value}):\n"
    ai_summary += f"- Archetype: {scouting_report.archetype}\n"
    ai_summary += f"- Strengths: {len(scouting_report.strengths)} identified\n"
    ai_summary += f"- Weaknesses: {len(scouting_report.weaknesses)} identified\n"
    ai_summary += f"- PDF: {'Available' if pdf_url else 'Generation failed'}"

    return {
        "scouting_report": scouting_report,
        "pdf_url": pdf_url,
        "error": None,
        "messages": [AIMessage(content=ai_summary)],
    }
