export const MAX_MANUAL_RECIPIENT_EMAILS = 200;
export const MAX_RECIPIENT_GROUP_CODES = 50;

const AUDIENCE_TO_INTEREST = {
  "i. stupeň": "skola_1_stupen",
  "1. stupeň": "skola_1_stupen",
  "ii. stupeň": "skola_2_stupen",
  "2. stupeň": "skola_2_stupen",
  učitelé: "ucitele",
  senioři: "seniori",
  komunita: "komunita",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function normalizeManualRecipientEmails(value) {
  const values = Array.isArray(value) ? value : [value];
  const candidates = values.flatMap((item) =>
    String(item || "")
      .split(/[\s,;]+/u)
      .map((email) => email.trim())
      .filter(Boolean)
  );

  const seen = new Set();
  const emails = [];
  const invalid = [];

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();

    if (
      candidate.length > 254 ||
      !EMAIL_PATTERN.test(candidate) ||
      candidate.includes("\r") ||
      candidate.includes("\n")
    ) {
      invalid.push(candidate);
      continue;
    }

    if (seen.has(normalized)) continue;
    seen.add(normalized);
    emails.push(normalized);
  }

  return { emails, invalid, inputCount: candidates.length };
}

export function normalizeRecipientGroupCodes(value, availableGroups = []) {
  const allowedCodes = new Set(
    availableGroups
      .map((group) => (typeof group === "string" ? group : group?.slug))
      .map((code) => String(code || "").trim())
      .filter(Boolean)
  );
  const shouldFilter = allowedCodes.size > 0;
  const seen = new Set();

  return (Array.isArray(value) ? value : [])
    .map((code) => String(code || "").trim())
    .filter((code) => {
      if (!code || seen.has(code) || (shouldFilter && !allowedCodes.has(code))) return false;
      seen.add(code);
      return true;
    })
    .slice(0, MAX_RECIPIENT_GROUP_CODES);
}

export function suggestRecipientGroups(event, availableGroups) {
  const availableCodes = new Set(
    availableGroups.map((group) => (typeof group === "string" ? group : group.slug))
  );
  const audience = Array.isArray(event?.audience_groups)
    ? event.audience_groups
    : String(event?.audience || "").split(",");

  return [
    ...new Set(
      audience
        .map((value) => String(value || "").trim().toLocaleLowerCase("cs"))
        .map((value) => (availableCodes.has(value) ? value : AUDIENCE_TO_INTEREST[value]))
        .filter((value) => value && availableCodes.has(value))
    ),
  ];
}

export function getInitialRecipientGroups({
  event,
  availableGroups,
  persistedCodes,
  configured,
}) {
  return configured
    ? normalizeRecipientGroupCodes(persistedCodes, availableGroups)
    : suggestRecipientGroups(event, availableGroups);
}
