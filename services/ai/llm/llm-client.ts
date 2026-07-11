import type { LLMProvider } from "./provider";
import type { LLMProviderType } from "./types";
import { OpenAIProvider } from "./openai-provider";
import { ClaudeProvider } from "./claude-provider";
import { GeminiProvider } from "./gemini-provider";

const PROVIDER_MAP: Record<LLMProviderType, new () => LLMProvider> = {
  OPENAI: OpenAIProvider,
  CLAUDE: ClaudeProvider,
  GEMINI: GeminiProvider,
};

let instance: LLMProvider | null = null;

export function getProvider(): LLMProvider {
  if (instance) return instance;

  const raw = process.env.AI_PROVIDER ?? "OPENAI";
  const type = raw.toUpperCase() as LLMProviderType;

  if (!(type in PROVIDER_MAP)) {
    throw new Error(
      `Unknown AI_PROVIDER "${raw}". Valid values: ${Object.keys(PROVIDER_MAP).join(", ")}.`,
    );
  }

  const ProviderClass = PROVIDER_MAP[type];
  instance = new ProviderClass();
  return instance;
}

export function resetProvider(): void {
  instance = null;
}
