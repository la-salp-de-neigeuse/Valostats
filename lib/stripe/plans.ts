import type { UserPlan } from "@prisma/client";
import { FREE_PLAN_LIMITS, PRO_PLAN } from "@/constants/limits";

export interface PlanConfig {
  priceId: string;
  plan: UserPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
}

const PRO_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_PRO_MONTHLY ?? "";

export const PLANS: Record<string, PlanConfig> = {
  pro_monthly: {
    priceId: PRO_MONTHLY_PRICE_ID,
    plan: "PRO",
    name: PRO_PLAN.name,
    description: PRO_PLAN.description,
    monthlyPrice: PRO_PLAN.monthlyPrice,
    features: [
      "Statistiques avancées",
      "Analyses IA illimitées",
      "Historique complet",
      "Graphiques d'évolution",
      "Export de données",
      "Support prioritaire",
    ],
  },
};

export const FREE_PLAN_FEATURES = {
  maxAiAnalysesPerMonth: FREE_PLAN_LIMITS.maxAiAnalysesPerMonth,
  maxMatchHistoryDays: FREE_PLAN_LIMITS.maxMatchHistoryDays,
  leaderboardAccess: true,
  chartsAccess: false,
};
