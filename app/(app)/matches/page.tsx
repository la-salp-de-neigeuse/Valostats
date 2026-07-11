import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MatchHistoryList } from "@/components/matches/MatchHistoryList";
import { getCurrentUser } from "@/lib/auth/session";
import { getMatchHistoryForUser } from "@/services/matches/match-history-service";

export const metadata: Metadata = {
  title: "Matchs",
  description: "Historique complet de vos parties Valorant avec filtres et analyses.",
};
import { isPremiumUser } from "@/services/subscription/subscription-service";

export default async function MatchesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const premium = await isPremiumUser(user.id);
  const { matches, total } = await getMatchHistoryForUser(user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Historique des matchs</h1>
        <p className="text-slate-400 mt-2">
          Retrouvez vos performances issues des synchronisations Riot.
        </p>
      </div>

      {!premium && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-slate-400">
            Affichage limité aux 30 derniers jours. <span className="text-white font-medium">{total}</span> matchs disponibles au total.
          </span>
          <Link
            href="/api/stripe/checkout"
            className="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            Passer à Premium pour l&apos;historique complet
          </Link>
        </div>
      )}

      <MatchHistoryList matches={matches} total={total} />
    </div>
  );
}
