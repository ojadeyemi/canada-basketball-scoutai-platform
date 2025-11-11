"""Player search endpoints."""

from fastapi import APIRouter, HTTPException, Query

from app.schemas import LeagueType

from ..schemas.player import PlayerDetail, PlayerSearchResult, ShotChartData
from ..services.player_service import get_player_details, get_shot_chart_data
from ..services.search_service import search_players

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("/player", response_model=list[PlayerSearchResult])
async def search_player(
    query: str = Query(..., description="Player name or partial name"),
    leagues: str | None = Query(None, description="Comma-separated leagues (e.g., 'usports,cebl')"),
    seasons: str | None = Query(None, description="Comma-separated seasons (e.g., '2024-25,2023-24')"),
    limit: int = Query(3, ge=1, le=50, description="Maximum number of results per league"),
):
    """
    Search for players across all leagues using fuzzy matching.

    - Handles typos and partial matches
    - Supports multi-word queries (e.g., "aaron rhooms" matches both "Aaron" and "Rhooms")
    - Returns up to 'limit' results per league (e.g., limit=3 across 4 leagues = max 12 results)
    - Results sorted by match score
    """
    # Parse comma-separated strings into lists
    leagues_list = [l.strip() for l in leagues.split(",")] if leagues else None  # noqa: E741
    seasons_list = [s.strip() for s in seasons.split(",")] if seasons else None

    results = search_players(
        query=query,
        leagues=leagues_list,
        seasons=seasons_list,
        limit=limit,
    )
    return results


@router.get("/player/{league}/{player_id}", response_model=PlayerDetail)
async def get_player_detail(
    league: LeagueType,
    player_id: str,
):
    """
    Get detailed player information including stats across all seasons.

    - league: League name (usports, ccaa, cebl, hoopqueens)
    - player_id: Player identifier from search results
    """
    player_detail = await get_player_details(league, player_id)

    if not player_detail:
        raise HTTPException(status_code=404, detail=f"Player not found: {player_id} in {league}")

    return player_detail


@router.get("/player/{league}/{player_id}/shot-chart", response_model=ShotChartData)
async def get_player_shot_chart(
    league: LeagueType,
    player_id: str,
):
    if league.lower() != "cebl":
        raise HTTPException(status_code=400, detail="Shot chart data only available for CEBL league")

    try:
        player_id_int = int(player_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid player ID format")

    shot_data = get_shot_chart_data(player_id_int)

    if not shot_data or not shot_data.shots:
        raise HTTPException(status_code=404, detail=f"No shot chart data found for player: {player_id}")

    return shot_data
