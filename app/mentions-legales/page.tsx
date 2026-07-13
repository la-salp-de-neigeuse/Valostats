import type { Metadata } from "next";
import { MENTIONS_LEGALES_SECTIONS, LEGAL_CONTACT } from "@/lib/legal/content";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalCard } from "@/components/legal/LegalCard";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales de ValoStats, plateforme SaaS d'analyse et d'amélioration pour joueurs Valorant.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout
      title="Mentions Légales"
      description={`Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique. Dernière mise à jour : ${LEGAL_CONTACT.lastUpdate}.`}
    >
      {MENTIONS_LEGALES_SECTIONS.map((section) => (
        <LegalCard
          key={section.id}
          title={section.title}
          content={section.content}
          details={section.details}
        />
      ))}
    </LegalPageLayout>
  );
}
