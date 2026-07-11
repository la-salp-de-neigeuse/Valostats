import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis?: Redis | null;
};

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    client.on("error", () => {});

    return client;
  } catch {
    return null;
  }
}

export function getRedis(): Redis | null {
  if (globalForRedis.redis === undefined) {
    globalForRedis.redis = createClient();
  }
  return globalForRedis.redis ?? null;
}

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: string, ttlMs: number): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    await client.set(key, value, "PX", ttlMs);
    return true;
  } catch {
    return false;
  }
}
