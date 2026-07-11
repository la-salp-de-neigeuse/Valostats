export const RATE_LIMITS = {
  register: { maxRequests: 3, windowMs: 60_000 },
  login: { maxRequests: 5, windowMs: 60_000 },
  riotLink: { maxRequests: 5, windowMs: 60_000 },
  riotVerify: { maxRequests: 10, windowMs: 60_000 },
  riotSync: { maxRequests: 3, windowMs: 60_000 },
  stripe: { maxRequests: 10, windowMs: 60_000 },
  feedback: { maxRequests: 5, windowMs: 60_000 },
} as const;

export const FREE_PLAN_LIMITS = {
  maxAiAnalysesPerMonth: 5,
  maxMatchHistoryDays: 30,
} as const;

export const PRO_PLAN = {
  monthlyPrice: 9.99,
  name: "Premium",
  description: "Analyses IA illimitées, historique complet, graphiques d'évolution",
} as const;

export const RIOT_FETCH_TIMEOUT_MS = 10_000;
export const RIOT_RETRY_COUNT = 2;

export const ACCOUNT_LOCKOUT_THRESHOLD = 5;
export const ACCOUNT_LOCKOUT_DURATION_MIN = 15;

export const CLEANUP_INTERVAL_MS = 60_000;
