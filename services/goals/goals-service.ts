import { prisma } from "@/lib/prisma/client";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import type { Goal, GoalWithProgress, GoalStats, GlobalProgression, GoalTemplate } from "./types";
import { checkAndUnlockBadges } from "./badges-service";
import { createNotification } from "@/services/notifications/notifications-service";

function toGoalWithProgress(g: Goal): GoalWithProgress {
  const percentage = g.targetValue > 0
    ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100)
    : 0;
  return { ...g, percentage };
}

function buildDeadline(type: "DAILY" | "WEEKLY" | "MONTHLY"): Date {
  const now = new Date();
  if (type === "DAILY") {
    now.setDate(now.getDate() + 1);
    now.setHours(23, 59, 59, 999);
  } else if (type === "WEEKLY") {
    now.setDate(now.getDate() + (7 - now.getDay()));
    now.setHours(23, 59, 59, 999);
  } else {
    now.setMonth(now.getMonth() + 1);
    now.setDate(0);
    now.setHours(23, 59, 59, 999);
  }
  return now;
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    title: "Atteindre un K/D positif",
    description: "Gagnez plus de duels que vous n'en perdez pour augmenter votre impact sur les rounds.",
    type: "WEEKLY",
    difficulty: "MEDIUM",
    priority: "CRITICAL",
    targetValue: 1.0,
    unit: "K/D",
    reward: "Objectif K/D atteint",
    category: "aim",
    condition: (s) => (s.averageKda ?? 0) < 0.95,
    currentValueFn: (s) => s.averageKda ?? 0,
  },
  {
    title: "Augmenter le winrate",
    description: "Atteignez un taux de victoire positif en améliorant votre macro-game et votre communication.",
    type: "WEEKLY",
    difficulty: "MEDIUM",
    priority: "CRITICAL",
    targetValue: 50,
    unit: "%",
    reward: "Objectif Winrate atteint",
    category: "game_sense",
    condition: (s) => (s.winRate ?? 0) < 48,
    currentValueFn: (s) => s.winRate ?? 0,
  },
  {
    title: "Améliorer la précision",
    description: "Visez systématiquement à hauteur de tête pour augmenter votre taux de headshot.",
    type: "WEEKLY",
    difficulty: "EASY",
    priority: "HIGH",
    targetValue: 20,
    unit: "%",
    reward: "Objectif Headshot atteint",
    category: "aim",
    condition: (s) => (s.headshotRate ?? 0) < 18,
    currentValueFn: (s) => s.headshotRate ?? 0,
  },
  {
    title: "Réduire les premières morts",
    description: "Mourez moins souvent en premier pour donner plus de chances à votre équipe de remporter les rounds.",
    type: "WEEKLY",
    difficulty: "MEDIUM",
    priority: "HIGH",
    targetValue: 25,
    unit: "%",
    reward: "Objectif First Death atteint",
    category: "positioning",
    condition: (s) => (s.firstDeathRate ?? 0) > 25,
    currentValueFn: (s) => 100 - (s.firstDeathRate ?? 0),
  },
  {
    title: "Augmenter les dégâts par round",
    description: "Faites plus de dégâts par round pour impacter davantage le jeu et aider votre équipe.",
    type: "WEEKLY",
    difficulty: "MEDIUM",
    priority: "HIGH",
    targetValue: 130,
    unit: "ADR",
    reward: "Objectif ADR atteint",
    category: "aim",
    condition: (s) => (s.damagePerRound ?? 0) < 120,
    currentValueFn: (s) => s.damagePerRound ?? 0,
  },
  {
    title: "Utiliser plus d'utilités",
    description: "Chaque capacité utilisée apporte un avantage. Utilisez systématiquement vos utilités en début de round.",
    type: "WEEKLY",
    difficulty: "EASY",
    priority: "MEDIUM",
    targetValue: 1.0,
    unit: "/round",
    reward: "Objectif Utilités atteint",
    category: "teamwork",
    condition: (s) => (s.utilityPerRound ?? 0) < 0.7,
    currentValueFn: (s) => s.utilityPerRound ?? 0,
  },
  {
    title: "Atteindre un K/D de 1.2",
    description: "Passez au niveau supérieur en dominant vos duels de manière plus consistante.",
    type: "MONTHLY",
    difficulty: "HARD",
    priority: "HIGH",
    targetValue: 1.2,
    unit: "K/D",
    reward: "Objectif K/D Élite atteint",
    category: "aim",
    condition: (s) => (s.averageKda ?? 0) >= 0.95 && (s.averageKda ?? 0) < 1.2,
    currentValueFn: (s) => s.averageKda ?? 0,
  },
  {
    title: "Atteindre 55% de winrate",
    description: "Devenez un joueur qui fait la différence et contribue grandement aux victoires.",
    type: "MONTHLY",
    difficulty: "HARD",
    priority: "HIGH",
    targetValue: 55,
    unit: "%",
    reward: "Objectif Winrate Élite atteint",
    category: "game_sense",
    condition: (s) => (s.winRate ?? 0) >= 48 && (s.winRate ?? 0) < 55,
    currentValueFn: (s) => s.winRate ?? 0,
  },
  {
    title: "Jouer 10 matchs cette semaine",
    description: "La régularité est la clé du progrès. Jouez au moins 10 matchs cette semaine.",
    type: "WEEKLY",
    difficulty: "EASY",
    priority: "MEDIUM",
    targetValue: 10,
    unit: "matchs",
    reward: "Objectif Volume atteint",
    category: "consistency",
    condition: () => true,
    currentValueFn: (s) => Math.min(s.matchCount ?? 0, 10),
  },
  {
    title: "Atteindre le prochain rang",
    description: "Grimpez d'un rang en travaillant votre constance et votre impact.",
    type: "MONTHLY",
    difficulty: "HARD",
    priority: "CRITICAL",
    targetValue: 1,
    unit: "palier",
    reward: "Objectif Rang atteint",
    category: "game_sense",
    condition: () => true,
    currentValueFn: (s) => {
      const progression = s.progression ?? 0;
      return progression > 0 ? Math.min(progression / 100, 1) : 0;
    },
  },
  {
    title: "Améliorer le score de combat",
    description: "Multipliez les actions à fort impact : kills multi, entry frags et clutchs.",
    type: "WEEKLY",
    difficulty: "MEDIUM",
    priority: "MEDIUM",
    targetValue: 200,
    unit: "ACS",
    reward: "Objectif Combat Score atteint",
    category: "aim",
    condition: (s) => (s.combatScore ?? 0) < 180,
    currentValueFn: (s) => s.combatScore ?? 0,
  },
  {
    title: "Diversifier vos agents",
    description: "Apprenez au moins 3 agents pour être plus adaptable en ranked.",
    type: "MONTHLY",
    difficulty: "EASY",
    priority: "MEDIUM",
    targetValue: 3,
    unit: "agents",
    reward: "Objectif Diversification atteint",
    category: "agent_mastery",
    condition: (s) => (s.agentCount ?? 0) < 3,
    currentValueFn: (s) => s.agentCount ?? 0,
  },
];

