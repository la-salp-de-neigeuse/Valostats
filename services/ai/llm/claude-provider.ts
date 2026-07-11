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

export class ClaudeProvider implements LLMProvider {
  readonly type = "CLAUDE" as const;

  getDefaultModel(): string {
    return process.env.ANTHROPIC_MODEL ?? getDefaultModel("CLAUDE");
  }

  async generateAnalysis(
    input: LLMAnalysisInput,
    config?: Partial<ProviderConfig>,
  ): Promise<LLMAnalysisResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.3;
    const maxTokens = config?.maxTokens ?? 2048;

    const builderInput = inputToPromptBuilder(input);
    const prompt = buildPrompt(builderInput);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: prompt.systemPrompt,
        messages: [{ role: "user", content: prompt.userPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Claude API error ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };

    const raw = data.content?.find((c) => c.type === "text")?.text;
    if (!raw) throw new Error("Claude returned an empty response.");

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
      provider: "CLAUDE",
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

  async generateChat(
    messages: LLMChatMessage[],
    config?: Partial<ProviderConfig>,
  ): Promise<LLMChatResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens ?? 1024;

    const systemMsg = messages.find((m) => m.role === "system");
    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMsg?.content,
        messages: chatMessages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Claude API error ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
      stop_reason?: string;
    };

    const content = data.content?.find((c) => c.type === "text")?.text ?? "";
    const finishReason = data.stop_reason === "end_turn" ? "stop" : data.stop_reason === "max_tokens" ? "length" : "stop";

    return { content, finishReason };
  }

  extractUsage(response: unknown): { inputTokens: number; outputTokens: number } | null {
    try {
      const r = response as { usage?: { input_tokens?: number; output_tokens?: number } };
      if (r.usage?.input_tokens && r.usage?.output_tokens) {
        return { inputTokens: r.usage.input_tokens, outputTokens: r.usage.output_tokens };
      }
    } catch {
      // ignore
    }
    return null;
  }

  async generateAnalysisStream(
    input: LLMAnalysisInput,
    callbacks: StreamingCallbacks,
    config?: Partial<ProviderConfig>,
  ): Promise<void> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      callbacks.onError(new Error("ANTHROPIC_API_KEY is not configured."));
      return;
    }

    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.3;
    const maxTokens = config?.maxTokens ?? 2048;

    const builderInput = inputToPromptBuilder(input);
    const prompt = buildPrompt(builderInput);

    let fullContent = "";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: prompt.systemPrompt,
          messages: [{ role: "user", content: prompt.userPrompt }],
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        callbacks.onError(new Error(`Claude stream error ${response.status}`));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "content_block_delta" && event.delta?.text) {
              fullContent += event.delta.text;
              callbacks.onToken(event.delta.text);
            }
          } catch {
            // ignore parse errors for partial chunks
          }
        }
      }

      callbacks.onComplete(fullContent);
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error("Claude stream error"));
    }
  }
}
