import { describe, expect, it } from "vitest";
import { normalizeBadgeCount } from "../../lib/appBadge";

describe("app badge", () => {
  it("uses only a bounded unread notification count", () => {
    expect(normalizeBadgeCount(-1)).toBe(0);
    expect(normalizeBadgeCount("2")).toBe(2);
    expect(normalizeBadgeCount(2.9)).toBe(2);
    expect(normalizeBadgeCount(150)).toBe(99);
    expect(normalizeBadgeCount("invalid")).toBe(0);
  });
});
