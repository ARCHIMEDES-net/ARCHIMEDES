import { resolveActiveOrganizationContext } from "./activeOrganizationContext";
import { fetchMyOrganization } from "./myOrganizations";

export async function resolveUserManagementOrganizationContext({
  supabase,
  userId,
  activeOrganizationId,
}) {
  if (!supabase || !userId) return null;

  const activeContext = await resolveActiveOrganizationContext(
    supabase,
    activeOrganizationId
  );

  if (activeContext) {
    return {
      ...activeContext,
      source: "active",
    };
  }

  const { data: fallbackMemberships, error: fallbackMembershipError } =
    await supabase
      .from("organization_members")
      .select("organization_id, role_in_org, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1000);

  if (fallbackMembershipError) throw fallbackMembershipError;

  const rows = Array.isArray(fallbackMemberships)
    ? fallbackMemberships
    : [];

  if (rows.length !== 1 || !rows[0]?.organization_id) return null;

  const membership = rows[0];
  const organization = await fetchMyOrganization(
    supabase,
    membership.organization_id
  );

  if (!organization?.id) return null;

  const roleInOrg = organization.role_in_org || membership.role_in_org || "";

  return {
    organization,
    organizationId: organization.id,
    roleInOrg,
    isOrganizationAdmin: roleInOrg === "organization_admin",
    source: "single_direct_membership",
  };
}
