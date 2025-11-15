"""Player search service with fuzzy matching."""

from datetime import datetime
from typing import Any

from rapidfuzz import fuzz

from config.constants import MENS_LEAGUE, WOMENS_LEAGUE, LeagueCategory

from ..db.sqlite import execute_query, get_all_leagues
from ..schemas.player import PlayerSearchResult


def search_players(
    query: str,
    leagues: list[str] | None = None,
    seasons: list[str] | None = None,
    limit: int = 5,
    min_score: int = 90,
) -> list[PlayerSearchResult]:
    """
    Search for players across leagues using fuzzy matching.

    Args:
        query: Search query (player name, partial name, etc.)
        leagues: Filter by specific leagues (default: all)
        seasons: Filter by specific seasons (default: all)
        limit: Maximum number of results per league (not total)
        min_score: Minimum fuzzy match score (0-100)

    Returns:
        List of player search results, sorted by match score
    """
    if not query or not query.strip():
        return []

    query = query.strip().lower()
    query_parts = query.split()  # Split for multi-word matching

    # Determine which leagues to search
    target_leagues = leagues if leagues else get_all_leagues()

    # Collect results from all leagues (up to 'limit' per league)
    all_results: list[tuple[PlayerSearchResult, int]] = []  # (result, score)

    for league in target_leagues:
        # Get players from this league
        try:
            players = _get_players_from_league(league, seasons)
            league_scored_players: list[tuple[str, int]] = []  # (full_name, score)
            league_player_map: dict[str, dict] = {}  # full_name -> player data

            for player in players:
                # Try fuzzy matching on full name
                full_name = player.get("full_name", "") or ""
                score = fuzz.partial_ratio(query, full_name.lower())

                # Also try matching individual query parts (e.g., "aaron rhooms" matches both "Aaron" and "Rhooms")
                if len(query_parts) > 1:
                    part_scores = []
                    for part in query_parts:
                        # Skip very short parts (single letters) to avoid false matches
                        if len(part) <= 1:
                            continue
                        part_score = fuzz.partial_ratio(part, full_name.lower())
                        part_scores.append(part_score)
                    # Use max score from parts (if any valid parts exist)
                    if part_scores:
                        score = max(score, max(part_scores))

                if score >= min_score:
                    # Aggregate player data
                    if full_name not in league_player_map:
                        # Calculate age from birth_date if available (HoopQueens)
                        birth_date = player.get("birth_date")
                        calculated_age = None
                        if birth_date and not player.get("age"):
                            try:
                                birth_dt = datetime.fromisoformat(birth_date)
                                today = datetime.now()
                                calculated_age = (
                                    today.year
                                    - birth_dt.year
                                    - ((today.month, today.day) < (birth_dt.month, birth_dt.day))
                                )
                            except (ValueError, TypeError):
                                pass

                        league_player_map[full_name] = {
                            "full_name": full_name,
                            "league": league,
                            "teams": set(),
                            "seasons": set(),
                            "positions": set(),
                            "player_id": player.get("player_id"),  # Store actual DB player_id for CEBL/HoopQueens
                            # Store name components for player_id generation (usports/ccaa only)
                            "firstname_initial": player.get("firstname_initial"),
                            "last_name": player.get("last_name"),
                            # Store biographical data (CEBL/HoopQueens)
                            "league_category": player.get("league_category"),  # For USPORTS/CCAA
                            "nationality": player.get("nationality"),
                            "photo_url": player.get("photo_url"),
                            "age": player.get("age") or calculated_age,
                        }
                        league_scored_players.append((full_name, score))  # type: ignore

                    # Add team, season, position if available
                    team = player.get("team_name") or player.get("team") or player.get("school")
                    if team:
                        league_player_map[full_name]["teams"].add(team)

                    season = player.get("season")
                    if season:
                        league_player_map[full_name]["seasons"].add(str(season))

                    position = player.get("position")
                    if position:
                        league_player_map[full_name]["positions"].add(position)

            # Sort this league's results by score and take top 'limit'
            league_scored_players.sort(key=lambda x: x[1], reverse=True)
            top_league_players = league_scored_players[:limit]

            # Convert to PlayerSearchResult objects and add to all_results
            for full_name, score in top_league_players:
                data = league_player_map[full_name]

                # Generate player_id based on league
                if league in ["usports", "ccaa"]:
                    # Format: firstname.lastname_school1_school2_league
                    # Remove spaces from school names (e.g., "Toronto Metropolitan" -> "TorontoMetropolitan")
                    schools_cleaned = [school.replace(" ", "") for school in sorted(data["teams"])]
                    schools_str = "_".join(schools_cleaned)
                    player_id = f"{data['firstname_initial']}.{data['last_name']}_{schools_str}_{league}"
                else:
                    # For CEBL and HoopQueens, use existing player_id from database
                    player_id = str(data.get("player_id") or full_name)

                    # Determine league category
                league_category: LeagueCategory | None = None
                if league == "cebl":
                    league_category = MENS_LEAGUE
                elif league == "hoopqueens":
                    league_category = WOMENS_LEAGUE
                elif league in ["usports", "ccaa"] and data.get("league"):
                    league_category = MENS_LEAGUE if data["league"] == "mens" else WOMENS_LEAGUE

                # Validate and prepare photo_url (CEBL only)
                photo_url_raw = data.get("photo_url")
                photo_url = None
                if photo_url_raw and isinstance(photo_url_raw, str) and photo_url_raw.strip():
                    if photo_url_raw.startswith(("http://", "https://")):
                        photo_url = photo_url_raw.strip()

                # Convert age to int if available
                age = None
                if data.get("age"):
                    try:
                        age = int(data["age"])
                    except (ValueError, TypeError):
                        pass

                result = PlayerSearchResult(
                    player_id=player_id,
                    full_name=data["full_name"],
                    league_category=league_category,
                    league=data["league"],
                    teams=sorted(list(data["teams"])),
                    seasons=sorted(list(data["seasons"]), reverse=True),  # Most recent first
                    positions=sorted(list(data["positions"])),
                    matches=[data["full_name"]],
                    nationality=data.get("nationality"),
                    age=age,
                    photo_url=photo_url,
                )
                all_results.append((result, score))

        except Exception as e:
            print(f"Error searching {league}: {e}")
            continue

    # Sort all results by score (descending) and return
    all_results.sort(key=lambda x: x[1], reverse=True)
    return [result for result, _ in all_results]


