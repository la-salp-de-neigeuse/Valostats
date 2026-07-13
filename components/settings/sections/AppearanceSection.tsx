"use client";

import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/theme/ThemeProvider";

const THEMES = [
  { value: "dark" as const, label: "Sombre", icon: "🌙" },
  { value: "light" as const, label: "Clair", icon: "☀️" },
  { value: "midnight" as const, label: "Minuit", icon: "🌌" },
];

export function AppearanceSection() {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();

  function handleChange(value: string) {
    setTheme(value as "dark" | "light" | "midnight");
    addToast({ variant: "success", title: "Thème modifié." });
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Apparence</h2>
        <p className="text-sm text-text-muted">{"Personnalisez l'apparence de l'interface."}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleChange(t.value)}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
              theme === t.value
                ? "border-accent bg-accent-light"
                : "border-border bg-surface-hover/20 hover:border-border-hover hover:bg-surface-hover/30"
            }`}
          >
            <span className="text-3xl">{t.icon}</span>
            <span className={`text-sm font-semibold ${theme === t.value ? "text-accent" : "text-text-secondary"}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

