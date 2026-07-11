"use client";

import { useState, useEffect, useRef } from "react";
import type { UserRole } from "@prisma/client";
import type {
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority,
  PaginatedFeedback,
  FeedbackStats,
} from "@/services/feedback/types";
import {
  FEEDBACK_TYPE_EMOJIS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_COLORS,
  FEEDBACK_PRIORITY_LABELS,
  FEEDBACK_PRIORITY_COLORS,
} from "@/services/feedback/types";
import { canModifyFeedbackStatus, canManageFeedback, canDeleteFeedback } from "@/services/roles/types";

interface FeedbackAdminClientProps {
  currentUserRole: UserRole;
}

export function FeedbackAdminClient({ currentUserRole }: FeedbackAdminClientProps) {
  const [feedbacks, setFeedbacks] = useState<PaginatedFeedback | null>(null);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const mountedRef = useRef(false);

  const canEditStatus = canModifyFeedbackStatus(currentUserRole);
  const canEdit = canManageFeedback(currentUserRole);
  const canDelete = canDeleteFeedback(currentUserRole);

  useEffect(() => {
    mountedRef.current = true;
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (priorityFilter) params.set("priority", priorityFilter);

    fetch(`/api/feedback?${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (mountedRef.current) { setFeedbacks(data); } });

    fetch("/api/feedback/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (mountedRef.current) { setStats(data); setLoading(false); } });

    return () => { mountedRef.current = false; };
  }, [page, statusFilter, typeFilter, priorityFilter]);

  const reload = () => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (priorityFilter) params.set("priority", priorityFilter);

    fetch(`/api/feedback?${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (mountedRef.current) setFeedbacks(data); });

    fetch("/api/feedback/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (mountedRef.current) setStats(data); });
  };

  const updateField = async (id: string, action: string, value: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, [action === "status" ? "status" : action === "priority" ? "priority" : "adminNote"]: value }),
      });
      if (res.ok) {
        setEditingNote(null);
        reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur");
      }
    } catch {
      alert("Erreur réseau");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce feedback définitivement ?")) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (res.ok) reload();
      else alert("Erreur lors de la suppression");
    } catch {
      alert("Erreur réseau");
    }
  };

  const types: FeedbackType[] = ["BUG", "IDEA", "SUGGESTION", "POSITIVE"];
  const statuses: FeedbackStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED", "DUPLICATE"];
  const priorities: FeedbackPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Nouveaux", value: stats.new, color: "text-blue-400" },
            { label: "En cours", value: stats.inProgress, color: "text-amber-400" },
            { label: "Résolus", value: stats.resolved, color: "text-emerald-400" },
            { label: "Critiques", value: stats.critical, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111115] border border-slate-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50">
          <option value="">Tous les statuts</option>
          {statuses.map((s) => <option key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</option>)}
        </select>

        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50">
          <option value="">Tous les types</option>
          {types.map((t) => <option key={t} value={t}>{FEEDBACK_TYPE_LABELS[t]}</option>)}
        </select>

        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50">
          <option value="">Toutes les priorités</option>
          {priorities.map((p) => <option key={p} value={p}>{FEEDBACK_PRIORITY_LABELS[p]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111115] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Titre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Priorité</th>
                {(canEdit || canDelete) && <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-6">
                      <div className="h-4 bg-slate-800/50 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : feedbacks?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Aucun feedback trouvé.
                  </td>
                </tr>
              ) : (
                feedbacks?.items.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                          {(fb.userName || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300">{fb.userName || fb.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{FEEDBACK_TYPE_EMOJIS[fb.type]}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white font-medium max-w-xs truncate">{fb.title}</div>
                      {fb.adminNote && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">Note: {fb.adminNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                      {new Date(fb.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      {canEditStatus ? (
                        <select
                          value={fb.status}
                          onChange={(e) => updateField(fb.id, "status", e.target.value)}
                          className={`text-xs rounded-full px-2 py-0.5 border font-medium ${FEEDBACK_STATUS_COLORS[fb.status]} bg-transparent focus:outline-none`}
                        >
                          {statuses.map((s) => <option key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs rounded-full px-2 py-0.5 border font-medium inline-block ${FEEDBACK_STATUS_COLORS[fb.status]}`}>
                          {FEEDBACK_STATUS_LABELS[fb.status]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <select
                          value={fb.priority}
                          onChange={(e) => updateField(fb.id, "priority", e.target.value)}
                          className={`text-xs rounded-full px-2 py-0.5 border font-medium ${FEEDBACK_PRIORITY_COLORS[fb.priority]} bg-transparent focus:outline-none`}
                        >
                          {priorities.map((p) => <option key={p} value={p}>{FEEDBACK_PRIORITY_LABELS[p]}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs rounded-full px-2 py-0.5 border font-medium inline-block ${FEEDBACK_PRIORITY_COLORS[fb.priority]}`}>
                          {FEEDBACK_PRIORITY_LABELS[fb.priority]}
                        </span>
                      )}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            editingNote === fb.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Note interne..."
                                  className="w-28 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") updateField(fb.id, "note", noteText);
                                    if (e.key === "Escape") setEditingNote(null);
                                  }}
                                  autoFocus
                                />
                                <button onClick={() => updateField(fb.id, "note", noteText)} className="text-xs text-rose-400 hover:text-rose-300">OK</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingNote(fb.id); setNoteText(fb.adminNote || ""); }}
                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                title="Ajouter une note"
                              >
                                📝
                              </button>
                            )
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(fb.id)}
                              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {feedbacks && feedbacks.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg hover:text-white transition-colors disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-sm text-slate-500">
            Page {feedbacks.page} / {feedbacks.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(feedbacks.totalPages, page + 1))}
            disabled={page >= feedbacks.totalPages}
            className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg hover:text-white transition-colors disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
