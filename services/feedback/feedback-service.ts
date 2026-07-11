import { prisma } from "@/lib/prisma/client";
import { createNotification } from "@/services/notifications/notifications-service";
import { dispatchChannel } from "@/services/notifications/channels/dispatcher";
import { canViewFeedback } from "@/services/roles/types";
import type { UserRole } from "@prisma/client";
import type {
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority,
  FeedbackListItem,
  PaginatedFeedback,
  FeedbackStats,
} from "./types";

const DEFAULT_PAGE_SIZE = 20;

function toFeedbackListItem(n: {
  id: bigint;
  userId: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  pageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  adminNote: string | null;
  user: { name: string | null; email: string };
}): FeedbackListItem {
  return {
    id: String(n.id),
    userId: n.userId,
    userName: n.user.name,
    userEmail: n.user.email,
    type: n.type as FeedbackType,
    title: n.title,
    description: n.description,
    status: n.status as FeedbackStatus,
    priority: n.priority as FeedbackPriority,
    pageUrl: n.pageUrl,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    adminNote: n.adminNote,
  };
}

export async function createFeedback(params: {
  userId: string;
  type: FeedbackType;
  title: string;
  description: string;
  pageUrl?: string;
  browser?: string;
  operatingSystem?: string;
  userAgent?: string;
  screenshotUrl?: string;
}): Promise<FeedbackListItem> {
  const created = await prisma.feedback.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      pageUrl: params.pageUrl ?? null,
      browser: params.browser ?? null,
      operatingSystem: params.operatingSystem ?? null,
      userAgent: params.userAgent ?? null,
      screenshotUrl: params.screenshotUrl ?? null,
    },
    include: { user: { select: { name: true, email: true } } },
  });

  const adminRoles: UserRole[] = ["OWNER", "DEVELOPER", "ADMINISTRATOR", "MODERATOR"];
  const admins = await prisma.user.findMany({
    where: { role: { in: adminRoles }, deletedAt: null },
    select: { id: true },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "FEEDBACK_CREATED",
        channel: "IN_APP",
        title: `Nouveau feedback : ${params.title}`,
        body: `${params.type} — ${params.description.slice(0, 100)}${params.description.length > 100 ? "..." : ""}`,
        link: "/admin/feedback",
        metadata: { feedbackId: String(created.id) } as never,
      })),
    });

    for (const admin of admins) {
      dispatchChannel(admin.id, "FEEDBACK_CREATED", {
        title: `Nouveau feedback : ${params.title}`,
        body: `${params.type} — ${params.description.slice(0, 100)}${params.description.length > 100 ? "..." : ""}`,
        metadata: { feedbackId: String(created.id) },
      });
    }
  }

  return toFeedbackListItem(created);
}

export async function getFeedbacks(
  options?: {
    page?: number;
    pageSize?: number;
    type?: FeedbackType;
    status?: FeedbackStatus;
    priority?: FeedbackPriority;
    userId?: string;
  },
): Promise<PaginatedFeedback> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (options?.type) where.type = options.type;
  if (options?.status) where.status = options.status;
  if (options?.priority) where.priority = options.priority;
  if (options?.userId) where.userId = options.userId;

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    items: items.map(toFeedbackListItem),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFeedbackById(id: bigint): Promise<FeedbackListItem | null> {
  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  return feedback ? toFeedbackListItem(feedback) : null;
}

export async function updateFeedbackStatus(
  id: bigint,
  status: FeedbackStatus,
): Promise<FeedbackListItem | null> {
  const prev = await prisma.feedback.findUnique({ where: { id } });
  if (!prev) return null;

  const updated = await prisma.feedback.update({
    where: { id },
    data: { status },
    include: { user: { select: { name: true, email: true } } },
  });

  if (status === "RESOLVED" || status === "REJECTED") {
    await createNotification({
      userId: prev.userId,
      type: "FEEDBACK_RESOLVED",
      title: `Votre feedback a été ${status === "RESOLVED" ? "résolu" : "rejeté"} : ${prev.title}`,
      link: "/feedback",
      metadata: { feedbackId: String(id) },
    });
  }

  return toFeedbackListItem(updated);
}

export async function updateFeedbackPriority(
  id: bigint,
  priority: FeedbackPriority,
): Promise<FeedbackListItem | null> {
  const updated = await prisma.feedback.update({
    where: { id },
    data: { priority },
    include: { user: { select: { name: true, email: true } } },
  });

  return toFeedbackListItem(updated);
}

export async function updateFeedbackAdminNote(
  id: bigint,
  adminNote: string,
): Promise<FeedbackListItem | null> {
  const updated = await prisma.feedback.update({
    where: { id },
    data: { adminNote },
    include: { user: { select: { name: true, email: true } } },
  });

  return toFeedbackListItem(updated);
}

export async function deleteFeedback(
  id: bigint,
): Promise<boolean> {
  try {
    await prisma.feedback.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  const [total, newCount, inProgress, resolved, critical, byType, byStatus] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { status: "NEW" } }),
    prisma.feedback.count({ where: { status: "IN_PROGRESS" } }),
    prisma.feedback.count({ where: { status: "RESOLVED" } }),
    prisma.feedback.count({ where: { priority: "CRITICAL", status: { not: "RESOLVED" } } }),
    prisma.feedback.groupBy({ by: ["type"], _count: true }),
    prisma.feedback.groupBy({ by: ["status"], _count: true }),
  ]);

  const typeMap: Record<string, number> = {};
  for (const t of byType) typeMap[t.type] = t._count;

  const statusMap: Record<string, number> = {};
  for (const s of byStatus) statusMap[s.status] = s._count;

  return { total, new: newCount, inProgress, resolved, critical, byType: typeMap, byStatus: statusMap };
}

export async function getUserFeedbackStats(userId: string): Promise<FeedbackStats> {
  const where = { userId };
  const [total, newCount, inProgress, resolved, critical, byType, byStatus] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.count({ where: { ...where, status: "NEW" } }),
    prisma.feedback.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.feedback.count({ where: { ...where, status: "RESOLVED" } }),
    prisma.feedback.count({ where: { ...where, priority: "CRITICAL", status: { not: "RESOLVED" } } }),
    prisma.feedback.groupBy({ by: ["type"], where, _count: true }),
    prisma.feedback.groupBy({ by: ["status"], where, _count: true }),
  ]);

  const typeMap: Record<string, number> = {};
  for (const t of byType) typeMap[t.type] = t._count;

  const statusMap: Record<string, number> = {};
  for (const s of byStatus) statusMap[s.status] = s._count;

  return { total, new: newCount, inProgress, resolved, critical, byType: typeMap, byStatus: statusMap };
}
