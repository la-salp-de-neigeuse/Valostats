"use client";

import { useSettingSave } from "@/hooks/use-setting-save";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field-group";
import { Button } from "@/components/ui/button";

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
  const initial = { theme: initialTheme, widgets: initialWidgets };
  const { data, setData, hasChanges, saving, save, error, success } = useSettingSave({
    endpoint: "/api/settings",
    initialData: initial,
    transformPayload: (d) => ({ overlay: { theme: d.theme, widgets: d.widgets } }),
    successMessage: "Overlay mis à jour.",
  });

  function toggleWidget(key: string) {
    setData({ ...data, widgets: { ...data.widgets, [key]: !data.widgets[key] } });
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Overlay</h2>
        <p className="text-sm text-text-muted">{"Personnalisez l'apparence et les widgets de votre overlay."}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
        <FieldGroup label="Thème">
          <div className="flex gap-2 flex-wrap">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setData({ ...data, theme: t.value })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  data.theme === t.value
                    ? "bg-accent-light text-accent border border-accent/30"
                    : "bg-surface-hover/50 text-text-muted border border-border hover:border-border-hover"
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-hover/30 border border-border cursor-pointer hover:bg-surface-hover/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={data.widgets[key] ?? false}
                  onChange={() => toggleWidget(key)}
                  className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        </FieldGroup>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        {success && !saving && <p className="text-sm text-emerald-400" role="status">Overlay mis à jour.</p>}

        <Button type="submit" isLoading={saving} disabled={!hasChanges}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}

