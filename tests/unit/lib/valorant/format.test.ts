import { describe, it, expect } from "vitest";
import { formatDuration, formatMatchDate, formatKda } from "@/lib/valorant/format";

describe("formatDuration", () => {
  it("formats seconds to m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3661)).toBe("61:01");
  });
});

describe("formatKda", () => {
  it("formats kills/deaths/assists", () => {
    expect(formatKda(10, 5, 3)).toBe("10/5/3");
    expect(formatKda(0, 0, 0)).toBe("0/0/0");
  });
});

describe("formatMatchDate", () => {
  const mockDate = new Date("2026-07-10T14:30:00Z");

  it("returns a non-empty string", () => {
    const result = formatMatchDate(mockDate);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
