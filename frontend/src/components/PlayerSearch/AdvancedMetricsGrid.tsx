import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { StatDelta } from "./StatDelta";
import { STAT_DESCRIPTIONS } from "../../constants/statDescriptions";
import { StatTooltip } from "./StatTooltip";
import type { LeagueSpecificStats } from "../../types/player";

interface AdvancedMetricsGridProps {
  league: string;
  stats: LeagueSpecificStats;
  gamesPlayed?: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  valueColor?: string;
}

const MetricCard = ({
  title,
  value,
  description,
  valueColor = "text-foreground",
}: MetricCardProps) => {
  return (
    <StatTooltip statLabel={title}>
      <Card className="group relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        </CardContent>
      </Card>
    </StatTooltip>
  );
};

export const AdvancedMetricsGrid = ({
  league,
  stats,
}: AdvancedMetricsGridProps) => {
  const leagueLower = league.toLowerCase();

  // CEBL Advanced Metrics
  if (leagueLower === "cebl") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Advanced Metrics (CEBL)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.double_double_rate !== undefined && (
            <MetricCard
              title="Double-Double Rate"
              value={`${stats.double_double_rate.toFixed(1)}%`}
              description={STAT_DESCRIPTIONS.double_double_rate?.description}
            />
          )}

          {stats.plus_minus_avg !== undefined && (
            <MetricCard
              title="Plus/Minus Avg"
              value={
                stats.plus_minus_avg > 0
                  ? `+${stats.plus_minus_avg.toFixed(1)}`
                  : stats.plus_minus_avg.toFixed(1)
              }
              description={STAT_DESCRIPTIONS.plus_minus_avg?.description}
              valueColor={
                stats.plus_minus_avg > 0
                  ? "text-green-600"
                  : stats.plus_minus_avg < 0
                    ? "text-red-600"
                    : "text-gray-500"
              }
            />
          )}

          {stats.two_point_percentage !== undefined && (
            <MetricCard
              title="2PT FG%"
              value={`${stats.two_point_percentage.toFixed(1)}%`}
              description={STAT_DESCRIPTIONS.two_point_percentage?.description}
            />
          )}

          {stats.fouls_drawn_per_game !== undefined && (
            <MetricCard
              title="Fouls Drawn/Game"
              value={stats.fouls_drawn_per_game.toFixed(1)}
              description={STAT_DESCRIPTIONS.fouls_drawn_per_game?.description}
            />
          )}

          {stats.target_score_rate !== undefined && (
            <MetricCard
              title="Target Score Rate"
              value={`${stats.target_score_rate.toFixed(1)}%`}
              description={STAT_DESCRIPTIONS.target_score_rate?.description}
            />
          )}

          {stats.triple_double_rate !== undefined &&
            stats.triple_double_rate > 0 && (
              <MetricCard
                title="Triple-Double Rate"
                value={`${stats.triple_double_rate.toFixed(1)}%`}
                description={STAT_DESCRIPTIONS.triple_double_rate?.description}
              />
            )}

          {stats.second_chance_points !== undefined && (
            <MetricCard
              title="2nd Chance Pts/Game"
              value={stats.second_chance_points.toFixed(1)}
              description="Average second chance points per game"
            />
          )}

          {stats.fast_break_points !== undefined && (
            <MetricCard
              title="Fast Break Pts/Game"
              value={stats.fast_break_points.toFixed(1)}
              description="Average fast break points per game"
            />
          )}
        </div>
      </div>
    );
  }

  // HoopQueens Advanced Metrics
  if (leagueLower === "hoopqueens") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Advanced Metrics (HoopQueens)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.consistency_score !== undefined && (
            <MetricCard
              title="Consistency Score"
              value={stats.consistency_score.toFixed(1)}
              description={STAT_DESCRIPTIONS.consistency_score?.description}
              valueColor={
                stats.consistency_score < 20
                  ? "text-green-600"
                  : stats.consistency_score < 30
                    ? "text-yellow-600"
                    : "text-red-600"
              }
            />
          )}

          {stats.plus_minus !== undefined && (
            <MetricCard
              title="Plus/Minus Avg"
              value={
                stats.plus_minus > 0
                  ? `+${stats.plus_minus.toFixed(1)}`
                  : stats.plus_minus.toFixed(1)
              }
              description={STAT_DESCRIPTIONS.plus_minus?.description}
              valueColor={
                stats.plus_minus > 0
                  ? "text-green-600"
                  : stats.plus_minus < 0
                    ? "text-red-600"
                    : "text-gray-500"
              }
            />
          )}

          {stats.plus_minus_min !== undefined &&
            stats.plus_minus_max !== undefined && (
              <MetricCard
                title="Plus/Minus Range"
                value={`${stats.plus_minus_min.toFixed(0)} to ${stats.plus_minus_max.toFixed(0)}`}
                description="Worst to best single-game plus/minus"
              />
            )}

          {stats.foul_drawing_efficiency !== undefined && (
            <MetricCard
              title="Foul Drawing Efficiency"
              value={stats.foul_drawing_efficiency.toFixed(2)}
              description={
                STAT_DESCRIPTIONS.foul_drawing_efficiency?.description
              }
            />
          )}

          {stats.ppg_variance !== undefined && (
            <MetricCard
              title="PPG Std Dev"
              value={stats.ppg_variance.toFixed(1)}
              description="Standard deviation of points per game"
            />
          )}
        </div>
      </div>
    );
  }

  // U SPORTS / CCAA Advanced Metrics
  if (leagueLower === "usports" || leagueLower === "ccaa") {
    const hasPlayoffDeltas =
      stats.playoff_ppg_delta !== undefined ||
      stats.playoff_rpg_delta !== undefined ||
      stats.playoff_apg_delta !== undefined ||
      stats.playoff_fg_pct_delta !== undefined;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Advanced Metrics ({leagueLower === "usports" ? "U SPORTS" : "CCAA"})
        </h3>

        {hasPlayoffDeltas && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Playoff Performance vs Regular Season
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.playoff_ppg_delta !== undefined && (
                <StatDelta
                  label="Scoring"
                  delta={stats.playoff_ppg_delta}
                  sampleSize={stats.playoff_sample_size}
                />
              )}
              {stats.playoff_rpg_delta !== undefined && (
                <StatDelta
                  label="Rebounding"
                  delta={stats.playoff_rpg_delta}
                  sampleSize={stats.playoff_sample_size}
                />
              )}
              {stats.playoff_apg_delta !== undefined && (
                <StatDelta
                  label="Playmaking"
                  delta={stats.playoff_apg_delta}
                  sampleSize={stats.playoff_sample_size}
                />
              )}
              {stats.playoff_fg_pct_delta !== undefined && (
                <StatDelta
                  label="Shooting Efficiency"
                  delta={stats.playoff_fg_pct_delta}
                  sampleSize={stats.playoff_sample_size}
                />
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.dq_rate !== undefined && stats.dq_rate > 0 && (
            <MetricCard
              title="DQ Rate"
              value={`${stats.dq_rate.toFixed(1)} / 100 GP`}
              description={STAT_DESCRIPTIONS.dq_rate?.description}
              valueColor="text-red-600"
            />
          )}

          {stats.disqualifications !== undefined &&
            stats.disqualifications > 0 && (
              <MetricCard
                title="Disqualifications"
                value={stats.disqualifications}
                description="Total career disqualifications"
                valueColor="text-red-600"
              />
            )}
        </div>
      </div>
    );
  }

  return null;
};
