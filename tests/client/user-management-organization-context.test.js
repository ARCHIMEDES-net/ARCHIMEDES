import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/activeOrganizationContext", () => ({
  resolveActiveOrganizationContext: vi.fn(),
}));

vi.mock("../../lib/myOrganizations", () => ({
  fetchMyOrganization: vi.fn(),
}));

import { resolveActiveOrganizationContext } from "../../lib/activeOrganizationContext";
import { fetchMyOrganization } from "../../lib/myOrganizations";
import { resolveUserManagementOrganizationContext } from "../../lib/userManagementOrganizationContext";

function createSupabase({ memberships = [], error = null } = {}) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    limit: vi.fn(async () => ({ data: memberships, error })),
  };

  return {
    from: vi.fn(() => query),
  };
}

describe("user management organization context resolver", () => {
  it("uses inherited active organization context before direct memberships", async () => {
    const activeContext = {
      organization: {
        id: "school-child",
        org_type: "school",
        role_in_org: "organization_admin",
      },
      organizationId: "school-child",
      roleInOrg: "organization_admin",
      isOrganizationAdmin: true,
    };

    resolveActiveOrganizationContext.mockResolvedValueOnce(activeContext);
    const supabase = createSupabase();

    await expect(
      resolveUserManagementOrganizationContext({
        supabase,
        userId: "municipality-admin",
        activeOrganizationId: "school-child",
      })
    ).resolves.toMatchObject({
      organizationId: "school-child",
      roleInOrg: "organization_admin",
      isOrganizationAdmin: true,
      source: "active",
    });

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("falls back only when there is exactly one direct active membership", async () => {
    resolveActiveOrganizationContext.mockResolvedValueOnce(null);
    fetchMyOrganization.mockResolvedValueOnce({
      id: "school-direct",
      org_type: "school",
      role_in_org: "member",
    });

    const supabase = createSupabase({
      memberships: [
        {
          organization_id: "school-direct",
          role_in_org: "member",
          status: "active",
        },
      ],
    });

    await expect(
      resolveUserManagementOrganizationContext({
        supabase,
        userId: "teacher",
        activeOrganizationId: "",
      })
    ).resolves.toMatchObject({
      organizationId: "school-direct",
      roleInOrg: "member",
      isOrganizationAdmin: false,
      source: "single_direct_membership",
    });
  });

  it("does not choose an arbitrary organization when multiple direct memberships exist", async () => {
    resolveActiveOrganizationContext.mockResolvedValueOnce(null);
    const supabase = createSupabase({
      memberships: [
        { organization_id: "school-a", role_in_org: "member", status: "active" },
        { organization_id: "school-b", role_in_org: "member", status: "active" },
      ],
    });

    await expect(
      resolveUserManagementOrganizationContext({
        supabase,
        userId: "multi-member",
        activeOrganizationId: "missing",
      })
    ).resolves.toBeNull();

    expect(fetchMyOrganization).not.toHaveBeenCalled();
  });

  it("returns null without a signed-in user", async () => {
    await expect(
      resolveUserManagementOrganizationContext({
        supabase: createSupabase(),
        userId: "",
        activeOrganizationId: "school-a",
      })
    ).resolves.toBeNull();
  });
});
