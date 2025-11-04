import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import type { PlayerDetail } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface PlayoffPerformanceChartProps {
  player: PlayerDetail;
}

export default function PlayoffPerformanceChart({
  player,
}: PlayoffPerformanceChartProps) {
  // Filter for regular season stats with playoff deltas
  const chartData = player.seasons
    .filter(
      (season) =>
        season.season_type === "regular" &&
        (season.league_specific?.playoff_ppg_delta !== undefined ||
          season.league_specific?.playoff_rpg_delta !== undefined ||
          season.league_specific?.playoff_apg_delta !== undefined),
    )
    .map((season) => ({
      season: season.season,
      ppg: season.league_specific?.playoff_ppg_delta || 0,
      rpg: season.league_specific?.playoff_rpg_delta || 0,
      apg: season.league_specific?.playoff_apg_delta || 0,
    }))
    .reverse(); // Oldest to newest for chart

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No playoff performance data available
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">
        Playoff vs Regular Season Performance (Positive = Better in Playoffs)
      </p>
      <ChartWrapper>
        <BarChart data={chartData}>
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
              value: "Delta (Playoff - Regular)",
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
          <Legend />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
          <Bar dataKey="ppg" fill="hsl(var(--chart-1))" name="PPG Change" />
          <Bar dataKey="rpg" fill="hsl(var(--chart-2))" name="RPG Change" />
          <Bar dataKey="apg" fill="hsl(var(--chart-3))" name="APG Change" />
        </BarChart>
      </ChartWrapper>
    </div>
  );
}
