#!/usr/bin/env python3
"""
Test script for /api/agent/run-sql endpoint.

Usage:
    python backend/tests/test_run_sql.py

Make sure the backend is running first:
    cd backend && uvicorn app.main:app --reload
"""

import requests

API_BASE_URL = "http://localhost:8080"


def test_run_sql():
    """Test the /api/agent/run-sql endpoint with sample queries."""

    print("\n" + "=" * 80)
    print(" Testing /api/agent/run-sql Endpoint")
    print("=" * 80 + "\n")

    # Test 1: Simple SELECT from usports
    print("📊 Test 1: Query usports database")
    payload = {"sql_query": "SELECT * FROM player_stats LIMIT 5", "db_name": "usports"}

    try:
        response = requests.post(f"{API_BASE_URL}/api/agent/run-sql", json=payload)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Returned {len(data)} rows")
            if data:
                print(f"Sample row: {data[0]}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

    print("\n" + "-" * 80 + "\n")

    # Test 2: Query cebl database
    print("📊 Test 2: Query cebl database")
    payload = {"sql_query": "SELECT * FROM player_stats LIMIT 3", "db_name": "cebl"}

    try:
        response = requests.post(f"{API_BASE_URL}/api/agent/run-sql", json=payload)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Returned {len(data)} rows")
            if data:
                print(f"Sample row: {data[0]}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

    print("\n" + "-" * 80 + "\n")

    # Test 3: Invalid SQL (should fail gracefully)
    print("📊 Test 3: Invalid SQL query (expected to fail)")
    payload = {"sql_query": "SELECT * FROM nonexistent_table", "db_name": "usports"}

    try:
        response = requests.post(f"{API_BASE_URL}/api/agent/run-sql", json=payload)
        print(f"Status: {response.status_code}")

        if response.status_code == 400:
            print(f"✅ Correctly returned error: {response.json()['detail']}")
        else:
            print(f"⚠️  Unexpected status: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    test_run_sql()
