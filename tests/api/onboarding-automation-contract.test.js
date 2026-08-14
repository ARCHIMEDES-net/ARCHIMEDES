import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("server onboarding automation contract", () => {
  const route = read("pages/api/admin/automation/activate-municipality.js");
  const sharedRoute = read("pages/api/admin/activate-municipality.js");
  const auth = read("lib/server/onboardingAutomationAuth.js");
  const script = read("scripts/onboard-municipality.mjs");

  it("authorizes the automation before delegating to the shared handler", () => {
    const authorization = route.indexOf("requireOnboardingAutomation(");
    const execution = route.indexOf("handleMunicipalityOnboarding(req, res");

    expect(authorization).toBeGreaterThanOrEqual(0);
    expect(execution).toBeGreaterThan(authorization);
    expect(route).toContain("SERVICE_ONBOARDING_RPCS");
    expect(route).toContain("approvalReference");
    expect(route).toContain('req.method !== "POST"');
  });

  it("accepts the automation secret only through a constant-time bearer check", () => {
    expect(auth).toContain("req.headers?.authorization");
    expect(auth).not.toMatch(/req\.(query|body).*ONBOARDING_AUTOMATION_SECRET/i);
    expect(auth).toContain('createHash("sha256")');
    expect(auth).toContain("crypto.timingSafeEqual");
    expect(auth).toContain("secret.length < 32");
  });

  it("keeps browser and service RPCs explicitly separated", () => {
    expect(sharedRoute).toContain('onboard: "onboard_customer_v3"');
    expect(sharedRoute).toContain('onboard: "onboard_customer_service_v1"');
    expect(sharedRoute).toContain("p_performed_by: servicePerformedBy.id");
    expect(sharedRoute).toContain('executionSource: serverContext ? "automation" : "admin_ui"');
  });

  it("provides a non-browser client without accepting plaintext HTTP", () => {
    expect(script).toContain('Authorization: `Bearer ${requiredEnv("ONBOARDING_AUTOMATION_SECRET")}`');
    expect(script).toContain('parsed.protocol !== "https:"');
    expect(script).toContain("controller.abort()");
    expect(script).not.toContain("console.log(request");
  });
});
