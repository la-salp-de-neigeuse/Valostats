import { describe, it, expect } from "vitest";
import { getClientIp } from "@/lib/security/rate-limit";

describe("getClientIp", () => {
  const makeRequest = (headers: Record<string, string>): Request =>
    new Request("http://localhost", { headers });

  it("returns IP from x-forwarded-for header", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when no forwarded header", () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("returns localhost fallback when no IP headers present", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("prioritizes x-forwarded-for over x-real-ip", () => {
    const req = makeRequest({
      "x-forwarded-for": "1.1.1.1",
      "x-real-ip": "2.2.2.2",
    });
    expect(getClientIp(req)).toBe("1.1.1.1");
  });
});
