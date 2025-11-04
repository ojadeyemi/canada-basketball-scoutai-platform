import { useQuery } from "@tanstack/react-query";
import { searchPlayers } from "../services/api";
import { useDebounce } from "./useDebounce";
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_DELAY } from "../constants";

export const usePlayerSearch = (
  query: string,
  leagues?: string[],
  seasons?: string[],
) => {
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_DELAY);

  return useQuery({
    queryKey: ["players", debouncedQuery, leagues, seasons],
    queryFn: () => searchPlayers({ query: debouncedQuery, leagues, seasons }),
    enabled: debouncedQuery.length >= MIN_SEARCH_LENGTH,
  });
};
