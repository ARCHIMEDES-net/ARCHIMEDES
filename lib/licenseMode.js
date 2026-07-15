// get_my_organizations() vrací už efektivní licenci: u školy/spolku stav
// rodičovské obce, u top-level organizace její vlastní stav. Klient proto
// nemusí a nesmí číst celý řádek rodičovské organizace.

const VALID_MODES = ["active", "suspended", "pending_approval"];

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase().trim();
  return VALID_MODES.includes(status) ? status : "inactive";
}

export async function resolveLicenseMode(_supabase, orgId, org) {
  if (!orgId) return "inactive";
  return normalizeStatus(org?.license_status);
}
