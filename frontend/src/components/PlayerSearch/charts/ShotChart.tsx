import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getShotChartData, getShotChartDataByName } from "@/services/api";
import type { ShotAttempt, ShotChartData } from "@/types/player";

// Full basketball court dimensions (94ft x 50ft ratio)
const COURT_WIDTH = 940; // 94ft scaled to pixels
const COURT_HEIGHT = 500; // 50ft scaled to pixels
const COURT_COLOR = "#f7d8b1";

// Shot styling
const SHOT_RADIUS_2PT = 5;
const SHOT_RADIUS_3PT = 7;
const SHOT_MADE_COLOR = "#22c55e";
const SHOT_MISSED_STROKE = "#ef4444";
const SHOT_STROKE_WIDTH = 2;
const SHOT_OPACITY = 0.7;

// Court element dimensions (scaled to match court size)
const HOOP_RADIUS = 9;
const THREE_POINT_RADIUS = 238; // 23.75ft scaled
const KEY_WIDTH = 160;
const KEY_HEIGHT = 190;
const FREE_THROW_CIRCLE_RADIUS = 60;

interface ShotChartProps {
  playerId?: number;
  playerName?: string;
}

export default function ShotChart({ playerId, playerName }: ShotChartProps) {
  const [selectedSeason, setSelectedSeason] = useState<number | "all">("all");
  const [selectedQuarters, setSelectedQuarters] = useState<Set<number>>(
    new Set([1, 2, 3, 4]),
  );
  const [show2PT, setShow2PT] = useState(true);
  const [show3PT, setShow3PT] = useState(true);

  const { data, isLoading, error } = useQuery<ShotChartData>({
    queryKey: playerName
      ? ["shotChart", "byName", playerName]
      : ["shotChart", "byId", playerId],
    queryFn: () => {
      if (playerName) {
        return getShotChartDataByName(playerName);
      }
      if (playerId) {
        return getShotChartData("cebl", playerId.toString());
      }
      throw new Error("Either playerId or playerName must be provided");
    },
    enabled: !!(playerId || playerName),
  });

  const filteredShots = useMemo(() => {
    if (!data?.shots) return [];

    return data.shots.filter((shot) => {
      const seasonMatch =
        selectedSeason === "all" || shot.season === selectedSeason;
      const quarterMatch = selectedQuarters.has(shot.quarter);
      const typeMatch =
        (shot.shot_type === "2pt" && show2PT) ||
        (shot.shot_type === "3pt" && show3PT);

      return seasonMatch && quarterMatch && typeMatch;
    });
  }, [data?.shots, selectedSeason, selectedQuarters, show2PT, show3PT]);

  const stats = useMemo(() => {
    const result = filteredShots.reduce(
      (acc, shot) => {
        acc.fgAttempted++;
        if (shot.made) acc.fgMade++;

        if (shot.shot_type === "3pt") {
          acc.threePtAttempted++;
          if (shot.made) acc.threePtMade++;
        }

        return acc;
      },
      { fgMade: 0, fgAttempted: 0, threePtMade: 0, threePtAttempted: 0 },
    );

    const fgPct =
      result.fgAttempted > 0 ? (result.fgMade / result.fgAttempted) * 100 : 0;
    const threePtPct =
      result.threePtAttempted > 0
        ? (result.threePtMade / result.threePtAttempted) * 100
        : 0;

    return {
      fg: {
        made: result.fgMade,
        attempted: result.fgAttempted,
        percentage: fgPct,
      },
      threePt: {
        made: result.threePtMade,
        attempted: result.threePtAttempted,
        percentage: threePtPct,
      },
    };
  }, [filteredShots]);

  const toggleQuarter = (quarter: number) => {
    const newQuarters = new Set(selectedQuarters);
    if (newQuarters.has(quarter)) {
      // Prevent unchecking the last selected quarter
      if (newQuarters.size > 1) {
        newQuarters.delete(quarter);
      }
    } else {
      newQuarters.add(quarter);
    }
    setSelectedQuarters(newQuarters);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading shot chart...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Shot chart data unavailable
      </div>
    );
  }

  if (data.shots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No shot data available for this player
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters and stats in one compact row */}
      <div className="flex flex-wrap gap-4 items-center py-2 border-b border-border">
        {/* Season selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Season
          </span>
          <select
            value={selectedSeason}
            onChange={(e) =>
              setSelectedSeason(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="px-2.5 py-1 border border-input rounded-md bg-background text-sm hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Seasons</option>
            {data.seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Quarter filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Quarters
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => toggleQuarter(q)}
                className={`
                  px-2.5 py-1 text-xs font-medium rounded-md transition-all
                  ${
                    selectedQuarters.has(q)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }
                `}
              >
                Q{q}
              </button>
            ))}
          </div>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Shot type filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Type
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setShow2PT(!show2PT)}
              className={`
                px-2.5 py-1 text-xs font-medium rounded-md transition-all
                ${
                  show2PT
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              2PT
            </button>
            <button
              onClick={() => setShow3PT(!show3PT)}
              className={`
                px-2.5 py-1 text-xs font-medium rounded-md transition-all
                ${
                  show3PT
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              3PT
            </button>
          </div>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Inline stats */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              FG%:
            </span>
            <span className="text-2xl font-bold tracking-tight">
              {stats.fg.percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({stats.fg.made}/{stats.fg.attempted})
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              3PT%:
            </span>
            <span className="text-2xl font-bold tracking-tight">
              {stats.threePt.percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({stats.threePt.made}/{stats.threePt.attempted})
            </span>
          </div>
        </div>
      </div>

      <div className="p-2 rounded-lg" style={{ backgroundColor: COURT_COLOR }}>
        <svg
          viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
          className="w-full h-auto border border-border rounded-lg max-h-[300px]"
          style={{ backgroundColor: COURT_COLOR }}
        >
          {/* Court outline and center line */}
          <g stroke="#000" strokeWidth="2" fill="none">
            <rect width={COURT_WIDTH} height={COURT_HEIGHT} />
            <line
              x1={COURT_WIDTH / 2}
              y1="0"
              x2={COURT_WIDTH / 2}
              y2={COURT_HEIGHT}
            />

            {/* Center circle */}
            <circle
              cx={COURT_WIDTH / 2}
              cy={COURT_HEIGHT / 2}
              r={FREE_THROW_CIRCLE_RADIUS}
            />

            {/* Left side - hoop, key, 3PT arc */}
            <circle
              cx={HOOP_RADIUS * 4}
              cy={COURT_HEIGHT / 2}
              r={HOOP_RADIUS}
              fill="#000"
            />
            <rect
              x="0"
              y={(COURT_HEIGHT - KEY_HEIGHT) / 2}
              width={KEY_WIDTH}
              height={KEY_HEIGHT}
            />
            <circle
              cx={KEY_WIDTH}
              cy={COURT_HEIGHT / 2}
              r={FREE_THROW_CIRCLE_RADIUS}
            />
            <path
              d={`M ${HOOP_RADIUS * 4} ${(COURT_HEIGHT - THREE_POINT_RADIUS * 2) / 2}
                  A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 1 ${HOOP_RADIUS * 4} ${(COURT_HEIGHT + THREE_POINT_RADIUS * 2) / 2}`}
            />

            {/* Right side - hoop, key, 3PT arc */}
            <circle
              cx={COURT_WIDTH - HOOP_RADIUS * 4}
              cy={COURT_HEIGHT / 2}
              r={HOOP_RADIUS}
              fill="#000"
            />
            <rect
              x={COURT_WIDTH - KEY_WIDTH}
              y={(COURT_HEIGHT - KEY_HEIGHT) / 2}
              width={KEY_WIDTH}
              height={KEY_HEIGHT}
            />
            <circle
              cx={COURT_WIDTH - KEY_WIDTH}
              cy={COURT_HEIGHT / 2}
              r={FREE_THROW_CIRCLE_RADIUS}
            />
            <path
              d={`M ${COURT_WIDTH - HOOP_RADIUS * 4} ${(COURT_HEIGHT - THREE_POINT_RADIUS * 2) / 2}
                  A ${THREE_POINT_RADIUS} ${THREE_POINT_RADIUS} 0 0 0 ${COURT_WIDTH - HOOP_RADIUS * 4} ${(COURT_HEIGHT + THREE_POINT_RADIUS * 2) / 2}`}
            />
          </g>

          {/* Shot data points - transform from 0-100 to court coordinates */}
          {filteredShots.map((shot: ShotAttempt, idx: number) => {
            const radius =
              shot.shot_type === "3pt" ? SHOT_RADIUS_3PT : SHOT_RADIUS_2PT;
            const fill = shot.made ? SHOT_MADE_COLOR : "none";
            const stroke = shot.made ? "none" : SHOT_MISSED_STROKE;
            const strokeWidth = shot.made ? 0 : SHOT_STROKE_WIDTH;

            // Transform normalized coordinates (0-100) to court pixels
            const x = (shot.x / 100) * COURT_WIDTH;
            const y = (shot.y / 100) * COURT_HEIGHT;

            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={SHOT_OPACITY}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
