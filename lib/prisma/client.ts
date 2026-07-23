import { PrismaClient } from "@prisma/client";

function ensurePgBouncerUrl(url: string): string {
  try {
    const [base, qs] = url.split("?");
    const params = new URLSearchParams(qs ?? "");
    let changed = false;
    if (!params.has("pgbouncer")) {
      params.set("pgbouncer", "true");
      changed = true;
    }
    if (!params.has("connection_limit")) {
      params.set("connection_limit", "1");
      changed = true;
    }
    return changed ? `${base}?${params.toString()}` : url;
  } catch {
    return url;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: ensurePgBouncerUrl(process.env.DATABASE_URL ?? ""),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
