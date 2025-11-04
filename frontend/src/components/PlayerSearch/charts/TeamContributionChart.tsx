import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import type { PlayerDetail } from "@/types/player";
import ChartWrapper from "./ChartWrapper";

interface TeamContributionChartProps {
  player: PlayerDetail;
}

export default function TeamContributionChart({
  player,
}: TeamContributionChartProps) {
  // Get the latest season with team context data
  const latestSeasonWithContext = player.seasons.find(
    (season) => season.team_context,
  );

  if (!latestSeasonWithContext?.team_context) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-muted/20">
        No team contribution data available
      </div>
    );
  }

  const context = latestSeasonWithContext.team_context;

  const chartData = [
    {
      stat: "Points",
      contribution: context.points_share || 0,
    },
    {
      stat: "Rebounds",
      contribution: context.rebounds_share || 0,
    },
    {
      stat: "Assists",
      contribution: context.assists_share || 0,
    },
    {
      stat: "Steals",
      contribution: context.steals_share || 0,
    },
    {
      stat: "Blocks",
      contribution: context.blocks_share || 0,
    },
    {
      stat: "Shots",
      contribution: context.shooting_volume_share || 0,
    },
  ].filter((item) => item.contribution > 0); // Only show stats with data

  const chartConfig = {
    contribution: {
      label: "Team Share",
      color: "hsl(var(--chart-1))",
    },
  };

  // Calculate dynamic domain for better visualization (instead of 0-100%)
  const maxContribution = Math.max(
    ...chartData.map((item) => item.contribution),
  );
  const domainMax = Math.ceil(maxContribution / 10) * 10 + 10; // Round up to nearest 10 + buffer

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Percentage of team's total production ({latestSeasonWithContext.season})
      </p>
      <ChartWrapper>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              domain={[0, domainMax]}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              label={{
                value: "Team Share (%)",
                position: "insideBottom",
                offset: -5,
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              type="category"
              dataKey="stat"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              width={70}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              dataKey="contribution"
              name={chartConfig.contribution.label}
              fill={chartConfig.contribution.color}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </ChartWrapper>
    </div>
  );
}
