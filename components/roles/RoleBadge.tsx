import type { UserRole } from "@prisma/client";
import { getRoleLabel, getRoleColor, hasAnyAdminPermission } from "@/services/roles/types";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const iconSize: Record<Size, string> = {
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
};

interface RoleBadgeProps {
  role: UserRole;
  size?: Size;
  showLabel?: boolean;
  className?: string;
}

export function RoleBadge({ role, size = "sm", showLabel = true, className }: RoleBadgeProps) {
  if (role === "USER" && !showLabel) return null;

  const classes = [
    "inline-flex items-center gap-1 rounded-full border font-medium",
    getRoleColor(role),
    sizeClasses[size],
    className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {hasAnyAdminPermission(role) && (
        <svg className={iconSize[size]} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l1.788-.553a1 1 0 11.424 1.954l-1.818.562.995 1.615a1 1 0 01-1.71 1.038L10 7.14l-1.68 2.799a1 1 0 01-1.71-1.038l.996-1.615-1.819-.562a1 1 0 11.424-1.954L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )}
      {showLabel && getRoleLabel(role)}
    </span>
  );
}

export function StaffBadge({ size = "sm" }: { size?: Size }) {
  const classes = [
    "inline-flex items-center gap-1 rounded-full border font-medium",
    "text-rose-400 border-rose-500/40 bg-rose-500/10",
    sizeClasses[size],
  ].join(" ");

  return (
    <span className={classes}>
      <svg className={iconSize[size]} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l1.788-.553a1 1 0 11.424 1.954l-1.818.562.995 1.615a1 1 0 01-1.71 1.038L10 7.14l-1.68 2.799a1 1 0 01-1.71-1.038l.996-1.615-1.819-.562a1 1 0 11.424-1.954L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Staff
    </span>
  );
}
