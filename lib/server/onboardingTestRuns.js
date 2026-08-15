const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseOnboardingTestEmailAllowlist(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  );
}

export function isOnboardingTestEmailAllowed(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  return parseOnboardingTestEmailAllowlist(
    process.env.ONBOARDING_E2E_EMAIL_ALLOWLIST
  ).has(cleanEmail);
}

export function isUuid(value) {
  return UUID_PATTERN.test(String(value || "").trim());
}

export function buildOnboardingTestOrganizationName(runId) {
  if (!isUuid(runId)) throw new Error("Invalid onboarding test run id");
  return `TEST – E2E onboarding ${runId}`;
}

