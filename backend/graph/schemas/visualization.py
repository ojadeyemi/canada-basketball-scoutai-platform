"""Visualization schema for chart rendering in frontend."""

from typing import Literal

from pydantic import BaseModel, Field


class SQLAgentResponse(BaseModel):
    """
    Structured output from SQL agent with query + visualization config.

    The SQL agent uses this schema to return:
    - The final SQL query it executed
    - Database name used
    - Chart configuration recommendation
    - Natural language summary
    """

    sql_query: str = Field(description="Final SQL query executed (with explicit column names)")
    db_name: str = Field(description="Database used (cebl, usports, ccaa, hoopqueens)")
    chart_config: "ChartConfig | None" = Field(
        default=None,
        description="Chart configuration (None if table-only is better)",
    )
    summary_text: str = Field(description="Natural language summary of results (2-3 sentences)")


class ChartConfig(BaseModel):
    """
    Chart configuration for frontend rendering with shadcn/charts.

    Provides all necessary information for plug-and-play chart rendering.
    Frontend receives this and passes directly to chart components.
    """

    chart_type: Literal["bar", "line", "table", "radar", "pie"] = Field(description="Type of chart to render")

    # Column mappings (exact SQL column names)
    x_column: str | None = Field(default=None, description="X-axis column name (e.g., 'season', 'player_name')")
    y_columns: list[str] = Field(
        default_factory=list,
        description="Y-axis column names (e.g., ['points_per_game', 'assists_per_game'])",
    )

    # Chart metadata
    title: str = Field(description="Chart title")
    subtitle: str | None = Field(default=None, description="Optional subtitle")

    # Styling configuration
    color_scheme: list[str] | None = Field(
        default=None,
        description="Array of hex colors for data series (e.g., ['#3b82f6', '#ef4444'])",
    )
    legend_position: Literal["top", "bottom", "left", "right", "none"] = Field(
        default="bottom", description="Legend position"
    )

    # Axis labels
    x_axis_label: str | None = Field(default=None, description="X-axis label")
    y_axis_label: str | None = Field(default=None, description="Y-axis label")

    # Data formatting hints
    value_format: Literal["number", "percentage", "decimal"] | None = Field(
        default="number", description="How to format Y-axis values"
    )
    show_data_labels: bool = Field(default=False, description="Show values on data points")

    # Table-specific options
    sortable: bool = Field(default=True, description="Enable column sorting (table only)")
    paginated: bool = Field(default=True, description="Enable pagination (table only)")

    class Config:
        json_schema_extra = {
            "example": {
                "chart_type": "bar",
                "x_column": "player_name",
                "y_columns": ["points_per_game", "rebounds_per_game"],
                "title": "Top Scorers in CEBL 2024",
                "subtitle": "Regular Season Leaders",
                "color_scheme": ["#3b82f6", "#10b981"],
                "legend_position": "bottom",
                "x_axis_label": "Player",
                "y_axis_label": "Stats",
                "value_format": "decimal",
                "show_data_labels": True,
            }
        }


class QueryResult(BaseModel):
    """
    Structured query result with data and visualization config.

    Returned by stats_lookup node to provide both data and rendering instructions.
    """

    data: list[dict] = Field(description="Query result rows as list of dicts")
    sql_query: str = Field(description="SQL query that generated this result")
    db_name: str = Field(description="Database name used (cebl, usports, ccaa, hoopqueens)")
    chart_config: ChartConfig | None = Field(
        default=None, description="Chart configuration (None for text-only responses)"
    )
    summary_text: str = Field(description="Natural language summary of the data (always provided)")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {"player_name": "Aaron Best", "points_per_game": 19.2},
                    {"player_name": "Cat Barber", "points_per_game": 21.3},
                ],
                "sql_query": "SELECT player_name, points_per_game FROM player_stats WHERE season = 2024 ORDER BY points_per_game DESC LIMIT 10",
                "db_name": "cebl",
                "chart_config": {
                    "chart_type": "bar",
                    "x_column": "player_name",
                    "y_columns": ["points_per_game"],
                    "title": "CEBL Scoring Leaders 2024",
                },
                "summary_text": "Cat Barber leads CEBL scoring with 21.3 PPG, followed by Aaron Best at 19.2 PPG.",
            }
        }
