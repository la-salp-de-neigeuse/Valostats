import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    price: "0 €",
    period: "/mois",
    description: "Parfait pour découvrir l'outil et suivre vos stats de base.",
    features: [
      { label: "Statistiques de base", included: true },
      { label: "5 analyses IA / mois", included: true },
      { label: "Classement global", included: true },
      { label: "Historique 30 jours", included: true },
      { label: "Analyses IA illimitées", included: false },
      { label: "Graphiques d'évolution", included: false },
      { label: "Support prioritaire", included: false },
    ],
    href: "/register",
    highlight: false,
  },
  {
    name: "Premium",
    price: "9,99 €",
    period: "/mois",
    description: "Pour les joueurs sérieux qui veulent maximiser leur progression.",
    features: [
      { label: "Statistiques de base", included: true },
      { label: "Analyses IA illimitées", included: true },
      { label: "Classement global", included: true },
      { label: "Historique complet", included: true },
      { label: "Graphiques d'évolution", included: true },
      { label: "Export de données", included: true },
      { label: "Support prioritaire", included: true },
    ],
    href: "/register",
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="premium" size="sm" className="mb-4">Tarifs</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Un prix adapté à votre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              ambition
            </span>
          </h2>
          <p className="text-text-muted mt-4 leading-relaxed">
            Commencez gratuitement et passez à Premium quand vous êtes prêt à aller plus loin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border relative ${
                plan.highlight
                  ? "bg-gradient-to-br from-accent/10 to-transparent border-accent/30 shadow-glow"
                  : "bg-surface border-border"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-sm text-text-muted mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-sm text-text-muted">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-success">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    <span className={feature.included ? "text-text-secondary" : "text-text-muted"}>{feature.label}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="block">
                <Button variant={plan.highlight ? "premium" : "secondary"} className="w-full">
                  {plan.highlight ? "Passer à Premium" : "Commencer gratuitement"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
