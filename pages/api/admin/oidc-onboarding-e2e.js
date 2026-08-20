import { createPublicKey, verify as verifySignature } from "crypto";
import { sendRegistrationEmail } from "../../../lib/server/registrationEmailProvider";

const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_AUDIENCE = "archimedes-onboarding-e2e-pr197";
const EXPECTED_REPOSITORY = "ARCHIMEDES-net/ARCHIMEDES";
const EXPECTED_WORKFLOW_PATH =
  "ARCHIMEDES-net/ARCHIMEDES/.github/workflows/onboarding-e2e-pr197-oidc.yml@";
const EXPECTED_EMAIL = "antonin.koplik+archimedes-e2e@gmail.com";

export const config = {
  maxDuration: 60,
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

function verifyPreviewSmokeEnvironment() {
  const allowlist = String(process.env.ONBOARDING_E2E_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const deploymentHost = String(process.env.VERCEL_URL || "").toLowerCase();
  const environment = String(process.env.VERCEL_ENV || "").toLowerCase();

  if (
    allowlist.length !== 1 ||
    allowlist[0] !== EXPECTED_EMAIL ||
    environment !== "preview" ||
    !/^[a-z0-9.-]+\.vercel\.app$/.test(deploymentHost)
  ) {
    throw new Error("Preview email smoke environment is not safely constrained.");
  }
}

async function runApprovedEmailSmoke(payload) {
  verifyPreviewSmokeEnvironment();
  const runId = String(payload.run_id || "").replace(/[^0-9]/g, "");
  if (!runId) throw new Error("OIDC run ID is missing.");

  const receipt = await sendRegistrationEmail({
    to: EXPECTED_EMAIL,
    subject: "ARCHIMEDES Live – interní test Resend PR #197",
    text: [
      "Toto je jednorázový interní test e-mailového provideru ARCHIMEDES Live.",
      "Nevznikla žádná obec, organizace, registrace ani uživatelský účet.",
      `GitHub run: ${runId}`,
    ].join("\n\n"),
    html: `<p>Toto je jednorázový interní test e-mailového provideru ARCHIMEDES Live.</p><p><strong>Nevznikla žádná obec, organizace, registrace ani uživatelský účet.</strong></p><p>GitHub run: ${runId}</p>`,
    idempotencyKey: `pr197-email-smoke:${runId}:1`,
    headers: { "X-ARCHIMEDES-Message-Type": "pr197-email-smoke" },
  });

  if (receipt.provider !== "resend" || !receipt.messageId) {
    throw new Error("Resend did not return a provider receipt.");
  }

  return {
    ok: true,
    mode: "email-smoke",
    provider: receipt.provider,
    messageId: receipt.messageId,
  };
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
    const payload = await verifyGitHubOidcToken(
      authorization.slice("Bearer ".length)
    );
    const result = await runApprovedEmailSmoke(payload);
    return res.status(200).json(result);
  } catch (error) {
    console.error("OIDC Resend smoke failed", { message: error.message });
    return res.status(500).json({
      error: "The approved OIDC Resend smoke did not complete safely.",
    });
  }
}
