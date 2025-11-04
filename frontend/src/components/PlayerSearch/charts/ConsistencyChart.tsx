import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { PlayerDetail } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface ConsistencyChartProps {
  player: PlayerDetail;
}

export default function ConsistencyChart({ player }: ConsistencyChartProps) {
  // Filter for regular season stats with consistency data
  const chartData = player.seasons
    .filter(
      (season) =>
        season.season_type === "regular" &&
        season.league_specific?.consistency_score !== undefined,
    )
    .map((season) => ({
      season: season.season,
      consistencyScore: season.league_specific?.consistency_score || 0,
    }))
    .reverse(); // Oldest to newest for chart

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No consistency data available
      </div>
    );
  }

  return (
    <ChartWrapper>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="season"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          label={{
            value: "Lower = More Consistent",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: "12px", fill: "hsl(var(--muted-foreground))" },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Line
          type="monotone"
          dataKey="consistencyScore"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
          activeDot={{ r: 6 }}
          name="Consistency Score"
        />
      </LineChart>
    </ChartWrapper>
  );
}
