export const LEAGUES = [
  { value: "usports", label: "U SPORTS" },
  { value: "ccaa", label: "CCAA" },
  { value: "cebl", label: "CEBL" },
  { value: "hoopqueens", label: "HoopQueens" },
] as const;

export type LeagueValue = (typeof LEAGUES)[number]["value"];

export const LEAGUE_LOGOS: Record<string, string> = {
  usports: "/usports_logo.png",
  ccaa: "/ccaa_logo.jpeg",
  cebl: "/cebl_logo.png",
  hoopqueens: "/hoopqueens_logo.png",
};

export const DEFAULT_LEAGUE_COLOR = "bg-gray-50";
