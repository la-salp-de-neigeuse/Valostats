"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { StatsPeriod } from "@/services/stats/aggregate-stats-service";
import { STATS_PERIOD_OPTIONS } from "@/constants/periods";

interface PeriodSelectorProps {
  currentPeriod: StatsPeriod;
}

export function PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const searchParams = useSearchParams();

  const createUrl = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex gap-2" role="tablist" aria-label="Période">
      {STATS_PERIOD_OPTIONS.map((period) => (
        <Link
          key={period.value}
          href={createUrl(period.value)}
          role="tab"
          aria-selected={currentPeriod === period.value}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPeriod === period.value
              ? "bg-rose-500 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
          }`}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}
