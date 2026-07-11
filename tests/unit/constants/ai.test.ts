import { describe, it, expect } from "vitest";
import { getScoreThreshold, getSeverityConfig, getDifficultyConfig, AI_SCORE_THRESHOLDS, SEVERITY_CONFIG, SCORE_BREAKDOWN_MAX, SCORE_BREAKDOWN_MAX_TOTAL } from "@/constants/ai";

describe("getScoreThreshold", () => {
  it("returns Excellent for score >= 70", () => {
    expect(getScoreThreshold(85).label).toBe("Excellent");
    expect(getScoreThreshold(70).label).toBe("Excellent");
  });

  it("returns Bon for score 50-69", () => {
    expect(getScoreThreshold(50).label).toBe("Bon");
    expect(getScoreThreshold(65).label).toBe("Bon");
  });

  it("returns Intermédiaire for score 30-49", () => {
    expect(getScoreThreshold(30).label).toBe("Intermédiaire");
    expect(getScoreThreshold(42).label).toBe("Intermédiaire");
  });

  it("returns Débutant for score < 30", () => {
    expect(getScoreThreshold(0).label).toBe("Débutant");
    expect(getScoreThreshold(29).label).toBe("Débutant");
  });

  it("returns color for each threshold level", () => {
    for (const t of AI_SCORE_THRESHOLDS) {
      expect(t.color).toMatch(/^text-/);
      expect(t.bg).toMatch(/^bg-/);
    }
  });
});

describe("getSeverityConfig", () => {
  it("returns correct label for each severity level", () => {
    expect(getSeverityConfig(3 as never).label).toBe("Critique");
    expect(getSeverityConfig(2 as never).label).toBe("Élevé");
    expect(getSeverityConfig(1 as never).label).toBe("Moyen");
    expect(getSeverityConfig(0 as never).label).toBe("Faible");
  });

  it("returns CSS classes for each severity level", () => {
    expect(SEVERITY_CONFIG[3].borderBg).toContain("rose-500");
    expect(SEVERITY_CONFIG[0].borderBg).toContain("emerald-500");
  });
});

describe("getDifficultyConfig", () => {
  it("returns correct labels", () => {
    expect(getDifficultyConfig("easy").label).toBe("Facile");
    expect(getDifficultyConfig("medium").label).toBe("Moyen");
    expect(getDifficultyConfig("hard").label).toBe("Difficile");
  });

  it("returns easy config for unknown difficulty", () => {
    expect(getDifficultyConfig("unknown").label).toBe("Facile");
  });
});

describe("SCORE_BREAKDOWN_MAX", () => {
  it("has 8 breakdown categories", () => {
    expect(Object.keys(SCORE_BREAKDOWN_MAX)).toHaveLength(8);
  });

  it("SCORE_BREAKDOWN_MAX_TOTAL equals sum of all values", () => {
    const sum = Object.values(SCORE_BREAKDOWN_MAX).reduce((a, b) => a + b, 0);
    expect(SCORE_BREAKDOWN_MAX_TOTAL).toBe(sum);
  });
});
