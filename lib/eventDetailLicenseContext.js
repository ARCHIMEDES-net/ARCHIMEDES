import { resolveActiveOrganizationContext } from "./activeOrganizationContext";
import { resolveLicenseMode } from "./licenseMode";

export async function resolveEventDetailLicenseContext({
  supabase,
  activeOrganizationId,
}) {
  if (!supabase || !activeOrganizationId) {
    return {
      organizationId: activeOrganizationId || "",
      organization: null,
      licenseMode: "active",
    };
  }

  const context = await resolveActiveOrganizationContext(
    supabase,
    activeOrganizationId
  );

  if (!context?.organization?.id) {
    return {
      organizationId: activeOrganizationId,
      organization: null,
      licenseMode: "active",
    };
  }

  const licenseMode = await resolveLicenseMode(
    supabase,
    context.organization.id,
    context.organization
  );

  return {
    organizationId: context.organization.id,
    organization: context.organization,
    licenseMode,
  };
}
