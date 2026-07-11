import OpenAI from "openai";
import type { LLMProvider } from "./provider";
import type {
  LLMAnalysisInput,
  LLMAnalysisResult,
  LLMChatMessage,
  LLMChatResponse,
  ProviderConfig,
  StreamingCallbacks,
} from "./types";
import { buildPrompt } from "@/services/ai/prompt-builder";
import { getDefaultModel } from "./cost-calculator";

function inputToPromptBuilder(input: LLMAnalysisInput) {
  return {
    playerName: input.playerName,
    matchCount: input.matchCount,
    wins: Math.round(input.matchCount * (input.winRate / 100)),
    losses: Math.round(input.matchCount * (1 - input.winRate / 100)),
    winRate: input.winRate,
    averageKda: input.averageKda,
    headshotRate: input.headshotRate,
    damagePerRound: input.damagePerRound,
    firstDeathRate: input.firstDeathRate,
    attackWinRate: input.attackWinRate,
    defenseWinRate: input.defenseWinRate,
    currentRank: input.currentRank,
    topAgents: input.topAgents,
    mapStats: input.mapStats,
    profile: input.profile
      ? {
          playStyle: input.profile.playStyle,
          preferredSide: input.profile.preferredSide,
          consistency: input.profile.consistency,
          mainStrengths: input.profile.mainStrengths,
          priorityFocus: input.profile.priorityFocus,
        }
      : undefined,
    currentScore: input.currentAnalysis?.score,
    currentSummary: input.currentAnalysis?.summary,
    previousSummary: undefined,
    currentGoals: undefined,
    recentMatches: input.recentMatches,
  };
}

export class OpenAIProvider implements LLMProvider {
  readonly type = "OPENAI" as const;

  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured.");
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  getDefaultModel(): string {
    return process.env.OPENAI_MODEL ?? getDefaultModel("OPENAI");
  }

  async generateAnalysis(
    input: LLMAnalysisInput,
    config?: Partial<ProviderConfig>,
  ): Promise<LLMAnalysisResult> {
    const client = this.getClient();
    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.3;
    const maxTokens = config?.maxTokens ?? 2048;

    const builderInput = inputToPromptBuilder(input);
    const prompt = buildPrompt(builderInput);

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature,
      max_tokens: maxTokens,
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned an empty response.");

    const parsed = JSON.parse(raw) as {
      summary?: string;
      strengths?: string[];
      weaknesses?: string[];
      recommendations?: string[];
      goals?: Array<{ title: string; description: string; metric: string; targetValue: string; difficulty: string }>;
      estimatedRank?: string;
      progressionProbability?: number;
    };

    return {
      provider: "OPENAI",
      score: input.currentAnalysis?.score ?? 0,
      summary: parsed.summary ?? "",
      insights: [],
      strengths: (parsed.strengths ?? []).slice(0, 3),
      weaknesses: (parsed.weaknesses ?? []).slice(0, 3),
      recommendations: (parsed.recommendations ?? []).slice(0, 3),
      goals: (parsed.goals ?? []).slice(0, 3).map((g) => ({
        title: g.title,
        description: g.description,
        metric: g.metric,
        targetValue: g.targetValue,
        difficulty: g.difficulty === "hard" || g.difficulty === "medium" ? g.difficulty : "easy",
      })),
      estimatedRank: parsed.estimatedRank ?? "Non classé",
      confidence: typeof parsed.progressionProbability === "number"
        ? Math.min(parsed.progressionProbability / 100, 1)
        : 0,
      progressionProbability: parsed.progressionProbability ?? 0,
    };
  }

  async generateAnalysisStream(
    input: LLMAnalysisInput,
    callbacks: StreamingCallbacks,
    config?: Partial<ProviderConfig>,
  ): Promise<void> {
    const client = this.getClient();
    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.3;
    const maxTokens = config?.maxTokens ?? 2048;

    const builderInput = inputToPromptBuilder(input);
    const prompt = buildPrompt(builderInput);

    let fullContent = "";

    try {
      const stream = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt.systemPrompt },
          { role: "user", content: prompt.userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          callbacks.onToken(delta);
        }
      }

      callbacks.onComplete(fullContent);
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error("Stream error"));
    }
  }

  async generateChat(
    messages: LLMChatMessage[],
    config?: Partial<ProviderConfig>,
  ): Promise<LLMChatResponse> {
    const client = this.getClient();
    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens ?? 1024;

    const response = await client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices?.[0]?.message?.content ?? "";
    const finishReason = response.choices?.[0]?.finish_reason ?? "stop";

    return {
      content,
      finishReason: finishReason === "stop" ? "stop" : finishReason === "length" ? "length" : "error",
    };
  }

  extractUsage(response: unknown): { inputTokens: number; outputTokens: number } | null {
    try {
      const r = response as { usage?: { prompt_tokens?: number; completion_tokens?: number } };
      if (r.usage?.prompt_tokens && r.usage?.completion_tokens) {
        return {
          inputTokens: r.usage.prompt_tokens,
          outputTokens: r.usage.completion_tokens,
        };
      }
    } catch {
      // ignore
    }
    return null;
  }
}
