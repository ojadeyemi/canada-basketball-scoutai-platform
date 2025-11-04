import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerSeasonStats } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface PlaymakingChartProps {
  seasons: PlayerSeasonStats[];
}

export default function PlaymakingChart({ seasons }: PlaymakingChartProps) {
  const chartData = seasons
    .map((season) => ({
      season: season.season || "N/A",
      apg: season.assists_per_game || 0,
      tpg: season.turnovers_per_game || 0,
    }))
    .reverse(); // Show chronological order

  const chartConfig = {
    apg: {
      label: "Assists Per Game",
      color: "hsl(var(--chart-1))",
    },
    tpg: {
      label: "Turnovers Per Game",
      color: "hsl(var(--chart-2))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No playmaking data available
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
            dataKey="apg"
            name={chartConfig.apg.label}
            stroke={chartConfig.apg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="tpg"
            name={chartConfig.tpg.label}
            stroke={chartConfig.tpg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
