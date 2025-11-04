import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerSeasonStats } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface TeamImpactEvolutionChartProps {
  seasons: PlayerSeasonStats[];
}

export default function TeamImpactEvolutionChart({
  seasons,
}: TeamImpactEvolutionChartProps) {
  // Filter seasons with team_context data and transform for chart
  const chartData = seasons
    .filter((season) => season.team_context)
    .map((season) => ({
      season: season.season || "N/A",
      points: season.team_context?.points_share || 0,
      rebounds: season.team_context?.rebounds_share || 0,
      assists: season.team_context?.assists_share || 0,
      steals: season.team_context?.steals_share || 0,
      blocks: season.team_context?.blocks_share || 0,
      minutes: season.team_context?.minutes_share || 0,
      shotVolume: season.team_context?.shooting_volume_share || 0,
    }))
    .reverse(); // Show chronological order

  const chartConfig = {
    points: {
      label: "Points %",
      color: "hsl(var(--chart-1))",
    },
    rebounds: {
      label: "Rebounds %",
      color: "hsl(var(--chart-2))",
    },
    assists: {
      label: "Assists %",
      color: "hsl(var(--chart-3))",
    },
    shotVolume: {
      label: "Shot Volume %",
      color: "hsl(var(--chart-5))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground border border-border rounded-lg bg-muted/20">
        No team contribution data available across seasons
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
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            label={{
              value: "Team Share (%)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12 },
            }}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: number, name: string) => {
              // Remove the " %" from the label (e.g., "Points %" -> "Points")
              const cleanLabel = name.replace(" %", "");
              return [`${cleanLabel}: ${value.toFixed(1)}%`, ""];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="points"
            name={chartConfig.points.label}
            stroke={chartConfig.points.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="rebounds"
            name={chartConfig.rebounds.label}
            stroke={chartConfig.rebounds.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="assists"
            name={chartConfig.assists.label}
            stroke={chartConfig.assists.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="shotVolume"
            name={chartConfig.shotVolume.label}
            stroke={chartConfig.shotVolume.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
