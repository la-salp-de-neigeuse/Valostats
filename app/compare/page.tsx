import type { Metadata } from "next";
import { getComparison } from "@/services/comparison/comparison-service";
import { PlayerSearch } from "@/components/compare/PlayerSearch";
import { CompareView } from "@/components/compare/CompareView";
import type { ComparisonData } from "@/services/comparison/types";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Comparaison",
  description: "Comparez vos statistiques Valorant avec d'autres joueurs : KDA, winrate, ADR et plus.",
};

function CompareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <PageHeader
        icon={<CompareIcon />}
        title="Comparer"
        description="Comparez vos statistiques avec un autre joueur"
      />

      <PlayerSearch />

      {comparison && (
        <CompareView data={comparison} />
      )}
    </div>
  );
}
