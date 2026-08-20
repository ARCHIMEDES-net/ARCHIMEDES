const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFINITIVE_REJECTION_HTTP_STATUSES = new Set([
  400,
  401,
  403,
  404,
  405,
  422,
  429,
  451,
]);

export class RegistrationEmailProviderError extends Error {
  constructor(
    message,
    code = "REGISTRATION_EMAIL_PROVIDER_ERROR",
    { deliveryOutcome = "unknown", httpStatus = null } = {}
  ) {
    super(message);
    this.name = "RegistrationEmailProviderError";
    this.code = code;
    this.deliveryOutcome = deliveryOutcome;
    this.httpStatus = Number.isInteger(httpStatus) ? httpStatus : null;
  }
}

export function registrationEmailWasDefinitelyNotSent(error) {
  return (
    error instanceof RegistrationEmailProviderError &&
    error.deliveryOutcome === "not_sent"
  );
}

function requiredEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new RegistrationEmailProviderError(
      `Chybí konfigurace ${name}.`,
      "REGISTRATION_EMAIL_CONFIG_MISSING",
      { deliveryOutcome: "not_sent" }
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
      "REGISTRATION_EMAIL_IDEMPOTENCY_KEY_INVALID",
      { deliveryOutcome: "not_sent" }
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
        "User-Agent": "ARCHIMEDES-Live/1.0",
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
      const httpStatus = Number(response.status);
      const definitivelyRejected =
        Number.isInteger(httpStatus) &&
        DEFINITIVE_REJECTION_HTTP_STATUSES.has(httpStatus);
      throw new RegistrationEmailProviderError(
        "Provider registrační e-mail nepřijal.",
        response.ok
          ? "REGISTRATION_EMAIL_PROVIDER_INVALID_RESPONSE"
          : "REGISTRATION_EMAIL_PROVIDER_REJECTED",
        {
          deliveryOutcome: definitivelyRejected ? "not_sent" : "unknown",
          httpStatus,
        }
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
