import { prisma } from "@/lib/prisma/client";
import type { UserRole } from "@prisma/client";
import {
  getRoleLabel,
  canManageRoles,
  hasPremiumAccess,
  canViewAdminPanel,
  hasAnyAdminPermission,
  canManageUsers,
  canModerate,
  canAccessDeveloperTools,
  canViewFeedback,
  canManageFeedback,
  canModifyFeedbackStatus,
  canDeleteFeedback,
} from "./types";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

export async function userHasPremiumAccess(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? hasPremiumAccess(role) : false;
}

export async function userCanManageRoles(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canManageRoles(role) : false;
}

export async function userCanManageUsers(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canManageUsers(role) : false;
}

export async function userCanModerate(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canModerate(role) : false;
}

export async function userCanAccessDeveloperTools(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canAccessDeveloperTools(role) : false;
}

export async function userCanViewAdminPanel(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canViewAdminPanel(role) : false;
}

export async function userCanViewFeedback(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canViewFeedback(role) : false;
}

export async function userCanManageFeedback(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canManageFeedback(role) : false;
}

export async function userCanModifyFeedbackStatus(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canModifyFeedbackStatus(role) : false;
}

export async function userCanDeleteFeedback(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? canDeleteFeedback(role) : false;
}

export async function userHasAnyAdminPermission(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? hasAnyAdminPermission(role) : false;
}

export async function getUserRoleLabel(userId: string): Promise<string> {
  const role = await getUserRole(userId);
  return role ? getRoleLabel(role) : "Inconnu";
}

export async function updateUserRole(
  targetUserId: string,
  newRole: UserRole,
  actorUserId: string
): Promise<void> {
  const actorRole = await getUserRole(actorUserId);
  if (!actorRole || !canManageRoles(actorRole)) {
    throw new Error("Seuls les propriétaires et développeurs peuvent modifier les rôles.");
  }

  if (!canManageRoles(actorRole)) {
    throw new Error("Vous n'avez pas la permission de modifier les rôles.");
  }

  if (actorRole !== "OWNER" && (newRole === "OWNER" || newRole === "DEVELOPER")) {
    throw new Error("Vous ne pouvez pas attribuer ce rôle.");
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });
}

export async function getAllUsersWithRoles(limit = 1_000) {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      publicSlug: true,
      createdAt: true,
    },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
