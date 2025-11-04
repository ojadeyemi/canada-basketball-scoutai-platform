import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PercentileIndicator } from "./PercentileIndicator";
import type { PlayerSeasonStats } from "../../types/player";

interface LeagueComparisonSectionProps {
  seasons: PlayerSeasonStats[];
  league: string;
}

interface ComparisonRowProps {
  label: string;
  playerValue: number;
  vsAvg: number;
  pctDiff: number;
  percentile: number;
}

const ComparisonRow = ({
  label,
  playerValue,
  vsAvg,
  pctDiff,
  percentile,
}: ComparisonRowProps) => {
  const isAboveAvg = vsAvg > 0;

  return (
    <div className="grid grid-cols-5 gap-4 py-2 border-b border-border last:border-b-0">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-sm text-right">{playerValue.toFixed(1)}</div>
      <div
        className={`text-sm text-right font-semibold ${
          isAboveAvg ? "text-green-600" : "text-red-600"
        }`}
      >
        {vsAvg > 0 ? "+" : ""}
        {vsAvg.toFixed(1)}
      </div>
      <div
        className={`text-sm text-right ${
          isAboveAvg ? "text-green-600" : "text-red-600"
        }`}
      >
        {pctDiff > 0 ? "+" : ""}
        {pctDiff.toFixed(1)}%
      </div>
      <div className="flex justify-end">
        <PercentileIndicator percentile={percentile} size="sm" />
      </div>
    </div>
  );
};

export const LeagueComparisonSection = ({
  seasons,
}: LeagueComparisonSectionProps) => {
  // Find the most recent season with league comparison data
  const seasonsWithComparison = seasons.filter(
    (s) => s.league_comparison !== undefined && s.league_comparison !== null,
  );

  if (seasonsWithComparison.length === 0) {
    return null;
  }

  // Use the most recent season (assumes seasons are ordered newest first)
  const recentSeason = seasonsWithComparison[0];
  const comparison = recentSeason.league_comparison;

  // Additional safety check - ensure comparison exists and has required fields
  if (
    !comparison ||
    comparison.ppg_percentile === undefined ||
    comparison.rpg_percentile === undefined ||
    comparison.apg_percentile === undefined
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">League Comparison</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            vs League Average ({recentSeason.season})
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            How this player compares to league-wide averages
          </p>
        </CardHeader>
        <CardContent>
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-4 pb-2 mb-2 border-b-2 border-border text-xs font-semibold text-muted-foreground">
            <div>Stat</div>
            <div className="text-right">Player</div>
            <div className="text-right">vs Avg</div>
            <div className="text-right">% Diff</div>
            <div className="text-right">Percentile</div>
          </div>

          {/* Data Rows */}
          <div className="space-y-1">
            <ComparisonRow
              label="Points/Game"
              playerValue={recentSeason.points_per_game || 0}
              vsAvg={comparison.ppg_vs_avg ?? 0}
              pctDiff={comparison.ppg_pct_diff ?? 0}
              percentile={comparison.ppg_percentile ?? 0}
            />

            <ComparisonRow
              label="Rebounds/Game"
              playerValue={recentSeason.rebounds_per_game || 0}
              vsAvg={comparison.rpg_vs_avg ?? 0}
              pctDiff={comparison.rpg_pct_diff ?? 0}
              percentile={comparison.rpg_percentile ?? 0}
            />

            <ComparisonRow
              label="Assists/Game"
              playerValue={recentSeason.assists_per_game || 0}
              vsAvg={comparison.apg_vs_avg ?? 0}
              pctDiff={comparison.apg_pct_diff ?? 0}
              percentile={comparison.apg_percentile ?? 0}
            />

            {recentSeason.advanced_stats?.true_shooting_pct !== undefined &&
              comparison.ts_pct_percentile !== undefined && (
                <ComparisonRow
                  label="True Shooting %"
                  playerValue={
                    (recentSeason.advanced_stats.true_shooting_pct || 0) * 100
                  }
                  vsAvg={comparison.ts_pct_vs_avg ?? 0}
                  pctDiff={comparison.ts_pct_vs_avg ?? 0} // Already in percentage points
                  percentile={comparison.ts_pct_percentile ?? 0}
                />
              )}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Percentile Rank:</span> Indicates
              how the player ranks among all players in the league (higher is
              better)
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">Elite (75-100)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Good (50-75)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-muted-foreground">Average (25-50)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-muted-foreground">Below (0-25)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
