import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerSeasonStats } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface ReboundingChartProps {
  seasons: PlayerSeasonStats[];
}

export default function ReboundingChart({ seasons }: ReboundingChartProps) {
  const chartData = seasons
    .map((season) => ({
      season: season.season || "N/A",
      rpg: season.rebounds_per_game || 0,
      orpg: season.offensive_rebounds_per_game || 0,
      drpg: season.defensive_rebounds_per_game || 0,
    }))
    .reverse(); // Show chronological order

  const chartConfig = {
    rpg: {
      label: "Total Rebounds",
      color: "hsl(var(--chart-1))",
    },
    orpg: {
      label: "Offensive Rebounds",
      color: "hsl(var(--chart-2))",
    },
    drpg: {
      label: "Defensive Rebounds",
      color: "hsl(var(--chart-3))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No rebounding data available
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
            dataKey="rpg"
            name={chartConfig.rpg.label}
            stroke={chartConfig.rpg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="orpg"
            name={chartConfig.orpg.label}
            stroke={chartConfig.orpg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="drpg"
            name={chartConfig.drpg.label}
            stroke={chartConfig.drpg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
