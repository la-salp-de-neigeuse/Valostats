import { redisGet, redisSet } from "@/lib/redis/client";

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redisGet(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    await redisSet(key, JSON.stringify(value), ttlMs);
  } catch {
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const { getRedis } = await import("@/lib/redis/client");
    const client = getRedis();
    if (client) {
      await client.del(key);
    }
  } catch {
  }
}

export async function getOrSet<T>(
  key: string,
  fetch: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const value = await fetch();
  await cacheSet(key, value, ttlMs);
  return value;
}
