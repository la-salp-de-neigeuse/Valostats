"use client";

import { useState } from "react";

interface ProfileBioProps {
  bio: string | null;
  onBioChange: (bio: string | null) => void;
  onToast: (variant: "success" | "error", title: string, description?: string) => void;
}

export function ProfileBio({ bio, onBioChange, onToast }: ProfileBioProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const newBio = value.trim() || null;
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile/bio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: newBio }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }
      onBioChange(newBio);
      setEditing(false);
      onToast("success", "Bio mise à jour");
    } catch (err) {
      onToast("error", "Erreur", err instanceof Error ? err.message : "Impossible d'enregistrer la bio.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(bio ?? "");
    setEditing(false);
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-secondary">Bio</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Modifier
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Parlez-nous de vous..."
            className="w-full bg-surface-hover/30 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">{value.length}/500</span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-primary leading-relaxed min-h-[1.25rem]">
          {bio || <span className="text-text-muted italic">Aucune bio renseignée.</span>}
        </p>
      )}
    </div>
  );
}