function getDailyGoalFromWeekly(weekly: GoalTemplate): GoalTemplate {
  const dailyTarget = Math.max(1, Math.round(weekly.targetValue / 7));
  return {
    ...weekly,
    title: `[Journalier] ${weekly.title}`,
    description: `Version accélérée : ${weekly.description.toLowerCase()}`,
    type: "DAILY",
    targetValue: dailyTarget,
  };
}

async function extractStatsFromAnalysis(userId: string): Promise<Record<string, number> | null> {
  const analysis = await getLatestAnalysis(userId);
  if (!analysis || analysis.insights.length === 0) return null;

  const aggregate = await prisma.playerStatAggregate.findFirst({
    where: { userId, period: "ALL_TIME" },
    orderBy: { computedAt: "desc" },
  });

  if (!aggregate) return null;

  const agentCount = await prisma.playerAgentAggregate.count({
    where: { userId, period: "ALL_TIME", windowStart: aggregate.windowStart, windowEnd: aggregate.windowEnd },
  });

  return {
    matchCount: aggregate.matchCount,
    wins: aggregate.wins,
    losses: aggregate.losses,
    winRate: Number(aggregate.winRate),
    averageKda: Number(aggregate.averageKda),
    headshotRate: Number(aggregate.headshotRate),
    damagePerRound: Number(aggregate.damagePerRound),
    combatScore: Number(aggregate.combatScore),
    firstDeathRate: Number(aggregate.firstDeathRate),
    utilityPerRound: Number(aggregate.utilityPerRound),
    attackWinRate: Number(aggregate.attackWinRate),
    defenseWinRate: Number(aggregate.defenseWinRate),
    agentCount,
    progression: Number(aggregate.rankProgressValue),
  };
}

