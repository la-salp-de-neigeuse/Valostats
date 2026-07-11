function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const BENEFITS = [
  {
    title: "Gratuit pour commencer",
    description: "Accédez à vos statistiques de base et à 5 analyses IA par mois sans aucun paiement.",
  },
  {
    title: "Mise à jour automatique",
    description: "Synchronisez vos matchs en un clic via votre compte Riot. Vos stats sont toujours à jour.",
  },
  {
    title: "Analyse IA sans effort",
    description: "Notre moteur d'analyse examine vos performances et génère des conseils personnalisés automatiquement.",
  },
  {
    title: "Données privées et sécurisées",
    description: "Vos données sont chiffrées et protégées. Contrôlez la visibilité de votre profil à tout moment.",
  },
  {
    title: "Comparaison classement",
    description: "Visualisez votre position dans le classement général et par région pour mesurer votre progression.",
  },
  {
    title: "Graphiques d'évolution",
    description: "Suivez l'évolution de vos performances dans le temps avec des visualisations claires et interactives.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Pourquoi choisir{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              ValoStats
            </span>
            ?
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Une plateforme conçue pour les joueurs qui veulent passer au niveau supérieur.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckIcon />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
