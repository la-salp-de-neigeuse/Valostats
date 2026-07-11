import type { InsightSeverity } from "@/services/ai/types";

export const MIN_MATCHES_FOR_ANALYSIS = 5;

export const AI_SCORE_THRESHOLDS = [
  { min: 70, label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500" },
  { min: 50, label: "Bon", color: "text-yellow-400", bg: "bg-yellow-500" },
  { min: 30, label: "Intermédiaire", color: "text-orange-400", bg: "bg-orange-500" },
  { min: 0, label: "Débutant", color: "text-rose-400", bg: "bg-rose-500" },
] as const;

export function getScoreThreshold(score: number) {
  for (const t of AI_SCORE_THRESHOLDS) {
    if (score >= t.min) return t;
  }
  return AI_SCORE_THRESHOLDS[AI_SCORE_THRESHOLDS.length - 1];
}

export const SCORE_BREAKDOWN_MAX = {
  kda: 25,
  winRate: 25,
  headshotRate: 20,
  damagePerRound: 20,
  firstDeathRate: 10,
  consistency: 5,
  agentMastery: 10,
  mapKnowledge: 10,
} as const;

export const SCORE_BREAKDOWN_MAX_TOTAL = Object.values(SCORE_BREAKDOWN_MAX).reduce((a, b) => a + b, 0);

export const SCORE_BREAKDOWN_LABELS: Record<string, string> = {
  kda: "K/D Ratio",
  winRate: "Winrate",
  headshotRate: "Headshot",
  damagePerRound: "Dégâts/Round",
  firstDeathRate: "Survie",
  consistency: "Régularité",
  agentMastery: "Piscine d'agents",
  mapKnowledge: "Maps",
};

export const SCORE_BREAKDOWN_BAR_COLORS: Record<string, string> = {
  kda: "from-blue-500 to-blue-400",
  winRate: "from-emerald-500 to-emerald-400",
  headshotRate: "from-violet-500 to-violet-400",
  damagePerRound: "from-orange-500 to-orange-400",
  firstDeathRate: "from-rose-500 to-rose-400",
  consistency: "from-cyan-500 to-cyan-400",
  agentMastery: "from-amber-500 to-amber-400",
  mapKnowledge: "from-indigo-500 to-indigo-400",
};

export const SEVERITY_CONFIG: Record<number, { label: string; borderBg: string }> = {
  3: { label: "Critique", borderBg: "bg-rose-500/10 border-rose-500/30 text-rose-400" },
  2: { label: "Élevé", borderBg: "bg-orange-500/10 border-orange-500/30 text-orange-400" },
  1: { label: "Moyen", borderBg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
  0: { label: "Faible", borderBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
};

export function getSeverityConfig(severity: InsightSeverity) {
  return SEVERITY_CONFIG[severity as number] ?? SEVERITY_CONFIG[0];
}

export const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: {
    label: "Facile",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  medium: {
    label: "Moyen",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  hard: {
    label: "Difficile",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export function getDifficultyConfig(difficulty: string) {
  return DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.easy;
}

export const AI_ANALYSIS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