export async function getGoals(userId: string, status?: string, type?: string): Promise<GoalWithProgress[]> {
  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;
  if (type) where.type = type;

  const goals = await prisma.goal.findMany({
    where,
    orderBy: [{ priority: "desc" }, { deadline: "asc" }],
    take: 100,
  });

  return goals.map((g) => toGoalWithProgress({
    id: String(g.id),
    userId: g.userId,
    title: g.title,
    description: g.description,
    type: g.type as Goal["type"],
    difficulty: g.difficulty as Goal["difficulty"],
    priority: g.priority as Goal["priority"],
    reward: g.reward,
    currentValue: Number(g.currentValue),
    targetValue: Number(g.targetValue),
    unit: g.unit,
    status: g.status as Goal["status"],
    deadline: g.deadline,
    completedAt: g.completedAt,
    metadata: g.metadata as Record<string, unknown>,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }));
}

export async function recalculateGoals(userId: string): Promise<void> {
  const stats = await extractStatsFromAnalysis(userId);
  if (!stats || stats.matchCount < 2) return;

  const activeGoals = await prisma.goal.findMany({
    where: { userId, status: "IN_PROGRESS" },
    take: 100,
  });

  const activeGoalTitles = new Set(activeGoals.map((g) => g.title));
  const hasDaily = activeGoals.some((g) => g.type === "DAILY" && g.status === "IN_PROGRESS");

  for (const template of GOAL_TEMPLATES) {
    if (!template.condition(stats)) continue;
    if (activeGoalTitles.has(template.title)) continue;

    const deadline = buildDeadline(template.type);

    if (!hasDaily && template.type === "WEEKLY") {
      const dailyTemplate = getDailyGoalFromWeekly(template);
      if (!activeGoalTitles.has(dailyTemplate.title)) {
        await prisma.goal.create({
          data: {
            userId,
            title: dailyTemplate.title,
            description: dailyTemplate.description,
            type: "DAILY",
            difficulty: template.difficulty as Goal["difficulty"],
            priority: template.priority as Goal["priority"],
            reward: dailyTemplate.reward ?? null,
            currentValue: Math.min(template.currentValueFn(stats), dailyTemplate.targetValue),
            targetValue: dailyTemplate.targetValue,
            unit: dailyTemplate.unit,
            deadline: buildDeadline("DAILY"),
            metadata: { insights: template.category },
          },
        });
      }
    }

    await prisma.goal.create({
      data: {
        userId,
        title: template.title,
        description: template.description,
        type: template.type as Goal["type"],
        difficulty: template.difficulty as Goal["difficulty"],
        priority: template.priority as Goal["priority"],
        reward: template.reward ?? null,
        currentValue: Math.min(template.currentValueFn(stats), template.targetValue),
        targetValue: template.targetValue,
        unit: template.unit,
        deadline,
        metadata: { insights: template.category },
      },
    });
  }
}

