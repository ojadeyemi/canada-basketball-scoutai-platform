import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerSeasonStats } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface ShootingChartProps {
  seasons: PlayerSeasonStats[];
}

export default function ShootingChart({ seasons }: ShootingChartProps) {
  // Helper function to format season label with type suffix
  const formatSeasonLabel = (
    season: string | undefined,
    seasonType?: string,
  ): string => {
    const baseSeason = season || "N/A";
    if (!seasonType || seasonType === "regular") return baseSeason;

    const suffixMap: Record<string, string> = {
      playoffs: "P",
      championship: "C",
      total: "T",
    };

    const suffix = suffixMap[seasonType.toLowerCase()] || "";
    return suffix ? `${baseSeason}${suffix}` : baseSeason;
  };

  const chartData = seasons
    .map((season) => ({
      season: formatSeasonLabel(season.season, season.season_type),
      fg: season.field_goal_percentage ? season.field_goal_percentage * 100 : 0,
      threePt: season.three_point_percentage
        ? season.three_point_percentage * 100
        : 0,
      ft: season.free_throw_percentage ? season.free_throw_percentage * 100 : 0,
    }))
    .reverse(); // Reverse to show chronological order

  const chartConfig = {
    fg: {
      label: "FG%",
      color: "hsl(var(--chart-1))",
    },
    threePt: {
      label: "3PT%",
      color: "hsl(var(--chart-2))",
    },
    ft: {
      label: "FT%",
      color: "hsl(var(--chart-3))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No shooting data available
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
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            label={{
              value: "Percentage (%)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12 },
            }}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="fg"
            name={chartConfig.fg.label}
            stroke={chartConfig.fg.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="threePt"
            name={chartConfig.threePt.label}
            stroke={chartConfig.threePt.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="ft"
            name={chartConfig.ft.label}
            stroke={chartConfig.ft.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </ChartWrapper>
  );
}
