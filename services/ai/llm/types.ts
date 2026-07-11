export type LLMProviderType = "OPENAI" | "CLAUDE" | "GEMINI";

export interface LLMAgentInfo {
  name: string;
  matches: number;
  winRate: number;
  kda: number;
}

export interface LLMMapInfo {
  name: string;
  matches: number;
  winRate: number;
}

export interface LLMMatchEntry {
  result: string;
  mapName: string;
  agentName: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  queue: string;
}

export interface LLMPlayerProfile {
  playStyle: string;
  preferredSide: string;
  consistency: string;
  mainStrengths: string[];
  priorityFocus: string[];
}

export interface LLMCurrentAnalysis {
  score: number;
  summary: string;
  insightsCount: number;
}

export interface LLMAnalysisInput {
  playerName: string;
  matchCount: number;
  winRate: number;
  averageKda: number;
  headshotRate: number;
  damagePerRound: number;
  firstDeathRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  topAgents: Array<LLMAgentInfo>;
  mapStats: Array<LLMMapInfo>;
  currentRank?: string;
  profile?: LLMPlayerProfile;
  currentAnalysis?: LLMCurrentAnalysis;
  recentMatches?: Array<LLMMatchEntry>;
}

export interface LLMGoal {
  title: string;
  description: string;
  metric: string;
  targetValue: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface LLMAnalysisResult {
  provider: LLMProviderType;
  score: number;
  summary: string;
  insights: Array<{
    category: string;
    severity: "critical" | "high" | "medium" | "low";
    problem: string;
    explanation: string;
    solution: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  goals: LLMGoal[];
  estimatedRank: string;
  confidence: number;
  progressionProbability: number;
}

export interface LLMChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMChatResponse {
  content: string;
  finishReason: "stop" | "length" | "error";
}

export interface ProviderConfig {
  provider: LLMProviderType;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  durationMs: number;
  model: string;
  provider: LLMProviderType;
}

export interface ProviderResult<T> {
  data: T;
  usage: ProviderUsage;
}

export interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successfulRequests: number;
  failedRequests: number;
  averageDurationMs: number;
  byProvider: Record<string, { requests: number; tokens: number; cost: number }>;
}

export interface PromptLogEntry {
  id: string;
  provider: string;
  model: string;
  promptVersion: string | null;
  systemPrompt: string | null;
  userPrompt: string | null;
  responseContent: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  durationMs: number | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: Date;
}

export interface StreamingCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
}
