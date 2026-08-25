import {
  sendRegistrationEmail,
  validateRegistrationEmailConfiguration,
} from "./registrationEmailProvider";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function safeRecoveryUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error("Odkaz pro obnovu hesla není platný.");
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error("Odkaz pro obnovu hesla není bezpečný.");
  }

  return parsed.toString();
}

export function validatePasswordRecoveryEmailConfiguration() {
  validateRegistrationEmailConfiguration();
}

export function passwordRecoveryMessage({ setupUrl }) {
  const recoveryUrl = safeRecoveryUrl(setupUrl);
  const subject = "Obnova hesla – ARCHIMEDES Live";
  const text = [
    "Dobrý den,",
    "",
    "obdrželi jsme žádost o nastavení nového hesla k vašemu účtu ARCHIMEDES Live.",
    "",
    `Nastavit nové heslo: ${recoveryUrl}`,
    "",
    "Odkaz je jednorázový a je určen pouze vám. Pokud jste o změnu hesla nežádali, tento e-mail ignorujte.",
    "",
    "Tým ARCHIMEDES Live",
  ].join("\n");
  const html = `<p>Dobrý den,</p><p>Obdrželi jsme žádost o nastavení nového hesla k vašemu účtu <strong>ARCHIMEDES Live</strong>.</p><p><a href="${escapeHtml(recoveryUrl)}" style="display:inline-block;padding:12px 18px;background:#0f2744;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Nastavit nové heslo</a></p><p>Odkaz je jednorázový a je určen pouze vám. Pokud jste o změnu hesla nežádali, tento e-mail ignorujte.</p><p>Tým ARCHIMEDES Live</p>`;

  return { subject, text, html };
}

export function sendPasswordRecoveryEmail(values, idempotencyKey) {
  return sendRegistrationEmail({
    to: values.recipientEmail,
    ...passwordRecoveryMessage(values),
    idempotencyKey,
  });
}
