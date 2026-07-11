import { prisma } from "@/lib/prisma/client";
import type {
  LLMProviderType,
  LLMAnalysisInput,
  LLMAnalysisResult,
  LLMChatMessage,
  LLMChatResponse,
  ProviderConfig,
  ProviderResult,
  UsageMetrics,
  PromptLogEntry,
  StreamingCallbacks,
} from "./types";
import type { LLMProvider } from "./provider";
import { OpenAIProvider } from "./openai-provider";
import { ClaudeProvider } from "./claude-provider";
import { GeminiProvider } from "./gemini-provider";
import { estimateCost, getDefaultModel } from "./cost-calculator";

const PROVIDER_MAP: Record<LLMProviderType, new () => LLMProvider> = {
  OPENAI: OpenAIProvider,
  CLAUDE: ClaudeProvider,
  GEMINI: GeminiProvider,
};

function resolveConfig(userConfig?: Partial<ProviderConfig>): ProviderConfig {
  return {
    provider: userConfig?.provider ?? (process.env.AI_PROVIDER as LLMProviderType) ?? "OPENAI",
    model: userConfig?.model ?? "",
    temperature: userConfig?.temperature ?? 0.3,
    maxTokens: userConfig?.maxTokens ?? 2048,
    timeout: userConfig?.timeout ?? 120,
  };
}

function createProvider(type: LLMProviderType): LLMProvider {
  const ProviderClass = PROVIDER_MAP[type];
  if (!ProviderClass) {
    throw new Error(`Unknown provider: ${type}`);
  }
  return new ProviderClass();
}

function applyTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

async function applyRetry<T>(
  fn: () => Promise<T>,
  retryCount: number,
  retryDelayMs: number,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retryCount) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function getUserConfig(userId: string): Promise<Partial<ProviderConfig> | null> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { preferredProvider: true, preferredModel: true, temperature: true, maxTokens: true, llmTimeout: true },
  });

  if (!settings) return null;

  return {
    provider: settings.preferredProvider as LLMProviderType,
    model: settings.preferredModel || undefined,
    temperature: Number(settings.temperature),
    maxTokens: settings.maxTokens,
    timeout: settings.llmTimeout,
  };
}

async function logPrompt(
  userId: string,
  provider: string,
  model: string,
  params: {
    promptVersion?: string;
    systemPrompt?: string;
    userPrompt?: string;
    responseContent?: string;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    durationMs?: number;
    success: boolean;
    errorMessage?: string;
  },
): Promise<void> {
  try {
    await prisma.aiPromptLog.create({
      data: {
        userId,
        provider,
        model,
        promptVersion: params.promptVersion ?? null,
        systemPrompt: params.systemPrompt ?? null,
        userPrompt: params.userPrompt ?? null,
        responseContent: params.responseContent ?? null,
        inputTokens: params.inputTokens ?? null,
        outputTokens: params.outputTokens ?? null,
        estimatedCost: params.estimatedCost ?? null,
        durationMs: params.durationMs ?? null,
        success: params.success,
        errorMessage: params.errorMessage ?? null,
      },
    });
  } catch {
    // Échec silencieux
  }
}

async function trackUsage(
  userId: string,
  provider: string,
  inputTokens: number,
  outputTokens: number,
  cost: number,
): Promise<void> {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await prisma.usageCounter.upsert({
      where: {
        userId_metric_periodStart_periodEnd: {
          userId,
          metric: `llm_tokens_${provider.toLowerCase()}`,
          periodStart,
          periodEnd,
        },
      },
      create: {
        userId,
        metric: `llm_tokens_${provider.toLowerCase()}`,
        periodStart,
        periodEnd,
        value: inputTokens + outputTokens,
        cost,
      },
      update: {
        value: { increment: inputTokens + outputTokens },
        cost: { increment: cost },
      },
    });
  } catch {
    // Échec silencieux
  }
}

