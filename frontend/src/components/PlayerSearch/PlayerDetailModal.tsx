import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlayerDetail } from "../../services/api";
import { X, BarChart3, FileText, List, TrendingUp } from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import CareerStatsTab from "./tabs/CareerStatsTab";
import SeasonStatsTab from "./tabs/SeasonStatsTab";
import PerformanceTrendsTab from "./tabs/PerformanceTrendsTab";
import { PlayerAvatar } from "./PlayerAvatar";
import {
  getCountryFlag,
  getCountryName,
  formatAge,
  formatBirthDate,
} from "../../utils/playerHelpers";
import { LEAGUE_LOGOS } from "../../constants";

interface PlayerDetailModalProps {
  league: string;
  playerId: string;
  playerName: string;
  onClose: () => void;
}

type TabType = "overview" | "career" | "seasons" | "trends";

export default function PlayerDetailModal({
  league,
  playerId,
  playerName,
  onClose,
}: PlayerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const {
    data: player,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playerDetail", league, playerId],
    queryFn: () => getPlayerDetail(league, playerId),
  });

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: BarChart3 },
    { id: "career" as TabType, label: "Career Stats", icon: FileText },
    { id: "seasons" as TabType, label: "Season Stats", icon: List },
    { id: "trends" as TabType, label: "Performance Trends", icon: TrendingUp },
  ];

  const LEAGUE_NAMES: Record<string, string> = {
    usports: "U SPORTS",
    ccaa: "CCAA",
    cebl: "CEBL",
    hoopqueens: "HoopQueens",
  };

  const leagueName = player
    ? LEAGUE_NAMES[player.league.toLowerCase()] || player.league.toUpperCase()
    : league.toUpperCase();
  const leagueLogo = player
    ? LEAGUE_LOGOS[player.league.toLowerCase()]
    : undefined;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!player && !isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl max-w-6xl w-full h-[90vh] overflow-hidden shadow-2xl border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Bio */}
        <div className="flex-shrink-0 bg-gradient-to-br from-background via-primary/5 to-background border-b border-border p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            {/* Bio Header Content */}
            {player ? (
              <div className="flex items-start gap-3 flex-1">
                {/* Avatar */}
                <PlayerAvatar
                  fullName={player.full_name}
                  photoUrl={player.photo_url}
                  size="xl"
                />

                {/* Bio Info */}
                <div className="flex-1 space-y-1">
                  {/* Name and League */}
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      {player.full_name}
                      {player.nationality && (
                        <span className="ml-2">
                          {getCountryFlag(player.nationality)}
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      {leagueLogo && (
                        <img
                          src={leagueLogo}
                          alt={leagueName}
                          className="h-5 w-auto object-contain"
                        />
                      )}
                      <span className="text-sm font-medium text-muted-foreground">
                        {leagueName}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    {player.position && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {player.position}
                        </span>
                      </div>
                    )}

                    {player.height && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {player.height}
                        </span>
                      </div>
                    )}

                    {player.age && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {formatAge(player.age)}
                        </span>
                      </div>
                    )}

                    {player.nationality && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {getCountryName(player.nationality)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Secondary Info Row */}
                  {(player.birth_date || player.current_team) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {player.birth_date && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">Born:</span>
                          <span>{formatBirthDate(player.birth_date)}</span>
                        </div>
                      )}

                      {player.current_team && (
                        <div className="flex items-center gap-1.5">
                          {player.birth_date && (
                            <span className="text-muted-foreground">•</span>
                          )}
                          <span className="font-medium">Current Team:</span>
                          <span>{player.current_team}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {playerName}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {league.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        {player && (
          <div className="flex-shrink-0 bg-background border-b border-border">
            <div className="flex items-center gap-2 overflow-x-auto px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto min-h-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Loading player data...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
              Error loading player details. Please try again.
            </div>
          )}

          {player && (
            <div>
              {activeTab === "overview" && <OverviewTab player={player} />}
              {activeTab === "career" && <CareerStatsTab player={player} />}
              {activeTab === "seasons" && <SeasonStatsTab player={player} />}
              {activeTab === "trends" && (
                <PerformanceTrendsTab player={player} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
