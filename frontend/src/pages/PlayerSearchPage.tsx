import { useState } from "react";
import { Search } from "lucide-react";
import { usePlayerSearch } from "../hooks/usePlayerSearch";
import PlayerCard from "../components/PlayerSearch/PlayerCard";
import PlayerDetailModal from "../components/PlayerSearch/PlayerDetailModal";
import {
  LEAGUES,
  MIN_SEARCH_LENGTH,
  SEARCH_RESULTS_MAX_HEIGHT,
} from "../constants";

export default function PlayerSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    league: string;
    playerId: string;
    name: string;
  } | null>(null);

  const {
    data: players,
    isLoading,
    isFetching,
  } = usePlayerSearch(
    searchQuery,
    selectedLeagues.length > 0 ? selectedLeagues : undefined,
  );

  const toggleLeague = (league: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(league)
        ? prev.filter((l) => l !== league)
        : [...prev, league],
    );
  };

  const clearFilters = () => {
    setSelectedLeagues([]);
  };

  const hasFilters = selectedLeagues.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Search className="w-10 h-10 text-blue-600" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Player Search
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Discover talent across U SPORTS, CCAA, HoopQueens, and CEBL
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-base"
            aria-label="Search for basketball players"
          />
          {isFetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {LEAGUES.map((league) => (
          <button
            key={league.value}
            onClick={() => toggleLeague(league.value)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              selectedLeagues.includes(league.value)
                ? "bg-blue-600 text-white shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {league.label}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Search Results */}
      <div className="min-h-[400px]">
        {searchQuery.length < MIN_SEARCH_LENGTH && !isLoading && (
          <div className="text-center text-muted-foreground py-20">
            <Search className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-sm">Start typing to search for players...</p>
          </div>
        )}

        {searchQuery.length >= MIN_SEARCH_LENGTH && isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {searchQuery.length >= MIN_SEARCH_LENGTH &&
          !isLoading &&
          players &&
          players.length === 0 && (
            <div className="text-center text-muted-foreground py-20">
              <p className="text-lg font-medium">No players found</p>
              <p className="text-sm mt-2">
                Try adjusting your search query or filters
              </p>
            </div>
          )}

        {players && players.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                {players.length} player{players.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div
              className="space-y-2 overflow-y-auto pr-2"
              style={{ maxHeight: SEARCH_RESULTS_MAX_HEIGHT }}
            >
              {players.map((player) => (
                <PlayerCard
                  key={`${player.league}-${player.player_id}`}
                  player={player}
                  onClick={() =>
                    setSelectedPlayer({
                      league: player.league,
                      playerId: String(player.player_id),
                      name: player.full_name,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          league={selectedPlayer.league}
          playerId={selectedPlayer.playerId}
          playerName={selectedPlayer.name}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
