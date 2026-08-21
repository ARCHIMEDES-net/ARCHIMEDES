import { createPublicKey, verify as verifySignature } from "crypto";

const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_AUDIENCE = "archimedes-onboarding-e2e-pr197";
const EXPECTED_REPOSITORY = "ARCHIMEDES-net/ARCHIMEDES";
const EXPECTED_WORKFLOW_PATH =
  "ARCHIMEDES-net/ARCHIMEDES/.github/workflows/onboarding-e2e-pr197-oidc.yml@";
const EXPECTED_EMAIL = "antonin.koplik+archimedes-e2e@gmail.com";
const EXPECTED_AUTOMATION_ADMIN_USER_ID =
  "13b78fbc-46c5-4994-9789-0bc289f42a70";

export const config = {
  maxDuration: 120,
};

function decodeJsonSegment(segment) {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

function audienceMatches(audience) {
  return Array.isArray(audience)
    ? audience.length === 1 && audience[0] === OIDC_AUDIENCE
    : audience === OIDC_AUDIENCE;
}

function subjectMatches(payload) {
  const legacySubject = `repo:${EXPECTED_REPOSITORY}:pull_request`;
  const immutableSubject =
    `repo:ARCHIMEDES-net@${payload.repository_owner_id}/` +
    `ARCHIMEDES@${payload.repository_id}:pull_request`;
  return payload.sub === legacySubject || payload.sub === immutableSubject;
}

function workflowRefMatches(workflowRef) {
  return (
    workflowRef === `${EXPECTED_WORKFLOW_PATH}refs/pull/197/merge` ||
    workflowRef ===
      `${EXPECTED_WORKFLOW_PATH}refs/heads/agent/unified-registration-email-provider`
  );
}

async function verifyGitHubOidcToken(token) {
  const segments = token.split(".");
  if (segments.length !== 3) throw new Error("Malformed OIDC token.");

  const [encodedHeader, encodedPayload, encodedSignature] = segments;
  const header = decodeJsonSegment(encodedHeader);
  const payload = decodeJsonSegment(encodedPayload);
  if (header.alg !== "RS256" || typeof header.kid !== "string") {
    throw new Error("Unexpected OIDC signing algorithm.");
  }

  const configurationResponse = await fetch(
    `${OIDC_ISSUER}/.well-known/openid-configuration`,
    { cache: "no-store" }
  );
  if (!configurationResponse.ok) throw new Error("OIDC discovery failed.");
  const configuration = await configurationResponse.json();
  if (
    configuration.issuer !== OIDC_ISSUER ||
    typeof configuration.jwks_uri !== "string" ||
    !configuration.jwks_uri.startsWith(`${OIDC_ISSUER}/`)
  ) {
    throw new Error("Unexpected OIDC discovery document.");
  }

  const keysResponse = await fetch(configuration.jwks_uri, { cache: "no-store" });
  if (!keysResponse.ok) throw new Error("OIDC signing keys could not be loaded.");
  const { keys = [] } = await keysResponse.json();
  const signingKey = keys.find(
    (key) => key.kid === header.kid && key.kty === "RSA" && key.use === "sig"
  );
  if (!signingKey) throw new Error("OIDC signing key was not found.");

  const verified = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    createPublicKey({ key: signingKey, format: "jwk" }),
    Buffer.from(encodedSignature, "base64url")
  );
  if (!verified) throw new Error("OIDC signature verification failed.");

  const now = Math.floor(Date.now() / 1000);
  if (
    payload.iss !== OIDC_ISSUER ||
    !audienceMatches(payload.aud) ||
    !Number.isFinite(payload.exp) ||
    payload.exp < now - 30 ||
    !Number.isFinite(payload.iat) ||
    payload.iat > now + 30 ||
    (Number.isFinite(payload.nbf) && payload.nbf > now + 30) ||
    payload.repository !== EXPECTED_REPOSITORY ||
    payload.repository_owner !== "ARCHIMEDES-net" ||
    payload.event_name !== "pull_request" ||
    payload.ref !== "refs/pull/197/merge" ||
    payload.head_ref !== "agent/unified-registration-email-provider" ||
    payload.base_ref !== "main" ||
    !subjectMatches(payload) ||
    !workflowRefMatches(payload.workflow_ref) ||
    payload.workflow !== "Controlled onboarding E2E for PR 197 via OIDC" ||
    String(payload.run_attempt) !== "1" ||
    payload.runner_environment !== "github-hosted"
  ) {
    throw new Error("OIDC claims are outside the approved E2E scope.");
  }

  return payload;
}

async function jsonRequest(siteUrl, path, options = {}) {
  const response = await fetch(`${siteUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status}): ${body.error || "unknown error"}`);
  }
  return body;
}

