export interface PerformanceMetrics {
  winRate: number;
  kda: number;
  headshotRate: number;
  damagePerRound: number;
  combatScore: number;
  attackWinRate: number;
  defenseWinRate: number;
  openingDuelSuccess: number;
  firstBloodsPerMatch: number;
  firstDeathsPerMatch: number;
  utilityPerRound: number;
  plantsPerMatch: number;
  defusesPerMatch: number;
  survivalRate: number;
  roundsPlayed: number;
  matchCount: number;
  wins: number;
  losses: number;
}

export interface AgentPerformanceItem {
  agentName: string;
  agentDisplayName: string;
  matchCount: number;
  winRate: number;
  averageKda: number;
  damagePerRound: number;
}

export interface MapPerformanceItem {
  mapName: string;
  matchCount: number;
  winRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  averageKda: number;
}

export interface RadarMetric {
  metric: string;
  value: number;
  fullMark: number;
}

export interface PerformanceAiInsights {
  score: number | null;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
}

export interface PerformanceData {
  current: PerformanceMetrics;
  agents: AgentPerformanceItem[];
  maps: MapPerformanceItem[];
  radar: RadarMetric[];
  aiInsights: PerformanceAiInsights;
  vsAverage: Array<{
    label: string;
    playerValue: number;
    averageValue: number;
    unit: string;
    higherIsBetter: boolean;
  }>;
  hasData: boolean;
}
