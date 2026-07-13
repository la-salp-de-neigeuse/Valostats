"use client";

import type { PrivacySettings } from "@/services/settings/types";
import { useSettingSave } from "@/hooks/use-setting-save";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface PrivacySectionProps {
  initial: PrivacySettings;
}

export function PrivacySection({ initial }: PrivacySectionProps) {
  const { data, setData, hasChanges, saving, save, error, success } = useSettingSave({
    endpoint: "/api/settings",
    initialData: initial,
    transformPayload: (d) => ({ privacy: d }),
    successMessage: "Préférences de confidentialité mises à jour.",
  });

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Confidentialité</h2>
        <p className="text-sm text-text-muted">Contrôlez qui peut voir vos informations.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
        <FieldGroup label="Visibilité du profil">
          <div className="flex gap-2">
            {(["PUBLIC", "PRIVATE"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setData({ ...data, visibility: v })}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                  data.visibility === v
                    ? "bg-accent-light text-accent border border-accent/30"
                    : "bg-surface-hover/50 text-text-muted border border-border hover:border-border-hover"
                }`}
              >
                <span className="block font-semibold">{v === "PUBLIC" ? "Public" : "Privé"}</span>
                <span className="block text-xs mt-0.5 opacity-80">
                  {v === "PUBLIC" ? "Tout le monde peut voir votre profil" : "Seulement vous et vos liens directs"}
                </span>
              </button>
            ))}
          </div>
        </FieldGroup>

        <div className="space-y-3">
          <Switch label="Rang visible publiquement" checked={data.showRankPublicly} onChange={(v) => setData({ ...data, showRankPublicly: v })} />
          <Switch label="Historique des matchs public" checked={data.showMatchHistory} onChange={(v) => setData({ ...data, showMatchHistory: v })} />
          <Switch label="Score IA visible" checked={data.showAiScore} onChange={(v) => setData({ ...data, showAiScore: v })} />
          <Switch label="Apparaître dans le classement" checked={data.allowLeaderboard} onChange={(v) => setData({ ...data, allowLeaderboard: v })} />
        </div>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        {success && !saving && <p className="text-sm text-emerald-400" role="status">Confidentialité mise à jour.</p>}

        <Button type="submit" isLoading={saving} disabled={!hasChanges}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}
