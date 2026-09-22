import { validateRegistrationEmailConfiguration } from "./registrationEmailProvider";

export function invitationMessage(event) {
  validateRegistrationEmailConfiguration();
  const title = String(event.title || "Vysílání ARCHIMEDES Live").replace(/[\r\n]+/g, " ");
  const date = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague", dateStyle: "long", timeStyle: "short",
  }).format(new Date(event.starts_at));
  const url = `https://www.archimedeslive.com/portal/udalost/${encodeURIComponent(event.id)}`;
  return {
    from: process.env.REGISTRATION_EMAIL_FROM.trim(),
    ...(process.env.REGISTRATION_EMAIL_REPLY_TO?.trim()
      ? { reply_to: process.env.REGISTRATION_EMAIL_REPLY_TO.trim() } : {}),
    subject: `Pozvánka: ${title}`,
    text: `Dobrý den,\n\nzveme vás na vysílání ARCHIMEDES Live:\n${title}\n${date} (český čas)\n\nDetail vysílání a vstup: ${url}\n\nNa stránce se přihlaste do svého účtu. Svůj zájem můžete potvrdit tlačítkem „Zúčastním se“. Vstup do vysílání se zpřístupní před jeho začátkem podle vašeho oprávnění. Tato pozvánka sama o sobě nepotvrzuje účast ani neposkytuje licenci.\n\nARCHIMEDES Live\nNastavení e-mailových upozornění najdete ve svém profilu na platformě.`,
  };
}

export async function sendInvitationBatch(db, batch) {
  validateRegistrationEmailConfiguration();
  // Resend retains idempotency keys for 24 hours. Never resend an ambiguous
  // old batch automatically after that window, even with the same key.
  if (Date.now() - new Date(batch.first_attempt_at).getTime() >= 23 * 60 * 60 * 1000) {
    throw new Error("Dřívější rozesílka vyžaduje ověření stavu odeslání správcem. Další pozvánky nebyly odeslány, aby nevznikly duplicity.");
  }
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `broadcast-invitation:${batch.id}`,
    },
    body: JSON.stringify(batch.payload),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.data?.length !== batch.payload.length || result.data.some((item) => !item.id)) {
    throw new Error(response.status === 429
      ? "E-mailová služba je nyní vytížená. Za chvíli spusťte rozesílku znovu; již přijaté pozvánky se neopakují."
      : "E-mailová služba nepotvrdila celou dávku. Spusťte rozesílku znovu; již přijaté pozvánky se neopakují.");
  }
  const { error } = await db.from("broadcast_invitation_batches").update({
    accepted_at: new Date().toISOString(),
    provider_message_ids: result.data.map((item) => item.id),
  }).eq("id", batch.id);
  if (error) throw new Error("Výsledek rozesílky se nepodařilo uložit. Opakujte rozesílku pro bezpečné ověření již přijaté dávky.");
  return batch.payload.length;
}
