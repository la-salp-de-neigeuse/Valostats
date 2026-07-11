export interface EvolutionPoint {
  label: string;
  matchCount: number;
  winRate: number;
  kdRatio: number;
}

export interface ComparedPlayer {
  slug: string;
  displayName: string;
  rank: string | null;
  rankTier: number | null;
  rr: number | null;
  matchCount: number;
  wins: number;
  losses: number;
  winRate: number;
  kda: number; // This is KD Ratio
  adr: number;
  acs: number;
  headshotRate: number;
  aiScore: number | null;
  progression: number;
  firstDeathRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  utilityPerRound: number;
  topAgents: Array<{ name: string; matches: number; winRate: number; kda: number }>;
  topMaps: Array<{ name: string; matches: number; winRate: number }>;
  recentResults: Array<"WIN" | "LOSS" | "DRAW">;
  evolution: EvolutionPoint[];
  aiInsights: {
    strengths: string[];
    weaknesses: string[];
    summary: string | null;
  };
}

export interface ComparisonAdvantage {
  player1: string[];
  player2: string[];
}

export interface AiComparisonSummary {
  advantageTo: "PLAYER1" | "PLAYER2" | "TIE";
  globalScore: number;
  player1Strengths: string[];
  player2Strengths: string[];
  player1Weaknesses: string[];
  player2Weaknesses: string[];
  areasForImprovement: string;
}

export interface ComparisonData {
  player1: ComparedPlayer;
  player2: ComparedPlayer;
  advantages: ComparisonAdvantage;
  aiSummary: AiComparisonSummary;
}

export interface PlayerSearchResult {
  publicSlug: string;
  displayName: string;
  gameName: string | null;
  tagLine: string | null;
  rank: string | null;
}
