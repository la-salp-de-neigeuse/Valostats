import { z } from "zod";

const AI_PROVIDER_VALUES = ["OPENAI", "CLAUDE", "GEMINI"] as const;

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
  INTERNAL_JOB_SECRET: z.string().min(32, "INTERNAL_JOB_SECRET must be at least 32 characters"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  REDIS_URL: z.string().optional(),
  RIOT_API_KEY: z.string().min(1, "RIOT_API_KEY is required"),
  RIOT_TOKEN_ENCRYPTION_KEY: z.string().min(32, "RIOT_TOKEN_ENCRYPTION_KEY must be at least 32 characters"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  STRIPE_PRICE_PRO_MONTHLY: z.string().min(1, "STRIPE_PRICE_PRO_MONTHLY is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  AI_PROVIDER: z.enum(AI_PROVIDER_VALUES).default("OPENAI"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

declare global {
  var __validatedEnv: ServerEnv | undefined;
}

export function validateServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  if (!globalThis.__validatedEnv) {
    const parsed = serverEnvSchema.parse(env);
    globalThis.__validatedEnv = parsed;
    return parsed;
  }
  return globalThis.__validatedEnv;
}

if (process.env.NODE_ENV === "production") {
  validateServerEnv();
}
