import { useQuery } from "@tanstack/react-query";
import { getTables, getTableData } from "@/services/dataService";
import type { LeagueName } from "@/types/dataExplorer";

/**
 * Fetch list of tables for a league
 */
export function useTables(league: LeagueName | null) {
  return useQuery({
    queryKey: ["tables", league],
    queryFn: () => getTables(league!),
    enabled: !!league,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch data from a specific table
 */
export function useTableData(
  league: LeagueName | null,
  tableName: string | null,
  params?: {
    season?: string;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ["tableData", league, tableName, params],
    queryFn: () => getTableData(league!, tableName!, params),
    enabled: !!league && !!tableName,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
