import { RATE_LIMITS as RATE_LIMIT_CONFIG, CLEANUP_INTERVAL_MS } from "@/constants/limits";
import { redisGet, redisSet } from "@/lib/redis/client";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMITS = RATE_LIMIT_CONFIG;
type RateLimitScope = keyof typeof RATE_LIMITS;

const FALLBACK_STORE_MAX = 10_000;

function buildKey(scope: string, identifier: string): string {
  return `ratelimit:${scope}:${identifier}`;
}

const fallbackStore = new Map<string, RateLimitEntry>();
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function evictOldest(): void {
  if (fallbackStore.size <= FALLBACK_STORE_MAX) return;
  const entries = [...fallbackStore.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  const toDelete = entries.slice(0, fallbackStore.size - FALLBACK_STORE_MAX);
  for (const [key] of toDelete) {
    fallbackStore.delete(key);
  }
}

function startFallbackCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of fallbackStore) {
      if (entry.resetAt <= now) {
        fallbackStore.delete(key);
      }
    }
    evictOldest();
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

startFallbackCleanup();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function getRateLimitConfig(scope: RateLimitScope): { maxRequests: number; windowMs: number } {
  return RATE_LIMITS[scope];
}

export async function checkRateLimit(
  identifier: string,
  scope: RateLimitScope,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config = RATE_LIMITS[scope];
  const key = buildKey(scope, identifier);
  const now = Date.now();

  const redisResult = await tryRedisRateLimit(key, config.maxRequests, config.windowMs, now);

  if (redisResult !== null) {
    return {
      allowed: redisResult.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - redisResult.count),
      resetAt: redisResult.resetAt,
    };
  }

  return memoryRateLimit(key, config.maxRequests, config.windowMs, now);
}

async function tryRedisRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number,
): Promise<{ count: number; resetAt: number } | null> {
  try {
    const raw = await redisGet(key);
    if (raw === null) {
      const resetAt = now + windowMs;
      await redisSet(key, `1:${resetAt}`, windowMs);
      return { count: 1, resetAt };
    }

    const colonIdx = raw.indexOf(":");
    const count = parseInt(raw.slice(0, colonIdx), 10);
    const resetAt = parseInt(raw.slice(colonIdx + 1), 10);

    if (resetAt <= now) {
      const newResetAt = now + windowMs;
      await redisSet(key, `1:${newResetAt}`, windowMs);
      return { count: 1, resetAt: newResetAt };
    }

    const newCount = count + 1;
    await redisSet(key, `${newCount}:${resetAt}`, resetAt - now);
    return { count: newCount, resetAt };
  } catch {
    return null;
  }
}

function memoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const entry = fallbackStore.get(key);

  if (!entry || entry.resetAt <= now) {
    fallbackStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitHeaders(
  remaining: number,
  resetAt: number,
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}
