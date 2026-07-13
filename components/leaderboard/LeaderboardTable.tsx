import Link from "next/link";

import type { LeaderboardPlayerEntry, LeaderboardResult } from "@/services/leaderboard/leaderboard-service";

interface LeaderboardTableProps {
  data: LeaderboardResult;
  currentSort: string;
  currentQueryString: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-yellow-400 font-bold text-lg" aria-label="1ère place" role="img">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-slate-300 font-bold text-lg" aria-label="2ème place" role="img">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-amber-600 font-bold text-lg" aria-label="3ème place" role="img">🥉</span>;
  }
  return <span className="text-slate-500 font-mono text-sm w-6 text-center">{rank}</span>;
}

import { getScoreThreshold } from "@/constants/ai";

function AiScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-600">--</span>;
  const color = getScoreThreshold(score).color;
  return <span className={`font-mono font-medium ${color}`}>{score.toFixed(0)}</span>;
}

function Pagination({ data, baseQueryString }: { data: LeaderboardResult; baseQueryString: string }) {
  const pages: number[] = [];
  const maxVisible = 5;
  const start = Math.max(1, data.page - Math.floor(maxVisible / 2));
  const end = Math.min(data.totalPages, start + maxVisible - 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (data.totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
      {pages.map((p) => {
        const params = new URLSearchParams(baseQueryString);
        if (p === 1) {
          params.delete("page");
        } else {
          params.set("page", String(p));
        }
        const qs = params.toString();
        const href = `/leaderboard${qs ? `?${qs}` : ""}`;

        return (
          <Link
            key={p}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              p === data.page
                ? "bg-accent/20 text-accent border border-accent/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            {p}
          </Link>
        );
      })}
    </nav>
  );
}

export function LeaderboardTable({ data, currentSort, currentQueryString }: LeaderboardTableProps) {
  if (data.entries.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-8 text-center" role="status">
        <p className="text-slate-400">Aucun joueur trouvé pour ces filtres.</p>
        <p className="text-slate-500 text-sm mt-2">Essayez de modifier les filtres ou de synchroniser des matchs.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-surface border border-slate-800 rounded-2xl overflow-hidden" role="group" aria-label="Classement des joueurs">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 w-12">#</th>
              <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Joueur</th>
              <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Rang</th>
              <th scope="col" className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Matchs</th>
              <th scope="col" className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Winrate</th>
              <th scope="col" className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">K/D</th>
              <th scope="col" className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Score IA</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <LeaderboardRow key={entry.userId} entry={entry} currentSort={currentSort} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination data={data} baseQueryString={currentQueryString} />
    </div>
  );
}

function LeaderboardRow({ entry, currentSort }: { entry: LeaderboardPlayerEntry; currentSort: string }) {
  const displayName = entry.gameName
    ? `${entry.gameName}#${entry.tagLine}`
    : entry.displayName || "Inconnu";

  const sortIsWinning = (entry: LeaderboardPlayerEntry, sort: string): boolean => {
    if (sort === "KDA") return entry.kda > 1.2;
    if (sort === "WIN_RATE") return entry.winRate > 55;
    if (sort === "AI_SCORE") return (entry.aiScore ?? 0) > 70;
    if (sort === "MATCH_COUNT") return entry.matchCount > 50;
    return false;
  };

  const highlight = sortIsWinning(entry, currentSort);

  return (
    <tr className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors ${highlight ? "bg-emerald-500/5" : ""}`}>
      <td className="px-4 py-3">
        <RankBadge rank={entry.rank} />
      </td>
      <td className="px-4 py-3">
        <Link href={`/player/${entry.publicSlug}`} className="hover:text-accent transition-colors">
          <span className="text-sm font-medium text-white">{displayName}</span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-400">{entry.rankName || "--"}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm text-slate-300 font-mono">{entry.matchCount}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-sm font-mono ${entry.winRate >= 55 ? "text-emerald-400" : entry.winRate >= 50 ? "text-slate-300" : "text-accent"}`}>
          {entry.winRate.toFixed(1)}%
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-sm font-mono ${entry.kda >= 1.2 ? "text-emerald-400" : entry.kda >= 1 ? "text-slate-300" : "text-accent"}`}>
          {entry.kda.toFixed(2)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <AiScoreBadge score={entry.aiScore} />
      </td>
    </tr>
  );
}