def _get_players_from_league(league: str, seasons: list[str] | None = None) -> list[dict[str, Any]]:
    """
    Get all players from a specific league database.

    Args:
        league: League name
        seasons: Optional season filter

    Returns:
        List of player records
    """
    league = league.lower()

    # Different leagues have different schemas
    if league == "cebl":
        query = """
            SELECT DISTINCT
                player_id,
                full_name,
                team_name_en as team_name,
                position,
                season,
                nationality,
                photo_url,
                age
            FROM players
        """
        params = ()

        if seasons:
            placeholders = ",".join("?" * len(seasons))
            query += f" WHERE season IN ({placeholders})"
            params = tuple(seasons)

    elif league in ["usports", "ccaa"]:
        # Column names: firstname_initial = single character (e.g., "B"), last_name = full last name (e.g., "Bakovic")
        query = """
            SELECT DISTINCT
                firstname_initial,
                last_name,
                firstname_initial || '. ' || last_name as full_name,
                school as team_name,
                season,
                league
            FROM player_stats
        """
        params = ()

        if seasons:
            placeholders = ",".join("?" * len(seasons))
            query += f" WHERE season IN ({placeholders})"
            params = tuple(seasons)

    elif league == "hoopqueens":
        # HoopQueens uses player table with team JOIN
        # Use first_name and last_name for full name matching
        query = """
            SELECT DISTINCT
                p.id as player_id,
                p.first_name || ' ' || p.last_name as full_name,
                t.name as team_name,
                p.position,
                p.season,
                p.nationality,
                p.birth_date
            FROM player p
            LEFT JOIN team t ON p.team_id = t.id
        """
        params = ()

        if seasons:
            placeholders = ",".join("?" * len(seasons))
            query += f" WHERE p.season IN ({placeholders})"
            params = tuple(int(s) for s in seasons)

    else:
        return []

    return execute_query(league, query, params)
