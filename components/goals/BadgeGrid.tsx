"use client";

import type { Badge } from "@/services/goals/types";

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) {
    return (
      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🏅</div>
        <p className="text-slate-400 text-sm">
          Complétez des objectifs pour débloquer des badges.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="bg-[#111115] border border-slate-800 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-colors group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            {badge.icon}
          </div>
          <div className="text-sm font-semibold text-white mb-1">{badge.name}</div>
          <div className="text-xs text-slate-500 line-clamp-2">{badge.description}</div>
          <div className="text-xs text-slate-600 mt-2">
            {new Date(badge.unlockedAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      ))}
    </div>
  );
}
