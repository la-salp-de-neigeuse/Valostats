export type OverlayTheme = "dark" | "transparent" | "pink" | "minimal" | "streamer" | "competition";

export type OverlayDisplayMode = "normal" | "streamer" | "competition" | "minimal";

export type OverlaySize = "small" | "medium" | "large";

export type OverlayFont = "geist-sans" | "geist-mono" | "inter" | "monospace";

export type OverlayWidgetType =
  | "playerName"
  | "rank"
  | "rr"
  | "winRate"
  | "kda"
  | "aiScore"
  | "recentMatches"
  | "lastMatch"
  | "mainAgent"
  | "bestAgent"
  | "winStreak"
  | "lastResult"
  | "progression"
  | "goalOfDay"
  | "lastAiInsight"
  | "syncTime";

export interface OverlayWidgetConfig {
  type: OverlayWidgetType;
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OverlaySettings {
  theme: OverlayTheme;
  displayMode: OverlayDisplayMode;
  widgets: OverlayWidgetConfig[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  size: OverlaySize;
  font: OverlayFont;
  transparency: number;
  animations: boolean;
  refreshInterval: number;
  showBorder: boolean;
  borderRadius: number;
  fontScale: number;
  shadow: boolean;
  shadowBlur: number;
}

const DEFAULT_WIDGETS: OverlayWidgetConfig[] = [
  { type: "playerName", visible: true, x: 0, y: 0, w: 4, h: 1 },
  { type: "rank", visible: true, x: 4, y: 0, w: 2, h: 1 },
  { type: "rr", visible: true, x: 6, y: 0, w: 2, h: 1 },
  { type: "winRate", visible: true, x: 8, y: 0, w: 2, h: 1 },
  { type: "kda", visible: true, x: 10, y: 0, w: 2, h: 1 },
  { type: "aiScore", visible: true, x: 0, y: 1, w: 2, h: 1 },
  { type: "winStreak", visible: true, x: 2, y: 1, w: 2, h: 1 },
  { type: "lastResult", visible: true, x: 4, y: 1, w: 2, h: 1 },
  { type: "mainAgent", visible: true, x: 6, y: 1, w: 2, h: 1 },
  { type: "bestAgent", visible: true, x: 8, y: 1, w: 2, h: 1 },
  { type: "lastMatch", visible: true, x: 10, y: 1, w: 2, h: 1 },
  { type: "progression", visible: true, x: 0, y: 2, w: 4, h: 1 },
  { type: "goalOfDay", visible: true, x: 4, y: 2, w: 3, h: 1 },
  { type: "lastAiInsight", visible: true, x: 7, y: 2, w: 3, h: 1 },
  { type: "syncTime", visible: true, x: 10, y: 2, w: 2, h: 1 },
  { type: "recentMatches", visible: true, x: 0, y: 3, w: 12, h: 1 },
];

export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  theme: "dark",
  displayMode: "normal",
  widgets: DEFAULT_WIDGETS,
  colors: {
    primary: "#f43f5e",
    secondary: "#94a3b8",
    accent: "#22d3ee",
    background: "",
    text: "",
  },
  size: "medium",
  font: "geist-sans",
  transparency: 0,
  animations: true,
  refreshInterval: 30,
  showBorder: true,
  borderRadius: 12,
  fontScale: 100,
  shadow: true,
  shadowBlur: 12,
};

export const WIDGET_LABELS: Record<OverlayWidgetType, string> = {
  playerName: "Nom du joueur",
  rank: "Rang",
  rr: "RR / Progression",
  winRate: "Winrate",
  kda: "KDA",
  aiScore: "Score IA",
  recentMatches: "Derniers matchs",
  lastMatch: "Dernier match",
  mainAgent: "Agent principal",
  bestAgent: "Meilleur agent",
  winStreak: "Série de victoires",
  lastResult: "Dernier résultat",
  progression: "Barre de progression",
  goalOfDay: "Objectif du jour",
  lastAiInsight: "Dernière amélioration IA",
  syncTime: "Sync",
};

export const WIDGET_SIZES: Record<OverlayWidgetType, { w: number; h: number }> = {
  playerName: { w: 4, h: 1 },
  rank: { w: 2, h: 1 },
  rr: { w: 2, h: 1 },
  winRate: { w: 2, h: 1 },
  kda: { w: 2, h: 1 },
  aiScore: { w: 2, h: 1 },
  recentMatches: { w: 12, h: 1 },
  lastMatch: { w: 4, h: 1 },
  mainAgent: { w: 2, h: 1 },
  bestAgent: { w: 2, h: 1 },
  winStreak: { w: 2, h: 1 },
  lastResult: { w: 2, h: 1 },
  progression: { w: 4, h: 1 },
  goalOfDay: { w: 3, h: 1 },
  lastAiInsight: { w: 3, h: 1 },
  syncTime: { w: 2, h: 1 },
};

export interface OverlayMatchEntry {
  result: string;
  mapName: string;
  agentName: string;
  kills: number;
  deaths: number;
  assists: number;
  matchStartedAt: string;
}

export interface OverlayData {
  playerName: string;
  rank: string | null;
  rankTier: number | null;
  rankProgressValue: number;
  winRate: number;
  kda: number;
  aiScore: number | null;
  matchCount: number;
  wins: number;
  losses: number;
  lastMatches: OverlayMatchEntry[];
  lastMatch: OverlayMatchEntry | null;
  lastAgent: string | null;
  mainAgent: string | null;
  bestAgent: { name: string; winRate: number } | null;
  winStreak: number;
  lastResult: string | null;
  goalOfDay: { title: string; progress: number; target: number } | null;
  lastAiInsight: { problem: string; solution: string } | null;
  syncTimeAgo: string | null;
  settings: OverlaySettings;
}
