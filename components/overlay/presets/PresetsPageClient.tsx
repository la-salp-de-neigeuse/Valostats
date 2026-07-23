"use client";

import { useState } from "react";
import type { OverlayPresetListItem } from "@/services/overlay/overlay-preset-service";
import { PresetCard } from "./PresetCard";
import { RenamePresetDialog } from "./RenamePresetDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export function PresetsPageClient({ initialPresets, compact }: { initialPresets: OverlayPresetListItem[]; compact?: boolean }) {
  const [presets, setPresets] = useState<OverlayPresetListItem[]>(initialPresets);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    const res = await fetch("/api/overlay/presets/manage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: renameTarget.id, name }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Erreur lors du renommage.");
    }
    setPresets((prev) =>
      prev.map((p) => (p.id === renameTarget.id ? { ...p, name } : p)),
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch("/api/overlay/presets/manage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression.");
    setPresets((prev) => prev.filter((p) => p.id !== deleteTarget.id));
  };

  const handleLoad = async (preset: OverlayPresetListItem) => {
    const res = await fetch("/api/overlay/presets/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: preset.id, action: "load" }),
    });
    if (!res.ok) {
      const text = await res.text();
      alert(text || "Erreur lors du chargement.");
      return;
    }
    alert("Preset chargé avec succès !");
  };

  const handleCopyLink = async (preset: OverlayPresetListItem) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/overlay/preset/${preset.id}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      prompt("Copiez ce lien :", link);
    }
  };

  if (presets.length === 0) {
    if (compact) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl">
          <svg className="w-10 h-10 mx-auto text-slate-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-slate-400 text-sm mb-1">Aucun preset pour l&apos;instant</p>
          <p className="text-slate-500 text-xs">
            Créez un preset depuis la section Configuration ci-dessous.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Mes presets</h1>
          <p className="text-slate-400 mt-1">
            Sauvegardez et partagez différentes configurations de votre overlay.
          </p>
        </div>
        <div className="text-center py-20 border-2 border-dashed border-slate-700/50 rounded-2xl">
          <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-slate-400 text-sm mb-1">Aucun preset pour l&apos;instant</p>
          <p className="text-slate-500 text-xs">
            Créez un preset depuis les paramètres de l&apos;overlay.
          </p>
        </div>
      </>
    );
  }

  if (compact) {
    return (
      <>
        <div className="grid sm:grid-cols-2 gap-4">
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onLoad={() => handleLoad(preset)}
              onRename={() => setRenameTarget({ id: preset.id, name: preset.name })}
              onDelete={() => setDeleteTarget({ id: preset.id, name: preset.name })}
              onCopyLink={() => handleCopyLink(preset)}
            />
          ))}
        </div>

        <RenamePresetDialog
          open={!!renameTarget}
          currentName={renameTarget?.name ?? ""}
          onClose={() => setRenameTarget(null)}
          onRename={handleRename}
        />

        <DeleteConfirmDialog
          open={!!deleteTarget}
          presetName={deleteTarget?.name ?? ""}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Mes presets</h1>
        <p className="text-slate-400 mt-1">
          Sauvegardez et partagez différentes configurations de votre overlay.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onLoad={() => handleLoad(preset)}
            onRename={() => setRenameTarget({ id: preset.id, name: preset.name })}
            onDelete={() => setDeleteTarget({ id: preset.id, name: preset.name })}
            onCopyLink={() => handleCopyLink(preset)}
          />
        ))}
      </div>

      <RenamePresetDialog
        open={!!renameTarget}
        currentName={renameTarget?.name ?? ""}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        presetName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
