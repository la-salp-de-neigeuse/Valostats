import { Badge } from "@/components/ui/badge";

const THEMES = [
  { name: "Sombre", colors: "bg-zinc-900 border-zinc-700", textColor: "text-white" },
  { name: "Transparent", colors: "bg-zinc-900/40 border-zinc-700/50", textColor: "text-white" },
  { name: "Minimal", colors: "bg-white border-gray-200", textColor: "text-gray-900" },
];

const WIDGETS = [
  { name: "Rang", desc: "Rang actuel, RR et évolution" },
  { name: "KDA", desc: "Kills, deaths, assists dernière partie" },
  { name: "Winrate", desc: "Winrate session et saison" },
  { name: "Score IA", desc: "Score de performance global" },
];

export function OverlayPreview() {
  return (
    <section className="py-20 lg:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="premium" size="sm">Overlay</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Affichez vos stats{" "}
              <span className="text-transparent bg-clip-text bg-gradient-brand">
                en direct
              </span>
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Un overlay personnalisable pour vos streams OBS, Streamlabs ou TikTok Live.
              Choisissez vos widgets, leurs couleurs et leur disposition.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Widgets disponibles</h3>
                <div className="grid grid-cols-2 gap-2">
                  {WIDGETS.map((w) => (
                    <div key={w.name} className="bg-surface border border-border rounded-xl p-3">
                      <p className="text-xs font-semibold text-text-primary">{w.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">{"Thèmes prêts à l'emploi"}</h3>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <div key={t.name} className={`flex-1 h-12 rounded-xl border ${t.colors} flex items-center justify-center`}>
                      <span className={`text-xs font-medium opacity-70 ${t.textColor}`}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Configuration overlay
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-text-secondary">Widget Rang</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-8 h-4 bg-surface-hover rounded-full peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-text-secondary">Widget KDA</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-8 h-4 bg-surface-hover rounded-full peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-text-secondary">Widget Winrate</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-8 h-4 bg-surface-hover rounded-full peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-text-secondary">Widget Score IA</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-8 h-4 bg-surface-hover rounded-full peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              </div>

              <div className="bg-background/80 border border-border rounded-xl p-4 mt-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-3">Aperçu en direct</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-surface-hover/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-text-muted">Rang</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">---</p>
                  </div>
                  <div className="flex-1 bg-surface-hover/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-text-muted">KDA</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">---</p>
                  </div>
                  <div className="flex-1 bg-surface-hover/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-text-muted">Winrate</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">---</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

