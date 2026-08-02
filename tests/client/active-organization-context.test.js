import { describe, expect, it, vi } from "vitest";
import { resolveActiveOrganizationContext } from "../../lib/activeOrganizationContext";

vi.mock("../../lib/myOrganizations", () => ({
  fetchMyOrganization: vi.fn(),
}));

import { fetchMyOrganization } from "../../lib/myOrganizations";

describe("active organization context resolver", () => {
  it("returns null without an active organization", async () => {
    await expect(
      resolveActiveOrganizationContext({}, "")
    ).resolves.toBeNull();
    expect(fetchMyOrganization).not.toHaveBeenCalled();
  });

  it("uses the scoped organization RPC result as the source of role", async () => {
    fetchMyOrganization.mockResolvedValueOnce({
      id: "school-1",
      name: "Testovací škola",
      org_type: "school",
      role_in_org: "organization_admin",
    });

    const supabase = {};
    await expect(
      resolveActiveOrganizationContext(supabase, "school-1")
    ).resolves.toEqual({
      organization: {
        id: "school-1",
        name: "Testovací škola",
        org_type: "school",
        role_in_org: "organization_admin",
      },
      organizationId: "school-1",
      roleInOrg: "organization_admin",
      isOrganizationAdmin: true,
    });

    expect(fetchMyOrganization).toHaveBeenCalledWith(supabase, "school-1");
  });

  it("does not elevate a regular member", async () => {
    fetchMyOrganization.mockResolvedValueOnce({
      id: "school-1",
      role_in_org: "member",
    });

    await expect(
      resolveActiveOrganizationContext({}, "school-1")
    ).resolves.toMatchObject({
      roleInOrg: "member",
      isOrganizationAdmin: false,
    });
  });

  it("returns null when the active organization is not accessible", async () => {
    fetchMyOrganization.mockResolvedValueOnce(null);

    await expect(
      resolveActiveOrganizationContext({}, "missing-org")
    ).resolves.toBeNull();
  });
});
