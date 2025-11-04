"""Stats lookup node: SQL agent with structured output."""

import ast
import json
import os

from langchain.agents import create_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_core.messages import AIMessage

from config.constants import LEAGUE_DB_MAP
from graph.configuration import get_sql_llm
from graph.prompts.stats_lookup import SQL_AGENT_PROMPT
from graph.schemas.visualization import QueryResult, SQLAgentResponse
from graph.state import AgentState

_db_cache: dict[str, SQLDatabase] = {}


def get_db_connection(league: str) -> SQLDatabase:
    """Get cached database connection with read-only enforcement."""
    if league not in _db_cache:
        db_path = os.path.join(os.getcwd(), "db", f"{league}.db")
        _db_cache[league] = SQLDatabase.from_uri(
            f"sqlite:///{db_path}",
            view_support=True,
            sample_rows_in_table_info=3,
        )
    return _db_cache[league]


async def stats_lookup(state: AgentState) -> dict:
    """
    Execute SQL query and return structured results with chart config.

    Process:
    1. SQL agent queries database and returns SQLAgentResponse
    2. Extract sql_query and re-run to get clean data as list[dict]
    3. Build QueryResult with data + chart_config + summary_text
    4. Append AI message summarizing query and results

    Args:
        state: Current agent state with user_query, intent, entities, league

    Returns:
        State update with query_result field and AI message
    """
    user_query = state.get("user_query", "")
    intent = state.get("intent", "unknown")
    entities = state.get("entities", {})
    league = state.get("league", "CEBL").lower().replace(" ", "")  # type: ignore
    season = entities.get("season", "2025")  # type: ignore
    db_name = LEAGUE_DB_MAP.get(league, "cebl")

    try:
        db = get_db_connection(db_name)
        llm = get_sql_llm()
        toolkit = SQLDatabaseToolkit(db=db, llm=llm)
        tools = toolkit.get_tools()

        system_message = SQL_AGENT_PROMPT.format(
            db_name=db_name,
            league=league.upper(),
            season=season,
            user_query=user_query,
            intent=intent,
            entities=json.dumps(entities, indent=2),
        )

        agent = create_agent(
            llm,
            tools,
            system_prompt=system_message,
            response_format=SQLAgentResponse,
        )

        agent_input = {"messages": state["messages"]}
        result = await agent.ainvoke(agent_input)  # type: ignore

        if "structured_response" not in result:
            raise ValueError("Agent did not return structured_response")

        agent_response: SQLAgentResponse = result["structured_response"]

        try:
            raw_results = db.run(
                agent_response.sql_query, fetch="all", include_columns=True
            )

            if isinstance(raw_results, str):
                query_data = ast.literal_eval(raw_results)
            elif isinstance(raw_results, dict) and "result" in raw_results:
                query_data = raw_results["result"]  # type: ignore
            elif isinstance(raw_results, list):
                query_data = raw_results
            else:
                query_data = []
        except Exception:
            query_data = []

        query_result = QueryResult(
            data=query_data,  # type: ignore
            sql_query=agent_response.sql_query,
            db_name=db_name,
            chart_config=agent_response.chart_config if query_data else None,
            summary_text=agent_response.summary_text or "Query completed successfully.",
        )

        ai_summary = f"**Stats Query Result** ({league.upper()}, {season}):\n{agent_response.summary_text or 'Query completed.'}"
        if query_data:
            ai_summary += f" Found {len(query_data)} result(s)."

        return {
            "query_result": query_result,
            "error": None,
            "messages": [AIMessage(content=ai_summary)],
        }

    except Exception as e:
        error_msg = f"Stats lookup failed: {str(e)}"
        error_result = QueryResult(
            data=[],
            sql_query="",
            db_name=db_name,
            chart_config=None,
            summary_text=f"I encountered an error: {str(e)}. Please try rephrasing your question.",
        )

        return {
            "query_result": error_result,
            "error": error_msg,
            "messages": [AIMessage(content=f"**Stats Query Error**: {str(e)}")],
        }
