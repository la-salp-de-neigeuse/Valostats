"use client";

import { useState, useEffect } from "react";
import { SocialPlatform, SocialLinkVisibility } from "@prisma/client";
import { Section } from "@/components/ui/section";
import { FieldGroup } from "@/components/ui/field-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SocialIcon } from "@/components/social/SocialIcons";

interface SocialLinkItem {
  id: string;
  platform: SocialPlatform;
  url: string;
  visibility: SocialLinkVisibility;
  displayOrder: number;
}

const PLATFORMS = Object.values(SocialPlatform);

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  TWITCH: "Twitch",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  X: "X (Twitter)",
  DISCORD: "Discord",
  INSTAGRAM: "Instagram",
  KICK: "Kick",
};

const VISIBILITY_OPTIONS: { value: SocialLinkVisibility; label: string; desc: string }[] = [
  { value: "PUBLIC", label: "Public", desc: "Visible par tout le monde" },
  { value: "CONNECTED_ONLY", label: "Connectés", desc: "Visible uniquement par les utilisateurs connectés" },
  { value: "HIDDEN", label: "Masqué", desc: "Visible seulement par vous" },
];

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  TWITCH: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  TIKTOK: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  YOUTUBE: "border-red-500/30 bg-red-500/10 text-red-400",
  X: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  DISCORD: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  INSTAGRAM: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400",
  KICK: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

function LinkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { platform: SocialPlatform; url: string; visibility: SocialLinkVisibility };
  onSave: (data: { platform: SocialPlatform; url: string; visibility: SocialLinkVisibility }) => Promise<void>;
  onCancel: () => void;
}) {
  const [platform, setPlatform] = useState<SocialPlatform>(initial?.platform ?? PLATFORMS[0]);
  const [url, setUrl] = useState(initial?.url ?? "");
  const [visibility, setVisibility] = useState<SocialLinkVisibility>(initial?.visibility ?? "PUBLIC");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("L'URL est requise.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("L'URL doit être valide (ex: https://twitch.tv/username).");
      return;
    }

    setSaving(true);
    try {
      await onSave({ platform, url: url.trim(), visibility });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-surface-hover/20 border border-border rounded-xl">
      <FieldGroup label="Plateforme">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all ${
                platform === p
                  ? PLATFORM_COLORS[p]
                  : "border-border text-text-muted hover:border-border-hover hover:text-text-secondary bg-transparent"
              }`}
              title={PLATFORM_LABELS[p]}
            >
              <SocialIcon platform={p} className="w-5 h-5" />
              <span className="hidden sm:inline">{PLATFORM_LABELS[p]}</span>
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="URL">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://twitch.tv/username"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          autoFocus
        />
      </FieldGroup>

      <FieldGroup label="Visibilité">
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                visibility === opt.value
                  ? "bg-accent-light text-accent border border-accent/30"
                  : "bg-surface-hover/50 text-text-muted border border-border hover:border-border-hover"
              }`}
              title={opt.desc}
            >
              <span className="block font-semibold">{opt.label}</span>
              <span className="block text-[10px] mt-0.5 opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </FieldGroup>

      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" size="sm" isLoading={saving}>
          {initial ? "Enregistrer" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}

export function SocialSection() {
  const { addToast } = useToast();
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/user/social");
        if (!res.ok) throw new Error("Erreur lors du chargement.");
        const data = await res.json();
        if (mounted) setLinks(data.links);
      } catch {
        if (mounted) addToast({ variant: "error", title: "Erreur", description: "Impossible de charger vos liens." });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [addToast]);

  async function handleCreate(data: { platform: SocialPlatform; url: string; visibility: SocialLinkVisibility }) {
    const res = await fetch("/api/user/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de l'ajout.");
    }
    const result = await res.json();
    setLinks((prev) => [...prev, result.link]);
    setShowForm(false);
    addToast({ variant: "success", title: "Lien ajouté" });
  }

  async function handleUpdate(id: string, data: { platform: SocialPlatform; url: string; visibility: SocialLinkVisibility }) {
    const res = await fetch(`/api/user/social/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la modification.");
    }
    const result = await res.json();
    setLinks((prev) => prev.map((l) => (l.id === id ? result.link : l)));
    setEditingId(null);
    addToast({ variant: "success", title: "Lien modifié" });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/user/social/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression.");
      setLinks((prev) => prev.filter((l) => l.id !== id));
      addToast({ variant: "success", title: "Lien supprimé" });
    } catch {
      addToast({ variant: "error", title: "Erreur", description: "Impossible de supprimer le lien." });
    } finally {
      setDeletingId(null);
    }
  }

  const usedPlatforms = new Set(links.map((l) => l.platform));
  const availablePlatforms = PLATFORMS.filter((p) => !usedPlatforms.has(p));

  return (
    <Section title="Réseaux sociaux" description="Ajoutez vos réseaux sociaux pour les afficher sur votre profil.">
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-text-muted">Chargement...</p>
        ) : links.length === 0 && !showForm ? (
          <p className="text-sm text-text-muted">Aucun réseau social ajouté.</p>
        ) : (
          links.map((link) => (
            <div key={link.id}>
              {editingId === link.id ? (
                <LinkForm
                  initial={{ platform: link.platform, url: link.url, visibility: link.visibility }}
                  onSave={(data) => handleUpdate(link.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-hover/30 border border-border">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg border ${PLATFORM_COLORS[link.platform].split(" ").slice(0, 2).join(" ")}`}>
                    <SocialIcon platform={link.platform} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{PLATFORM_LABELS[link.platform]}</p>
                    <p className="text-xs text-text-muted truncate">{link.url}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    link.visibility === "PUBLIC"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : link.visibility === "CONNECTED_ONLY"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-slate-500/30 bg-slate-500/10 text-slate-400"
                  }`}>
                    {VISIBILITY_OPTIONS.find((o) => o.value === link.visibility)?.label}
                  </span>
                  <button
                    onClick={() => { setEditingId(link.id); setShowForm(false); }}
                    className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
                    aria-label={`Modifier ${PLATFORM_LABELS[link.platform]}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deletingId === link.id}
                    className="p-1.5 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                    aria-label={`Supprimer ${PLATFORM_LABELS[link.platform]}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {showForm && (
          <LinkForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {!showForm && availablePlatforms.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
            onClick={() => { setShowForm(true); setEditingId(null); }}
          >
            Ajouter un réseau
          </Button>
        )}
      </div>
    </Section>
  );
}
