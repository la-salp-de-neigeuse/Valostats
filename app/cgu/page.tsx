import type { Metadata } from "next";
import { CGU_SECTIONS, LEGAL_CONTACT } from "@/lib/legal/content";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalCard } from "@/components/legal/LegalCard";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation du service ValoStats.",
};

export default function CguPage() {
  return (
    <LegalPageLayout
      title="Conditions Générales d'Utilisation"
      description={`Les présentes CGU régissent l'utilisation du service ValoStats. Dernière mise à jour : ${LEGAL_CONTACT.lastUpdate}.`}
    >
      {CGU_SECTIONS.map((section) => {
        const items = "items" in section ? section.items : undefined;
        const details = "details" in section ? section.details : undefined;
        const paragraphs = "paragraphs" in section ? section.paragraphs : undefined;
        return (
          <LegalCard
            key={section.id}
            title={section.title}
            content={section.content}
            items={items}
            details={details}
            paragraphs={paragraphs}
          />
        );
      })}
    </LegalPageLayout>
  );
}
