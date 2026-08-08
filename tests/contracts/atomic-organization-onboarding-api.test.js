import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const routes = ["registrace-skoly.js", "registrace-spolku.js"].map((file) => ({
  file,
  source: fs.readFileSync(path.join(process.cwd(), "pages/api", file), "utf8"),
}));

describe("atomic organization onboarding API contract", () => {
  it.each(routes)("$file delegates database writes to one RPC", ({ source }) => {
    expect(source).toContain(
      'supabaseAdmin.rpc("complete_municipality_organization_onboarding"'
    );
    expect(source).not.toContain('.from("organizations").insert');
    expect(source).not.toContain('.from("organization_members")');
    expect(source).not.toContain('.from("profiles").upsert');
    expect(source).not.toContain("consumeMunicipalityInvite");
  });

  it.each(routes)("$file never compensates by deleting an organization", ({ source }) => {
    expect(source).not.toContain('.from("organizations").delete');
    expect(source).not.toContain("schoolId");
    expect(source).not.toContain("spolekId");
  });

  it.each(routes)("$file audits cleanup of only a newly created Auth account", ({ source }) => {
    expect(source).toContain("let onboardingCommitted = false");
    expect(source).toContain("onboardingCommitted = true");
    expect(source).toContain("if (!onboardingCommitted)");
    expect(source).toContain("cleanupNewRegistrant(supabaseAdmin, registrant, {");
    expect(source).toContain("reason:");
  });
});
