export const POSITION_ABBREVIATIONS: Record<string, string> = {
  F: "Forward",
  G: "Guard",
  C: "Center",
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
};

export const POSITION_THRESHOLDS = {
  center: {
    minRpg: 6,
    minBpg: 0.8,
  },
  guard: {
    minApg: 3,
    minSpg: 1.2,
  },
  forward: {
    minRpg: 4,
    maxApg: 2.5,
  },
} as const;
