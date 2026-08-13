export const MAX_MANUAL_RECIPIENT_EMAILS = 200;

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
