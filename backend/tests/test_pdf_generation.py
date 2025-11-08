"""Test PDF generation for Canada Basketball scouting reports.

This test fetches real player data from the running API and generates scouting reports.

Run with: python tests/test_pdf_generation.py
"""

import asyncio
import sys
from datetime import date, datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx

from app.schemas.player import PlayerDetail
from graph.schemas.scouting import (
    FinalRecommendation,
    League,
    NationalTeamAssessment,
    NationalTeamFit,
    PlayerArchetype,
    PlayerProfile,
    Position,
    ScoutingReport,
    Strength,
    TrajectoryPoint,
    Weakness,
)
from graph.tools.pdf_generator.pdf_generator import PDFGenerator

API_BASE_URL = "http://localhost:8000"


async def fetch_player_data(league: str, player_id: str) -> dict:
    """Fetch player data from the API.

    Args:
        league: League (usports or cebl)
        player_id: Player ID

    Returns:
        Player data dict
    """
    url = f"{API_BASE_URL}/api/search/player/{league}/{player_id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


def create_cebl_scouting_report(player_data: dict, player_detail) -> ScoutingReport:
    """Create CEBL scouting report from API data."""
    return ScoutingReport(
        report_id=f"SR-{datetime.now().strftime('%Y%m%d%H%M%S')}-CEBL",
        generated_at=datetime.now(),
        player_profile=PlayerProfile(
            name=player_data["full_name"],
            position=Position.GUARD,
            jersey_number="00",
            height=player_data.get("height"),
            weight=None,
            date_of_birth=date.fromisoformat(player_data["birth_date"]) if player_data.get("birth_date") else None,
            age=player_data.get("age"),
            current_team=player_data["current_team"],
            league=League.CEBL,
            player_photo_url=player_data.get("photo_url"),
        ),
        player_detail=player_detail,
        archetype=PlayerArchetype.SCORING_PLAYMAKER,
        archetype_description="Sean is a dynamic scoring guard with excellent shooting range and playmaking ability. His ability to create his own shot and facilitate for others makes him a dual threat in the CEBL.",
        strengths=[
            Strength(
                title="Versatile Scoring",
                description=f"Averaged {player_data['seasons'][0]['points_per_game']:.1f} PPG in {player_data['seasons'][0]['season']} season. Can score at all three levels with solid efficiency. True shooting percentage of {player_data['seasons'][0]['advanced_stats']['true_shooting_pct']:.1%} demonstrates effectiveness.",
            ),
            Strength(
                title="Playmaking Ability",
                description=f"Dishes out {player_data['seasons'][0]['assists_per_game']:.1f} assists per game with {player_data['seasons'][0]['advanced_stats']['assist_to_turnover_ratio']:.2f} assist-to-turnover ratio. Makes smart decisions with the ball and can run the offense.",
            ),
            Strength(
                title="Two-Way Impact",
                description=f"Contributes {player_data['seasons'][0]['steals_per_game']:.1f} steals and {player_data['seasons'][0]['blocks_per_game']:.1f} blocks per game. Competes hard on both ends of the floor with good defensive awareness.",
            ),
        ],
        weaknesses=[
            Weakness(
                title="Three-Point Consistency",
                description=f"Shooting {player_data['seasons'][0]['three_point_percentage']:.1%} from beyond the arc. Needs to improve perimeter shooting consistency to maximize offensive impact and spacing.",
            ),
            Weakness(
                title="Free Throw Shooting",
                description=f"Free throw percentage of {player_data['seasons'][0]['free_throw_percentage']:.1%} leaves room for improvement. Must become more reliable from the charity stripe in clutch moments.",
            ),
        ],
        trajectory_analysis=[
            TrajectoryPoint(
                season=season["season"],
                ppg=season["points_per_game"],
                trend_description=f"Season average: {season['points_per_game']:.1f} PPG",
                percentage_change=None,
            )
            for season in player_data["seasons"][:3]
        ],
        trajectory_summary=f"Sean has played {len(player_data['seasons'])} CEBL seasons, demonstrating consistency as a scoring guard. His career averages of {player_data['career_stats'][0]['points_per_game']:.1f} PPG and {player_data['career_stats'][0]['assists_per_game']:.1f} APG show his value as a two-way player. Continued development of perimeter shooting will elevate his game to the next level.",
        national_team_assessments=[
            NationalTeamAssessment(
                team_type="Senior 5v5",
                fit_rating=NationalTeamFit.DEPTH_CONSIDERATION,
                rationale="Quality scorer and playmaker with professional experience. Could provide depth scoring off the bench. Needs to improve three-point shooting consistency for international play.",
            ),
            NationalTeamAssessment(
                team_type="3x3",
                fit_rating=NationalTeamFit.GOOD_FIT,
                rationale="Versatile scoring and playmaking translate well to 3x3 format. Physical style and ability to create shots in tight spaces are valuable. Strong candidate for 3x3 program.",
            ),
        ],
        final_recommendation=FinalRecommendation(
            verdict_title="PROVEN CEBL GUARD WITH 3X3 UPSIDE",
            summary=f"Sean Miller-Moore is an experienced CEBL guard with {player_data['age']} years of professional experience. His scoring ability, playmaking, and two-way impact make him a valuable player in Canadian basketball. Strong 3x3 candidate with continued development potential.",
            best_use_cases=[
                "Primary ball-handler for CEBL teams",
                "3x3 national team guard prospect",
                "Veteran leadership and scoring off the bench",
            ],
            overall_grade_domestic="B+",
            overall_grade_national="C+",
        ),
    )


