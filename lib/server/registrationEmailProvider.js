const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TIMEOUT_MS = 15_000;

export class RegistrationEmailProviderError extends Error {
  constructor(message, code = "REGISTRATION_EMAIL_PROVIDER_ERROR") {
    super(message);
    this.name = "RegistrationEmailProviderError";
    this.code = code;
  }
}

function requiredEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new RegistrationEmailProviderError(
      `Chybí konfigurace ${name}.`,
      "REGISTRATION_EMAIL_CONFIG_MISSING"
    );
  }
  return value;
}

export function validateRegistrationEmailConfiguration() {
  requiredEnvironment("RESEND_API_KEY");
  requiredEnvironment("REGISTRATION_EMAIL_FROM");
}

function validateIdempotencyKey(value) {
  const key = String(value || "").trim();
  if (!key || key.length > 256 || !/^[A-Za-z0-9:_-]+$/.test(key)) {
    throw new RegistrationEmailProviderError(
      "Idempotentní klíč registračního e-mailu není platný.",
      "REGISTRATION_EMAIL_IDEMPOTENCY_KEY_INVALID"
    );
  }
  return key;
}

export async function sendRegistrationEmail({
  to,
  subject,
  text,
  html,
  idempotencyKey,
  headers,
}) {
  validateRegistrationEmailConfiguration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const replyTo = String(process.env.REGISTRATION_EMAIL_REPLY_TO || "").trim();

  try {
    const response = await fetch(RESEND_EMAILS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requiredEnvironment("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": validateIdempotencyKey(idempotencyKey),
      },
      body: JSON.stringify({
        from: requiredEnvironment("REGISTRATION_EMAIL_FROM"),
        to: [to],
        subject,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(headers ? { headers } : {}),
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.id) {
      throw new RegistrationEmailProviderError(
        "Provider registrační e-mail nepřijal.",
        response.ok
          ? "REGISTRATION_EMAIL_PROVIDER_INVALID_RESPONSE"
          : "REGISTRATION_EMAIL_PROVIDER_REJECTED"
      );
    }
    return { provider: "resend", messageId: payload.id };
  } catch (error) {
    if (error instanceof RegistrationEmailProviderError) throw error;
    throw new RegistrationEmailProviderError(
      error?.name === "AbortError"
        ? "Odeslání registračního e-mailu vypršelo."
        : "Provider registračního e-mailu není dostupný.",
      error?.name === "AbortError"
        ? "REGISTRATION_EMAIL_PROVIDER_TIMEOUT"
        : "REGISTRATION_EMAIL_PROVIDER_UNAVAILABLE"
    );
  } finally {
    clearTimeout(timeout);
  }
}
