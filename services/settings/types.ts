import type { ProfileVisibility } from "@prisma/client";

export type NotificationChannelPref = "IN_APP" | "EMAIL" | "DISCORD" | "PUSH";

export interface NotificationChannelSettings {
  rankChange: boolean;
  newRecord: boolean;
  winStreak: boolean;
  aiInsight: boolean;
  goalCompleted: boolean;
  badgeUnlocked: boolean;
  scoreImprovement: boolean;
  syncCompleted: boolean;
}

export interface NotificationSettings {
  email: NotificationChannelSettings;
  discord: NotificationChannelSettings;
  push: NotificationChannelSettings;
}

export interface AiSettings {
  provider: "OPENAI" | "CLAUDE" | "GEMINI";
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface PrivacySettings {
  visibility: ProfileVisibility;
  showRankPublicly: boolean;
  showMatchHistory: boolean;
  showAiScore: boolean;
  allowLeaderboard: boolean;
}

export interface UserProfileSettings {
  name: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  locale: string;
  timezone: string;
}

export interface SettingsData {
  profile: UserProfileSettings;
  notifications: NotificationSettings;
  ai: AiSettings;
  privacy: PrivacySettings;
  overlayTheme: string;
  overlayWidgets: Record<string, boolean>;
}

export const DEFAULT_NOTIFICATION_CHANNEL: NotificationChannelSettings = {
  rankChange: true,
  newRecord: true,
  winStreak: true,
  aiInsight: false,
  goalCompleted: true,
  badgeUnlocked: true,
  scoreImprovement: false,
  syncCompleted: true,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: { ...DEFAULT_NOTIFICATION_CHANNEL },
  discord: {
    rankChange: false,
    newRecord: false,
    winStreak: false,
    aiInsight: false,
    goalCompleted: false,
    badgeUnlocked: false,
    scoreImprovement: false,
    syncCompleted: false,
  },
  push: {
    rankChange: false,
    newRecord: false,
    winStreak: false,
    aiInsight: false,
    goalCompleted: false,
    badgeUnlocked: false,
    scoreImprovement: false,
    syncCompleted: false,
  },
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "OPENAI",
  model: "gpt-4o",
  temperature: 0.3,
  maxTokens: 2048,
};

export const AI_MODEL_OPTIONS: Record<string, string[]> = {
  OPENAI: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  CLAUDE: ["claude-sonnet-4-20250514", "claude-haiku-3-5-20241022"],
  GEMINI: ["gemini-2.5-flash", "gemini-2.5-pro"],
};

export const DEFAULT_OVERLAY_WIDGETS: Record<string, boolean> = {
  playerName: true,
  rank: true,
  rr: true,
  winRate: true,
  kda: true,
  aiScore: true,
  recentMatches: true,
  lastAgent: true,
  winStreak: true,
  lastResult: true,
  progression: true,
};
