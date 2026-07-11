import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité de ValoStats : collecte, utilisation et protection de vos données.",
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Données collectées</h2>
          <p>
            Nous collectons les données nécessaires au fonctionnement du service : adresse email,
            pseudonyme, statistiques de jeu Valorant (via l&apos;API Riot Games), et informations de paiement
            (via Stripe, nous ne stockons pas les données bancaires).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Cookies</h2>
          <p>
            ValoStats utilise des cookies techniques strictement nécessaires au fonctionnement
            de l&apos;authentification (session JWT) et à la sécurité du service. Aucun cookie
            publicitaire ou de tracking tiers n&apos;est utilisé.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Partage des données</h2>
          <p>
            Vos données ne sont jamais revendues à des tiers. Elles sont partagées uniquement
            avec nos sous-traitants techniques (Vercel pour l&apos;hébergement, Stripe pour les
            paiements, Supabase pour la base de données) dans le strict nécessaire à leur
            prestation.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
            suppression de vos données. Pour exercer ces droits, contactez-nous à
            privacy@valostats.app.
          </p>
        </section>
      </div>
    </div>
  );
}
