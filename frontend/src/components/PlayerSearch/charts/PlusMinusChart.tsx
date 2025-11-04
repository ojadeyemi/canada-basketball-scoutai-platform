import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { PlayerDetail } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface PlusMinusChartProps {
  player: PlayerDetail;
}

export default function PlusMinusChart({ player }: PlusMinusChartProps) {
  // Filter for regular season stats with plus/minus data
  const chartData = player.seasons
    .filter(
      (season) =>
        season.season_type === "regular" &&
        season.league_specific?.plus_minus_avg !== undefined,
    )
    .map((season) => ({
      season: season.season,
      plusMinus: season.league_specific?.plus_minus_avg || 0,
    }))
    .reverse(); // Oldest to newest for chart

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No plus/minus data available
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <ReferenceLine
          y={0}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="3 3"
        />
        <Line
          type="monotone"
          dataKey="plusMinus"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
          activeDot={{ r: 6 }}
          name="Plus/Minus"
        />
      </LineChart>
    </ChartWrapper>
  );
}
