import { useState, useCallback, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  PromptInputButton,
  PromptInputHoverCard,
  PromptInputHoverCardTrigger,
  PromptInputHoverCardContent,
  PromptInputCommand,
  PromptInputCommandInput,
  PromptInputCommandList,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandItem,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { searchPlayers, getErrorMessage } from "@/services/api";
import type { PlayerSearchResult } from "@/types/player";
import { useDebounce } from "@/hooks/useDebounce";

export interface PlayerContext {
  id: string;
  full_name: string;
  league: string;
  teams: string[];
  seasons: string[];
}

interface PlayerContextManagerProps {
  playerContexts: PlayerContext[];
  onAdd: (player: PlayerContext) => void;
  onRemove: (id: string) => void;
}

export default function PlayerContextManager({
  playerContexts,
  onAdd,
  onRemove,
}: PlayerContextManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPlayers({ query, limit: 5 });
      setSearchResults(results);
    } catch (error) {
      console.error("Player search error:", error);
      toast.error(getErrorMessage(error));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, handleSearch]);

  const addPlayerContext = (player: PlayerSearchResult) => {
    const playerContext: PlayerContext = {
      id: `${player.league}-${player.player_id}`,
      full_name: player.full_name,
      league: player.league.toUpperCase(),
      teams: player.teams,
      seasons: player.seasons,
    };

    if (!playerContexts.some((p) => p.id === playerContext.id)) {
      onAdd(playerContext);
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      <PromptInputHoverCard>
        <PromptInputHoverCardTrigger>
          <PromptInputButton className="!h-7" size="sm" variant="outline">
            <UserPlus className="text-muted-foreground" size={14} />
            <span>Search player</span>
          </PromptInputButton>
        </PromptInputHoverCardTrigger>
        <PromptInputHoverCardContent className="w-[400px] p-0">
          <PromptInputCommand shouldFilter={false}>
            <PromptInputCommandInput
              placeholder="Search players to add as context..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <PromptInputCommandList>
              {searchResults.length === 0 ? (
                <PromptInputCommandEmpty className="p-3 text-muted-foreground text-sm">
                  {isSearching
                    ? "Searching..."
                    : searchQuery.length < 2
                      ? "Type at least 2 characters to search"
                      : "No players found"}
                </PromptInputCommandEmpty>
              ) : (
                <PromptInputCommandGroup heading="Search Results">
                  {searchResults.map((player) => (
                    <PromptInputCommandItem
                      key={`${player.league}-${player.player_id}`}
                      onSelect={() => addPlayerContext(player)}
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-medium text-sm">
                          {player.full_name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {player.league.toUpperCase()} •{" "}
                          {player.teams.join(", ")}
                        </span>
                      </div>
                    </PromptInputCommandItem>
                  ))}
                </PromptInputCommandGroup>
              )}
            </PromptInputCommandList>
          </PromptInputCommand>
        </PromptInputHoverCardContent>
      </PromptInputHoverCard>

      {playerContexts.map((player) => (
        <div
          key={player.id}
          className="group relative flex h-7 cursor-default select-none items-center gap-1.5 rounded-md border border-border px-2 font-medium text-sm transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <div className="relative size-4 shrink-0">
            <div className="absolute inset-0 flex size-4 items-center justify-center overflow-hidden rounded bg-background transition-opacity group-hover:opacity-0">
              <UserPlus className="size-3 text-muted-foreground" />
            </div>
            <Button
              aria-label="Remove player context"
              className="absolute inset-0 size-4 cursor-pointer rounded p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&>svg]:size-2"
              onClick={() => onRemove(player.id)}
              type="button"
              variant="ghost"
            >
              <X />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
          <span className="truncate text-xs">
            {player.full_name} • {player.league}
          </span>
        </div>
      ))}
    </>
  );
}
