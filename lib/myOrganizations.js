export async function fetchMyOrganizations(supabase, organizationIds = null) {
  const requestedIds = Array.isArray(organizationIds)
    ? [...new Set(organizationIds.filter(Boolean))]
    : null;

  if (requestedIds && requestedIds.length === 0) return [];

  const { data, error } = await supabase.rpc("get_my_organizations", {
    requested_ids: requestedIds,
  });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function fetchMyOrganization(supabase, organizationId) {
  if (!organizationId) return null;
  const rows = await fetchMyOrganizations(supabase, [organizationId]);
  return rows[0] || null;
}
