import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MatchHistoryList } from "@/components/matches/MatchHistoryList";
import { getCurrentUser } from "@/lib/auth/session";
import { getMatchHistoryForUser } from "@/services/matches/match-history-service";
import { isPremiumUser } from "@/services/subscription/subscription-service";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Matchs",
  description: "Historique complet de vos parties Valorant avec filtres et analyses.",
};

export default async function MatchesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const premium = await isPremiumUser(user.id);
  const { matches, total } = await getMatchHistoryForUser(user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Historique des matchs"
        description="Retrouvez vos performances issues des synchronisations Riot."
      />

      {!premium && (
        <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-text-muted">
            Affichage limité aux 30 derniers jours. <span className="text-text-primary font-medium">{total}</span> matchs disponibles au total.
          </span>
          <Link
            href="/api/stripe/checkout"
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            {"Passer à Premium pour l'historique complet"}
          </Link>
        </div>
      )}

      <MatchHistoryList matches={matches} total={total} />
    </div>
  );
}

