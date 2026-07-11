import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales de ValoStats, plateforme SaaS d'analyse et d'amélioration pour joueurs Valorant.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-8">Mentions Légales</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Éditeur</h2>
          <p>
            ValoStats est un service SaaS édité par une société inscrite au RCS.<br />
            Pour nous contacter : contact@valostats.app
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Propriété intellectuelle</h2>
          <p>
            ValoStats n&apos;est pas affilié à Riot Games, Inc. VALORANT est une marque déposée de Riot Games, Inc.
            Les données affichées proviennent de l&apos;API publique Riot Games et sont utilisées conformément
            à leur politique de développement.
          </p>
        </section>
      </div>
    </div>
  );
}
