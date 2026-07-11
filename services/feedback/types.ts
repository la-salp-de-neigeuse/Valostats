import type { FeedbackType, FeedbackStatus, FeedbackPriority } from "@prisma/client";

export type { FeedbackType, FeedbackStatus, FeedbackPriority };

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  BUG: "🐞 Bug",
  IDEA: "💡 Idée",
  SUGGESTION: "⭐ Suggestion",
  POSITIVE: "❤️ Positif",
};

export const FEEDBACK_TYPE_EMOJIS: Record<FeedbackType, string> = {
  BUG: "🐞",
  IDEA: "💡",
  SUGGESTION: "⭐",
  POSITIVE: "❤️",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: "Nouveau",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  REJECTED: "Rejeté",
  DUPLICATE: "Doublon",
};

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  NEW: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  IN_PROGRESS: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  RESOLVED: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  REJECTED: "text-red-400 border-red-500/40 bg-red-500/10",
  DUPLICATE: "text-slate-400 border-slate-500/40 bg-slate-500/10",
};

export const FEEDBACK_PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  CRITICAL: "Critique",
};

export const FEEDBACK_PRIORITY_COLORS: Record<FeedbackPriority, string> = {
  LOW: "text-slate-400 border-slate-600/40 bg-slate-800",
  MEDIUM: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  HIGH: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  CRITICAL: "text-red-400 border-red-500/40 bg-red-500/10",
};

export interface FeedbackListItem {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  pageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  adminNote: string | null;
}

export interface PaginatedFeedback {
  items: FeedbackListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  critical: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}
