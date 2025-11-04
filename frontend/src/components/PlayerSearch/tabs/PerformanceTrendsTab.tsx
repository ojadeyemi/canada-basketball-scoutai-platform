import type { PlayerDetail } from "@/types/player";
import ScoringChart from "../charts/ScoringChart";
import ReboundingChart from "../charts/ReboundingChart";
import ShootingChart from "../charts/ShootingChart";
import PlaymakingChart from "../charts/PlaymakingChart";
import DefensiveChart from "../charts/DefensiveChart";
import MinutesChart from "../charts/MinutesChart";
import TeamImpactEvolutionChart from "../charts/TeamImpactEvolutionChart";
import PlusMinusChart from "../charts/PlusMinusChart";
import ConsistencyChart from "../charts/ConsistencyChart";
import PlayoffPerformanceChart from "../charts/PlayoffPerformanceChart";

interface PerformanceTrendsTabProps {
  player: PlayerDetail;
}

export default function PerformanceTrendsTab({
  player,
}: PerformanceTrendsTabProps) {
  if (player.seasons.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No season data available for trend analysis
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Impact Evolution */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Team Impact Evolution
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Track contribution percentages across seasons
        </p>
        <TeamImpactEvolutionChart seasons={player.seasons} />
      </div>
      {/* Scoring Trends */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Scoring Trends
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Track points per game over time
        </p>
        <ScoringChart seasons={player.seasons} />
      </div>

      {/* Rebounding Trends */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Rebounding Trends
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Total, offensive, and defensive rebounds per game
        </p>
        <ReboundingChart seasons={player.seasons} />
      </div>

      {/* Shooting Efficiency */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Shooting Efficiency Trends
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Field goal, three-point, and free throw percentage trends
        </p>
        <ShootingChart seasons={player.seasons} />
      </div>

      {/* Playmaking & Ball Control */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Playmaking & Ball Control
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Assists and turnovers per game
        </p>
        <PlaymakingChart seasons={player.seasons} />
      </div>

      {/* Defensive Impact */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Defensive Impact
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Steals, blocks, and fouls per game
        </p>
        <DefensiveChart seasons={player.seasons} />
      </div>

      {/* Playing Time */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-foreground">
          Playing Time
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Minutes per game trends
        </p>
        <MinutesChart seasons={player.seasons} />
      </div>

      {/* League-Specific Advanced Trends */}

      {/* CEBL: Plus/Minus Trend */}
      {player.league.toLowerCase() === "cebl" && (
        <div>
          <h3 className="text-base font-semibold mb-2 text-foreground">
            Plus/Minus Trend (CEBL)
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Average point differential when on court
          </p>
          <PlusMinusChart player={player} />
        </div>
      )}

      {/* HoopQueens: Consistency Trend */}
      {player.league.toLowerCase() === "hoopqueens" && (
        <div>
          <h3 className="text-base font-semibold mb-2 text-foreground">
            Consistency Trend (HoopQueens)
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Performance consistency over time (lower is more consistent)
          </p>
          <ConsistencyChart player={player} />
        </div>
      )}

      {/* U SPORTS/CCAA: Playoff Performance */}
      {(player.league.toLowerCase() === "usports" ||
        player.league.toLowerCase() === "ccaa") && (
        <div>
          <h3 className="text-base font-semibold mb-2 text-foreground">
            Playoff vs Regular Season
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Performance changes in playoff games
          </p>
          <PlayoffPerformanceChart player={player} />
        </div>
      )}
    </div>
  );
}
