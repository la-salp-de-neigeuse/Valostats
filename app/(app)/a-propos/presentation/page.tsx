import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Présentation - ValoStats",
  description: "Découvrez ValoStats, la plateforme SaaS d'analyse et d'amélioration pour joueurs Valorant.",
};

const FEATURES = [
  {
    title: "Analyse de performance",
    desc: "Statistiques détaillées, évolution de votre rank, winrate, KDA, headshot et bien plus.",
  },
  {
    title: "Coach IA",
    desc: "Obtenez des insights personnalisés générés par intelligence artificielle pour progresser plus vite.",
  },
  {
    title: "Objectifs & progression",
    desc: "Définissez des objectifs, suivez votre progression et restez motivé.",
  },
  {
    title: "Overlay temps réel",
    desc: "Affichez vos statistiques en direct pendant vos parties avec notre overlay personnalisable.",
  },
  {
    title: "Classement",
    desc: "Comparez-vous aux autres joueurs et grimpez dans le classement communautaire.",
  },
  {
    title: "Prédictions",
    desc: "Anticipez votre évolution de rank grâce à nos algorithmes de prédiction.",
  },
];

export default function PresentationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Présentation"
        description="ValoStats est une plateforme SaaS conçue pour les joueurs Valorant souhaitant analyser leurs performances et progresser."
      />

      <Card padding="lg">
        <p className="text-text-secondary leading-relaxed mb-6">
          {"ValoStats est né d'une passion commune pour Valorant et l'analyse de données. Notre mission est de fournir à chaque joueur, du débutant au professionnel, les outils nécessaires pour comprendre son jeu, identifier ses axes d'amélioration et suivre sa progression au fil du temps."}
        </p>
        <p className="text-text-secondary leading-relaxed">
          {"En connectant votre compte Riot Games, vous accédez automatiquement à l'ensemble de vos statistiques de matchs. Nos algorithmes d'intelligence artificielle analysent vos parties pour vous fournir des conseils personnalisés et actionnables."}
        </p>
      </Card>

      <h2 className="text-xl font-bold text-text-primary">Fonctionnalités principales</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <Card key={f.title} hover>
            <h3 className="font-semibold text-text-primary mb-1">{f.title}</h3>
            <p className="text-sm text-text-secondary">{f.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

