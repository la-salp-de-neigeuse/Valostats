import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du service ValoStats.",
};

export default function CguPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales d&apos;Utilisation</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Objet</h2>
          <p>
            Les présentes CGU régissent l&apos;utilisation du service ValoStats, plateforme SaaS
            d&apos;analyse et d&apos;amélioration pour joueurs de Valorant.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Abonnement</h2>
          <p>
            Le service est proposé en formule gratuite (Free) et en formule payante (Premium).
            L&apos;abonnement Premium est facturé mensuellement et peut être résilié à tout moment depuis
            votre espace client. Le remboursement n&apos;est pas assuré pour les périodes entamées.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Données</h2>
          <p>
            ValoStats utilise l&apos;API publique Riot Games pour récupérer vos statistiques de jeu.
            Nous ne stockons que les données nécessaires au fonctionnement du service.
            Consultez notre Politique de Confidentialité pour plus d&apos;informations.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Limitation de responsabilité</h2>
          <p>
            ValoStats s&apos;efforce de fournir des données exactes mais ne peut garantir
            l&apos;exactitude absolue des statistiques affichées. Le service est fourni &quot;en l&apos;état&quot;
            sans garantie expresse ou implicite.
          </p>
        </section>
      </div>
    </div>
  );
}