def create_usports_scouting_report(player_data: dict) -> ScoutingReport:
    """Create U SPORTS scouting report from API data."""
    latest_season = player_data["seasons"][0]

    return ScoutingReport(
        report_id=f"SR-{datetime.now().strftime('%Y%m%d%H%M%S')}-USPORTS",
        generated_at=datetime.now(),
        player_profile=PlayerProfile(
            name=player_data["full_name"],
            position=Position.GUARD if latest_season.get("position") == "Guard" else Position.FORWARD,
            jersey_number=None,
            height=player_data.get("height"),
            weight=None,
            date_of_birth=None,
            age=player_data.get("age"),
            current_team=player_data["current_team"],
            league=League.USPORTS,
            player_photo_url=None,
        ),
        player_detail=PlayerDetail(**player_data),
        archetype=PlayerArchetype.SCORING_PLAYMAKER,
        archetype_description=f"{player_data['full_name']} is a high-volume scorer in U SPORTS who can take over games. His ability to score from all three levels and create his own shot makes him a go-to offensive option.",
        strengths=[
            Strength(
                title="Elite Scoring Output",
                description=f"Averaged {latest_season['points_per_game']:.1f} PPG in {latest_season['season']} season. Can carry offensive load and create shots in isolation. High-volume scorer with ability to take over games.",
            ),
            Strength(
                title="Shooting Efficiency",
                description=f"Shot {latest_season['field_goal_percentage']:.1%} from the field and {latest_season['three_point_percentage']:.1%} from three-point range. True shooting percentage of {latest_season['advanced_stats']['true_shooting_pct']:.1%} shows scoring efficiency.",
            ),
            Strength(
                title="Rebounding Production",
                description=f"Pulled down {latest_season['rebounds_per_game']:.1f} rebounds per game. Crashes the glass on both ends with good instincts and timing.",
            ),
            Strength(
                title="Defensive Activity",
                description=f"Averaged {latest_season['steals_per_game']:.1f} steals per game. Active hands and good anticipation in passing lanes. Competes hard on the defensive end.",
            ),
        ],
        weaknesses=[
            Weakness(
                title="Turnover Management",
                description=f"Assist-to-turnover ratio of {latest_season['advanced_stats']['assist_to_turnover_ratio']:.2f} suggests decision-making needs refinement. Must take better care of the ball under pressure.",
            ),
            Weakness(
                title="Playmaking Development",
                description=f"Only {latest_season['assists_per_game']:.1f} assists per game for a primary ball-handler. Needs to improve vision and willingness to get teammates involved.",
            ),
        ],
        trajectory_analysis=[
            TrajectoryPoint(
                season=season["season"],
                ppg=season["points_per_game"],
                trend_description=f"{season['season']}: {season['points_per_game']:.1f} PPG",
                percentage_change=None,
            )
            for season in player_data["seasons"][:5]
            if season["season_type"] == "regular"
        ],
        trajectory_summary=f"Played {len([s for s in player_data['seasons'] if s['season_type'] == 'regular'])} regular seasons in U SPORTS with steady production. Career averages of {player_data['career_stats'][-1]['points_per_game']:.1f} PPG and {player_data['career_stats'][-1]['rebounds_per_game']:.1f} RPG demonstrate consistency as a high-volume scorer.",
        national_team_assessments=[
            NationalTeamAssessment(
                team_type="Senior 5v5",
                fit_rating=NationalTeamFit.DEVELOPMENTAL,
                rationale="Elite U SPORTS scorer with proven production. Needs to continue developing against professional competition. With 1-2 years at next level, could become rotation player.",
            ),
            NationalTeamAssessment(
                team_type="3x3",
                fit_rating=NationalTeamFit.GOOD_FIT,
                rationale="Scoring ability and physicality translate well to 3x3 format. One-on-one skills and rebounding are valuable. Could contribute to 3x3 program immediately after graduation.",
            ),
        ],
        final_recommendation=FinalRecommendation(
            verdict_title="ELITE U SPORTS SCORER WITH PROFESSIONAL POTENTIAL",
            summary=f"{player_data['full_name']} is one of the top scorers in U SPORTS with elite production. His ability to score at high volume with solid efficiency makes him a strong professional prospect. Continued development of playmaking and decision-making will maximize his potential.",
            best_use_cases=[
                "Primary scoring option for professional teams in Canada",
                "3x3 national team scoring wing",
                "CEBL scoring guard with development potential",
            ],
            overall_grade_domestic="A-",
            overall_grade_national="B",
        ),
    )


