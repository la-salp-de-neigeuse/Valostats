import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    title: "Données officielles",
    description: "Toutes les statistiques proviennent de l'API Riot Games.",
  },
  {
    title: "Analyse par IA",
    description: "Des insights exploitables générés automatiquement.",
  },
  {
    title: "Dashboard complet",
    description: "Performance, agents, maps, évolution et prédictions.",
  },
  {
    title: "Overlay stream",
    description: "Affichage personnalisable en direct pour vos streams.",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-accent/5 to-transparent border border-accent/10 rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <Badge variant="premium" size="sm" className="mb-3">ValoStats</Badge>
            <p className="text-text-muted text-sm">
              Tout ce dont vous avez besoin pour progresser
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center">
                <div className="text-base font-semibold text-text-primary mb-1">
                  {f.title}
                </div>
                <div className="text-sm text-text-muted leading-relaxed">{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
