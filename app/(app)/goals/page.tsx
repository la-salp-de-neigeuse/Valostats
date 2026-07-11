import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getGoals, getGoalStats, getGlobalProgression, expireOldGoals } from "@/services/goals/goals-service";

export const metadata: Metadata = {
  title: "Objectifs",
  description: "Fixez et suivez vos objectifs de progression sur Valorant.",
};
import { getBadges } from "@/services/goals/badges-service";
import { GoalsView } from "@/components/goals/GoalsView";

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default async function GoalsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await expireOldGoals(user.id);

  const [activeGoals, completedGoals, expiredGoals, stats, progression, badges] = await Promise.all([
    getGoals(user.id, "IN_PROGRESS"),
    getGoals(user.id, "COMPLETED"),
    getGoals(user.id, "EXPIRED"),
    getGoalStats(user.id),
    getGlobalProgression(user.id),
    getBadges(user.id),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
          <TargetIcon />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Objectifs</h1>
          <p className="text-slate-400 mt-1">Objectifs intelligents générés par l&apos;IA pour progresser</p>
        </div>
      </div>

      <GoalsView
        activeGoals={activeGoals}
        completedGoals={completedGoals}
        expiredGoals={expiredGoals}
        stats={stats}
        progression={progression}
        badges={badges}
      />
    </div>
  );
}
