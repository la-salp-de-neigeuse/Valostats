export enum InsightCategory {
  AIM = "aim",
  GAME_SENSE = "game_sense",
  AGENT_MASTERY = "agent_mastery",
  MAP_KNOWLEDGE = "map_knowledge",
  TEAMWORK = "teamwork",
  ECONOMY = "economy",
  CONSISTENCY = "consistency",
  POSITIONING = "positioning",
}

export enum InsightSeverity {
  CRITICAL = 3,
  HIGH = 2,
  MEDIUM = 1,
  LOW = 0,
}

export interface Insight {
  category: InsightCategory;
  severity: InsightSeverity;
  problem: string;
  explanation: string;
  solution: string;
  evidence: Record<string, unknown>;
}

export interface AnalysisInput {
  userId: string;
  aggregateId: bigint;
  stats: {
    matchCount: number;
    wins: number;
    losses: number;
    winRate: number;
    averageKda: number;
    headshotRate: number;
    damagePerRound: number;
    combatScore: number;
    firstDeathRate: number;
    attackWinRate: number;
    defenseWinRate: number;
    utilityPerRound: number;
    mainAgent: string | null;
    bestMap: string | null;
    worstMap: string | null;
  };
  agents: Array<{
    agentName: string;
    matchCount: number;
    winRate: number;
    averageKda: number;
    damagePerRound: number;
  }>;
  maps: Array<{
    mapName: string;
    matchCount: number;
    winRate: number;
    attackWinRate: number;
    defenseWinRate: number;
    averageKda: number;
  }>;
}

export interface ScoreBreakdown {
  overall: number;
  winRate: number;
  kda: number;
  headshotRate: number;
  damagePerRound: number;
  firstDeathRate: number;
  consistency: number;
  agentMastery: number;
  mapKnowledge: number;
}

export interface PlayerProfile {
  playStyle: "aggressive" | "balanced" | "supportive" | "inconsistent";
  preferredSide: "attack" | "defense" | "balanced";
  consistency: "stable" | "volatile" | "improving";
  mainStrengths: string[];
  priorityFocus: string[];
}

export interface CoachingGoal {
  id: string;
  title: string;
  description: string;
  metric: string;
  targetValue: string;
  currentValue: string;
  difficulty: "easy" | "medium" | "hard";
  category: InsightCategory;
}

export interface CoachingReport extends AnalysisResult {
  scoreBreakdown: ScoreBreakdown;
  profile: PlayerProfile;
  strengths: Insight[];
  weaknesses: Insight[];
  goals: CoachingGoal[];
}

export interface AnalysisResult {
  score: number;
  summary: string;
  insights: Insight[];
}
