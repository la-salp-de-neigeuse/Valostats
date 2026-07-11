import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPrediction } from "@/services/prediction/prediction-service";
import { PredictionView } from "@/components/prediction/PredictionView";

export const metadata = {
  title: "Prédiction | ValoStats",
  description: "Moteur de prédiction avancé : rang futur, probabilité de progression, facteurs influents et conseils IA.",
};

export default async function PredictionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const prediction = await getPrediction(user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Prédiction V2</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Moteur de prédiction pondéré · Analyse multi-facteurs · Score IA
            </p>
          </div>
        </div>
      </div>

      {!prediction && (
        <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl inline-flex mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Données insuffisantes</h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Jouez au moins 2 matchs compétitifs avec un rang pour activer le moteur de prédiction personnalisé.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {["Winrate", "K/D", "ADR", "ACS", "Score IA", "Régularité"].map((m) => (
              <div key={m} className="bg-slate-800/40 rounded-xl py-2 px-3 text-xs font-semibold text-slate-500">
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {prediction && <PredictionView data={prediction} />}
    </div>
  );
}
