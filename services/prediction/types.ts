export interface RankBlock {
  label: string;
  matchStart: number;
  matchEnd: number;
  matchCount: number;
  averageRankTier: number;
  wins: number;
  winRate: number;
  kda: number;
  adr: number;
  headshotRate: number;
}

export interface ProgressionPoint {
  matchIndex: number;
  actualRankTier: number | null;
  projectedRankTier: number | null;
}

export interface InfluencingFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  value: number;
  description: string;
}

export interface PredictionWeights {
  recentWinrate: number;
  overallKda: number;
  overallAdr: number;
  aiScore: number;
  consistency: number;
  mapPoolStrength: number;
  agentPoolStrength: number;
}

export interface PredictionResult {
  currentRankTier: number;
  currentRankLabel: string;
  nextRankTier: number;
  nextRankLabel: string;
  winProbability: number;
  probability: number;
  estimatedMatches: number;
  estimatedTimeHours: number;
  estimatedRR: number;
  confidence: number;
  globalProgressionScore: number;
  progressionCurve: ProgressionPoint[];
  rankBlocks: RankBlock[];
  slope: number;
  intercept: number;
  summary: string;
  advice: string[];
  influencingFactors: InfluencingFactor[];
  streaks: {
    winStreak: number;
    lossStreak: number;
  };
  trends: {
    last5: number; // winrate on last 5
    last10: number;
    last20: number;
  };
  aiScore: number | null;
  consistency: {
    winrate: number;
    kda: number;
    adr: number;
    overall: "stable" | "volatile" | "improving" | "declining";
  };
  topAgents: Array<{ name: string; matchCount: number; winRate: number }>;
  topMaps: Array<{ name: string; matchCount: number; winRate: number }>;
}
