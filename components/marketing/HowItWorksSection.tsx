import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    step: "1",
    title: "Synchronisez votre compte Riot",
    description: "Liez votre compte Riot Games en un clic. ValoStats importe automatiquement l'historique de vos matchs.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    step: "2",
    title: "Analyse automatique par l'IA",
    description: "Notre IA examine chaque partie : précision, économie, travail d'équipe, adaptation. Des insights exploitables.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
      </svg>
    ),
  },
  {
    step: "3",
    title: "Suivez votre progression",
    description: "Tableau de bord complet, graphiques d'évolution, leaderboard. Mesurez vos progrès et passez au niveau supérieur.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="premium" size="sm" className="mb-4">Comment ça marche</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            De la synchronisation{" "}
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              à la progression
            </span>
          </h2>
          <p className="text-text-muted mt-4 leading-relaxed">
            Trois étapes simples pour transformer vos données de jeu en axes de progression concrets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-light text-accent flex items-center justify-center mx-auto mb-5">
                {s.icon}
              </div>
              <div className="absolute top-0 left-[calc(50%+3rem)] hidden md:flex items-center justify-center w-8 h-14">
                {s.step !== "3" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent text-xs font-bold mb-3">
                {s.step}
              </span>
              <h3 className="text-base font-semibold text-text-primary mb-2">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto" dangerouslySetInnerHTML={{ __html: s.description }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

