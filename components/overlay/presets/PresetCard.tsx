"use client";

import type { OverlayPresetListItem } from "@/services/overlay/overlay-preset-service";

interface PresetCardProps {
  preset: OverlayPresetListItem;
  onLoad: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PresetCard({ preset, onLoad, onRename, onDelete, onCopyLink }: PresetCardProps) {
  return (
    <div className="group relative bg-surface/70 backdrop-blur-sm border border-border rounded-2xl p-5 transition-all duration-300 hover:border-border-accent hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-text-primary">{preset.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Modifié le {formatDate(preset.updatedAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
        <button
          onClick={onLoad}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Charger
        </button>
        <button
          onClick={onCopyLink}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-hover/50 border border-border text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copier le lien
        </button>
        <button
          onClick={onRename}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-hover/50 border border-border text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Renommer
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Supprimer
        </button>
      </div>
    </div>
  );
}
