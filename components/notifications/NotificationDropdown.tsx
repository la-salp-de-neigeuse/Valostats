"use client";

import { useState, useEffect } from "react";
import type { AppNotification } from "@/services/notifications/types";
import { NotificationItem } from "./NotificationItem";

export function NotificationDropdown({
  onClose,
  onRead,
}: {
  onClose: () => void;
  onRead: () => void;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications?pageSize=10")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setNotifications(data.notifications);
        if (data.unreadCount === 0) onRead();
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [onRead]);

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date(), isRead: true })));
      onRead();
    } catch {
      // silence
    }
  }

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date(), isRead: true } : n)),
    );
  }

  function handleArchive(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] bg-surface border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-scale-in">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Tout lu
            </button>
          )}
          <a
            href="/notifications"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Voir tout
          </a>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-2 space-y-1">
        {loading && (
          <p className="text-sm text-slate-500 text-center py-8">Chargement...</p>
        )}
        {!loading && notifications.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">Aucune notification</p>
        )}
        {!loading &&
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={handleRead}
              onArchive={handleArchive}
              compact
            />
          ))}
      </div>
    </div>
  );
}
