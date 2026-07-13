import { Badge } from "@/components/ui/badge";

const SECTIONS = [
  {
    title: "Vue d'ensemble",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    items: [
      "Winrate, K/D, ADR, HS% actualisés après chaque match",
      "Graphiques d'évolution sur 7, 30 ou 90 jours",
      "Scores par agent, map et côté (attaque/défense)",
    ],
  },
  {
    title: "Historique des matchs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" />
      </svg>
    ),
    items: [
      "Chaque partie détaillée : kills, assists, deaths, score, durée",
      "Filtrage par agent, map, mode de jeu et période",
      "Visualisation des séquences de victoires/défaites",
    ],
  },
  {
    title: "Comparaison",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    items: [
      "Classement global avec filtres par région et rang",
      "Comparaison directe avec d'autres joueurs",
      "Positionnement par métrique clé",
    ],
  },
  {
    title: "Profil personnalisable",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    items: [
      "Profil public avec vos stats visibles par tous",
      "Mode privé ou visible uniquement sur lien direct",
      "Partage facile vers vos coéquipiers et recruteurs",
    ],
  },
];

export function DashboardPreview() {
  return (
    <section id="overview" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="premium" size="sm" className="mb-4">Aperçu</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Un tableau de bord{" "}
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              complet et clair
            </span>
          </h2>
          <p className="text-text-muted mt-4 leading-relaxed">
            Toutes vos données Valorant centralisées dans une interface pensée pour les joueurs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-surface border border-border rounded-2xl p-6 hover-lift transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-light rounded-xl text-accent">
                  {section.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary" dangerouslySetInnerHTML={{ __html: section.title }} />
              </div>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

