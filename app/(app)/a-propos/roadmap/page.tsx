import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Roadmap - ValoStats",
  description: "Les prochaines fonctionnalités prévues sur ValoStats.",
};

const ITEMS = [
  {
    status: "done" as const,
    title: "Analyse de matchs",
    desc: "Import et analyse automatique de vos matchs Valorant.",
  },
  {
    status: "done" as const,
    title: "Coach IA",
    desc: "Insights personnalisés générés par intelligence artificielle.",
  },
  {
    status: "done" as const,
    title: "Overlay personnalisable",
    desc: "Affichage en direct de vos statistiques pendant les parties.",
  },
  {
    status: "done" as const,
    title: "Système d'objectifs",
    desc: "Définissez et suivez vos objectifs de progression.",
  },
  {
    status: "progress" as const,
    title: "Mode comparatif avancé",
    desc: "Comparez vos statistiques avec d'autres joueurs en détail.",
  },
  {
    status: "progress" as const,
    title: "Support multilingue",
    desc: "Interface disponible en plusieurs langues.",
  },
  {
    status: "todo" as const,
    title: "Application mobile",
    desc: "Accédez à vos statistiques depuis votre téléphone.",
  },
  {
    status: "todo" as const,
    title: "Intégration Discord",
    desc: "Recevez vos notifications et statistiques directement sur Discord.",
  },
  {
    status: "todo" as const,
    title: "Analyses d'équipe",
    desc: "Statistiques et recommandations pour votre équipe complète.",
  },
];

const STATUS_LABELS: Record<string, string> = {
  done: "Fait",
  progress: "En cours",
  todo: "À venir",
};

const STATUS_COLORS: Record<string, "success" | "warning" | "default"> = {
  done: "success",
  progress: "warning",
  todo: "default",
};

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Roadmap"
        description="Découvrez les fonctionnalités déjà disponibles et celles à venir sur ValoStats."
      />

      <div className="space-y-4">
        {ITEMS.map((item) => (
          <Card key={item.title} padding="md" hover>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  item.status === "done" ? "bg-emerald-500"
                  : item.status === "progress" ? "bg-amber-500"
                  : "bg-slate-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  <Badge variant={STATUS_COLORS[item.status]}>
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
