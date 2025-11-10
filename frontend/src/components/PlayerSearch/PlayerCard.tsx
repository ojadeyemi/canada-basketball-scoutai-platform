import type { PlayerSearchResult } from "../../types/player";
import { ChevronRight } from "lucide-react";
import { LEAGUE_LOGOS, DEFAULT_LEAGUE_COLOR } from "../../constants";
import { PlayerAvatar } from "./PlayerAvatar";
import { getCountryFlag, formatAge } from "../../utils/playerHelpers";

interface PlayerCardProps {
  player: PlayerSearchResult;
  onClick: () => void;
}

const LEAGUE_CONFIG: Record<
  string,
  { logo: string; alt: string; color: string }
> = {
  usports: {
    logo: LEAGUE_LOGOS.usports,
    alt: "U SPORTS",
    color: "bg-blue-50 text-blue-700",
  },
  ccaa: {
    logo: LEAGUE_LOGOS.ccaa,
    alt: "CCAA",
    color: "bg-green-50 text-green-700",
  },
  cebl: {
    logo: LEAGUE_LOGOS.cebl,
    alt: "CEBL",
    color: "bg-red-50 text-red-700",
  },
  hoopqueens: {
    logo: LEAGUE_LOGOS.hoopqueens,
    alt: "HoopQueens",
    color: "bg-purple-50 text-purple-700",
  },
};
//TODO add playerurl image to this form backend (i.e cebl players, make sure to cache images)
export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const leagueConfig = LEAGUE_CONFIG[player.league.toLowerCase()] || {
    logo: "",
    alt: player.league.toUpperCase(),
    color: DEFAULT_LEAGUE_COLOR,
  };
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-2.5 px-4 py-1.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border last:border-b-0"
    >
      {/* Player Avatar */}
      <PlayerAvatar
        fullName={player.full_name}
        leagueLogoUrl={leagueConfig.logo}
        size="sm"
      />

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {player.full_name}
            {player.nationality && (
              <span className="ml-1">{getCountryFlag(player.nationality)}</span>
            )}
          </h3>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${leagueConfig.color}`}
          >
            {leagueConfig.alt}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {player.positions.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {player.positions[0]}
            </span>
          )}
          {player.age && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatAge(player.age)}
              </span>
            </>
          )}
          {player.teams.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground truncate">
                {player.teams[0]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow Icon */}
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </div>
  );
}
