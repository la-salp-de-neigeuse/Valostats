import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Remerciements - ValoStats",
  description: "Remerciements et crédits de ValoStats.",
};

const THANKS = [
  {
    title: "Riot Games",
    desc: "Pour leur API publique qui permet à ValoStats d'exister et d'afficher les statistiques de jeu.",
  },
  {
    title: "Communauté Valorant",
    desc: "Pour leur soutien, leurs retours et leur passion qui nous motivent à améliorer ValoStats chaque jour.",
  },
  {
    title: "Contributeurs open source",
    desc: "Aux mainteneurs des bibliothèques et frameworks qui rendent ce projet possible : Next.js, Prisma, Supabase, et bien d'autres.",
  },
  {
    title: "Nos bêta-testeurs",
    desc: "Pour leur patience et leurs précieux retours qui ont permis de façonner ValoStats dès les premières versions.",
  },
];

export default function RemerciementsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Remerciements"
        description="ValoStats n'existerait pas sans le travail et le soutien de nombreuses personnes et organisations."
      />

      <Card padding="lg">
        <p className="text-text-secondary leading-relaxed mb-6">
          ValoStats est un projet né de la passion pour Valorant et le développement web.
          Nous tenons à remercier chaleureusement toutes les personnes et organisations qui
          contribuent, directement ou indirectement, à rendre ce service possible.
        </p>
        <p className="text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Note :</strong> {"ValoStats n'est pas affilié à Riot Games, Inc. VALORANT est une marque déposée de Riot Games, Inc. Les données affichées proviennent de l'API publique Riot Games et sont utilisées conformément"}
          à leur politique de développement.
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {THANKS.map((t) => (
          <Card key={t.title} hover padding="lg">
            <h3 className="font-semibold text-text-primary mb-1">{t.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{t.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

