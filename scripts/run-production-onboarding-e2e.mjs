const siteUrl = String(process.env.ONBOARDING_E2E_SITE_URL || "").replace(/\/$/, "");
const secret = String(process.env.ONBOARDING_AUTOMATION_SECRET || "");
const email = String(process.env.ONBOARDING_E2E_EMAIL || "").trim().toLowerCase();

if (!/^https:\/\//.test(siteUrl) || secret.length < 32 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error(
    "Set ONBOARDING_E2E_SITE_URL, ONBOARDING_AUTOMATION_SECRET and ONBOARDING_E2E_EMAIL."
  );
}

const automationHeaders = {
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
  "X-Onboarding-E2E-Automation": "1",
};

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${siteUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status}): ${body.error || "unknown error"}`);
  }
  return body;
}

let runId = "";
let cleanupCompleted = false;

try {
  const started = await jsonRequest("/api/admin/onboarding-test-runs", {
    method: "POST",
    headers: automationHeaders,
    body: JSON.stringify({ email }),
  });
  runId = started.run.id;

  await jsonRequest("/api/zadost-o-pristup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "obec",
      licensePlan: "paid_monthly",
      termsAccepted: true,
      name: "ARCHIMEDES E2E test",
      role: "starosta",
      email,
      phone: "+420 000 000 000",
      organization: started.run.expected_organization_name,
      address: "Testovací 1, Testov 000 00",
      population: "0",
      legalIdentifier: "",
      message: `Automatický produkční E2E test ${runId}.`,
      testRunId: runId,
    }),
  });

  const submitted = await jsonRequest(
    `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
    { headers: automationHeaders }
  );
  if (submitted.run.status !== "submitted" || !submitted.run.organization_id) {
    throw new Error("The public order was not associated with the prepared test run.");
  }

  const today = new Date().toISOString().slice(0, 10);
  await jsonRequest("/api/admin/automation/activate-municipality", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      approvalReference: `production-e2e:${runId}`,
      idempotencyKey: runId,
      organizationId: submitted.run.organization_id,
      licensePlan: "paid_monthly",
      licenseStartedAt: today,
      licenseValidUntil: null,
      contractStatus: "accepted",
      billingStatus: "pending",
      classroomEligibilityVerified: false,
      localAdminFullName: "ARCHIMEDES E2E test",
      localAdminEmail: email,
    }),
  });

  const verified = await jsonRequest(
    `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
    { headers: automationHeaders }
  );
  if (
    verified.run.status !== "activated" ||
    verified.organization?.status !== "active" ||
    verified.organization?.license_status !== "active" ||
    verified.acceptance?.status !== "sent" ||
    verified.acceptance?.attempt_count !== 1 ||
    verified.onboarding?.email_status !== "sent" ||
    verified.onboarding?.email_attempt_count !== 1
  ) {
    throw new Error(`E2E verification failed: ${JSON.stringify(verified)}`);
  }

  const cleaned = await jsonRequest(
    `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
    { method: "DELETE", headers: automationHeaders }
  );
  cleanupCompleted = cleaned.status === "cleaned";
  if (!cleanupCompleted) throw new Error("Cleanup did not finish.");

  console.log(JSON.stringify({ ok: true, runId, status: "cleaned" }));
} finally {
  if (runId && !cleanupCompleted) {
    try {
      await jsonRequest(
        `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
        { method: "DELETE", headers: automationHeaders }
      );
    } catch (cleanupError) {
      console.error(`Emergency cleanup failed for ${runId}: ${cleanupError.message}`);
    }
  }
}

