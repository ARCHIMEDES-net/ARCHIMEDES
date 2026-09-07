import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

describe("onboarding control center", () => {
  it("is guarded by platform admin access and exposes the canonical onboarding route", () => {
    const page = read("pages/portal/admin/onboarding.js");
    expect(page).toContain("<RequirePlatformAdmin>");
    expect(page).toContain('href="/portal/admin/obce"');
    expect(page).toContain("onboarding_preflight_reviews");
    expect(page).toContain("review_onboarding_preflight_v1");
  });

  it("enforces four-eyes review in the UI", () => {
    const page = read("pages/portal/admin/onboarding.js");
    expect(page).toContain("review.requested_by === currentUserId");
    expect(page).toContain("Vlastní žádost nelze schválit ani zamítnout");
    expect(page).toContain('p_decision: decision');
    expect(page).toContain('decision === "approve"');
  });

  it("links the control center from the admin home", () => {
    const adminHome = read("pages/portal/admin/index.js");
    expect(adminHome).toContain('href="/portal/admin/onboarding"');
    expect(adminHome).toContain("READY / POZOR / STOP");
  });
});
