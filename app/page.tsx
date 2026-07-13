import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { AiPreview } from "@/components/marketing/AiPreview";
import { StatsSection } from "@/components/marketing/StatsSection";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { OverlayPreview } from "@/components/marketing/OverlayPreview";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "ValoStats - Analyse de performances Valorant",
  description:
    "ValoStats analyse vos performances Valorant avec des données réelles issues de l'API Riot. Coach IA, overlay stream, statistiques avancées. Gratuit pour commencer.",
  openGraph: {
    title: "ValoStats - Analyse de performances Valorant",
    description:
      "Analysez vos performances Valorant avec des données réelles. Coach IA, overlay stream, statistiques avancées.",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AiPreview />
        <StatsSection />
        <DashboardPreview />
        <OverlayPreview />
        <PricingSection />
        <FaqSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
