import { Badge } from "@/components/ui/badge";

const DIMENSIONS = [
  {
    name: "Précision",
    desc: "Headshot rate, kill efficiency, dégâts par rounds",
    color: "#FF4655",
  },
  {
    name: "Prise d'information",
    desc: "Vision du jeu, rotations, utilisation des utility",
    color: "#38BDF8",
  },
  {
    name: "Gestion économique",
    desc: "Achats optimisés, rounds éco, force round",
    color: "#22C55E",
  },
  {
    name: "Travail d'équipe",
    desc: "Assists, trades, communication, play autour de l'équipe",
    color: "#A855F7",
  },
  {
    name: "Adaptation",
    desc: "Changement de rythme, adaptation à l'adversaire, side switching",
    color: "#F59E0B",
  },
];

export function AiPreview() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="premium" size="sm" className="mb-4">Coach IA</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Un coach qui analyse{" "}
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              vos données
            </span>
          </h2>
          <p className="text-text-muted mt-4 leading-relaxed">
            Pas de généralités. Notre IA examine vos performances réelles et identifie
            vos axes de progression avec des recommandations précises.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 mb-12">
          {DIMENSIONS.map((d, i) => (
            <div key={d.name} className="bg-surface border border-border rounded-2xl p-5 text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center animate-ai-ring"
                style={{
                  backgroundColor: `${d.color}15`,
                  animationDelay: `${i * 0.6}s`,
                  "--pulse-color": `${d.color}60`,
                } as React.CSSProperties}
              >
                <div
                  className="w-2 h-2 rounded-full animate-ai-dot"
                  style={{
                    backgroundColor: d.color,
                    animationDelay: `${i * 0.6}s`,
                  }}
                />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1" dangerouslySetInnerHTML={{ __html: d.name }} />
              <p className="text-xs text-text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: d.desc }} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent-light rounded-xl text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Comment ça marche</h3>
                <p className="text-xs text-text-muted">Analyse automatique post-synchronisation</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                { step: "1", title: "Synchronisation", desc: "Lie ton compte Riot et importe tes matchs" },
                { step: "2", title: "Analyse", desc: "L'IA examine chaque partie sous toutes les dimensions" },
                { step: "3", title: "Résultats", desc: "Reçois un bilan personnalisé avec tes forces et faiblesses" },
                { step: "4", title: "Recommandations", desc: "Des conseils actionnables pour progresser sur chaque aspect" },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent-light rounded-xl text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{"Ce que l'IA analyse"}</h3>
                <p className="text-xs text-text-muted">{"Facteurs pris en compte dans l'évaluation"}</p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Performance brute : KDA, ADR, HS%, ACS",
                "Efficiency : first blood, clutches, multi-kills",
                "Consistency : écart-type des performances",
                "Agent mastery : stats par agent joué",
                "Map awareness : performance par carte",
                "Trend analysis : progression dans le temps",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

