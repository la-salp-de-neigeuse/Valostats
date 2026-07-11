import type { LLMProviderType, LLMAnalysisInput, LLMAnalysisResult, LLMChatMessage, LLMChatResponse, ProviderConfig, StreamingCallbacks } from "./types";

export interface LLMProvider {
  readonly type: LLMProviderType;

  generateAnalysis(input: LLMAnalysisInput, config?: Partial<ProviderConfig>): Promise<LLMAnalysisResult>;

  generateChat(messages: LLMChatMessage[], config?: Partial<ProviderConfig>): Promise<LLMChatResponse>;

  generateAnalysisStream?(input: LLMAnalysisInput, callbacks: StreamingCallbacks, config?: Partial<ProviderConfig>): Promise<void>;

  extractUsage?(response: unknown, model: string): { inputTokens: number; outputTokens: number } | null;

  getDefaultModel(): string;
}
