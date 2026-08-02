function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export async function resolveOrganizationAccess({
  supabaseAdmin,
  userId,
  organizationId,
  requireAdmin = false,
}) {
  if (!supabaseAdmin || !userId || !organizationId) return null;

  const { data: directMembership, error: directMembershipError } =
    await supabaseAdmin
      .from("organization_members")
      .select("organization_id, role_in_org, status")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .maybeSingle();

  if (directMembershipError) throw directMembershipError;

  if (
    directMembership?.organization_id &&
    (!requireAdmin || directMembership.role_in_org === "organization_admin")
  ) {
    return {
      organizationId,
      roleInOrg: directMembership.role_in_org || "member",
      inherited: false,
      sourceOrganizationId: organizationId,
    };
  }

  const { data: targetOrganization, error: targetOrganizationError } =
    await supabaseAdmin
      .from("organizations")
      .select("id, parent_organization_id, status")
      .eq("id", organizationId)
      .maybeSingle();

  if (targetOrganizationError) throw targetOrganizationError;
  if (
    !targetOrganization ||
    normalize(targetOrganization.status) !== "active" ||
    !targetOrganization.parent_organization_id
  ) {
    return null;
  }

  const { data: parentOrganization, error: parentOrganizationError } =
    await supabaseAdmin
      .from("organizations")
      .select("id, org_type, status")
      .eq("id", targetOrganization.parent_organization_id)
      .maybeSingle();

  if (parentOrganizationError) throw parentOrganizationError;
  if (
    !parentOrganization ||
    normalize(parentOrganization.status) !== "active" ||
    !["municipality", "obec"].includes(normalize(parentOrganization.org_type))
  ) {
    return null;
  }

  const { data: municipalityMembership, error: municipalityMembershipError } =
    await supabaseAdmin
      .from("organization_members")
      .select("organization_id, role_in_org, status")
      .eq("user_id", userId)
      .eq("organization_id", parentOrganization.id)
      .eq("role_in_org", "organization_admin")
      .eq("status", "active")
      .maybeSingle();

  if (municipalityMembershipError) throw municipalityMembershipError;
  if (!municipalityMembership?.organization_id) return null;

  return {
    organizationId,
    roleInOrg: "organization_admin",
    inherited: true,
    sourceOrganizationId: parentOrganization.id,
  };
}
