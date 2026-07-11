import { createHash } from "crypto";

import { prisma } from "@/lib/prisma/client";
import { checkAiAnalysisQuota, incrementAiAnalysisUsage } from "@/services/quotas/quota-service";
import { generateInsights, generateCoachingReport } from "./insight-generator";
import { InsightCategory, InsightSeverity } from "./types";
import { AI_ANALYSIS_CACHE_TTL_MS } from "@/constants/ai";
import { PROMPT_VERSION } from "@/services/ai/prompt-builder";
import { analysisInputToLLMInput, llmToAnalysisResult, llmToCoachingReport } from "@/services/ai/llm/converter";
import type { AnalysisInput, AnalysisResult, CoachingReport } from "./types";
import type { LLMAnalysisResult } from "@/services/ai/llm/types";
import { createNotification } from "@/services/notifications/notifications-service";
import { getProvider } from "@/services/ai/llm/llm-client";
import { ProviderManager } from "@/services/ai/llm/provider-manager";
import { getDefaultModel } from "@/services/ai/llm/cost-calculator";

const HEURISTIC_MODEL_NAME = "valostats-rule-based-v1";
const HEURISTIC_MODEL_VERSION = "1.0.0";
const HEURISTIC_PROMPT_VERSION = "1.0.0";

function generateInputHash(input: AnalysisInput): string {
  const inputString = JSON.stringify(input);
  return createHash("sha256").update(inputString).digest("hex");
}

interface EngineMetadata {
  provider: string;
  modelName: string;
  modelVersion: string;
  promptVersion: string;
}

function heuristicMetadata(): EngineMetadata {
  return {
    provider: "RULE_BASED",
    modelName: HEURISTIC_MODEL_NAME,
    modelVersion: HEURISTIC_MODEL_VERSION,
    promptVersion: HEURISTIC_PROMPT_VERSION,
  };
}

async function tryLlm(
  input: AnalysisInput,
  playerName: string,
  rank?: string,
): Promise<{ result: AnalysisResult; meta: EngineMetadata; rawResult: LLMAnalysisResult; generationTimeMs: number } | null> {
  try {
    const llmInput = analysisInputToLLMInput(input, playerName, rank);

    const start = Date.now();
    const providerResult = await ProviderManager.generateAnalysis(llmInput, { userId: input.userId });
    const llmResult = providerResult.data;
    const generationTimeMs = Date.now() - start;

    const meta: EngineMetadata = {
      provider: llmResult.provider,
      modelName: providerResult.usage.model,
      modelVersion: PROMPT_VERSION,
      promptVersion: PROMPT_VERSION,
    };

    const result = llmToAnalysisResult(llmResult);

    return { result, meta, rawResult: llmResult, generationTimeMs };
  } catch {
    return null;
  }
}

async function runHeuristic(input: AnalysisInput): Promise<{
  result: AnalysisResult;
  meta: EngineMetadata;
  coachingReport: CoachingReport;
  generationTimeMs: number;
}> {
  const start = Date.now();
  const result = generateInsights(input);
  const coachingReport = generateCoachingReport(input);
  const generationTimeMs = Date.now() - start;

  return { result, meta: heuristicMetadata(), coachingReport, generationTimeMs };
}

