import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerSeasonStats } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface ScoringChartProps {
  seasons: PlayerSeasonStats[];
}

export default function ScoringChart({ seasons }: ScoringChartProps) {
  const chartData = seasons
    .map((season) => ({
      season: season.season || "N/A",
      ppg: season.points_per_game || 0,
    }))
    .reverse(); // Show chronological order

  const chartConfig = {
    ppg: {
      label: "Points Per Game",
      color: "hsl(var(--chart-1))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No scoring data available
      </div>
    );
  }

  return (
    <ChartWrapper>
      <ChartContainer config={chartConfig}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="season"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="ppg"
            name={chartConfig.ppg.label}
            stroke={chartConfig.ppg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
