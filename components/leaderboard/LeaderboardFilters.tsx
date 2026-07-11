"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { LEADERBOARD_PERIODS, LEADERBOARD_SORT_OPTIONS, LEADERBOARD_REGIONS, LEADERBOARD_RANKS } from "@/constants/periods";

export function LeaderboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPeriod = searchParams.get("period") || "all";
  const currentSort = searchParams.get("sort") || "KDA";
  const currentRegion = searchParams.get("region") || "";
  const currentRank = searchParams.get("rank") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Filtres du classement">
      <select
        value={currentPeriod}
        onChange={(e) => updateParam("period", e.target.value)}
        className="bg-[#111115] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-rose-500/50"
        aria-label="Période"
      >
        {LEADERBOARD_PERIODS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="bg-[#111115] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-rose-500/50"
        aria-label="Tri"
      >
        {LEADERBOARD_SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={currentRegion}
        onChange={(e) => updateParam("region", e.target.value)}
        className="bg-[#111115] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-rose-500/50"
        aria-label="Région"
      >
        {LEADERBOARD_REGIONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <select
        value={currentRank}
        onChange={(e) => updateParam("rank", e.target.value)}
        className="bg-[#111115] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-rose-500/50"
        aria-label="Rang"
      >
        {LEADERBOARD_RANKS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    </div>
  );
}