async function buildAnalysisInput(
  aggregateId: bigint,
  userId: string,
): Promise<{ input: AnalysisInput; playerName: string; currentRank?: string } | null> {
  const aggregate = await prisma.playerStatAggregate.findUnique({
    where: { id: aggregateId },
    include: {
      user: {
        select: { name: true, riotAccount: { select: { gameName: true, tagLine: true } } },
      },
    },
  });

  if (!aggregate) return null;

  const [agents, maps] = await Promise.all([
    prisma.playerAgentAggregate.findMany({
      where: { userId, period: aggregate.period, windowStart: aggregate.windowStart, windowEnd: aggregate.windowEnd },
      orderBy: { matchCount: "desc" },
    }),
    prisma.playerMapAggregate.findMany({
      where: { userId, period: aggregate.period, windowStart: aggregate.windowStart, windowEnd: aggregate.windowEnd },
      orderBy: { matchCount: "desc" },
    }),
  ]);

  let playerName = "Joueur";
  if (aggregate.user?.name) {
    playerName = aggregate.user.name;
  } else if (aggregate.user?.riotAccount?.gameName) {
    const ra = aggregate.user.riotAccount;
    playerName = `${ra.gameName}#${ra.tagLine}`;
  }

  return {
    currentRank: aggregate.rank ?? undefined,
    playerName,
    input: {
      userId,
      aggregateId,
      stats: {
        matchCount: aggregate.matchCount,
        wins: aggregate.wins,
        losses: aggregate.losses,
        winRate: Number(aggregate.winRate),
        averageKda: Number(aggregate.averageKda),
        headshotRate: Number(aggregate.headshotRate),
        damagePerRound: Number(aggregate.damagePerRound),
        combatScore: Number(aggregate.combatScore),
        firstDeathRate: Number(aggregate.firstDeathRate),
        attackWinRate: Number(aggregate.attackWinRate),
        defenseWinRate: Number(aggregate.defenseWinRate),
        utilityPerRound: Number(aggregate.utilityPerRound),
        mainAgent: aggregate.mainAgent,
        bestMap: aggregate.bestMap,
        worstMap: aggregate.worstMap,
      },
      agents: agents.map((a) => ({
        agentName: a.agentName,
        matchCount: a.matchCount,
        winRate: Number(a.winRate),
        averageKda: Number(a.averageKda),
        damagePerRound: Number(a.damagePerRound),
      })),
      maps: maps.map((m) => ({
        mapName: m.mapName,
        matchCount: m.matchCount,
        winRate: Number(m.winRate),
        attackWinRate: Number(m.attackWinRate),
        defenseWinRate: Number(m.defenseWinRate),
        averageKda: Number(m.averageKda),
      })),
    },
  };
}

function isCacheValid(analysis: { status: string; generatedAt: Date | null }): boolean {
  if (analysis.status !== "COMPLETED") return false;
  if (!analysis.generatedAt) return false;
  return Date.now() - analysis.generatedAt.getTime() < AI_ANALYSIS_CACHE_TTL_MS;
}

async function fetchCachedInsights(
  analysisId: bigint,
): Promise<import("./types").Insight[]> {
  const stored = await prisma.aiInsight.findMany({
    where: { analysisId },
    orderBy: { severity: "desc" },
  });

  return stored.map((insight) => ({
    category: insight.category as InsightCategory,
    severity: insight.severity as InsightSeverity,
    problem: insight.problem,
    explanation: insight.explanation,
    solution: insight.solution,
    evidence: insight.evidence as Record<string, unknown>,
  }));
}

async function checkCache(
  userId: string,
  inputHash: string,
  meta: EngineMetadata,
): Promise<{ analysisId: bigint; score: number; summary: string; insights: import("./types").Insight[] } | null> {
  const existing = await prisma.aiAnalysis.findUnique({
    where: {
      userId_modelName_modelVersion_promptVersion_inputHash: {
        userId,
        modelName: meta.modelName,
        modelVersion: meta.modelVersion,
        promptVersion: meta.promptVersion,
        inputHash,
      },
    },
  });

  if (!existing) return null;
  if (!isCacheValid(existing)) return null;

  const insights = await fetchCachedInsights(existing.id);

  return {
    analysisId: existing.id,
    score: Number(existing.score ?? 0),
    summary: existing.summary ?? "",
    insights,
  };
}

async function storeResult(
  userId: string,
  aggregateId: bigint,
  inputHash: string,
  result: AnalysisResult,
  meta: EngineMetadata,
  rawResult: LLMAnalysisResult | null,
  generationTimeMs: number,
): Promise<void> {
  const rawResultJson = rawResult ? JSON.parse(JSON.stringify(rawResult)) : undefined;

  const analysis = await prisma.aiAnalysis.upsert({
    where: {
      userId_modelName_modelVersion_promptVersion_inputHash: {
        userId,
        modelName: meta.modelName,
        modelVersion: meta.modelVersion,
        promptVersion: meta.promptVersion,
        inputHash,
      },
    },
    create: {
      userId,
      aggregateId,
      status: "COMPLETED",
      modelName: meta.modelName,
      modelVersion: meta.modelVersion,
      promptVersion: meta.promptVersion,
      provider: meta.provider,
      inputHash,
      score: result.score,
      summary: result.summary,
      generationTimeMs,
      generatedAt: new Date(),
      rawResult: rawResultJson,
    },
    update: {
      status: "COMPLETED",
      score: result.score,
      summary: result.summary,
      provider: meta.provider,
      generationTimeMs,
      generatedAt: new Date(),
      rawResult: rawResultJson,
    },
  });

  await prisma.aiInsight.deleteMany({
    where: { analysisId: analysis.id },
  });

  if (result.insights.length > 0) {
    await prisma.aiInsight.createMany({
      data: result.insights.map((insight) => ({
        analysisId: analysis.id,
        category: insight.category,
        severity: insight.severity,
        problem: insight.problem,
        explanation: insight.explanation,
        solution: insight.solution,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        evidence: insight.evidence as any,
      })),
    });
  }
}

