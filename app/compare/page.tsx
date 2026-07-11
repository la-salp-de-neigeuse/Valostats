import type { Metadata } from "next";
import { getComparison } from "@/services/comparison/comparison-service";
import { PlayerSearch } from "@/components/compare/PlayerSearch";
import { CompareView } from "@/components/compare/CompareView";
import type { ComparisonData } from "@/services/comparison/types";

export const metadata: Metadata = {
  title: "Comparaison",
  description: "Comparez vos statistiques Valorant avec d'autres joueurs : KDA, winrate, ADR et plus.",
};

function CompareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}) {
  const { p1, p2 } = await searchParams;

  let comparison: ComparisonData | null = null;

  if (p1 && p2 && p1 !== p2) {
    comparison = await getComparison(p1, p2);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
          <CompareIcon />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Comparer</h1>
          <p className="text-slate-400 mt-1">Comparez vos statistiques avec un autre joueur</p>
        </div>
      </div>

      <PlayerSearch />

      {comparison && (
        <CompareView data={comparison} />
      )}

      {!comparison && !p1 && !p2 && (
        <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-12 text-center">
          <div className="p-3 bg-slate-800/50 rounded-xl inline-flex mb-4">
            <CompareIcon />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sélectionnez deux joueurs</h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Recherchez et sélectionnez deux joueurs pour comparer leurs statistiques côte à côte.
          </p>
        </div>
      )}

      {p1 && p2 && !comparison && (
        <div className="bg-[#111115] border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-slate-400">Impossible de charger les données pour ces joueurs.</p>
        </div>
      )}
    </div>
  );
}
