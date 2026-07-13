"use client";

import { useState } from "react";

interface RenamePresetDialogProps {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (name: string) => Promise<void>;
}

export function RenamePresetDialog({ open, currentName, onClose, onRename }: RenamePresetDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) { setError("Veuillez entrer un nom."); return; }
    setLoading(true);
    try {
      await onRename(trimmed);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Renommer le preset</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rename-preset-name" className="block text-sm font-medium text-text-secondary mb-1.5">
              Nouveau nom
            </label>
            <input
              id="rename-preset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-2 bg-surface-hover border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Renommage..." : "Renommer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