export async function runAiAnalysis(userId: string, aggregateId: bigint): Promise<AnalysisResult> {
  const built = await buildAnalysisInput(aggregateId, userId);

  if (!built) {
    throw new Error("Aggregate not found");
  }

  const { input, playerName, currentRank } = built;
  const inputHash = generateInputHash(input);

  const quota = await checkAiAnalysisQuota(userId);
  if (!quota.allowed) {
    throw new Error(
      `Quota d'analyses IA atteint pour ce mois (${quota.used}/${quota.limit}). Passez à Premium pour des analyses illimitées.`,
    );
  }

  const isLlmAvailable = (() => {
    try {
      getProvider();
      return true;
    } catch {
      return false;
    }
  })();

  if (isLlmAvailable) {
    const providerType = getProvider().type;
    const llmMeta: EngineMetadata = {
      provider: providerType,
      modelName: process.env[`${providerType}_MODEL`] || getDefaultModel(providerType),
      modelVersion: PROMPT_VERSION,
      promptVersion: PROMPT_VERSION,
    };

    const cached = await checkCache(userId, inputHash, llmMeta);
    if (cached) {
      return { score: cached.score, summary: cached.summary, insights: cached.insights };
    }

    const llmResult = await tryLlm(input, playerName, currentRank);

    if (llmResult) {
      await storeResult(
        userId,
        aggregateId,
        inputHash,
        llmResult.result,
        llmResult.meta,
        llmResult.rawResult,
        llmResult.generationTimeMs,
      );

      await incrementAiAnalysisUsage(userId);

      try {
        const prev = await getLatestAnalysis(userId);
        if (prev && llmResult.result.score > prev.score) {
          await createNotification({
            userId,
            type: "SCORE_IMPROVEMENT",
            title: `Score IA amélioré : ${prev.score} → ${llmResult.result.score}`,
            body: `Votre score Coach IA est passé de ${prev.score} à ${llmResult.result.score} !`,
            link: "/ai-coach",
            metadata: { previousScore: prev.score, newScore: llmResult.result.score },
          });
        }
        if (llmResult.result.insights.length > 0) {
          const critical = llmResult.result.insights.find((i) => i.severity === InsightSeverity.CRITICAL || i.severity === InsightSeverity.HIGH);
          if (critical) {
            await createNotification({
              userId,
              type: "AI_INSIGHT",
              title: critical.problem,
              body: critical.solution.substring(0, 120),
              link: "/ai-coach",
              metadata: { category: critical.category, severity: critical.severity },
            });
          }
        }
      } catch {
        // Échec silencieux
      }

      return llmResult.result;
    }
  }

  const heuristicResult = await runHeuristic(input);

  const cached = await checkCache(userId, inputHash, heuristicResult.meta);
  if (cached) {
    return { score: cached.score, summary: cached.summary, insights: cached.insights };
  }

  await storeResult(
    userId,
    aggregateId,
    inputHash,
    heuristicResult.result,
    heuristicResult.meta,
    null,
    heuristicResult.generationTimeMs,
  );

  await incrementAiAnalysisUsage(userId);

  try {
    const prev = await getLatestAnalysis(userId);
    if (prev && heuristicResult.result.score > prev.score) {
      await createNotification({
        userId,
        type: "SCORE_IMPROVEMENT",
        title: `Score IA amélioré : ${prev.score} → ${heuristicResult.result.score}`,
        body: `Votre score Coach IA est passé de ${prev.score} à ${heuristicResult.result.score} !`,
        link: "/ai-coach",
        metadata: { previousScore: prev.score, newScore: heuristicResult.result.score },
      });
    }
    const critical = heuristicResult.result.insights.find(
      (i) => i.severity === InsightSeverity.CRITICAL || i.severity === InsightSeverity.HIGH,
    );
    if (critical) {
      await createNotification({
        userId,
        type: "AI_INSIGHT",
        title: critical.problem,
        link: "/ai-coach",
        metadata: { category: critical.category, severity: critical.severity },
      });
    }
  } catch {
    // Échec silencieux
  }

  return heuristicResult.result;
}

