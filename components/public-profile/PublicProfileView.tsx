"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import type { PublicProfile } from "@/services/public-profile/types";
import { ProfileHeader } from "./ProfileHeader";
import { StatsGrid } from "./StatsGrid";
import { PerformanceSection } from "./PerformanceSection";
import { AgentsSection } from "./AgentsSection";
import { MapsSection } from "./MapsSection";
import { AiSection } from "./AiSection";
import { EvolutionCharts } from "./EvolutionCharts";

interface PublicProfileViewProps {
  profile: PublicProfile;
}

const PERIODS = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "all", label: "Global" },
] as const;

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || profile.period;

  const setPeriod = useCallback(
    (period: string) => {
      const params = new URLSearchParams(searchParams);
      if (period === "all") {
        params.delete("period");
      } else {
        params.set("period", period);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="border-b border-slate-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-400 font-semibold">
            <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            ValoStats
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ProfileHeader user={profile.user} stats={profile.stats} />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 bg-[#111115] border border-slate-800 rounded-xl p-1 w-fit">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPeriod === p.value
                    ? "bg-rose-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <Link
              href={`/overlay/${profile.user.publicSlug}`}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-300 bg-[#111115] border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Overlay
            </Link>
            <Link
              href={`/compare?slug=${profile.user.publicSlug}`}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-300 bg-[#111115] border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Comparer
            </Link>
          </div>
        </div>

        <StatsGrid stats={profile.stats} />

        <EvolutionCharts recentMatches={profile.recentMatches} />

        <PerformanceSection recentMatches={profile.recentMatches} />

        <div className="grid lg:grid-cols-2 gap-6">
          <AgentsSection agents={profile.agents} />
          <MapsSection maps={profile.maps} />
        </div>

        {profile.aiAnalysis && <AiSection analysis={profile.aiAnalysis} />}

        <footer className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            Statistiques générées par ValoStats &bull;{" "}
            <Link href="/" className="text-rose-500 hover:text-rose-400">
              Créer votre profil
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
