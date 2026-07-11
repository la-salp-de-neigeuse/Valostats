import type { StatsPeriod } from "@/services/stats/aggregate-stats-service";

export interface PeriodOption {
  value: StatsPeriod;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "all", label: "Global" },
];

export const LEADERBOARD_PERIODS = [
  { value: "all", label: "Global" },
  { value: "30d", label: "30 jours" },
  { value: "7d", label: "7 jours" },
] as const;

export const LEADERBOARD_SORT_OPTIONS = [
  { value: "KDA", label: "K/D" },
  { value: "WIN_RATE", label: "Winrate" },
  { value: "AI_SCORE", label: "Score IA" },
  { value: "PROGRESSION", label: "Progression" },
  { value: "MATCH_COUNT", label: "Matchs" },
] as const;

export const LEADERBOARD_REGIONS = [
  { value: "", label: "Toutes les régions" },
  { value: "EUROPE", label: "Europe" },
  { value: "AMERICAS", label: "Amériques" },
  { value: "ASIA", label: "Asie" },
  { value: "SEA", label: "SEA" },
] as const;

export const LEADERBOARD_RANKS = [
  { value: "", label: "Tous les rangs", tierMin: 0, tierMax: 24 },
  { value: "iron", label: "Fer", tierMin: 0, tierMax: 2 },
  { value: "bronze", label: "Bronze", tierMin: 3, tierMax: 5 },
  { value: "silver", label: "Argent", tierMin: 6, tierMax: 8 },
  { value: "gold", label: "Or", tierMin: 9, tierMax: 11 },
  { value: "platinum", label: "Platine", tierMin: 12, tierMax: 14 },
  { value: "diamond", label: "Diamant", tierMin: 15, tierMax: 17 },
  { value: "ascendant", label: "Ascendant", tierMin: 18, tierMax: 20 },
  { value: "immortal", label: "Immortel", tierMin: 21, tierMax: 23 },
  { value: "radiant", label: "Radiant", tierMin: 24, tierMax: 24 },
] as const;

export const STATS_PERIOD_OPTIONS = PERIOD_OPTIONS;
