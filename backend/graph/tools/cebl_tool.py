"""CEBL SDK tool for biographical player data."""

from pydantic import BaseModel, Field


class CEBLPlayerInfoInput(BaseModel):
    """Input schema for CEBL player info tool (flat Pydantic, no nested JSON)."""

    player_id: str = Field(description="CEBL player ID (numeric string)")


async def get_cebl_player_info(player_id: int) -> dict:
    """
    Get CEBL player biographical information using the CEBL SDK.

    This tool fetches player profile data including:
    - Full name, nationality, birth date, age
    - Team information (name, ID)
    - Position, jersey number
    - Photo URL

    Args:
        player_id: CEBL player ID (e.g., "12345")

    Returns:
        Dictionary with status, message, and player data:
        {
            "status": "success|error",
            "message": str,
            "data": {
                "id": str,
                "full_name": str,
                "nationality": str,
                "birth_date": str,
                "age": int,
                "photo_url": str,
                "team_id": str,
                "team_name_en": str,
                "position": str,
                "jersey_number": int
            }
        }
    """
    try:
        from cebl import CEBLClient as Client

        client = Client(CEBL_API_KEY="public_access")

        # Fetch player profile using player_id
        player_data = await client.get_player(player_id)

        if not player_data:
            return {
                "status": "error",
                "message": f"No CEBL player found with ID '{player_id}'",
                "data": None,
            }

        # Return structured player profile
        return {
            "status": "success",
            "message": f"CEBL player profile for {player_data.get('full_name', 'Unknown')}",
            "data": {
                "id": player_data.get("id"),
                "full_name": player_data.get("full_name"),
                "nationality": player_data.get("nationality"),
                "birth_date": player_data.get("birth_date"),
                "age": player_data.get("age"),
                "photo_url": player_data.get("photo_url"),
                "team_id": player_data.get("team_id"),
                "team_name_en": player_data.get("team_name_en"),
                "position": player_data.get("position"),
                "jersey_number": player_data.get("jersey_number"),
            },
        }

    except ImportError:
        return {
            "status": "error",
            "message": "CEBL SDK not available. Install with: pip install git+https://github.com/ojadeyemi/cebl-sdk.git",
            "data": None,
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to fetch CEBL player info: {str(e)}",
            "data": None,
        }
