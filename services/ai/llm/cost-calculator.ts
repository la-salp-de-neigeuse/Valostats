import type { LLMProviderType } from "./types";

interface ModelPricing {
  inputPer1K: number;
  outputPer1K: number;
}

const PRICING: Record<string, ModelPricing> = {
  "gpt-4o": { inputPer1K: 0.0025, outputPer1K: 0.01 },
  "gpt-4o-mini": { inputPer1K: 0.00015, outputPer1K: 0.0006 },
  "gpt-4-turbo": { inputPer1K: 0.01, outputPer1K: 0.03 },
  "gpt-4": { inputPer1K: 0.03, outputPer1K: 0.06 },
  "gpt-3.5-turbo": { inputPer1K: 0.0005, outputPer1K: 0.0015 },
  "claude-3-5-sonnet-20241022": { inputPer1K: 0.003, outputPer1K: 0.015 },
  "claude-3-opus-20240229": { inputPer1K: 0.015, outputPer1K: 0.075 },
  "claude-3-haiku-20240307": { inputPer1K: 0.00025, outputPer1K: 0.00125 },
  "claude-sonnet-4-20250514": { inputPer1K: 0.003, outputPer1K: 0.015 },
  "gemini-2.0-flash": { inputPer1K: 0.0001, outputPer1K: 0.0004 },
  "gemini-2.0-pro": { inputPer1K: 0.002, outputPer1K: 0.005 },
  "gemini-1.5-pro": { inputPer1K: 0.00125, outputPer1K: 0.005 },
  "gemini-1.5-flash": { inputPer1K: 0.000075, outputPer1K: 0.0003 },
};

const PROVIDER_DEFAULT_MODELS: Record<LLMProviderType, string> = {
  OPENAI: "gpt-4o",
  CLAUDE: "claude-sonnet-4-20250514",
  GEMINI: "gemini-2.0-flash",
};

export function getDefaultModel(provider: LLMProviderType): string {
  return PROVIDER_DEFAULT_MODELS[provider] ?? "gpt-4o";
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = PRICING[model];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1000) * pricing.inputPer1K;
  const outputCost = (outputTokens / 1000) * pricing.outputPer1K;

  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}

export function getAvailableModels(provider: LLMProviderType): Array<{
  id: string;
  name: string;
  inputPrice: string;
  outputPrice: string;
}> {
  const models = Object.keys(PRICING).filter((m) => {
    if (provider === "OPENAI") return m.startsWith("gpt-");
    if (provider === "CLAUDE") return m.startsWith("claude-");
    if (provider === "GEMINI") return m.startsWith("gemini-");
    return false;
  });

  return models.map((id) => ({
    id,
    name: id,
    inputPrice: `$${PRICING[id].inputPer1K}/1K tokens`,
    outputPrice: `$${PRICING[id].outputPer1K}/1K tokens`,
  }));
}
