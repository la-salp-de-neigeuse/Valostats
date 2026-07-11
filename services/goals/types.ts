export type GoalType = "DAILY" | "WEEKLY" | "MONTHLY";
export type GoalStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
export type GoalDifficulty = "EASY" | "MEDIUM" | "HARD";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: GoalType;
  difficulty: GoalDifficulty;
  priority: GoalPriority;
  reward: string | null;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: GoalStatus;
  deadline: Date | null;
  completedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalWithProgress extends Goal {
  percentage: number;
}

export interface Badge {
  id: string;
  userId: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  createdAt: Date;
}

export interface GoalStats {
  totalCompleted: number;
  totalExpired: number;
  totalActive: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  pointsEarned: number;
}

export interface GlobalProgression {
  overallScore: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  activeGoals: number;
  weeklyGoalCount: number;
  dailyGoalCount: number;
  nextMilestone: string;
}

export interface GoalTemplate {
  title: string;
  description: string;
  type: GoalType;
  difficulty: GoalDifficulty;
  priority: GoalPriority;
  targetValue: number;
  unit: string;
  reward: string;
  category: string;
  condition: (stats: Record<string, number>) => boolean;
  currentValueFn: (stats: Record<string, number>) => number;
}

export const GOAL_POINTS: Record<GoalDifficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
};

export const BADGE_DEFINITIONS = [
  { badgeId: "first_goal", name: "Premier objectif", description: "Complétez votre premier objectif", icon: "🎯" },
  { badgeId: "three_goals", name: "Enchaînement", description: "Complétez 3 objectifs", icon: "🔥" },
  { badgeId: "ten_goals", name: "Déterminé", description: "Complétez 10 objectifs", icon: "💪" },
  { badgeId: "twenty_five_goals", name: "Légende", description: "Complétez 25 objectifs", icon: "🏆" },
  { badgeId: "fifty_goals", name: "Machine de guerre", description: "Complétez 50 objectifs", icon: "⚡" },
  { badgeId: "weekly_streak_2", name: "Régulier", description: "2 semaines consécutives avec un objectif complété", icon: "📅" },
  { badgeId: "weekly_streak_4", name: "Habitué", description: "4 semaines consécutives avec un objectif complété", icon: "📆" },
  { badgeId: "hard_goal", name: "Défi relevé", description: "Complétez un objectif difficile", icon: "🛡️" },
  { badgeId: "all_weekly", name: "Semaine parfaite", description: "Complétez tous vos objectifs hebdomadaires", icon: "⭐" },
  { badgeId: "rank_up", name: "Promu", description: "Atteignez le rang suivant", icon: "⬆️" },
  { badgeId: "kda_goal", name: "Duelliste", description: "Complétez un objectif K/D", icon: "⚔️" },
  { badgeId: "winrate_goal", name: "Stratège", description: "Complétez un objectif Winrate", icon: "🧠" },
] as const;
