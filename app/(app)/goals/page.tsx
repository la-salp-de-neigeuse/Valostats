import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getGoals, getGoalStats, getGlobalProgression, expireOldGoals } from "@/services/goals/goals-service";
import { getBadges } from "@/services/goals/badges-service";
import { GoalsView } from "@/components/goals/GoalsView";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Objectifs",
  description: "Fixez et suivez vos objectifs de progression sur Valorant.",
};

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <PageHeader
        icon={<TargetIcon />}
        title="Objectifs"
        description="Objectifs intelligents générés par l'IA pour progresser"
      />

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
