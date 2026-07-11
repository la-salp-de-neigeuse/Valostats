export type NotificationType =
  | "RANK_CHANGE"
  | "NEW_RECORD"
  | "WIN_STREAK"
  | "AI_INSIGHT"
  | "GOAL_COMPLETED"
  | "BADGE_UNLOCKED"
  | "SCORE_IMPROVEMENT"
  | "SYNC_COMPLETED"
  | "NEW_MAIN_AGENT"
  | "FEEDBACK_CREATED"
  | "FEEDBACK_RESOLVED";

export type NotificationChannel = "IN_APP" | "EMAIL" | "DISCORD" | "PUSH";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  readAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  isRead: boolean;
}

export interface PaginatedNotifications {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const NOTIFICATION_LINKS: Record<NotificationType, string> = {
  RANK_CHANGE: "/dashboard",
  NEW_RECORD: "/matches",
  WIN_STREAK: "/dashboard",
  AI_INSIGHT: "/ai-coach",
  GOAL_COMPLETED: "/goals",
  BADGE_UNLOCKED: "/goals",
  SCORE_IMPROVEMENT: "/ai-coach",
  SYNC_COMPLETED: "/matches",
  NEW_MAIN_AGENT: "/matches",
  FEEDBACK_CREATED: "/admin/feedback",
  FEEDBACK_RESOLVED: "/feedback",
};

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  RANK_CHANGE: "⬆️",
  NEW_RECORD: "🏆",
  WIN_STREAK: "🔥",
  AI_INSIGHT: "🧠",
  GOAL_COMPLETED: "🎯",
  BADGE_UNLOCKED: "🏅",
  SCORE_IMPROVEMENT: "📈",
  SYNC_COMPLETED: "🔄",
  NEW_MAIN_AGENT: "🎭",
  FEEDBACK_CREATED: "💬",
  FEEDBACK_RESOLVED: "✅",
};
