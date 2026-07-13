import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Changelog - ValoStats",
  description: "Historique des mises à jour de ValoStats.",
};

const VERSIONS = [
  {
    version: "1.3.0",
    date: "12 juillet 2026",
    items: [
      "Ajout du système de réseaux sociaux sur le profil",
      "Refonte complète de la page de profil utilisateur",
      "Nouvelle bannière et avatar personnalisables",
      "Options de confidentialité avancées",
    ],
  },
  {
    version: "1.2.0",
    date: "5 juillet 2026",
    items: [
      "Nouveau design system unifié",
      "Refonte de la landing page",
      "Migration de tous les paramètres vers le nouveau design",
      "Optimisation des performances du tableau de bord",
      "Cache Redis pour les services de matchs et comparaison",
    ],
  },
  {
    version: "1.1.0",
    date: "28 juin 2026",
    items: [
      "Ajout du coach IA avec analyses personnalisées",
      "Système d'objectifs et suivi de progression",
      "Overlay personnalisable pour le streaming",
      "Correctifs de sécurité et optimisations",
    ],
  },
  {
    version: "1.0.0",
    date: "15 juin 2026",
    items: [
      "Lancement officiel de ValoStats",
      "Authentification et création de compte",
      "Connexion compte Riot Games",
      "Analyse automatique des matchs",
      "Statistiques détaillées et graphiques d'évolution",
      "Classement communautaire",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Changelog"
        description="Retrouvez l'historique complet des mises à jour de ValoStats."
      />

      <div className="space-y-6">
        {VERSIONS.map((v) => (
          <Card key={v.version} padding="lg">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-lg font-bold text-text-primary">v{v.version}</h2>
              <Badge variant="default">{v.date}</Badge>
            </div>
            <ul className="space-y-2">
              {v.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
