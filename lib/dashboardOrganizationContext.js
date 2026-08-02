import { resolveActiveOrganizationContext } from "./activeOrganizationContext";
import { fetchMyOrganization } from "./myOrganizations";

export async function resolveDashboardOrganizationContext({
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

  const { data: fallbackMembershipRows, error: fallbackMembershipError } =
    await supabase
      .from("organization_members")
      .select("organization_id, status, role_in_org")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("organization_id", { ascending: true })
      .limit(1);

  if (fallbackMembershipError) throw fallbackMembershipError;

  const fallbackMembership = Array.isArray(fallbackMembershipRows)
    ? fallbackMembershipRows[0] || null
    : fallbackMembershipRows || null;

  if (!fallbackMembership?.organization_id) return null;

  const organization = await fetchMyOrganization(
    supabase,
    fallbackMembership.organization_id
  );

  if (!organization?.id) return null;

  return {
    organization,
    organizationId: organization.id,
    roleInOrg:
      organization.role_in_org || fallbackMembership.role_in_org || "",
    isOrganizationAdmin:
      (organization.role_in_org || fallbackMembership.role_in_org) ===
      "organization_admin",
    source: "fallback_membership",
  };
}
