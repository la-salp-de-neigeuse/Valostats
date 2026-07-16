import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { HeroSection } from "@/components/notre-application/HeroSection";
import { PresentationSection } from "@/components/notre-application/PresentationSection";
import { PourquoiSection } from "@/components/notre-application/PourquoiSection";
import { FeaturesSection } from "@/components/notre-application/FeaturesSection";
import { ScreenshotsSection } from "@/components/notre-application/ScreenshotsSection";
import { OverlayCaptureSection } from "@/components/notre-application/OverlayCaptureSection";
import { ComparisonSection } from "@/components/notre-application/ComparisonSection";
import { FaqSection } from "@/components/notre-application/FaqSection";
import { SystemRequirements } from "@/components/notre-application/SystemRequirements";
import { DownloadSection } from "@/components/notre-application/DownloadSection";

export const metadata: Metadata = {
  title: "ValoStats Companion - Application desktop pour Valorant",
  description:
    "Découvrez ValoStats Companion, l'application Windows native qui transforme votre expérience Valorant : overlay Pre Game Coach, analyse IA en temps réel, détection automatique des parties.",
  openGraph: {
    title: "ValoStats Companion - Application desktop",
    description:
      "L'application Windows qui analyse vos parties Valorant en temps réel avec un overlay intelligent.",
    type: "website",
  },
  keywords: [
    "Valorant",
    "ValoStats",
    "application desktop",
    "overlay",
    "analyse IA",
    "Pre Game Coach",
    "Windows",
    "tracker",
    "statistiques",
  ],
  alternates: {
    canonical: "/notre-application",
  },
};

export default function NotreApplicationPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <PresentationSection />
        <PourquoiSection />
        <FeaturesSection />
        <ScreenshotsSection />
        <OverlayCaptureSection />
        <ComparisonSection />
        <FaqSection />
        <SystemRequirements />
        <DownloadSection />
      </main>
      <Footer />
    </>
  );
}
