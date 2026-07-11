"use client";

import { useState } from "react";

const THEMES = [
  { value: "dark", label: "Sombre" },
  { value: "transparent", label: "Transparent" },
  { value: "pink", label: "Rose" },
  { value: "minimal", label: "Minimal" },
];

const WIDGET_LABELS: Record<string, string> = {
  playerName: "Nom du joueur",
  rank: "Rang",
  rr: "RR",
  winRate: "Winrate",
  kda: "K/D",
  aiScore: "Score IA",
  recentMatches: "Derniers matchs",
  lastAgent: "Dernier agent",
  winStreak: "Série de victoires",
  lastResult: "Dernier résultat",
  progression: "Progression",
};

interface OverlaySectionProps {
  initialTheme: string;
  initialWidgets: Record<string, boolean>;
}

export function OverlaySection({ initialTheme, initialWidgets }: OverlaySectionProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [widgets, setWidgets] = useState<Record<string, boolean>>(initialWidgets);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function toggleWidget(key: string) {
    setWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overlay: { theme, widgets } }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      setMessage({ type: "success", text: "Overlay mis à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inattendue." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Overlay" description="Personnalisez l'apparence et les widgets de votre overlay.">
      <form onSubmit={handleSave} className="space-y-6">
        <FieldGroup label="Thème">
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  theme === t.value
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Widgets">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(WIDGET_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={widgets[key] ?? false}
                  onChange={() => toggleWidget(key)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-rose-500 focus:ring-rose-500/30"
                />
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        </FieldGroup>

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
