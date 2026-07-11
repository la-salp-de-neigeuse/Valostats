"use client";

import type { UserProfile } from "@/services/users/user-service";
import { LogoutButton } from "./LogoutButton";
import { useSidebar } from "./MobileDrawer";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useSearch } from "@/components/search/SearchProvider";
import { RoleBadge } from "@/components/roles/RoleBadge";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { hasAnyAdminPermission } from "@/services/roles/types";

export function Header({ user }: { user: UserProfile }) {
  const { open: openSidebar } = useSidebar();
  const { setOpen: setSearchOpen } = useSearch();

  return (
    <header role="banner" aria-label="En-tête" className="h-16 flex items-center justify-between px-6 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors"
          aria-label="Rechercher"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <span className="hidden sm:inline">Rechercher</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-slate-600 bg-slate-800/50 rounded border border-slate-700/50">
            ⌘K
          </kbd>
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <FeedbackButton />
        <NotificationBell initialUnread={0} />
        <div className="flex items-center gap-3">
          <div role="img" aria-label={user.name || "Utilisateur"} className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-500/20">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none">{user.name || "Utilisateur"}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              @{user.publicSlug}
              {hasAnyAdminPermission(user.role) && <RoleBadge role={user.role} size="sm" />}
            </p>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <LogoutButton />
      </div>
    </header>
  );
}
