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

export class GeminiProvider implements LLMProvider {
  readonly type = "GEMINI" as const;

  getDefaultModel(): string {
    return process.env.GEMINI_MODEL ?? getDefaultModel("GEMINI");
  }

  async generateAnalysis(
    input: LLMAnalysisInput,
    config?: Partial<ProviderConfig>,
  ): Promise<LLMAnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.3;
    const maxTokens = config?.maxTokens ?? 2048;

    const builderInput = inputToPromptBuilder(input);
    const prompt = buildPrompt(builderInput);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${prompt.systemPrompt}\n\n${prompt.userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Gemini returned an empty response.");

    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*$/, "").trim();

    const parsed = JSON.parse(cleaned) as {
      summary?: string;
      strengths?: string[];
      weaknesses?: string[];
      recommendations?: string[];
      goals?: Array<{ title: string; description: string; metric: string; targetValue: string; difficulty: string }>;
      estimatedRank?: string;
      progressionProbability?: number;
    };

    return {
      provider: "GEMINI",
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens ?? 1024;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
    };

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const finishReason = data.candidates?.[0]?.finishReason === "STOP" ? "stop" : "stop";

    return { content, finishReason };
  }

  extractUsage(response: unknown): { inputTokens: number; outputTokens: number } | null {
    try {
      const r = response as {
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      if (r.usageMetadata?.promptTokenCount !== undefined && r.usageMetadata?.candidatesTokenCount !== undefined) {
        return {
          inputTokens: r.usageMetadata.promptTokenCount,
          outputTokens: r.usageMetadata.candidatesTokenCount,
        };
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      callbacks.onError(new Error("GEMINI_API_KEY is not configured."));
      return;
    }

    const model = config?.model || this.getDefaultModel();
    const temperature = config?.temperature ?? 0.3;
    const maxTokens = config?.maxTokens ?? 2048;

    const builderInput = inputToPromptBuilder(input);
    const prompt = buildPrompt(builderInput);

    let fullContent = "";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${prompt.systemPrompt}\n\n${prompt.userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok || !response.body) {
        callbacks.onError(new Error(`Gemini stream error ${response.status}`));
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
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr);
            const text = event.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullContent += text;
              callbacks.onToken(text);
            }
          } catch {
            // ignore parse errors for partial chunks
          }
        }
      }

      callbacks.onComplete(fullContent);
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error("Gemini stream error"));
    }
  }
}
