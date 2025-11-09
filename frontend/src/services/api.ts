import axios, { type AxiosError } from "axios";
import type {
  PlayerSearchResult,
  PlayerDetail,
  ShotChartData,
} from "../types/player";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Network error. Check your connection.";
    if (error.response.status >= 500) return "Server error. Please try again.";
    if (error.response.status === 404) return "Resource not found.";
    return (
      error.response.data?.detail ||
      error.response.data?.message ||
      "Request failed."
    );
  }
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

// Player Search
export const searchPlayers = async (params: {
  query: string;
  leagues?: string[];
  seasons?: string[];
  limit?: number; // Per-league limit (e.g., 3 per league across 4 leagues = max 12 results)
}): Promise<PlayerSearchResult[]> => {
  const { data } = await api.get("/search/player", {
    params: {
      query: params.query,
      leagues: params.leagues?.join(","),
      seasons: params.seasons?.join(","),
      limit: params.limit || 3, // Default: 3 results per league
    },
  });
  return data;
};

// Get Player Details
export const getPlayerDetail = async (
  league: string,
  playerId: string,
): Promise<PlayerDetail> => {
  const { data } = await api.get(`/search/player/${league}/${playerId}`);
  return data;
};

export const getShotChartData = async (
  league: string,
  playerId: string,
): Promise<ShotChartData> => {
  const { data } = await api.get(
    `/search/player/${league}/${playerId}/shot-chart`,
  );
  return data;
};
