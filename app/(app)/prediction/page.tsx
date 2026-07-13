import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPrediction } from "@/services/prediction/prediction-service";
import { PredictionView } from "@/components/prediction/PredictionView";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Prédiction | ValoStats",
  description: "Moteur de prédiction avancé : rang futur, probabilité de progression, facteurs influents et conseils IA.",
};

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export default async function PredictionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prediction = await getPrediction(user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        icon={<ChartIcon />}
        title="Prédiction V2"
        description="Moteur de prédiction pondéré · Analyse multi-facteurs · Score IA"
      />

      {!prediction && (
        <Card className="p-12 text-center">
          <div className="p-4 bg-surface-hover/50 rounded-2xl inline-flex mb-6 text-text-muted">
            <ChartIcon />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Données insuffisantes</h2>
          <p className="text-text-muted max-w-md mx-auto leading-relaxed">
            Jouez au moins 2 matchs compétitifs avec un rang pour activer le moteur de prédiction personnalisé.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {["Winrate", "K/D", "ADR", "ACS", "Score IA", "Régularité"].map((m) => (
              <div key={m} className="bg-surface-hover/30 rounded-xl py-2 px-3 text-xs font-semibold text-text-muted">
                {m}
              </div>
            ))}
          </div>
        </Card>
      )}

      {prediction && <PredictionView data={prediction} />}
    </div>
  );
}
