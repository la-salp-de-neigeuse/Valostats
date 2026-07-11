import { prisma } from "@/lib/prisma/client";
import { FREE_PLAN_FEATURES } from "@/lib/stripe/plans";

function getPeriodBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export async function checkAiAnalysisQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return { allowed: false, used: 0, limit: 0 };
  }

  if (user.plan !== "FREE") {
    return { allowed: true, used: 0, limit: -1 };
  }

  const { start, end } = getPeriodBounds();

  const counter = await prisma.usageCounter.findUnique({
    where: {
      userId_metric_periodStart_periodEnd: {
        userId,
        metric: "ai_analysis",
        periodStart: start,
        periodEnd: end,
      },
    },
  });

  const used = counter?.value ?? 0;
  const limit = FREE_PLAN_FEATURES.maxAiAnalysesPerMonth;

  return {
    allowed: used < limit,
    used,
    limit,
  };
}

export async function incrementAiAnalysisUsage(userId: string): Promise<void> {
  const { start, end } = getPeriodBounds();

  await prisma.usageCounter.upsert({
    where: {
      userId_metric_periodStart_periodEnd: {
        userId,
        metric: "ai_analysis",
        periodStart: start,
        periodEnd: end,
      },
    },
    create: {
      userId,
      metric: "ai_analysis",
      periodStart: start,
      periodEnd: end,
      value: 1,
    },
    update: {
      value: { increment: 1 },
    },
  });
}
