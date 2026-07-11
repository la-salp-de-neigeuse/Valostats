import { prisma } from "@/lib/prisma/client";
import { BADGE_DEFINITIONS } from "./types";
import { getGoalStats } from "./goals-service";
import type { Badge } from "./types";
import { createNotification } from "@/services/notifications/notifications-service";

function toBadge(b: {
  id: bigint;
  userId: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  createdAt: Date;
}): Badge {
  return {
    id: String(b.id),
    userId: b.userId,
    badgeId: b.badgeId,
    name: b.name,
    description: b.description,
    icon: b.icon,
    unlockedAt: b.unlockedAt,
    createdAt: b.createdAt,
  };
}

export async function checkAndUnlockBadges(userId: string): Promise<Badge[]> {
  const [stats, existingBadges] = await Promise.all([
    getGoalStats(userId),
    prisma.badge.findMany({
      where: { userId },
      select: { badgeId: true },
      take: 200,
    }),
  ]);

  const unlockedBadgeIds = new Set(existingBadges.map((b) => b.badgeId));
  const newlyUnlocked: Badge[] = [];

  const badgeChecks: Array<{ badgeId: string; condition: boolean }> = [
    { badgeId: "first_goal", condition: stats.totalCompleted >= 1 },
    { badgeId: "three_goals", condition: stats.totalCompleted >= 3 },
    { badgeId: "ten_goals", condition: stats.totalCompleted >= 10 },
    { badgeId: "twenty_five_goals", condition: stats.totalCompleted >= 25 },
    { badgeId: "fifty_goals", condition: stats.totalCompleted >= 50 },
    { badgeId: "weekly_streak_2", condition: stats.bestStreak >= 2 },
    { badgeId: "weekly_streak_4", condition: stats.bestStreak >= 4 },
    { badgeId: "hard_goal", condition: await checkCompletedHardGoal(userId) },
    { badgeId: "all_weekly", condition: await checkAllWeeklyCompleted(userId) },
    { badgeId: "kda_goal", condition: await checkCategoryGoalCompleted(userId, "K/D") },
    { badgeId: "winrate_goal", condition: await checkCategoryGoalCompleted(userId, "Winrate") },
  ];

  for (const check of badgeChecks) {
    if (check.condition && !unlockedBadgeIds.has(check.badgeId)) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeId === check.badgeId);
      if (!def) continue;

      const created = await prisma.badge.create({
        data: {
          userId,
          badgeId: def.badgeId,
          name: def.name,
          description: def.description,
          icon: def.icon,
        },
      });

      newlyUnlocked.push(toBadge(created));

      try {
        await createNotification({
          userId,
          type: "BADGE_UNLOCKED",
          title: `Badge débloqué : ${def.name}`,
          body: def.description,
          link: "/goals",
          metadata: { badgeId: def.badgeId, icon: def.icon },
        });
      } catch {
        // Échec silencieux
      }
    }
  }

  return newlyUnlocked;
}

async function checkCompletedHardGoal(userId: string): Promise<boolean> {
  const count = await prisma.goal.count({
    where: { userId, status: "COMPLETED", difficulty: "HARD" },
  });
  return count > 0;
}

async function checkAllWeeklyCompleted(userId: string): Promise<boolean> {
  const [completed, total] = await Promise.all([
    prisma.goal.count({ where: { userId, type: "WEEKLY", status: "COMPLETED" } }),
    prisma.goal.count({ where: { userId, type: "WEEKLY", status: { not: "EXPIRED" } } }),
  ]);
  return total > 0 && completed === total;
}

async function checkCategoryGoalCompleted(userId: string, keyword: string): Promise<boolean> {
  const count = await prisma.goal.count({
    where: { userId, status: "COMPLETED", title: { contains: keyword } },
  });
  return count > 0;
}

export async function getBadges(userId: string): Promise<Badge[]> {
  const badges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
    take: 200,
  });

  return badges.map(toBadge);
}

export async function getAllBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}