export class ProviderManager {
  static async generateAnalysis(
    input: LLMAnalysisInput,
    options?: { userId?: string; config?: Partial<ProviderConfig>; systemPrompt?: string; userPrompt?: string },
  ): Promise<ProviderResult<LLMAnalysisResult>> {
    const start = Date.now();
    const config = resolveConfig(options?.config);

    if (options?.userId) {
      const userConfig = await getUserConfig(options.userId);
      if (userConfig) {
        if (userConfig.provider) config.provider = userConfig.provider;
        if (userConfig.model) config.model = userConfig.model;
        if (userConfig.temperature !== undefined) config.temperature = userConfig.temperature;
        if (userConfig.maxTokens !== undefined) config.maxTokens = userConfig.maxTokens;
        if (userConfig.timeout !== undefined) config.timeout = userConfig.timeout;
      }
    }

    if (!config.model) {
      config.model = getDefaultModel(config.provider);
    }

    const provider = createProvider(config.provider);

    const execute = async () => {
      return provider.generateAnalysis(input, {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });
    };

    const timeoutMs = config.timeout * 1000;

    try {
      const result = await applyTimeout(applyRetry(execute, 2, 1000), timeoutMs);
      const durationMs = Date.now() - start;

      let inputTokens = 0;
      let outputTokens = 0;
      if (provider.extractUsage) {
        const usage = provider.extractUsage(result, config.model);
        if (usage) {
          inputTokens = usage.inputTokens;
          outputTokens = usage.outputTokens;
        }
      }
      const cost = estimateCost(config.model, inputTokens || Math.round(input.matchCount * 15), outputTokens || 500);

      if (options?.userId) {
        await logPrompt(options.userId, config.provider, config.model, {
          promptVersion: options?.systemPrompt ? "2.0.0" : undefined,
          systemPrompt: options?.systemPrompt,
          userPrompt: options?.userPrompt,
          responseContent: result.summary,
          inputTokens: inputTokens || undefined,
          outputTokens: outputTokens || undefined,
          estimatedCost: cost,
          durationMs,
          success: true,
        });
        await trackUsage(options.userId, config.provider, inputTokens, outputTokens, cost);
      }

      return {
        data: result,
        usage: {
          inputTokens: inputTokens || Math.round(input.matchCount * 15),
          outputTokens: outputTokens || 500,
          totalTokens: (inputTokens || Math.round(input.matchCount * 15)) + (outputTokens || 500),
          estimatedCost: cost,
          durationMs,
          model: config.model,
          provider: config.provider,
        },
      };
    } catch (err) {
      const durationMs = Date.now() - start;
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

      if (options?.userId) {
        await logPrompt(options.userId, config.provider, config.model, {
          success: false,
          errorMessage,
          durationMs,
        });
      }

      throw err;
    }
  }

  static async generateChat(
    messages: LLMChatMessage[],
    options?: { userId?: string; config?: Partial<ProviderConfig> },
  ): Promise<ProviderResult<LLMChatResponse>> {
    const start = Date.now();
    const config = resolveConfig(options?.config);

    if (!config.model) {
      config.model = getDefaultModel(config.provider);
    }

    const provider = createProvider(config.provider);
    const timeoutMs = config.timeout * 1000;

    const execute = async () => {
      return provider.generateChat(messages, {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });
    };

    try {
      const result = await applyTimeout(applyRetry(execute, 2, 1000), timeoutMs);
      const durationMs = Date.now() - start;

      const cost = estimateCost(config.model, messages.length * 50, result.content.length / 4);

      if (options?.userId) {
        await logPrompt(options.userId, config.provider, config.model, {
          responseContent: result.content,
          inputTokens: messages.length * 50,
          outputTokens: Math.round(result.content.length / 4),
          estimatedCost: cost,
          durationMs,
          success: true,
        });
        await trackUsage(options.userId, config.provider, messages.length * 50, Math.round(result.content.length / 4), cost);
      }

      return {
        data: result,
        usage: {
          inputTokens: messages.length * 50,
          outputTokens: Math.round(result.content.length / 4),
          totalTokens: messages.length * 50 + Math.round(result.content.length / 4),
          estimatedCost: cost,
          durationMs,
          model: config.model,
          provider: config.provider,
        },
      };
    } catch (err) {
      const durationMs = Date.now() - start;
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

      if (options?.userId) {
        await logPrompt(options.userId, config.provider, config.model, {
          success: false,
          errorMessage,
          durationMs,
        });
      }

      throw err;
    }
  }

