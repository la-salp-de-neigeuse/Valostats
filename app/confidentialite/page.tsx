import type { Metadata } from "next";
import { PRIVACY_SECTIONS, LEGAL_CONTACT } from "@/lib/legal/content";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalCard } from "@/components/legal/LegalCard";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de confidentialité de ValoStats : collecte, utilisation et protection de vos données.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de Confidentialité"
      description={`Comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD. Dernière mise à jour : ${LEGAL_CONTACT.lastUpdate}.`}
    >
      {PRIVACY_SECTIONS.map((section) => (
        <LegalCard
          key={section.id}
          title={section.title}
          content={section.content}
          items={"items" in section ? section.items : undefined}
          details={"details" in section ? section.details : undefined}
        />
      ))}
    </LegalPageLayout>
  );
}
