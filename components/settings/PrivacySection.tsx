"use client";

import { useState } from "react";
import type { PrivacySettings } from "@/services/settings/types";

interface PrivacySectionProps {
  initial: PrivacySettings;
}

export function PrivacySection({ initial }: PrivacySectionProps) {
  const [visibility, setVisibility] = useState(initial.visibility);
  const [showRankPublicly, setShowRankPublicly] = useState(initial.showRankPublicly);
  const [showMatchHistory, setShowMatchHistory] = useState(initial.showMatchHistory);
  const [showAiScore, setShowAiScore] = useState(initial.showAiScore);
  const [allowLeaderboard, setAllowLeaderboard] = useState(initial.allowLeaderboard);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privacy: {
            visibility,
            showRankPublicly,
            showMatchHistory,
            showAiScore,
            allowLeaderboard,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      setMessage({ type: "success", text: "Préférences de confidentialité mises à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inattendue." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Confidentialité" description="Contrôlez qui peut voir vos informations.">
      <form onSubmit={handleSave} className="space-y-6">
        <FieldGroup label="Visibilité du profil">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisibility("PUBLIC")}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                visibility === "PUBLIC"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <span className="block font-semibold">Public</span>
              <span className="block text-xs mt-0.5 opacity-80">Tout le monde peut voir votre profil</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility("PRIVATE")}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                visibility === "PRIVATE"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              <span className="block font-semibold">Privé</span>
              <span className="block text-xs mt-0.5 opacity-80">Seulement vous et vos liens directs</span>
            </button>
          </div>
        </FieldGroup>

        <div className="space-y-3">
          <ToggleField
            label="Rang visible publiquement"
            checked={showRankPublicly}
            onChange={setShowRankPublicly}
          />
          <ToggleField
            label="Historique des matchs public"
            checked={showMatchHistory}
            onChange={setShowMatchHistory}
          />
          <ToggleField
            label="Score IA visible"
            checked={showAiScore}
            onChange={setShowAiScore}
          />
          <ToggleField
            label="Apparaître dans le classement"
            checked={allowLeaderboard}
            onChange={setAllowLeaderboard}
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-400" : "text-rose-400"}`} role="alert">
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          {saving && (
            <svg aria-hidden="true" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Enregistrer
        </button>
      </form>
    </Section>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-rose-500" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
