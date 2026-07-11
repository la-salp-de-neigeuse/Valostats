import type { PublicProfile } from "@/services/public-profile/types";
import type { AggregateStats } from "@/services/stats/aggregate-stats-service";
import { RoleBadge } from "@/components/roles/RoleBadge";
import { hasAnyAdminPermission } from "@/services/roles/types";

interface ProfileHeaderProps {
  user: PublicProfile["user"];
  stats: AggregateStats;
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const displayName = user.name || user.riotAccount?.gameName || "Joueur";
  const riotId = user.riotAccount ? `${user.riotAccount.gameName}#${user.riotAccount.tagLine}` : null;
  const region = user.riotAccount?.regionGroup || null;
  const rank = user.riotAccount?.currentRank || "Non classé";

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-rose-500/20 shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{displayName}</h1>
            {hasAnyAdminPermission(user.role) && <RoleBadge role={user.role} size="lg" />}
          </div>
          {riotId && (
            <p className="text-slate-400 text-lg">{riotId}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            {region && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                {region}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              {rank}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300">
              {stats.matchCount} matchs
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/50 rounded-xl p-4 min-w-[80px]">
            <div className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-400">Winrate</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 min-w-[80px]">
            <div className="text-2xl font-bold text-white">{stats.kdRatio.toFixed(2)}</div>
            <div className="text-xs text-slate-400">K/D</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 min-w-[80px]">
            <div className="text-2xl font-bold text-white">{stats.headshotRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-400">Headshot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
