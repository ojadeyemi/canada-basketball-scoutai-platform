import type { PlayerDetail } from "@/types/player";
import TeamContributionChart from "../charts/TeamContributionChart";
import ShotChart from "../charts/ShotChart";
import { AdvancedMetricsGrid } from "../AdvancedMetricsGrid";
import { LeagueComparisonSection } from "../LeagueComparisonSection";
import { StatTooltip } from "../StatTooltip";

interface OverviewTabProps {
  player: PlayerDetail;
}

export default function OverviewTab({ player }: OverviewTabProps) {
  // Get the "total" career stats from the array (career_stats contains regular, playoffs, total)
  const careerStats =
    player.career_stats?.find((stat) => stat.season_type === "total") ||
    player.career_stats?.[0]; // Fallback to first item if no "total" found

  // Get latest season stats (most recent season)
  const latestSeasonStats = player.seasons?.[0]; // Assuming seasons are sorted by most recent first

  if (!careerStats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No career statistics available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Career Averages */}
      <div>
        <h3 className="text-base font-semibold mb-3 text-foreground">
          Career Averages
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          <StatTooltip statLabel="PPG">
            <CompactStatCard
              label="PPG"
              value={careerStats.points_per_game?.toFixed(1) || "N/A"}
            />
          </StatTooltip>
          <StatTooltip statLabel="RPG">
            <CompactStatCard
              label="RPG"
              value={careerStats.rebounds_per_game?.toFixed(1) || "N/A"}
            />
          </StatTooltip>
          <StatTooltip statLabel="APG">
            <CompactStatCard
              label="APG"
              value={careerStats.assists_per_game?.toFixed(1) || "N/A"}
            />
          </StatTooltip>
          <StatTooltip statLabel="FG%">
            <CompactStatCard
              label="FG%"
              value={
                careerStats.field_goal_percentage
                  ? `${(careerStats.field_goal_percentage * 100).toFixed(1)}%`
                  : "N/A"
              }
            />
          </StatTooltip>
          <StatTooltip statLabel="3P%">
            <CompactStatCard
              label="3P%"
              value={
                careerStats.three_point_percentage
                  ? `${(careerStats.three_point_percentage * 100).toFixed(1)}%`
                  : "N/A"
              }
            />
          </StatTooltip>
          <StatTooltip statLabel="FT%">
            <CompactStatCard
              label="FT%"
              value={
                careerStats.free_throw_percentage
                  ? `${(careerStats.free_throw_percentage * 100).toFixed(1)}%`
                  : "N/A"
              }
            />
          </StatTooltip>
          <StatTooltip statLabel="SPG">
            <CompactStatCard
              label="SPG"
              value={careerStats.steals_per_game?.toFixed(1) || "N/A"}
            />
          </StatTooltip>
          <StatTooltip statLabel="BPG">
            <CompactStatCard
              label="BPG"
              value={careerStats.blocks_per_game?.toFixed(1) || "N/A"}
            />
          </StatTooltip>
        </div>
      </div>

      {/* Latest Season Averages */}
      {latestSeasonStats && (
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">
            Latest Season ({latestSeasonStats.season})
            {latestSeasonStats.team && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                - {latestSeasonStats.team}
              </span>
            )}
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            <StatTooltip statLabel="PPG">
              <CompactStatCard
                label="PPG"
                value={latestSeasonStats.points_per_game?.toFixed(1) || "N/A"}
              />
            </StatTooltip>
            <StatTooltip statLabel="RPG">
              <CompactStatCard
                label="RPG"
                value={latestSeasonStats.rebounds_per_game?.toFixed(1) || "N/A"}
              />
            </StatTooltip>
            <StatTooltip statLabel="APG">
              <CompactStatCard
                label="APG"
                value={latestSeasonStats.assists_per_game?.toFixed(1) || "N/A"}
              />
            </StatTooltip>
            <StatTooltip statLabel="FG%">
              <CompactStatCard
                label="FG%"
                value={
                  latestSeasonStats.field_goal_percentage
                    ? `${(latestSeasonStats.field_goal_percentage * 100).toFixed(1)}%`
                    : "N/A"
                }
              />
            </StatTooltip>
            <StatTooltip statLabel="3P%">
              <CompactStatCard
                label="3P%"
                value={
                  latestSeasonStats.three_point_percentage
                    ? `${(latestSeasonStats.three_point_percentage * 100).toFixed(1)}%`
                    : "N/A"
                }
              />
            </StatTooltip>
            <StatTooltip statLabel="FT%">
              <CompactStatCard
                label="FT%"
                value={
                  latestSeasonStats.free_throw_percentage
                    ? `${(latestSeasonStats.free_throw_percentage * 100).toFixed(1)}%`
                    : "N/A"
                }
              />
            </StatTooltip>
            <StatTooltip statLabel="SPG">
              <CompactStatCard
                label="SPG"
                value={latestSeasonStats.steals_per_game?.toFixed(1) || "N/A"}
              />
            </StatTooltip>
            <StatTooltip statLabel="BPG">
              <CompactStatCard
                label="BPG"
                value={latestSeasonStats.blocks_per_game?.toFixed(1) || "N/A"}
              />
            </StatTooltip>
          </div>
        </div>
      )}

      {/* Advanced Metrics (League-Specific) */}
      {careerStats.league_specific && (
        <AdvancedMetricsGrid
          league={player.league}
          stats={careerStats.league_specific}
          gamesPlayed={careerStats.games_played}
        />
      )}

      {/* League Comparison */}
      <LeagueComparisonSection
        seasons={player.seasons}
        league={player.league}
      />

      {/* Team Contribution Chart */}
      <div>
        <h3 className="text-base font-semibold mb-3 text-foreground">
          Team Contribution
        </h3>
        <TeamContributionChart player={player} />
      </div>

      {/* Shot Chart (CEBL only) */}
      {player.league === "cebl" && (
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">
            Shot Chart
          </h3>
          <ShotChart playerId={Number(player.player_id)} />
        </div>
      )}
    </div>
  );
}

interface CompactStatCardProps {
  label: string;
  value: string;
}

function CompactStatCard({ label, value }: CompactStatCardProps) {
  return (
    <div className="bg-muted/40 border border-border rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
