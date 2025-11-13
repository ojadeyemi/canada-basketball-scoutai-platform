/**
 * Type definitions for Data Explorer
 */

export interface TableMetadata {
  name: string;
  row_count: number;
  requires_season: boolean;
  latest_season: string | number | null;
  columns: string[];
}

export interface TableListResponse {
  league: string;
  tables: TableMetadata[];
}

export interface TableDataResponse {
  league: string;
  table_name: string;
  data: Record<string, any>[];
  columns: string[];
  row_count: number;
  filters_applied: Record<string, any>;
}

export type LeagueName = "usports" | "ccaa" | "cebl" | "hoopqueens";

export interface League {
  id: LeagueName;
  name: string;
  shortName: string;
}

export const LEAGUES: League[] = [
  { id: "usports", name: "U SPORTS", shortName: "USPORTS" },
  { id: "ccaa", name: "CCAA", shortName: "CCAA" },
  { id: "cebl", name: "CEBL", shortName: "CEBL" },
  { id: "hoopqueens", name: "HoopQueens", shortName: "HQ" },
];
