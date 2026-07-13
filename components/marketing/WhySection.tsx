import { Badge } from "@/components/ui/badge";

const DIFFERENCES = [
  {
    title: "Basé sur des données réelles",
    description: "ValoStats utilise l'API officielle Riot Games. Chaque statistique affichée vient directement de vos parties.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Synchronisation automatique",
    description: "Liez votre compte Riot une fois pour toutes. ValoStats importe chaque nouveau match automatiquement.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  {
    title: "Analyse sans parti pris",
    description: "Pas de suppositions, pas d'avis subjectifs. L'IA se base uniquement sur vos données de match pour ses recommandations.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    title: "Respect de votre vie privée",
    description: "Vos données vous appartiennent. Contrôlez la visibilité de votre profil, exportez vos données à tout moment.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Conçu par des joueurs",
    description: "L'outil est pensé pour les joueurs Valorant, avec les métriques qui comptent vraiment pour progresser.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Gratuit pour commencer",
    description: "Accédez à vos statistiques et à 5 analyses IA par mois sans aucun engagement ni carte bancaire.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function WhySection() {
  return (
    <section className="py-20 lg:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="info" size="sm" className="mb-4">Pourquoi ValoStats</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Ce qui nous{" "}
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              différencie
            </span>
          </h2>
          <p className="text-text-muted mt-4 leading-relaxed">
            Une approche différente : des données réelles, une analyse objective, une confidentialité totale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIFFERENCES.map((item) => (
            <div key={item.title} className="flex gap-4 p-5 bg-surface border border-border rounded-2xl hover-lift transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

