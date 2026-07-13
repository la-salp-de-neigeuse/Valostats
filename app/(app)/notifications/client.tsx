"use client";

import { useState, useCallback } from "react";
import type { PaginatedNotifications, NotificationType } from "@/services/notifications/types";
import { NotificationItem } from "@/components/notifications/NotificationItem";

const TYPE_FILTERS: Array<{ value: NotificationType | ""; label: string }> = [
  { value: "", label: "Toutes" },
  { value: "SYNC_COMPLETED", label: "Synchronisation" },
  { value: "GOAL_COMPLETED", label: "Objectifs" },
  { value: "BADGE_UNLOCKED", label: "Badges" },
  { value: "AI_INSIGHT", label: "Coach IA" },
  { value: "RANK_CHANGE", label: "Rang" },
  { value: "WIN_STREAK", label: "Séries" },
];

export function NotificationsPageClient({
  initialData,
}: {
  initialData: PaginatedNotifications;
}) {
  const [data, setData] = useState(initialData);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: "20" });
        if (typeFilter) params.set("type", typeFilter);
        const res = await fetch(`/api/notifications?${params}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silence
      } finally {
        setLoading(false);
      }
    },
    [typeFilter],
  );

  async function handleFilterChange(newFilter: NotificationType | "") {
    setTypeFilter(newFilter);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "20" });
      if (newFilter) params.set("type", newFilter);
      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({
          ...n,
          readAt: new Date(),
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch {
      // silence
    }
  }

  function handleRead(id: string) {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date(), isRead: true } : n,
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }

  function handleArchive(id: string) {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
      total: prev.total - 1,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                typeFilter === f.value
                  ? "bg-accent text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {data.unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-accent hover:text-accent-hover transition-colors shrink-0"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-surface border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      )}

      {!loading && data.notifications.length === 0 && (
        <div className="bg-surface border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3" role="img" aria-label="Cloche de notification">🔔</div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucune notification</h3>
          <p className="text-sm text-slate-400">
            Les notifications apparaîtront ici après vos parties et analyses IA.
          </p>
        </div>
      )}

      {!loading && data.notifications.length > 0 && (
        <div className="bg-surface border border-slate-800 rounded-2xl p-4 space-y-1">
          {data.notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={handleRead}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === data.page
                  ? "bg-accent text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
