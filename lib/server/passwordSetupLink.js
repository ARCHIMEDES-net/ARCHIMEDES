// lib/server/passwordSetupLink.js
//
// Odkazy z auth.admin.generateLink() (action_link) míří přímo na Supabase /verify.
// Jednorázový token se spotřebuje už při prvním načtení URL – a to často udělá
// bezpečnostní skener školní pošty (např. Microsoft 365 Safe Links) dřív než učitel.
// Učitel pak vidí „Odkaz není platný nebo vypršel“.
//
// Proto do e-mailů dáváme odkaz na naši stránku /nastavit-heslo s token_hash.
// Stránka token NEOVĚŘUJE při načtení – ověří ho až po kliknutí na tlačítko,
// takže automatické načtení skenerem token nespotřebuje.

const ALLOWED_TYPES = new Set(["recovery", "invite", "signup", "magiclink", "email"]);

export function buildPasswordSetupUrl(linkData, redirectTo, fallbackType = "recovery") {
  const properties = linkData?.properties || {};
  const actionLink = properties.action_link || "";
  const hashedToken = properties.hashed_token || "";
  const verificationType = ALLOWED_TYPES.has(properties.verification_type)
    ? properties.verification_type
    : fallbackType;

  if (!hashedToken || !redirectTo) return actionLink;

  try {
    const url = new URL(redirectTo);
    url.searchParams.set("token_hash", hashedToken);
    url.searchParams.set("type", verificationType);
    return url.toString();
  } catch {
    return actionLink;
  }
}
