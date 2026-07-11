import type { UserRole } from "@prisma/client";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 100,
  DEVELOPER: 90,
  ADMINISTRATOR: 80,
  MODERATOR: 70,
  PREMIUM: 60,
  FRIEND: 50,
  USER: 0,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Propriétaire",
  DEVELOPER: "Développeur",
  ADMINISTRATOR: "Administrateur",
  MODERATOR: "Modérateur",
  PREMIUM: "Premium",
  FRIEND: "Ami",
  USER: "Utilisateur",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  OWNER: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  DEVELOPER: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  ADMINISTRATOR: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  MODERATOR: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  PREMIUM: "text-violet-400 border-violet-500/40 bg-violet-500/10",
  FRIEND: "text-teal-400 border-teal-500/40 bg-teal-500/10",
  USER: "text-slate-400 border-slate-600/40 bg-slate-800",
};

// === SYSTÈME 1 : ACCÈS PREMIUM ===
// Les rôles suivants bénéficient automatiquement des fonctionnalités Premium
// sans abonnement Stripe. Cela inclut OWNER, DEVELOPER, ADMINISTRATOR,
// MODERATOR, PREMIUM et FRIEND — seul USER doit payer.

export const PREMIUM_ROLES: UserRole[] = [
  "OWNER",
  "DEVELOPER",
  "ADMINISTRATOR",
  "MODERATOR",
  "PREMIUM",
  "FRIEND",
];

export function hasPremiumAccess(role: UserRole): boolean {
  return PREMIUM_ROLES.includes(role);
}

// === SYSTÈME 2 : PERMISSIONS D'ADMINISTRATION ===
// Totalement indépendant du système Premium.
// FRIEND et PREMIUM n'ont aucune permission d'administration.

export type AdminPermission =
  | "manage_roles"
  | "manage_users"
  | "moderate"
  | "developer_tools"
  | "view_admin_panel"
  | "view_feedback"
  | "manage_feedback"
  | "modify_feedback_status"
  | "delete_feedback";

export const ROLE_ADMIN_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  OWNER: [
    "manage_roles", "manage_users", "moderate", "developer_tools", "view_admin_panel",
    "view_feedback", "manage_feedback", "modify_feedback_status", "delete_feedback",
  ],
  DEVELOPER: [
    "manage_roles", "manage_users", "moderate", "developer_tools", "view_admin_panel",
    "view_feedback", "manage_feedback", "modify_feedback_status", "delete_feedback",
  ],
  ADMINISTRATOR: [
    "manage_users", "moderate", "view_admin_panel",
    "view_feedback", "manage_feedback", "modify_feedback_status",
  ],
  MODERATOR: [
    "moderate", "view_admin_panel",
    "view_feedback", "modify_feedback_status",
  ],
  PREMIUM: [],
  FRIEND: [],
  USER: [],
};

function hasAdminPermission(role: UserRole, permission: AdminPermission): boolean {
  return ROLE_ADMIN_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageRoles(role: UserRole): boolean {
  return hasAdminPermission(role, "manage_roles");
}

export function canManageUsers(role: UserRole): boolean {
  return hasAdminPermission(role, "manage_users");
}

export function canModerate(role: UserRole): boolean {
  return hasAdminPermission(role, "moderate");
}

export function canAccessDeveloperTools(role: UserRole): boolean {
  return hasAdminPermission(role, "developer_tools");
}

export function canViewAdminPanel(role: UserRole): boolean {
  return hasAdminPermission(role, "view_admin_panel");
}

export function canViewFeedback(role: UserRole): boolean {
  return hasAdminPermission(role, "view_feedback");
}

export function canManageFeedback(role: UserRole): boolean {
  return hasAdminPermission(role, "manage_feedback");
}

export function canModifyFeedbackStatus(role: UserRole): boolean {
  return hasAdminPermission(role, "modify_feedback_status");
}

export function canDeleteFeedback(role: UserRole): boolean {
  return hasAdminPermission(role, "delete_feedback");
}

export function hasAnyAdminPermission(role: UserRole): boolean {
  return ROLE_ADMIN_PERMISSIONS[role]?.length > 0;
}

// === UTILITAIRES ===

export function getRolePriority(role: UserRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? "Inconnu";
}

export function getRoleColor(role: UserRole): string {
  return ROLE_COLORS[role] ?? ROLE_COLORS.USER;
}

export function getHighestRole(roles: UserRole[]): UserRole {
  return [...roles].sort((a, b) => getRolePriority(b) - getRolePriority(a))[0];
}
