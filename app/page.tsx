import type { Metadata } from "next";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { CTASection } from "@/components/marketing/CTASection";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { Footer } from "@/components/marketing/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { Navbar } from "@/components/marketing/Navbar";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "ValoStats - Analyse et amélioration pour joueurs Valorant",
  description:
    "Suivez vos performances Valorant avec des statistiques détaillées, un coach IA, un overlay pour streamer, et comparez-vous aux meilleurs joueurs.",
  openGraph: {
    title: "ValoStats - Analyse et amélioration pour joueurs Valorant",
    description:
      "Suivez vos performances Valorant avec des statistiques détaillées, un coach IA, un overlay pour streamer, et comparez-vous aux meilleurs joueurs.",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <DashboardPreview />
        <BenefitsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
