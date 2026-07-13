"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";

interface RiotSectionProps {
  gameName: string | null;
  tagLine: string | null;
}

export function RiotSection({ gameName, tagLine }: RiotSectionProps) {
  const { addToast } = useToast();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [riotGameName, setRiotGameName] = useState("");
  const [riotTagLine, setRiotTagLine] = useState("");
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLinked = !!gameName;

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!riotGameName.trim() || !riotTagLine.trim()) {
      setError("Le nom de summoner et le tag sont requis.");
      return;
    }

    setLinking(true);
    try {
      const res = await fetch("/api/riot/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName: riotGameName.trim(), tagLine: riotTagLine.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la liaison.");
      }

      addToast({ variant: "success", title: "Compte Riot lié ! Synchronisation en cours..." });
      setShowLinkForm(false);
      setRiotGameName("");
      setRiotTagLine("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink() {
    setUnlinking(true);
    try {
      const res = await fetch("/api/riot/unlink", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors du déliage.");
      }
      addToast({ variant: "success", title: "Compte Riot délié." });
      setShowUnlinkConfirm(false);
      window.location.reload();
    } catch (err) {
      addToast({ variant: "error", title: "Erreur", description: err instanceof Error ? err.message : "Erreur inattendue." });
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Compte Riot</h2>
        <p className="text-sm text-text-muted">Gérez la liaison de votre compte Riot Games.</p>
      </div>

      {isLinked ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{gameName}#{tagLine}</p>
              <p className="text-xs text-text-muted mt-0.5">Compte lié et synchronisé</p>
            </div>
          </div>

          <Button variant="danger" size="sm" onClick={() => setShowUnlinkConfirm(true)}>
            Délier le compte Riot
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Aucun compte lié</p>
              <p className="text-xs text-text-muted mt-0.5">Lie ton compte Riot pour accéder à toutes les fonctionnalités.</p>
            </div>
          </div>

          {showLinkForm ? (
            <form onSubmit={handleLink} className="space-y-4">
              <FieldGroup label="Nom de summoner">
                <input
                  type="text"
                  value={riotGameName}
                  onChange={(e) => setRiotGameName(e.target.value)}
                  placeholder="Ex: Lezox"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </FieldGroup>
              <FieldGroup label="Tag">
                <input
                  type="text"
                  value={riotTagLine}
                  onChange={(e) => setRiotTagLine(e.target.value)}
                  placeholder="Ex: EUW"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </FieldGroup>

              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

              <div className="flex gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" isLoading={linking}>
                  Lier
                </Button>
              </div>
            </form>
          ) : (
            <Button size="sm" onClick={() => setShowLinkForm(true)}>
              Lier un compte Riot
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showUnlinkConfirm}
        onClose={() => setShowUnlinkConfirm(false)}
        onConfirm={handleUnlink}
        title="Délier le compte Riot"
        description="Les données importées resteront sur ton compte, mais les futures synchronisations ne seront plus effectuées."
        confirmLabel="Délier"
        loading={unlinking}
      />
    </Card>
  );
}
