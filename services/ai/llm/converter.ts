import { InsightCategory, InsightSeverity } from "@/services/ai/types";
import { calculateScoreBreakdown, inferPlayerProfile } from "@/services/ai/insight-generator";
import type { AnalysisInput, AnalysisResult, CoachingReport } from "@/services/ai/types";
import type { LLMAnalysisInput, LLMAnalysisResult } from "./types";

export function analysisInputToLLMInput(
  input: AnalysisInput,
  playerName: string,
  rank?: string,
): LLMAnalysisInput {
  return {
    playerName,
    matchCount: input.stats.matchCount,
    winRate: input.stats.winRate,
    averageKda: input.stats.averageKda,
    headshotRate: input.stats.headshotRate,
    damagePerRound: input.stats.damagePerRound,
    firstDeathRate: input.stats.firstDeathRate,
    attackWinRate: input.stats.attackWinRate,
    defenseWinRate: input.stats.defenseWinRate,
    currentRank: rank,
    topAgents: input.agents.map((a) => ({
      name: a.agentName,
      matches: a.matchCount,
      winRate: a.winRate,
      kda: a.averageKda,
    })),
    mapStats: input.maps.map((m) => ({
      name: m.mapName,
      matches: m.matchCount,
      winRate: m.winRate,
    })),
  };
}

const SEVERITY_MAP: Record<string, InsightSeverity> = {
  critical: InsightSeverity.CRITICAL,
  high: InsightSeverity.HIGH,
  medium: InsightSeverity.MEDIUM,
  low: InsightSeverity.LOW,
};

function mapSeverity(severity: string): InsightSeverity {
  return SEVERITY_MAP[severity] ?? InsightSeverity.MEDIUM;
}

const CATEGORY_MAP: Record<string, InsightCategory> = {
  aim: InsightCategory.AIM,
  game_sense: InsightCategory.GAME_SENSE,
  agent_mastery: InsightCategory.AGENT_MASTERY,
  map_knowledge: InsightCategory.MAP_KNOWLEDGE,
  teamwork: InsightCategory.TEAMWORK,
  economy: InsightCategory.ECONOMY,
  consistency: InsightCategory.CONSISTENCY,
  positioning: InsightCategory.POSITIONING,
};

function mapCategory(category: string): InsightCategory {
  return CATEGORY_MAP[category] ?? InsightCategory.GAME_SENSE;
}

export function llmToAnalysisResult(llm: LLMAnalysisResult, input: AnalysisInput): AnalysisResult {
  const insights = [
    ...llm.strengths.map(
      (s): import("@/services/ai/types").Insight => ({
        category: InsightCategory.GAME_SENSE,
        severity: InsightSeverity.LOW,
        problem: s,
        explanation: s,
        solution: s,
        evidence: {},
      }),
    ),
    ...llm.weaknesses.map(
      (w): import("@/services/ai/types").Insight => ({
        category: InsightCategory.GAME_SENSE,
        severity: InsightSeverity.HIGH,
        problem: w,
        explanation: w,
        solution: w,
        evidence: {},
      }),
    ),
    ...llm.insights.map(
      (i): import("@/services/ai/types").Insight => ({
        category: mapCategory(i.category),
        severity: mapSeverity(i.severity),
        problem: i.problem,
        explanation: i.explanation,
        solution: i.solution,
        evidence: {},
      }),
    ),
  ];

  const breakdown = calculateScoreBreakdown(input);
  const score = llm.score || breakdown.overall;

  return { score, summary: llm.summary, insights, engine: "llm" };
}

export function llmToCoachingReport(
  llm: LLMAnalysisResult,
  input: AnalysisInput,
): CoachingReport {
  const scoreBreakdown = calculateScoreBreakdown(input);
  const profile = inferPlayerProfile(input);

  const strengths: import("@/services/ai/types").Insight[] = llm.strengths.map((s) => ({
    category: InsightCategory.GAME_SENSE,
    severity: InsightSeverity.LOW,
    problem: s,
    explanation: s,
    solution: s,
    evidence: {},
  }));

  const weaknesses: import("@/services/ai/types").Insight[] = llm.weaknesses.map((w) => ({
    category: InsightCategory.GAME_SENSE,
    severity: InsightSeverity.HIGH,
    problem: w,
    explanation: w,
    solution: w,
    evidence: {},
  }));

  const goals: import("@/services/ai/types").CoachingGoal[] = llm.goals.map((g, i) => ({
    id: `llm-goal-${i}`,
    title: g.title,
    description: g.description,
    metric: g.metric,
    targetValue: g.targetValue,
    currentValue: "",
    difficulty: g.difficulty,
    category: InsightCategory.GAME_SENSE,
  }));

  const insights = [...strengths, ...weaknesses];

  return {
    score: llm.score,
    summary: llm.summary,
    insights,
    engine: "llm",
    scoreBreakdown,
    profile,
    strengths,
    weaknesses,
    goals,
  };
}
