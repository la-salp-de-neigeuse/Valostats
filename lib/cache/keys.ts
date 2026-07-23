export const TTL = {
  DASHBOARD: 10 * 60 * 1000,
  STATS_AGGREGATE: 15 * 60 * 1000,
  OVERLAY: 30 * 1000,
  SETTINGS: 60 * 1000,
  LEADERBOARD: 5 * 60 * 1000,
  PREDICTION: 15 * 60 * 1000,
  PERFORMANCE: 10 * 60 * 1000,
  EVOLUTION: 10 * 60 * 1000,
  MATCH_CHART: 5 * 60 * 1000,
  PUBLIC_PROFILE: 5 * 60 * 1000,
  GOALS_SUMMARY: 5 * 60 * 1000,
  ACTIVITY: 5 * 60 * 1000,
  MATCH_HISTORY: 2 * 60 * 1000,
  COMPARISON: 5 * 60 * 1000,
  NEWS: 30 * 60 * 1000,
} as const;

function prefix(domain: string, ...parts: string[]): string {
  return `cache:${domain}:${parts.join(":")}`;
}

export function statsKey(userId: string, period: string): string {
  return prefix("stats", userId, period);
}

export function agentStatsKey(userId: string, period: string): string {
  return prefix("agent-stats", userId, period);
}

export function mapStatsKey(userId: string, period: string): string {
  return prefix("map-stats", userId, period);
}

export function evolutionKey(userId: string): string {
  return prefix("evolution", userId);
}

export function periodComparisonKey(userId: string): string {
  return prefix("period-compare", userId);
}

export function recentMatchesKey(userId: string, limit: number): string {
  return prefix("recent-matches", userId, String(limit));
}

export function overlayKey(slug: string, skipVisibilityCheck = false): string {
  return skipVisibilityCheck ? prefix("overlay-bypass", slug) : prefix("overlay", slug);
}

export function leaderboardKey(filters: Record<string, unknown>): string {
  const parts = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`);
  return prefix("leaderboard", ...parts);
}

export function settingsKey(userId: string): string {
  return prefix("settings", userId);
}

export function predictionKey(userId: string): string {
  return prefix("prediction", userId);
}

export function performanceKey(userId: string, period: string): string {
  return prefix("performance", userId, period);
}

export function publicProfileKey(slug: string, period: string): string {
  return prefix("public-profile", slug, period);
}

export function dashboardV2Key(userId: string): string {
  return prefix("dashboard", userId, "v2");
}

export function dashboardHeatmapKey(userId: string): string {
  return prefix("dashboard", userId, "heatmap");
}

export function dashboardTimelineKey(userId: string): string {
  return prefix("dashboard", userId, "timeline");
}

export function dashboardActivityKey(userId: string): string {
  return prefix("dashboard", userId, "activity");
}

export function dashboardGoalsKey(userId: string): string {
  return prefix("dashboard", userId, "goals");
}

export function dashboardRankEvolutionKey(userId: string): string {
  return prefix("dashboard", userId, "rank-evolution");
}

export function dashboardVsAverageKey(userId: string): string {
  return prefix("dashboard", userId, "vs-average");
}

export function matchHistoryKey(userId: string, limit: number, offset: number): string {
  return prefix("match-history", userId, String(limit), String(offset));
}

export function comparisonKey(slugA: string, slugB: string): string {
  const sorted = [slugA, slugB].sort();
  return prefix("comparison", sorted[0], sorted[1]);
}
