import type { MatchResult } from "@prisma/client";

import { formatDuration, formatKda, formatMatchDate } from "@/lib/valorant/format";
import type { MatchHistoryItem } from "@/services/matches/match-history-service";

const RESULT_STYLES: Record<
  MatchResult,
  { label: string; badgeClass: string; borderClass: string }
> = {
  WIN: {
    label: "Victoire",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    borderClass: "border-l-emerald-500",
  },
  LOSS: {
    label: "Défaite",
    badgeClass: "bg-accent-light text-accent border-accent/20",
    borderClass: "border-l-accent",
  },
  DRAW: {
    label: "Égalité",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    borderClass: "border-l-slate-500",
  },
};

const QUEUE_LABELS: Record<string, string> = {
  COMPETITIVE: "Compétitif",
  UNRATED: "Non classé",
  PREMIER: "Premier",
  SWIFTPLAY: "Swiftplay",
  SPIKERUSH: "Spike Rush",
  DEATHMATCH: "Deathmatch",
};

export function MatchHistoryRow({ match }: { match: MatchHistoryItem }) {
  const resultStyle = RESULT_STYLES[match.result];

  return (
    <article
      className={`bg-surface border border-slate-800 border-l-4 ${resultStyle.borderClass} rounded-2xl p-5 hover-lift hover:border-slate-700 transition-all`}
      aria-label={`Match ${resultStyle.label} sur ${match.mapName}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <span
            className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border ${resultStyle.badgeClass}`}
          >
            {resultStyle.label}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">{match.mapName}</h3>
            <p className="text-sm text-slate-400 truncate">
              {match.agentDisplayName} · {QUEUE_LABELS[match.queue] ?? match.queue}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-1">KDA</p>
            <p className="font-semibold text-white">
              {formatKda(match.kills, match.deaths, match.assists)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">ACS</p>
            <p className="font-semibold text-white">{match.combatScore.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Score</p>
            <p className="font-semibold text-white">{match.score.toLocaleString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">MVP</p>
            <p className="font-semibold text-white">—</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Durée</p>
            <p className="font-semibold text-white">{formatDuration(match.durationSeconds)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Date</p>
            <p className="font-semibold text-white">{formatMatchDate(match.playedAt)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