export async function updateGoalProgress(
  userId: string,
  goalId: bigint,
  currentValue: number,
): Promise<GoalWithProgress | null> {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal || goal.status !== "IN_PROGRESS") return null;

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: { currentValue },
  });

  const percentage = Number(updated.targetValue) > 0
    ? Math.min(Math.round((Number(updated.currentValue) / Number(updated.targetValue)) * 100), 100)
    : 0;

  if (percentage >= 100 && updated.status === "IN_PROGRESS") {
    await prisma.goal.update({
      where: { id: goalId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    await checkAndUnlockBadges(userId);

    try {
      await createNotification({
        userId,
        type: "GOAL_COMPLETED",
        title: `Objectif complété : ${updated.title}`,
        body: `Difficulté : ${updated.difficulty === "EASY" ? "Facile" : updated.difficulty === "MEDIUM" ? "Moyen" : "Difficile"}`,
        link: "/goals",
        metadata: {
          goalId: String(updated.id),
          title: updated.title,
          difficulty: updated.difficulty,
          reward: updated.reward,
        },
      });
    } catch {
      // Échec silencieux
    }
  }

  return toGoalWithProgress({
    id: String(updated.id),
    userId: updated.userId,
    title: updated.title,
    description: updated.description,
    type: updated.type as Goal["type"],
    difficulty: updated.difficulty as Goal["difficulty"],
    priority: updated.priority as Goal["priority"],
    reward: updated.reward,
    currentValue: Number(updated.currentValue),
    targetValue: Number(updated.targetValue),
    unit: updated.unit,
    status: updated.status as Goal["status"],
    deadline: updated.deadline,
    completedAt: updated.completedAt,
    metadata: updated.metadata as Record<string, unknown>,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}

export async function expireOldGoals(userId: string): Promise<number> {
  const now = new Date();
  const result = await prisma.goal.updateMany({
    where: {
      userId,
      status: "IN_PROGRESS",
      deadline: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  return result.count;
}

export async function getGoalStats(userId: string): Promise<GoalStats> {
  const [completed, expired, active, allGoals] = await Promise.all([
    prisma.goal.count({ where: { userId, status: "COMPLETED" } }),
    prisma.goal.count({ where: { userId, status: "EXPIRED" } }),
    prisma.goal.count({ where: { userId, status: "IN_PROGRESS" } }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 1_000,
      select: { completedAt: true, difficulty: true, status: true, updatedAt: true },
    }),
  ]);

  const total = completed + expired + active;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  let currentStreak = 0;
  let bestStreak = 0;
  const completionDates = allGoals
    .filter((g) => g.completedAt && g.status === "COMPLETED")
    .map((g) => g.completedAt as Date)
    .sort((a, b) => b.getTime() - a.getTime());

  if (completionDates.length > 0) {
    currentStreak = 1;
    for (let i = 1; i < completionDates.length; i++) {
      const diff = completionDates[i - 1].getTime() - completionDates[i].getTime();
      if (diff <= 7 * 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else break;
    }
    bestStreak = currentStreak;
    for (let i = 1; i < completionDates.length; i++) {
      let streak = 1;
      for (let j = i; j < completionDates.length; j++) {
        const diff = completionDates[j - 1].getTime() - completionDates[j].getTime();
        if (diff <= 7 * 24 * 60 * 60 * 1000) streak++;
        else break;
      }
      if (streak > bestStreak) bestStreak = streak;
    }
  }

  const pointsEarned = allGoals
    .filter((g) => g.status === "COMPLETED")
    .reduce((acc, g) => {
      if (g.difficulty === "EASY") return acc + 10;
      if (g.difficulty === "MEDIUM") return acc + 25;
      if (g.difficulty === "HARD") return acc + 50;
      return acc;
    }, 0);

  return {
    totalCompleted: completed,
    totalExpired: expired,
    totalActive: active,
    completionRate,
    currentStreak,
    bestStreak,
    pointsEarned,
  };
}

export async function getGlobalProgression(userId: string): Promise<GlobalProgression | null> {
  const [stats, weeklyGoals, monthlyGoals, activeGoals] = await Promise.all([
    getGoalStats(userId),
    getGoals(userId, undefined, "WEEKLY"),
    getGoals(userId, undefined, "MONTHLY"),
    getGoals(userId, "IN_PROGRESS"),
  ]);

  const weeklyCompleted = weeklyGoals.filter((g) => g.status === "COMPLETED").length;
  const weeklyTotal = weeklyGoals.length;
  const weeklyCompletion = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  const monthlyCompleted = monthlyGoals.filter((g) => g.status === "COMPLETED").length;
  const monthlyTotal = monthlyGoals.length;
  const monthlyCompletion = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;

  const overallScore = stats.completionRate;

  const milestones = [
    { score: 10, label: "Premier pas" },
    { score: 25, label: "En bonne voie" },
    { score: 50, label: "À mi-chemin" },
    { score: 75, label: "Presque au sommet" },
    { score: 100, label: "Objectif atteint !" },
  ];

  let nextMilestone = "Démarrez votre premier objectif";
  for (const m of milestones) {
    if (overallScore < m.score) {
      nextMilestone = m.label;
      break;
    }
  }

  return {
    overallScore,
    weeklyCompletion,
    monthlyCompletion,
    activeGoals: activeGoals.length,
    weeklyGoalCount: weeklyGoals.filter((g) => g.status === "IN_PROGRESS").length,
    dailyGoalCount: (await getGoals(userId, "IN_PROGRESS", "DAILY")).length,
    nextMilestone,
  };
}
