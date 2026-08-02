import { fetchMyOrganization } from "./myOrganizations";

export async function resolveActiveOrganizationContext(
  supabase,
  activeOrganizationId
) {
  const organizationId = String(activeOrganizationId || "").trim();
  if (!supabase || !organizationId) return null;

  const organization = await fetchMyOrganization(supabase, organizationId);
  if (!organization?.id) return null;

  return {
    organization,
    organizationId: organization.id,
    roleInOrg: organization.role_in_org || "",
    isOrganizationAdmin:
      organization.role_in_org === "organization_admin",
  };
}
