import type { PlayerDetail, PlayerSeasonStats } from "@/types/player";
import SeasonTypeBadge from "../SeasonTypeBadge";

interface CareerStatsTabProps {
  player: PlayerDetail;
}

export default function CareerStatsTab({ player }: CareerStatsTabProps) {
  const careerStats = player.career_stats;

  if (!careerStats || careerStats.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No career statistics available
      </div>
    );
  }

  // Sort career stats: regular, playoffs, championship, total
  const sortOrder = ["regular", "playoffs", "championship", "total"];
  const sortedStats = [...careerStats].sort((a, b) => {
    const indexA = sortOrder.indexOf(a.season_type || "total");
    const indexB = sortOrder.indexOf(b.season_type || "total");
    return indexA - indexB;
  });

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-foreground mb-3">
        Career Statistics by Type
      </h3>

      <div className="space-y-3">
        {sortedStats.map((stats, index) => (
          <div key={index}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-foreground">
                {stats.season}
              </h4>
              {stats.season_type && (
                <SeasonTypeBadge seasonType={stats.season_type} />
              )}
            </div>
            <StatsTable stats={stats} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsTable({ stats }: { stats: PlayerSeasonStats }) {
  const statRows = [
    { label: "GP", value: stats.games_played },
    { label: "GS", value: stats.games_started },
    { label: "MIN", value: stats.total_minutes },
    { label: "MPG", value: stats.minutes_per_game?.toFixed(1) },
    { label: "PPG", value: stats.points_per_game?.toFixed(1) },
    { label: "RPG", value: stats.rebounds_per_game?.toFixed(1) },
    { label: "ORB", value: stats.offensive_rebounds_per_game?.toFixed(1) },
    { label: "DRB", value: stats.defensive_rebounds_per_game?.toFixed(1) },
    { label: "APG", value: stats.assists_per_game?.toFixed(1) },
    { label: "SPG", value: stats.steals_per_game?.toFixed(1) },
    { label: "BPG", value: stats.blocks_per_game?.toFixed(1) },
    { label: "TPG", value: stats.turnovers_per_game?.toFixed(1) },
    { label: "FPG", value: stats.personal_fouls_per_game?.toFixed(1) },
    {
      label: "FG%",
      value: stats.field_goal_percentage
        ? (stats.field_goal_percentage * 100).toFixed(1) + "%"
        : undefined,
    },
    {
      label: "3P%",
      value: stats.three_point_percentage
        ? (stats.three_point_percentage * 100).toFixed(1) + "%"
        : undefined,
    },
    {
      label: "FT%",
      value: stats.free_throw_percentage
        ? (stats.free_throw_percentage * 100).toFixed(1) + "%"
        : undefined,
    },
  ];

  return (
    <div className="bg-muted/20 border border-border/50 p-3 rounded-lg">
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
        {statRows.map(({ label, value }) =>
          value !== undefined && value !== null ? (
            <div key={label} className="text-center">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                {label}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {value ?? "-"}
              </p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
