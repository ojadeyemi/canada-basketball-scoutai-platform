import type {
  PlayerDetail,
  PlayerSeasonStats,
  AdvancedStats,
  TeamContextStats,
  LeagueSpecificStats,
} from "@/types/player";
import SeasonTypeBadge from "../SeasonTypeBadge";
import { PercentileIndicator } from "../PercentileIndicator";
import { StatTooltip } from "../StatTooltip";

interface SeasonStatsTabProps {
  player: PlayerDetail;
}

export default function SeasonStatsTab({ player }: SeasonStatsTabProps) {
  if (player.seasons.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No season-by-season data available
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-foreground mb-3">
        Season-by-Season Breakdown
      </h3>

      <div className="space-y-4">
        {player.seasons.map((season, index) => (
          <div
            key={index}
            className="border border-border rounded-lg p-4 bg-card/50"
          >
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                {season.season}
              </span>
              {season.season_type && (
                <SeasonTypeBadge seasonType={season.season_type} />
              )}
              {season.team && (
                <span className="text-sm text-muted-foreground">
                  {season.team}
                </span>
              )}
            </h4>

            {/* Core Stats */}
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Core Stats
              </h5>
              <StatsTable stats={season} />
            </div>

            {/* Advanced Stats */}
            {season.advanced_stats &&
              hasAdvancedStats(season.advanced_stats) && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Advanced Metrics
                  </h5>
                  <AdvancedStatsDisplay stats={season.advanced_stats} />
                </div>
              )}

            {/* Team Context */}
            {season.team_context && hasTeamContext(season.team_context) && (
              <div className="mb-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Team Contribution
                </h5>
                <TeamContextDisplay context={season.team_context} />
              </div>
            )}

            {/* League-Specific Stats */}
            {season.league_specific &&
              hasLeagueSpecificStats(season.league_specific) && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    League-Specific Stats
                  </h5>
                  <LeagueSpecificDisplay
                    stats={season.league_specific}
                    league={player.league}
                  />
                </div>
              )}

            {/* League Comparison */}
            {season.league_comparison && (
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  League Comparison
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <StatTooltip statLabel="PPG">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">PPG</span>
                      <PercentileIndicator
                        percentile={season.league_comparison.ppg_percentile}
                        size="sm"
                      />
                    </div>
                  </StatTooltip>
                  <StatTooltip statLabel="RPG">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">RPG</span>
                      <PercentileIndicator
                        percentile={season.league_comparison.rpg_percentile}
                        size="sm"
                      />
                    </div>
                  </StatTooltip>
                  <StatTooltip statLabel="APG">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">APG</span>
                      <PercentileIndicator
                        percentile={season.league_comparison.apg_percentile}
                        size="sm"
                      />
                    </div>
                  </StatTooltip>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsTable({ stats }: { stats: PlayerSeasonStats }) {
  const statRows = [
    { label: "GP", value: stats.games_played, tooltip: "Games Played" },
    { label: "GS", value: stats.games_started, tooltip: "Games Started" },
    { label: "MIN", value: stats.total_minutes, tooltip: "Total Minutes" },
    {
      label: "MPG",
      value: stats.minutes_per_game?.toFixed(1),
      tooltip: "Minutes Per Game",
    },
    {
      label: "PPG",
      value: stats.points_per_game?.toFixed(1),
      tooltip: "Points Per Game",
    },
    {
      label: "RPG",
      value: stats.rebounds_per_game?.toFixed(1),
      tooltip: "Rebounds Per Game",
    },
    {
      label: "ORB",
      value: stats.offensive_rebounds_per_game?.toFixed(1),
      tooltip: "Offensive Rebounds Per Game",
    },
    {
      label: "DRB",
      value: stats.defensive_rebounds_per_game?.toFixed(1),
      tooltip: "Defensive Rebounds Per Game",
    },
    {
      label: "APG",
      value: stats.assists_per_game?.toFixed(1),
      tooltip: "Assists Per Game",
    },
    {
      label: "SPG",
      value: stats.steals_per_game?.toFixed(1),
      tooltip: "Steals Per Game",
    },
    {
      label: "BPG",
      value: stats.blocks_per_game?.toFixed(1),
      tooltip: "Blocks Per Game",
    },
    {
      label: "TPG",
      value: stats.turnovers_per_game?.toFixed(1),
      tooltip: "Turnovers Per Game",
    },
    {
      label: "FPG",
      value: stats.personal_fouls_per_game?.toFixed(1),
      tooltip: "Fouls Per Game",
    },
    {
      label: "FG%",
      value: stats.field_goal_percentage
        ? (stats.field_goal_percentage * 100).toFixed(1) + "%"
        : undefined,
      tooltip: "Field Goal Percentage",
    },
    {
      label: "3P%",
      value: stats.three_point_percentage
        ? (stats.three_point_percentage * 100).toFixed(1) + "%"
        : undefined,
      tooltip: "Three-Point Percentage",
    },
    {
      label: "FT%",
      value: stats.free_throw_percentage
        ? (stats.free_throw_percentage * 100).toFixed(1) + "%"
        : undefined,
      tooltip: "Free Throw Percentage",
    },
  ];

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 bg-muted/30 border border-border p-3.5 rounded-lg">
      {statRows.map(({ label, value }) =>
        value !== undefined && value !== null ? (
          <StatTooltip key={label} statLabel={label}>
            <div className="text-center px-1">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {label}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {value ?? "-"}
              </p>
            </div>
          </StatTooltip>
        ) : null,
      )}
    </div>
  );
}

function AdvancedStatsDisplay({ stats }: { stats: AdvancedStats }) {
  const advancedRows = [
    {
      label: "TS%",
      value: stats.true_shooting_pct
        ? (stats.true_shooting_pct * 100).toFixed(1) + "%"
        : undefined,
      tooltip: "True Shooting %",
    },
    {
      label: "eFG%",
      value: stats.effective_fg_pct
        ? (stats.effective_fg_pct * 100).toFixed(1) + "%"
        : undefined,
      tooltip: "Effective FG %",
    },
    {
      label: "AST/TO",
      value: stats.assist_to_turnover_ratio?.toFixed(2),
      tooltip: "Assist-to-Turnover Ratio",
    },
    {
      label: "USG%",
      value: stats.usage_rate?.toFixed(1)
        ? stats.usage_rate.toFixed(1) + "%"
        : undefined,
      tooltip: "Usage Rate",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-lg border border-blue-200 dark:border-blue-800">
      {advancedRows.map(({ label, value }) =>
        value !== undefined ? (
          <StatTooltip key={label} statLabel={label}>
            <div className="text-center px-1">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                {label}
              </p>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {value}
              </p>
            </div>
          </StatTooltip>
        ) : null,
      )}
    </div>
  );
}

function TeamContextDisplay({ context }: { context: TeamContextStats }) {
  const contextRows = [
    { label: "Points", value: context.points_share },
    { label: "Rebounds", value: context.rebounds_share },
    { label: "Assists", value: context.assists_share },
    { label: "Steals", value: context.steals_share },
    { label: "Blocks", value: context.blocks_share },
    { label: "Minutes", value: context.minutes_share },
    { label: "Shots", value: context.shooting_volume_share },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 bg-green-50 dark:bg-green-950/30 p-3.5 rounded-lg border border-green-200 dark:border-green-800">
      {contextRows.map(({ label, value }) =>
        value !== undefined && value !== null ? (
          <StatTooltip key={label} statLabel={`${label} Share`}>
            <div className="text-center px-1">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                {label}
              </p>
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                {typeof value === "number" ? value.toFixed(1) : value}%
              </p>
            </div>
          </StatTooltip>
        ) : null,
      )}
    </div>
  );
}

function LeagueSpecificDisplay({
  stats,
  league,
}: {
  stats: LeagueSpecificStats;
  league: string;
}) {
  const ceblStats =
    league === "cebl"
      ? [
          {
            label: "Double-Doubles",
            value: stats.double_doubles,
            tooltip: undefined,
          },
          {
            label: "Triple-Doubles",
            value: stats.triple_doubles,
            tooltip: undefined,
          },
          {
            label: "Target Scores",
            value: stats.target_scores,
            tooltip: undefined,
          },
          {
            label: "2nd Chance Pts",
            value: stats.second_chance_points?.toFixed(1),
            tooltip: undefined,
          },
          {
            label: "Fast Break Pts",
            value: stats.fast_break_points?.toFixed(1),
            tooltip: undefined,
          },
          {
            label: "Pts in Paint",
            value: stats.points_in_paint?.toFixed(1),
            tooltip: undefined,
          },
        ]
      : [];

  const hoopQueensStats =
    league === "hoopqueens"
      ? [
          {
            label: "Plus/Minus",
            value: stats.plus_minus?.toFixed(1),
            tooltip: undefined,
          },
          {
            label: "Fouls Drawn",
            value: stats.fouls_drawn_per_game?.toFixed(1),
            tooltip: undefined,
          },
          {
            label: "PPG Variance",
            value: stats.ppg_variance?.toFixed(1),
            tooltip: "Consistency (lower is better)",
          },
        ]
      : [];

  const usportsCcaaStats =
    league === "usports" || league === "ccaa"
      ? [
          { label: "Conference", value: stats.conference, tooltip: undefined },
          {
            label: "Disqualifications",
            value: stats.disqualifications,
            tooltip: undefined,
          },
        ]
      : [];

  const allStats = [...ceblStats, ...hoopQueensStats, ...usportsCcaaStats];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-purple-50 dark:bg-purple-950/30 p-3.5 rounded-lg border border-purple-200 dark:border-purple-800">
      {allStats.map(({ label, value }) =>
        value !== undefined && value !== null ? (
          <StatTooltip key={label} statLabel={label}>
            <div className="text-center px-1">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                {label}
              </p>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                {value}
              </p>
            </div>
          </StatTooltip>
        ) : null,
      )}
    </div>
  );
}

function hasAdvancedStats(stats?: AdvancedStats): boolean {
  if (!stats) return false;
  return !!(
    stats.true_shooting_pct ||
    stats.effective_fg_pct ||
    stats.assist_to_turnover_ratio ||
    stats.usage_rate
  );
}

function hasTeamContext(context?: TeamContextStats): boolean {
  if (!context) return false;
  return !!(
    context.points_share ||
    context.rebounds_share ||
    context.assists_share ||
    context.steals_share ||
    context.blocks_share ||
    context.minutes_share ||
    context.shooting_volume_share
  );
}

function hasLeagueSpecificStats(stats?: LeagueSpecificStats): boolean {
  if (!stats) return false;
  return !!(
    stats.double_doubles ||
    stats.triple_doubles ||
    stats.target_scores ||
    stats.second_chance_points ||
    stats.fast_break_points ||
    stats.points_in_paint ||
    stats.plus_minus ||
    stats.fouls_drawn_per_game ||
    stats.ppg_variance ||
    stats.conference ||
    stats.disqualifications
  );
}
