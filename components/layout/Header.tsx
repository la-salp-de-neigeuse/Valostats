"use client";

import type { UserProfile } from "@/services/users/user-service";
import { LogoutButton } from "./LogoutButton";
import { useSidebar } from "./MobileDrawer";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useSearch } from "@/components/search/SearchProvider";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { hasAnyAdminPermission } from "@/services/roles/types";

export function Header({ user }: { user: UserProfile }) {
  const { open: openSidebar } = useSidebar();
  const { setOpen: setSearchOpen } = useSearch();

  return (
    <header role="banner" aria-label="En-tête" className="h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-surface-hover/30 hover:bg-surface-hover/50 border border-border rounded-lg transition-colors"
          aria-label="Rechercher"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <span className="hidden sm:inline">Rechercher</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-text-muted bg-surface-hover/50 rounded border border-border">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell initialUnread={0} />
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar name={user.name || "U"} size="md" src={user.image} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-primary leading-none">{user.name || "Utilisateur"}</p>
            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
              @{user.publicSlug}
              {hasAnyAdminPermission(user.role) && <Badge variant="premium" size="sm">Admin</Badge>}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
