import { describe, it, expect } from "vitest";
import { serverEnvSchema, validateServerEnv } from "@/config/env";

describe("serverEnvSchema", () => {
  const validEnv = {
    DATABASE_URL: "postgresql://localhost:5432/db",
    DIRECT_URL: "postgresql://localhost:5432/db",
    INTERNAL_JOB_SECRET: "a".repeat(32),
    NEXTAUTH_SECRET: "a".repeat(32),
    NEXTAUTH_URL: "https://example.com",
    REDIS_URL: "redis://localhost:6379",
    RIOT_API_KEY: "RGAPI-xxx",
    RIOT_TOKEN_ENCRYPTION_KEY: "a".repeat(32),
    STRIPE_SECRET_KEY: "sk_test_xxx",
    STRIPE_WEBHOOK_SECRET: "whsec_xxx",
    STRIPE_PRICE_PRO_MONTHLY: "price_xxx",
  };

  it("passes with valid env", () => {
    const result = serverEnvSchema.parse(validEnv);
    expect(result.RIOT_API_KEY).toBe("RGAPI-xxx");
  });

  it("rejects missing RIOT_API_KEY", () => {
    const { ...without } = validEnv;
    delete (without as Record<string, string>)["RIOT_API_KEY"];
    expect(() => serverEnvSchema.parse(without)).toThrow();
  });

  it("rejects invalid NEXTAUTH_URL", () => {
    expect(() => serverEnvSchema.parse({ ...validEnv, NEXTAUTH_URL: "not-a-url" })).toThrow();
  });

  it("rejects short secrets", () => {
    expect(() => serverEnvSchema.parse({ ...validEnv, NEXTAUTH_SECRET: "short" })).toThrow();
    expect(() => serverEnvSchema.parse({ ...validEnv, INTERNAL_JOB_SECRET: "short" })).toThrow();
  });

  it("validateServerEnv returns parsed env", () => {
    const result = validateServerEnv(validEnv as unknown as NodeJS.ProcessEnv);
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL);
  });
});
