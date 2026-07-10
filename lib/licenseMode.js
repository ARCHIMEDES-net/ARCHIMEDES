// Shared license-mode resolution for the portal.
//
// Rozhodnutí 9. 7. 2026: školy a spolky nemají vlastní stav licence — dědí ho
// od obce (top-level organizace), pod kterou patří. Organizace s vyplněným
// parent_organization_id nemají vlastní license_status; použije se stav
// rodičovské organizace.
//
// parent_organization_id zatím neexistuje jako sloupec v Supabase (blok A).
// Dokud nebude přidán, lookup níže spadne do catch a chová se jako dnes
// (org nemá parenta) — jakmile sloupec přibude, dědění se aktivuje samo.

const VALID_MODES = ["active", "suspended", "pending_approval"];

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase().trim();
  return VALID_MODES.includes(status) ? status : "inactive";
}

export async function resolveLicenseMode(supabase, orgId, org) {
  if (!orgId) return "inactive";

  let effectiveStatus = org?.license_status;

  try {
    const { data: parentLink, error: parentLinkError } = await supabase
      .from("organizations")
      .select("parent_organization_id")
      .eq("id", orgId)
      .maybeSingle();

    if (!parentLinkError && parentLink?.parent_organization_id) {
      const { data: parentOrg, error: parentOrgError } = await supabase
        .from("organizations")
        .select("license_status")
        .eq("id", parentLink.parent_organization_id)
        .maybeSingle();

      if (!parentOrgError && parentOrg) {
        effectiveStatus = parentOrg.license_status;
      }
    }
  } catch (_e) {
    // parent_organization_id sloupec ještě neexistuje — použij vlastní záznam
  }

  return normalizeStatus(effectiveStatus);
}
