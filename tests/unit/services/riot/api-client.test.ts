import { describe, it, expect, vi, beforeEach } from "vitest";
import { RiotApiError, riotFetch, sleep } from "@/services/riot/api-client";

const VALID_API_KEY = "RGAPI-test-key";

beforeEach(() => {
  process.env.RIOT_API_KEY = VALID_API_KEY;
  vi.restoreAllMocks();
});

describe("sleep", () => {
  it("resolves after the specified time", async () => {
    const start = Date.now();
    await sleep(10);
    expect(Date.now() - start).toBeGreaterThanOrEqual(5);
  });
});

describe("RiotApiError", () => {
  it("stores status and message", () => {
    const error = new RiotApiError(404, "Not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("RiotApiError");
  });
});

describe("riotFetch", () => {
  it("throws if RIOT_API_KEY is missing", async () => {
    delete process.env.RIOT_API_KEY;
    await expect(riotFetch("/test")).rejects.toThrow("RIOT_API_KEY non configurée");
  });

  it("returns JSON on successful response", async () => {
    const mockData = { puuid: "abc123", gameName: "Test" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await riotFetch("/summoner/v4/summoners/by-name/test");
    expect(result).toEqual(mockData);
  });

  it("retries on 429 and succeeds", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ "Retry-After": "0" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    const result = await riotFetch("/test", "europe", 1);
    expect(result).toEqual({ success: true });
    expect(callCount).toBe(2);
  });

  it("throws RiotApiError on 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(riotFetch("/nonexistent")).rejects.toThrow(RiotApiError);
    await expect(riotFetch("/nonexistent")).rejects.toMatchObject({ status: 404 });
  });

  it("throws RiotApiError on 403", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(riotFetch("/forbidden")).rejects.toThrow("Clé API Riot invalide ou expirée");
  });

  it("throws on network error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    await expect(riotFetch("/test")).rejects.toThrow("Network failure");
  });
});
