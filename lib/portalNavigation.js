export const communityLinks = [
  ["Komunitní příspěvky", "/portal/komunita"],
  ["Soutěže a projekty", "/portal/souteze"],
  ["Křídla", "/portal/kridla"],
  ["Síť učeben", "/portal/skoly"],
  ["Inzerce", "/portal/inzerce"],
];

export const administrationGroups = [
  { title: "Vysílání a obsah", links: [
    ["Správa vysílání", "/portal/admin/udalosti"],
    ["Nová událost", "/portal/admin-udalosti/novy"],
    ["E-mailové skupiny", "/portal/email-skupiny"],
    ["Pracovní listy", "/portal/pracovni-listy"],
    ["Komunitní příspěvky", "/portal/komunita"],
    ["Soutěže a projekty", "/portal/souteze"],
    ["Materiály Křídla", "/portal/kridla"],
    ["Moderace inzerce", "/portal/admin-inzerce"],
    ["Správa sítě učeben", "/portal/admin-skoly"],
  ] },
  { title: "Organizace a přístupy", links: [
    ["Všechny organizace", "/portal/admin/organizace"],
    ["Zákazníci a licence", "/portal/admin/obce"],
    ["Onboarding obcí a schvalování", "/portal/admin/onboarding"],
    ["START objednávky a školy", "/portal/admin-start"],
    ["Poptávky", "/portal/admin-poptavky"],
  ] },
  { title: "Provozní kontroly", links: [
    ["Provozní upozornění", "/portal/admin/upozorneni"],
    ["Profilové případy", "/portal/admin/upominky-profilu"],
  ] },
];

export function organizationAdminHref(org) {
  return org.org_type === "school" && org.parent_organization_id
    ? `/portal/admin/skoly/${org.id}/onboarding`
    : `/portal/admin/obce/${org.id}`;
}

export function filterOrganizations(rows, query, type = "", includeSystem = false) {
  const normalize = (text) => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const needle = normalize(query).trim();
  return rows.filter((org) => (includeSystem || !org.is_system)
    && (!type || org.org_type === type || (type === "municipality" && org.org_type === "obec") || (type === "association" && org.org_type === "spolek"))
    && normalize(`${org.name} ${org.parent_name || ""}`).includes(needle));
}

// Keep the selected section on detail pages without selecting Portal everywhere.
export function isPortalSectionActive(path, href) {
  const cleanPath = String(path || "").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return cleanPath === href || (href !== "/portal" && href !== "/portal/admin" && cleanPath.startsWith(`${href}/`));
}

export function eventNavigation(from, isArchive = false) {
  const archive = from === "archiv" || (from !== "program" && isArchive);
  return archive
    ? { href: "/portal/archiv", label: "Zpět do Archivu" }
    : { href: "/portal/kalendar", label: "Zpět na Program" };
}
