import { prisma } from "@/lib/prisma/client";
import type { AppNotification, NotificationType, NotificationChannel, PaginatedNotifications } from "./types";
import { dispatchChannel } from "./channels/dispatcher";

const DEFAULT_PAGE_SIZE = 20;

function toNotification(n: {
  id: bigint;
  userId: string;
  type: string;
  channel: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: unknown;
  readAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
}): AppNotification {
  return {
    id: String(n.id),
    userId: n.userId,
    type: n.type as NotificationType,
    channel: n.channel as NotificationChannel,
    title: n.title,
    body: n.body,
    link: n.link,
    metadata: n.metadata as Record<string, unknown>,
    readAt: n.readAt,
    archivedAt: n.archivedAt,
    createdAt: n.createdAt,
    isRead: n.readAt !== null,
  };
}

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}): Promise<AppNotification> {
  const created = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      channel: params.channel ?? "IN_APP",
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
      metadata: (params.metadata ?? {}) as never,
    },
  });

  dispatchChannel(params.userId, params.type, {
    title: params.title,
    body: params.body,
    metadata: params.metadata,
  });

  return toNotification(created);
}

export async function getNotifications(
  userId: string,
  options?: {
    page?: number;
    pageSize?: number;
    type?: NotificationType;
    includeArchived?: boolean;
  },
): Promise<PaginatedNotifications> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { userId };
  if (options?.type) where.type = options.type;
  if (!options?.includeArchived) where.archivedAt = null;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null, archivedAt: null } }),
  ]);

  return {
    notifications: notifications.map(toNotification),
    total,
    unreadCount,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null, archivedAt: null },
  });
}

export async function markAsRead(userId: string, notificationId: bigint): Promise<AppNotification | null> {
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });

  if (updated.count === 0) return null;

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  return notification ? toNotification(notification) : null;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null, archivedAt: null },
    data: { readAt: new Date() },
  });

  return result.count;
}

export async function archiveNotification(userId: string, notificationId: bigint): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { archivedAt: new Date() },
  });

  return result.count > 0;
}

export async function deleteNotification(userId: string, notificationId: bigint): Promise<boolean> {
  const result = await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });

  return result.count > 0;
}

export async function cleanupOldNotifications(userId: string, keepDays = 90): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - keepDays);

  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      createdAt: { lt: cutoff },
      archivedAt: { not: null },
    },
  });

  return result.count;
}