export async function getLatestAnalysis(userId: string) {
  const analysis = await prisma.aiAnalysis.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: {
      insights: { orderBy: { severity: "desc" } },
    },
  });

  if (!analysis) return null;

  return {
    id: analysis.id,
    score: Number(analysis.score ?? 0),
    summary: analysis.summary ?? "",
    insights: analysis.insights.map((insight) => ({
      category: insight.category as InsightCategory,
      severity: insight.severity as InsightSeverity,
      problem: insight.problem,
      explanation: insight.explanation,
      solution: insight.solution,
      evidence: insight.evidence as Record<string, unknown>,
    })),
    createdAt: analysis.createdAt,
    provider: analysis.provider,
    modelName: analysis.modelName,
    modelVersion: analysis.modelVersion,
    promptVersion: analysis.promptVersion,
    generationTimeMs: analysis.generationTimeMs,
  };
}

export async function getLatestCoachingReport(userId: string): Promise<CoachingReport | null> {
  const analysis = await prisma.aiAnalysis.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  if (!analysis || !analysis.aggregateId) return null;

  const aggregate = await prisma.playerStatAggregate.findUnique({
    where: { id: analysis.aggregateId },
  });

  if (!aggregate) return null;

  const [storedInsights, agents, maps] = await Promise.all([
    prisma.aiInsight.findMany({
      where: { analysisId: analysis.id },
      orderBy: { severity: "desc" },
    }),
    prisma.playerAgentAggregate.findMany({
      where: {
        userId,
        period: aggregate.period,
        windowStart: aggregate.windowStart,
        windowEnd: aggregate.windowEnd,
      },
      orderBy: { matchCount: "desc" },
    }),
    prisma.playerMapAggregate.findMany({
      where: {
        userId,
        period: aggregate.period,
        windowStart: aggregate.windowStart,
        windowEnd: aggregate.windowEnd,
      },
      orderBy: { matchCount: "desc" },
    }),
  ]);

  const input: AnalysisInput = {
    userId,
    aggregateId: aggregate.id,
    stats: {
      matchCount: aggregate.matchCount,
      wins: aggregate.wins,
      losses: aggregate.losses,
      winRate: Number(aggregate.winRate),
      averageKda: Number(aggregate.averageKda),
      headshotRate: Number(aggregate.headshotRate),
      damagePerRound: Number(aggregate.damagePerRound),
      combatScore: Number(aggregate.combatScore),
      firstDeathRate: Number(aggregate.firstDeathRate),
      attackWinRate: Number(aggregate.attackWinRate),
      defenseWinRate: Number(aggregate.defenseWinRate),
      utilityPerRound: Number(aggregate.utilityPerRound),
      mainAgent: aggregate.mainAgent,
      bestMap: aggregate.bestMap,
      worstMap: aggregate.worstMap,
    },
    agents: agents.map((a) => ({
      agentName: a.agentName,
      matchCount: a.matchCount,
      winRate: Number(a.winRate),
      averageKda: Number(a.averageKda),
      damagePerRound: Number(a.damagePerRound),
    })),
    maps: maps.map((m) => ({
      mapName: m.mapName,
      matchCount: m.matchCount,
      winRate: Number(m.winRate),
      attackWinRate: Number(m.attackWinRate),
      defenseWinRate: Number(m.defenseWinRate),
      averageKda: Number(m.averageKda),
    })),
  };

  if (analysis.rawResult) {
    const storedRaw = analysis.rawResult as unknown as import("@/services/ai/llm/types").LLMAnalysisResult;
    return llmToCoachingReport(storedRaw, input);
  }

  const report = generateCoachingReport(input);

  return {
    ...report,
    insights: storedInsights.map((insight) => ({
      category: insight.category as InsightCategory,
      severity: insight.severity as InsightSeverity,
      problem: insight.problem,
      explanation: insight.explanation,
      solution: insight.solution,
      evidence: insight.evidence as Record<string, unknown>,
    })),
  };
}
