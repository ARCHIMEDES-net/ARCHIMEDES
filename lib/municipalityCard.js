export function municipalityNeedsDetails(organization) {
  return ["municipality", "obec"].includes(organization?.org_type) &&
    [organization.legal_identifier || organization.ico, organization.registered_address,
      organization.contact_name, organization.contact_email].some((value) => !String(value || "").trim());
}
