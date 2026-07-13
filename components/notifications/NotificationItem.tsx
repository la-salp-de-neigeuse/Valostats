"use client";

import type { AppNotification } from "@/services/notifications/types";
import { NOTIFICATION_ICONS } from "@/services/notifications/types";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function NotificationItem({
  notification,
  onRead,
  onArchive,
  compact,
}: {
  notification: AppNotification;
  onRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  compact?: boolean;
}) {
  const icon = NOTIFICATION_ICONS[notification.type] ?? "🔔";

  async function handleRead() {
    if (notification.isRead) return;
    try {
      await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
      onRead?.(notification.id);
    } catch {
      // silence
    }
  }

  async function handleArchive() {
    try {
      await fetch(`/api/notifications/${notification.id}`, { method: "DELETE" });
      onArchive?.(notification.id);
    } catch {
      // silence
    }
  }

  const content = (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
        notification.isRead
          ? "hover:bg-slate-800/30"
          : "bg-accent/5 hover:bg-accent-light"
      } ${!notification.isRead ? "hover:scale-[1.01]" : ""}`}
      onClick={handleRead}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleRead()}
    >
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.isRead ? "text-slate-300" : "text-white font-medium"}`}>
          {notification.title}
        </p>
        {!compact && notification.body && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className={`text-xs mt-1 ${notification.isRead ? "text-slate-600" : "text-slate-500"}`}>
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
      )}
      {notification.isRead && (
        <button
          onClick={(e) => { e.stopPropagation(); handleArchive(); }}
          className="text-slate-600 hover:text-slate-400 transition-colors shrink-0 mt-1"
          aria-label="Archiver"
        >
          <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <a href={notification.link} className="block">
        {content}
      </a>
    );
  }

  return content;
}
