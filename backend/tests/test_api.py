#!/usr/bin/env python3
"""
Simple test script for Canada Basketball API endpoints.

Usage:
    python tests/test_api.py

Make sure the FastAPI server is running first:
    cd canada-basketball-api
    uvicorn app.main:app --reload
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import requests

API_BASE_URL = "http://localhost:8000"


def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80 + "\n")


def test_health():
    """Test the health check endpoint."""
    print_section("TEST 1: Health Check")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        response.raise_for_status()
        print("✅ Health check passed")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False


def test_search_usports():
    """Test U SPORTS player search."""
    print_section("TEST 2: U SPORTS Player Search - 'Bakovic'")
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/search/player",
            params={"query": "Bakovic", "leagues": "usports", "limit": 5},
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            print("⚠️  No results found for 'Bakovic'")
            return False

        print(f"✅ Found {len(data)} player(s)")
        for player in data:
            print(f"  - {player['full_name']} ({player['league'].upper()})")
            print(f"    Teams: {', '.join(player['teams'])}")
            print(f"    Seasons: {', '.join(player['seasons'])}")
            print(f"    Player ID: {player['player_id']}")

            # Verify player_id format includes season: first_last_school_season
            if "_" not in player["player_id"]:
                print("    ⚠️  Warning: Player ID doesn't contain underscores")
                return False

        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_search_ccaa():
    """Test CCAA player search."""
    print_section("TEST 2B: CCAA Player Search - 'James'")
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/search/player",
            params={"query": "James", "leagues": "ccaa", "limit": 5},
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            print("⚠️  No results found for 'James' in CCAA")
            return False

        print(f"✅ Found {len(data)} player(s)")
        for player in data:
            print(f"  - {player['full_name']} ({player['league'].upper()})")
            print(f"    Teams: {', '.join(player['teams'])}")
            print(f"    Seasons: {', '.join(player['seasons'])}")
            print(f"    Player ID: {player['player_id']}")

            # Verify player_id format includes season: first_last_school_season
            if "_" not in player["player_id"]:
                print("    ⚠️  Warning: Player ID doesn't contain underscores")
                return False

        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_search_hoopqueens():
    """Test HoopQueens player search."""
    print_section("TEST 2C: HoopQueens Player Search - 'Perry'")
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/search/player",
            params={"query": "Perry", "leagues": "hoopqueens", "limit": 5},
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            print("⚠️  No results found for 'Perry' in HoopQueens")
            return False

        print(f"✅ Found {len(data)} player(s)")
        for player in data:
            print(f"  - {player['full_name']} ({player['league'].upper()})")
            print(f"    Teams: {', '.join(player['teams'])}")
            print(f"    Seasons: {', '.join(player['seasons'])}")
            print(f"    Player ID: {player['player_id']}")

        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_search_cebl():
    """Test CEBL player search."""
    print_section("TEST 3: CEBL Player Search - 'Kabongo'")
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/search/player",
            params={"query": "Kabongo", "leagues": "cebl", "limit": 5},
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            print("⚠️  No results found for 'Kabongo'")
            return False

        print(f"✅ Found {len(data)} player(s)")
        for player in data:
            print(f"  - {player['full_name']} ({player['league'].upper()})")
            print(f"    Teams: {', '.join(player['teams'])}")
            print(f"    Seasons: {', '.join(player['seasons'])}")
            print(f"    Player ID: {player['player_id']}")
        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return False


def test_search_all_leagues():
    """Test search across all leagues."""
    print_section("TEST 4: Multi-League Search - 'James'")
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/search/player", params={"query": "James", "limit": 50}
        )
        response.raise_for_status()
        data = response.json()

        if not data:
            print("⚠️  No results found for 'James'")
            return False

        print(f"✅ Found {len(data)} player(s) across all leagues")
        leagues = {}
        for player in data:
            league = player["league"].upper()
            if league not in leagues:
                leagues[league] = []
            leagues[league].append(player["full_name"])

        for league, players in leagues.items():
            print(f"\n  {league}: {len(players)} player(s)")
            for player in players[:3]:  # Show first 3
                print(f"    - {player}")
        return True
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return False


def test_player_detail_usports():
    """Test U SPORTS player detail endpoint."""
    print_section("TEST 5: U SPORTS Player Detail")
    try:
        # First search for a player
        search_response = requests.get(
            f"{API_BASE_URL}/api/search/player",
            params={"query": "Bakovic", "leagues": "usports", "limit": 1},
        )
        search_response.raise_for_status()
        search_data = search_response.json()

        if not search_data:
            print("⚠️  No player found to test detail endpoint")
            return False

        player = search_data[0]
        player_id = player["player_id"]
        league = player["league"]

        print(f"Fetching details for: {player['full_name']} (ID: {player_id})")

        # Get player details
        detail_response = requests.get(
            f"{API_BASE_URL}/api/search/player/{league}/{player_id}"
        )
        detail_response.raise_for_status()
        detail_data = detail_response.json()

        print("✅ Player details retrieved")
        print(f"  Name: {detail_data['full_name']}")
        print(f"  League: {detail_data['league'].upper()}")
        print(f"  Position: {detail_data.get('position', 'N/A')}")
        print(f"  Seasons played: {len(detail_data['seasons'])}")

        if detail_data.get("career_stats"):
            career = detail_data["career_stats"]
            print("\n  Career Stats:")
            print(f"    GP: {career.get('games_played', 'N/A')}")
            print(f"    PPG: {career.get('points_per_game', 'N/A')}")
            print(f"    RPG: {career.get('rebounds_per_game', 'N/A')}")
            print(f"    APG: {career.get('assists_per_game', 'N/A')}")
            print(f"    FG%: {career.get('field_goal_percentage', 'N/A')}")

        return True
    except Exception as e:
        print(f"❌ Player detail failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_player_detail_cebl():
    """Test CEBL player detail endpoint."""
    print_section("TEST 6: CEBL Player Detail")
    try:
        # First search for a player
        search_response = requests.get(
            f"{API_BASE_URL}/api/search/player",
            params={"query": "Kabongo", "leagues": "cebl", "limit": 1},
        )
        search_response.raise_for_status()
        search_data = search_response.json()

        if not search_data:
            print("⚠️  No player found to test detail endpoint")
            return False

        player = search_data[0]
        player_id = player["player_id"]
        league = player["league"]

        print(f"Fetching details for: {player['full_name']} (ID: {player_id})")

        # Get player details
        detail_response = requests.get(
            f"{API_BASE_URL}/api/search/player/{league}/{player_id}"
        )
        detail_response.raise_for_status()
        detail_data = detail_response.json()

        print("✅ Player details retrieved")
        print(f"  Name: {detail_data['full_name']}")
        print(f"  League: {detail_data['league'].upper()}")
        print(f"  Position: {detail_data.get('position', 'N/A')}")
        print(f"  Seasons played: {len(detail_data['seasons'])}")

        if detail_data.get("career_stats"):
            career = detail_data["career_stats"]
            print("\n  Career Stats:")
            print(f"    GP: {career.get('games_played', 'N/A')}")
            print(f"    PPG: {career.get('points_per_game', 'N/A')}")
            print(f"    RPG: {career.get('rebounds_per_game', 'N/A')}")
            print(f"    APG: {career.get('assists_per_game', 'N/A')}")
            print(f"    FG%: {career.get('field_goal_percentage', 'N/A')}")

        return True
    except Exception as e:
        print(f"❌ Player detail failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n" + "🏀" * 40)
    print("  CANADA BASKETBALL API TEST SUITE")
    print("🏀" * 40)

    print(f"\nAPI Base URL: {API_BASE_URL}")
    print("Make sure the FastAPI server is running!")
    print("Command: cd canada-basketball-api && uvicorn app.main:app --reload\n")

    results = []

    # Run all tests
    results.append(("Health Check", test_health()))
    results.append(("U SPORTS Search", test_search_usports()))
    results.append(("CCAA Search", test_search_ccaa()))
    results.append(("HoopQueens Search", test_search_hoopqueens()))
    results.append(("CEBL Search", test_search_cebl()))
    results.append(("Multi-League Search", test_search_all_leagues()))
    results.append(("U SPORTS Player Detail", test_player_detail_usports()))
    results.append(("CEBL Player Detail", test_player_detail_cebl()))

    # Print summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")

    print(f"\n{'=' * 80}")
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 80 + "\n")

    if passed == total:
        print("🎉 All tests passed! Your API is working correctly.\n")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the output above for details.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
