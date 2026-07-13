"use client";

import { useState } from "react";
import type { UserProfile } from "@/services/users/user-service";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { FieldGroup } from "@/components/ui/field-group";

interface ProfilePrivacyOptionsProps {
  user: UserProfile;
  showGoals: boolean;
  showRecentMatches: boolean;
  onToast: (variant: "success" | "error", title: string, description?: string) => void;
}

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Privé" },
];

export function ProfilePrivacyOptions({ user, showGoals, showRecentMatches, onToast }: ProfilePrivacyOptionsProps) {
  const [visibility, setVisibility] = useState(user.visibility);
  const [showRank, setShowRank] = useState(user.settings.showRankPublicly);
  const [showMatches, setShowMatches] = useState(user.settings.showMatchHistory);
  const [showAi, setShowAi] = useState(user.settings.showAiScore);
  const [allowLeaderboard, setAllowLeaderboard] = useState(user.settings.allowLeaderboard);
  const [goals, setGoals] = useState(showGoals);
  const [recentMatches, setRecentMatches] = useState(showRecentMatches);

  function buildStandardPayload() {
    return {
      visibility,
      showRankPublicly: showRank,
      showMatchHistory: showMatches,
      showAiScore: showAi,
      allowLeaderboard,
    };
  }

  async function saveStandard() {
    try {
      const res = await fetch("/api/user/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildStandardPayload()),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }
      onToast("success", "Paramètre mis à jour");
    } catch (err) {
      onToast("error", "Erreur", err instanceof Error ? err.message : "Impossible d'enregistrer.");
    }
  }

  async function saveExtended(field: "showGoals" | "showRecentMatches", value: boolean) {
    try {
      const res = await fetch("/api/user/profile/privacy-extended", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }
      onToast("success", "Paramètre mis à jour");
    } catch (err) {
      onToast("error", "Erreur", err instanceof Error ? err.message : "Impossible d'enregistrer.");
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
      <h3 className="text-sm font-medium text-text-secondary">Confidentialité</h3>

      <FieldGroup label="Visibilité du profil">
        <Select
          value={visibility}
          onChange={(v) => { setVisibility(v as "PUBLIC" | "PRIVATE"); saveStandard(); }}
          options={VISIBILITY_OPTIONS}
        />
        <p className="text-xs text-text-muted mt-1">
          {visibility === "PUBLIC"
            ? "Votre profil est visible par tous et apparaît dans les recherches."
            : "Votre profil est visible uniquement via un lien direct."}
        </p>
      </FieldGroup>

      <div className="space-y-2">
        <Switch
          checked={showRank}
          onChange={(v) => { setShowRank(v); saveStandard(); }}
          label="Afficher mon rang"
        />
        <Switch
          checked={showMatches}
          onChange={(v) => { setShowMatches(v); saveStandard(); }}
          label="Afficher mon historique de matchs"
        />
        <Switch
          checked={showAi}
          onChange={(v) => { setShowAi(v); saveStandard(); }}
          label="Afficher mon score IA"
        />
        <Switch
          checked={allowLeaderboard}
          onChange={(v) => { setAllowLeaderboard(v); saveStandard(); }}
          label="Autoriser l'affichage dans le classement"
        />
        <Switch
          checked={goals}
          onChange={(v) => { setGoals(v); saveExtended("showGoals", v); }}
          label="Afficher mes objectifs"
        />
        <Switch
          checked={recentMatches}
          onChange={(v) => { setRecentMatches(v); saveExtended("showRecentMatches", v); }}
          label="Afficher mes derniers matchs"
        />
      </div>
    </div>
  );
}