async function runApprovedE2E() {
  const secret = String(process.env.ONBOARDING_AUTOMATION_SECRET || "");
  const allowlist = String(process.env.ONBOARDING_E2E_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const deploymentHost = String(process.env.VERCEL_URL || "").toLowerCase();
  const automationAdminUserId = String(
    process.env.ONBOARDING_AUTOMATION_ADMIN_USER_ID || ""
  ).trim();
  const configuredSupabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  // This diagnostic never creates a Supabase client; all application clients use persistSession: false.
  const configuredServiceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  let supabaseUrlRef = "invalid";
  let serviceKeyRef = configuredServiceKey.startsWith("sb_secret_") ? "modern-secret" : "invalid";
  try {
    supabaseUrlRef = new URL(configuredSupabaseUrl).hostname.split(".")[0] || "invalid";
  } catch {}
  try {
    if (configuredServiceKey.split(".").length === 3) {
      serviceKeyRef =
        JSON.parse(
          Buffer.from(configuredServiceKey.split(".")[1], "base64url").toString("utf8")
        ).ref || "legacy-without-ref";
    }
  } catch {}
  console.info("OIDC E2E Supabase binding", { supabaseUrlRef, serviceKeyRef });
  try {
    const authProbeResponse = await fetch(
      `${configuredSupabaseUrl}/auth/v1/admin/users/${EXPECTED_AUTOMATION_ADMIN_USER_ID}`,
      {
        cache: "no-store",
        headers: {
          apikey: configuredServiceKey,
          Authorization: `Bearer ${configuredServiceKey}`,
        },
      }
    );
    const authProbeBody = await authProbeResponse.json().catch(() => ({}));
    console.info("OIDC E2E Auth probe", {
      status: authProbeResponse.status,
      code: authProbeBody.code || authProbeBody.error_code || null,
      message: authProbeBody.msg || authProbeBody.message || null,
      userIdMatches: authProbeBody.id === EXPECTED_AUTOMATION_ADMIN_USER_ID,
      emailPresent: typeof authProbeBody.email === "string",
    });
  } catch (authProbeError) {
    console.info("OIDC E2E Auth probe", {
      status: "request_failed",
      message: authProbeError.message,
    });
  }
  const environmentChecks = {
    secretConfigured: secret.length >= 32,
    allowlistConfigured:
      allowlist.length === 1 && allowlist[0] === EXPECTED_EMAIL,
    automationAdminConfigured:
      automationAdminUserId === EXPECTED_AUTOMATION_ADMIN_USER_ID,
    previewHostValid: /^[a-z0-9.-]+\.vercel\.app$/.test(deploymentHost),
  };
  if (Object.values(environmentChecks).some((value) => !value)) {
    throw new Error(
      `Preview E2E environment is not safely constrained: ${JSON.stringify(
        environmentChecks
      )}`
    );
  }

  const siteUrl = `https://${deploymentHost}`;
  const automationHeaders = {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
    "X-Onboarding-E2E-Automation": "1",
  };
  let runId = "";
  let cleanupCompleted = false;

  try {
    const started = await jsonRequest(siteUrl, "/api/admin/onboarding-test-runs", {
      method: "POST",
      headers: automationHeaders,
      body: JSON.stringify({ email: EXPECTED_EMAIL }),
    });
    runId = started.run.id;

    await jsonRequest(siteUrl, "/api/zadost-o-pristup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "obec",
        licensePlan: "paid_monthly",
        termsAccepted: true,
        name: "ARCHIMEDES E2E test",
        role: "starosta",
        email: EXPECTED_EMAIL,
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
      siteUrl,
      `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
      { headers: automationHeaders }
    );
    if (submitted.run.status !== "submitted" || !submitted.run.organization_id) {
      throw new Error("The public order was not associated with the prepared test run.");
    }

    const today = new Date().toISOString().slice(0, 10);
    await jsonRequest(siteUrl, "/api/admin/automation/activate-municipality", {
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
        localAdminEmail: EXPECTED_EMAIL,
      }),
    });

    const verified = await jsonRequest(
      siteUrl,
      `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
      { headers: automationHeaders }
    );
    const verificationChecks = {
      runActivated: verified.run.status === "activated",
      organizationActive: verified.organization?.status === "active",
      licenseActive: verified.organization?.license_status === "active",
      acceptanceSent: verified.acceptance?.status === "sent",
      acceptanceOnce: verified.acceptance?.attempt_count === 1,
      acceptanceProvider: verified.acceptance?.email_provider === "resend",
      acceptanceClientReceipt:
        Boolean(String(verified.acceptance?.client_provider_message_id || "").trim()),
      acceptanceAuditReceipt:
        Boolean(String(verified.acceptance?.audit_copy_provider_message_id || "").trim()),
      onboardingSent: verified.onboarding?.email_status === "sent",
      onboardingOnce: verified.onboarding?.email_attempt_count === 1,
      onboardingProvider: verified.onboarding?.email_provider === "resend",
      onboardingClientReceipt:
        Boolean(String(verified.onboarding?.client_provider_message_id || "").trim()),
      onboardingAuditReceipt:
        Boolean(String(verified.onboarding?.audit_copy_provider_message_id || "").trim()),
    };
    if (Object.values(verificationChecks).some((value) => !value)) {
      console.info("OIDC E2E verification checks", verificationChecks);
      throw new Error("E2E verification did not reach the approved sent state.");
    }

    const cleaned = await jsonRequest(
      siteUrl,
      `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
      { method: "DELETE", headers: automationHeaders }
    );
    cleanupCompleted = cleaned.status === "cleaned";
    if (!cleanupCompleted) throw new Error("Cleanup did not finish.");

    return { ok: true, runId, status: "cleaned" };
  } finally {
    if (runId && !cleanupCompleted) {
      try {
        await jsonRequest(
          siteUrl,
          `/api/admin/onboarding-test-runs?runId=${encodeURIComponent(runId)}`,
          { method: "DELETE", headers: automationHeaders }
        );
      } catch (cleanupError) {
        console.error("OIDC E2E emergency cleanup failed", {
          runId,
          message: cleanupError.message,
        });
      }
    }
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authorization = String(req.headers.authorization || "");
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing GitHub OIDC token." });
    }
    await verifyGitHubOidcToken(authorization.slice("Bearer ".length));
    const result = await runApprovedE2E();
    return res.status(200).json(result);
  } catch (error) {
    console.error("OIDC onboarding E2E failed", { message: error.message });
    return res.status(500).json({
      error: "The approved OIDC onboarding E2E did not complete safely.",
    });
  }
}