  static async streamAnalysis(
    input: LLMAnalysisInput,
    callbacks: StreamingCallbacks,
    options?: { userId?: string; config?: Partial<ProviderConfig> },
  ): Promise<void> {
    const config = resolveConfig(options?.config);

    if (!config.model) {
      config.model = getDefaultModel(config.provider);
    }

    const provider = createProvider(config.provider);

    if (!provider.generateAnalysisStream) {
      callbacks.onError(new Error("Streaming not supported by this provider"));
      return;
    }

    await provider.generateAnalysisStream(input, callbacks, {
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
  }

  static async getUserConfig(userId: string): Promise<ProviderConfig | null> {
    const config = await getUserConfig(userId);
    if (!config) return null;
    return resolveConfig(config);
  }

  static async saveUserConfig(
    userId: string,
    config: Partial<ProviderConfig>,
  ): Promise<void> {
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        preferredProvider: config.provider ?? "OPENAI",
        preferredModel: config.model ?? "",
        temperature: config.temperature ?? 0.3,
        maxTokens: config.maxTokens ?? 2048,
        llmTimeout: config.timeout ?? 120,
      },
      update: {
        ...(config.provider && { preferredProvider: config.provider }),
        ...(config.model !== undefined && { preferredModel: config.model }),
        ...(config.temperature !== undefined && { temperature: config.temperature }),
        ...(config.maxTokens !== undefined && { maxTokens: config.maxTokens }),
        ...(config.timeout !== undefined && { llmTimeout: config.timeout }),
      },
    });
  }

  static async getUsageMetrics(userId: string): Promise<UsageMetrics> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [counters, logs] = await Promise.all([
      prisma.usageCounter.findMany({
        where: {
          userId,
          metric: { startsWith: "llm_tokens_" },
          periodStart,
          periodEnd,
        },
      }),
      prisma.aiPromptLog.findMany({
        where: { userId, createdAt: { gte: periodStart, lte: periodEnd } },
        select: { success: true, durationMs: true, provider: true },
      }),
    ]);

    const totalTokens = counters.reduce((sum, c) => sum + c.value, 0);
    const totalCost = counters.reduce((sum, c) => sum + Number(c.cost), 0);
    const totalRequests = logs.length;
    const successfulRequests = logs.filter((l) => l.success).length;
    const avgDuration = logs.length > 0
      ? Math.round(logs.reduce((s, l) => s + (l.durationMs ?? 0), 0) / logs.length)
      : 0;

    const byProvider: Record<string, { requests: number; tokens: number; cost: number }> = {};
    for (const log of logs) {
      const p = log.provider;
      if (!byProvider[p]) byProvider[p] = { requests: 0, tokens: 0, cost: 0 };
      byProvider[p].requests++;
    }
    for (const counter of counters) {
      const p = counter.metric.replace("llm_tokens_", "");
      if (!byProvider[p]) byProvider[p] = { requests: 0, tokens: 0, cost: 0 };
      byProvider[p].tokens += counter.value;
      byProvider[p].cost += Number(counter.cost);
    }

    return {
      totalRequests,
      totalTokens,
      totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      averageDurationMs: avgDuration,
      byProvider,
    };
  }

  static async getPromptHistory(
    userId: string,
    limit = 50,
  ): Promise<PromptLogEntry[]> {
    const logs = await prisma.aiPromptLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs.map((l) => ({
      id: String(l.id),
      provider: l.provider,
      model: l.model,
      promptVersion: l.promptVersion,
      systemPrompt: l.systemPrompt,
      userPrompt: l.userPrompt,
      responseContent: l.responseContent,
      inputTokens: l.inputTokens,
      outputTokens: l.outputTokens,
      estimatedCost: l.estimatedCost ? Number(l.estimatedCost) : null,
      durationMs: l.durationMs,
      success: l.success,
      errorMessage: l.errorMessage,
      createdAt: l.createdAt,
    }));
  }
}
