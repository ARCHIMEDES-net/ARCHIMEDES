function normalizedAddress(value) {
  return String(value || "").trim().toLowerCase();
}

export function safeSmtpDiagnostics(error) {
  const diagnostics = {};
  const source = error?.smtpDiagnostics || error || {};

  for (const field of ["code", "command", "errno", "syscall"]) {
    const value = source[field];
    if (typeof value === "string" && value.length > 0) {
      diagnostics[field] = value.slice(0, 80);
    }
  }

  const responseCode = Number(source.responseCode);
  if (Number.isInteger(responseCode)) diagnostics.responseCode = responseCode;

  return Object.keys(diagnostics).length
    ? diagnostics
    : { code: "SMTP_ERROR_UNCLASSIFIED" };
}

export function logSafeSmtpFailure(event, error, context = {}) {
  console.error(event, {
    ...context,
    smtp: safeSmtpDiagnostics(error),
  });
}

export function assertSmtpRecipientAccepted(info, recipient) {
  const expected = normalizedAddress(recipient);
  const accepted = Array.isArray(info?.accepted)
    ? info.accepted.map(normalizedAddress)
    : [];
  const rejected = Array.isArray(info?.rejected)
    ? info.rejected.map(normalizedAddress)
    : [];

  if (!expected || !accepted.includes(expected) || rejected.includes(expected)) {
    const error = new Error("SMTP server did not confirm recipient acceptance.");
    error.code = "SMTP_RECIPIENT_NOT_ACCEPTED";
    throw error;
  }

  return info;
}

export async function verifySmtpTransport(transporter) {
  try {
    await transporter.verify();
  } catch (error) {
    const wrapped = new Error("SMTP transport preflight failed.");
    wrapped.code = "SMTP_PREFLIGHT_FAILED";
    wrapped.smtpDiagnostics = safeSmtpDiagnostics(error);
    throw wrapped;
  }
}

export async function sendSmtpMessage(transporter, message) {
  try {
    const info = await transporter.sendMail(message);
    return assertSmtpRecipientAccepted(info, message.to);
  } catch (error) {
    if (error?.code === "SMTP_RECIPIENT_NOT_ACCEPTED") throw error;

    const wrapped = new Error("SMTP delivery result is not confirmed.");
    wrapped.code = "SMTP_DELIVERY_UNCONFIRMED";
    wrapped.smtpDiagnostics = safeSmtpDiagnostics(error);
    throw wrapped;
  }
}
