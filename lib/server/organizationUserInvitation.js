import {
  sendRegistrationEmail,
  validateRegistrationEmailConfiguration,
} from "./registrationEmailProvider";

export const ORGANIZATION_USER_INVITATION_AUDIT_EMAIL =
  "zuzana.novotna@archimedeslive.com";

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

function safeSetupUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error("Odkaz pozvánky není platný.");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error("Odkaz pozvánky není bezpečný.");
  }
  return parsed.toString();
}

export function validateOrganizationUserInvitationEmailConfiguration() {
  validateRegistrationEmailConfiguration();
}

export function organizationUserInvitationMessage({
  fullName,
  organizationName,
  roleLabel,
  setupUrl,
}) {
  const accessUrl = safeSetupUrl(setupUrl);
  const greeting = fullName ? `Dobrý den, ${fullName},` : "Dobrý den,";
  const subject = `Pozvánka do ARCHIMEDES Live – ${organizationName}`;
  const text = `${greeting}\n\nbyl vám připraven přístup do platformy ARCHIMEDES Live pro organizaci ${organizationName}.\n\nRole: ${roleLabel}\n\nNastavit heslo a dokončit přístup: ${accessUrl}\n\nOdkaz je jednorázový a je určen pouze vám.\n\nTým ARCHIMEDES Live`;
  const html = `<p>${escapeHtml(greeting)}</p><p>Byl vám připraven přístup do platformy <strong>ARCHIMEDES Live</strong> pro organizaci <strong>${escapeHtml(organizationName)}</strong>.</p><p><strong>Role:</strong> ${escapeHtml(roleLabel)}</p><p><a href="${escapeHtml(accessUrl)}" style="display:inline-block;padding:12px 18px;background:#0f2744;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Nastavit heslo a dokončit přístup</a></p><p>Odkaz je jednorázový a je určen pouze vám.</p><p>Tým ARCHIMEDES Live</p>`;

  return { subject, text, html };
}

export function organizationUserInvitationAuditCopyMessage({
  recipientEmail,
  fullName,
  organizationName,
  roleLabel,
}) {
  const subject = `Kopie pozvánky: ${organizationName}`;
  const text = [
    "Automatická bezpečná kopie pozvánky ARCHIMEDES Live.",
    "",
    `Organizace: ${organizationName}`,
    `Příjemce: ${recipientEmail}`,
    `Jméno: ${fullName}`,
    `Role: ${roleLabel}`,
    "",
    "Jednorázový aktivační odkaz ani token nejsou z bezpečnostních důvodů součástí této kopie.",
  ].join("\n");
  const html = `<p><strong>Automatická bezpečná kopie pozvánky ARCHIMEDES Live.</strong></p><ul><li><strong>Organizace:</strong> ${escapeHtml(organizationName)}</li><li><strong>Příjemce:</strong> ${escapeHtml(recipientEmail)}</li><li><strong>Jméno:</strong> ${escapeHtml(fullName)}</li><li><strong>Role:</strong> ${escapeHtml(roleLabel)}</li></ul><p>Jednorázový aktivační odkaz ani token nejsou z bezpečnostních důvodů součástí této kopie.</p>`;
  return { subject, text, html };
}

export function sendOrganizationUserInvitation(values, idempotencyKey) {
  return sendRegistrationEmail({
    to: values.recipientEmail,
    ...organizationUserInvitationMessage(values),
    idempotencyKey,
  });
}

export function sendOrganizationUserInvitationAuditCopy(values, idempotencyKey) {
  return sendRegistrationEmail({
    to: ORGANIZATION_USER_INVITATION_AUDIT_EMAIL,
    ...organizationUserInvitationAuditCopyMessage(values),
    idempotencyKey,
  });
}
