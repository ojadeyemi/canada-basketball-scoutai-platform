import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerSeasonStats } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface DefensiveChartProps {
  seasons: PlayerSeasonStats[];
}

export default function DefensiveChart({ seasons }: DefensiveChartProps) {
  const chartData = seasons
    .map((season) => ({
      season: season.season || "N/A",
      spg: season.steals_per_game || 0,
      bpg: season.blocks_per_game || 0,
      fpg: season.personal_fouls_per_game || 0,
    }))
    .reverse(); // Show chronological order

  const chartConfig = {
    spg: {
      label: "Steals Per Game",
      color: "hsl(var(--chart-1))",
    },
    bpg: {
      label: "Blocks Per Game",
      color: "hsl(var(--chart-2))",
    },
    fpg: {
      label: "Fouls Per Game",
      color: "hsl(var(--chart-3))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No defensive data available
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
            dataKey="spg"
            name={chartConfig.spg.label}
            stroke={chartConfig.spg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="bpg"
            name={chartConfig.bpg.label}
            stroke={chartConfig.bpg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="fpg"
            name={chartConfig.fpg.label}
            stroke={chartConfig.fpg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
