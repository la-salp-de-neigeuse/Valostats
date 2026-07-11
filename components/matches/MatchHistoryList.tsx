import type { MatchHistoryItem } from "@/services/matches/match-history-service";
import { MatchHistoryEmpty } from "./MatchHistoryEmpty";
import { MatchHistoryRow } from "./MatchHistoryRow";

export function MatchHistoryList({
  matches,
  total,
}: {
  matches: MatchHistoryItem[];
  total: number;
}) {
  if (matches.length === 0) {
    return <MatchHistoryEmpty />;
  }

  return (
    <div className="space-y-4" role="feed" aria-label="Historique des matchs">
      <p className="text-sm text-slate-500" aria-live="polite">
        {total} match{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}
      </p>
      <div className="space-y-3">
        {matches.map((match, index) => (
          <div key={match.id} role="article" aria-posinset={index + 1} aria-setsize={total}>
            <MatchHistoryRow match={match} />
          </div>
        ))}
      </div>
    </div>
  );
}
