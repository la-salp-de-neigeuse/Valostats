const COMPETITIVE_TIER_TO_RANK: Record<number, string> = {
  0: "Non classé",
  1: "Non classé",
  2: "Non classé",
  3: "Fer 1",
  4: "Fer 2",
  5: "Fer 3",
  6: "Bronze 1",
  7: "Bronze 2",
  8: "Bronze 3",
  9: "Argent 1",
  10: "Argent 2",
  11: "Argent 3",
  12: "Or 1",
  13: "Or 2",
  14: "Or 3",
  15: "Platine 1",
  16: "Platine 2",
  17: "Platine 3",
  18: "Diamant 1",
  19: "Diamant 2",
  20: "Diamant 3",
  21: "Ascendant 1",
  22: "Ascendant 2",
  23: "Ascendant 3",
  24: "Immortel 1",
  25: "Immortel 2",
  26: "Immortel 3",
  27: "Radiant",
};

export function competitiveTierToRank(tier: number | null | undefined): string {
  if (tier == null) return "Non classé";
  return COMPETITIVE_TIER_TO_RANK[tier] ?? "Non classé";
}

export function resolveRankLabel(tier: number | null | undefined): string {
  return competitiveTierToRank(tier);
}
