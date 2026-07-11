import Link from "next/link";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

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
    cta: "Commencer gratuitement",
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
    cta: "Passer à Premium",
    href: "/register",
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium tracking-wider text-rose-400 uppercase mb-4">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Un prix adapté à votre{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              ambition
            </span>
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Commencez gratuitement et passez à Premium quand vous êtes prêt à aller plus loin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border relative ${
                plan.highlight
                  ? "bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/30"
                  : "bg-gradient-to-br from-[#111115] to-[#0a0a0c] border-slate-800"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-center gap-2 text-sm">
                    <span className="flex-shrink-0">{feature.included ? <CheckIcon /> : <CrossIcon />}</span>
                    <span className={feature.included ? "text-slate-300" : "text-slate-600"}>{feature.label}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center font-semibold py-2.5 rounded-xl transition-colors text-sm ${
                  plan.highlight
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