async def main():
    """Generate test PDFs using real player data from API."""
    print("🏀 Canada Basketball - PDF Generation Test (Real Data)\n")

    # Fetch player data from API
    print("📡 Fetching player data from API...\n")

    print("1️⃣  Fetching Sean Miller-Moore (CEBL)...")
    cebl_data = await fetch_player_data("cebl", "102")
    print(f"   ✅ Fetched: {cebl_data['full_name']} - {cebl_data['current_team']}\n")

    print("2️⃣  Fetching Aaron Rhooms (U SPORTS)...")
    usports_data = await fetch_player_data("usports", "A.Rhooms_Ryerson_TorontoMetropolitan_usports")
    print(f"   ✅ Fetched: {usports_data['full_name']} - {usports_data['current_team']}\n")
    print(usports_data["seasons"][0]["team_context"])

    # Create scouting reports
    cebl_report = create_cebl_scouting_report(cebl_data, cebl_data)
    usports_report = create_usports_scouting_report(usports_data)

    # Generate PDFs
    pdf_generator = PDFGenerator()

    print("3️⃣  Generating CEBL scouting report PDF...")
    try:
        cebl_pdf_path = await pdf_generator.generate_pdf(
            data=cebl_report.model_dump(mode="json"),
            pdf_title=f"{cebl_data['full_name'].replace(' ', '_')}_CEBL_Scouting_Report",
        )
        print(f"   ✅ PDF generated: {cebl_pdf_path}\n")
    except Exception as e:
        print(f"   ❌ Failed: {e}\n")

    print("4️⃣  Generating U SPORTS scouting report PDF...")
    try:
        usports_pdf_path = await pdf_generator.generate_pdf(
            data=usports_report.model_dump(mode="json"),
            pdf_title=f"{usports_data['full_name'].replace(' ', '_')}_USPORTS_Scouting_Report",
        )
        print(f"   ✅ PDF generated: {usports_pdf_path}\n")
    except Exception as e:
        print(f"   ❌ Failed: {e}\n")

    print("🎉 PDF generation test complete!")


if __name__ == "__main__":
    asyncio.run(main())
