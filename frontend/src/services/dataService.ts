import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";

/**
 * Data service for fetching table data from league databases.
 * Handles all /api/data endpoints for the Data Explorer.
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

async function getErrorFromResponse(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return (
      data.detail ||
      data.message ||
      `HTTP ${response.status}: ${response.statusText}`
    );
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

/**
 * Get list of all tables in a league database with metadata.
 */
export async function getTables(league: string): Promise<TableListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${league}/tables`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorMsg = await getErrorFromResponse(response);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tables";
    toast.error(message);
    throw error;
  }
}

/**
 * Get data from a specific table with optional filtering.
 */
export async function getTableData(
  league: string,
  tableName: string,
  params?: {
    season?: string;
    limit?: number;
  }
): Promise<TableDataResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.season) {
      queryParams.append("season", params.season);
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const url = `${API_BASE_URL}/data/${league}/${tableName}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorMsg = await getErrorFromResponse(response);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch table data";
    toast.error(message);
    throw error;
  }
}

/**
 * Export table data as CSV.
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }

  const columns = Object.keys(data[0]);
  const csvContent = [
    columns.join(","),
    ...data.map((row) =>
      columns
        .map((col) => {
          const value = row[col];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // Escape values containing commas or quotes
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  toast.success(`Exported ${data.length} rows to ${filename}.csv`);
}

/**
 * Export table data as JSON.
 */
export function exportToJSON(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);

  toast.success(`Exported ${data.length} rows to ${filename}.json`);
}
