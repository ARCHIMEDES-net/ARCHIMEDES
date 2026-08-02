import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import { resolveDashboardOrganizationContext } from "../../lib/dashboardOrganizationContext";

describe("dashboard organization context resolver", () => {
  it("uses the accessible active organization before direct memberships", async () => {
    const { supabase, queries } = createSupabaseMock({
      rpcResult: {
        data: [
          {
            id: "school-1",
            name: "School 1",
            org_type: "school",
            role_in_org: "organization_admin",
          },
        ],
        error: null,
      },
    });

    await expect(
      resolveDashboardOrganizationContext({
        supabase,
        userId: "municipality-admin",
        activeOrganizationId: "school-1",
      })
    ).resolves.toMatchObject({
      organizationId: "school-1",
      roleInOrg: "organization_admin",
      isOrganizationAdmin: true,
      source: "active",
    });

    expect(queries).toHaveLength(0);
  });

  it("falls back to one direct active membership when active context is unavailable", async () => {
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        organization_members: {
          data: {
            organization_id: "school-direct",
            status: "active",
            role_in_org: "member",
          },
          error: null,
        },
      },
    });

    supabase.rpc
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [
          {
            id: "school-direct",
            name: "Direct school",
            org_type: "school",
            role_in_org: "member",
          },
        ],
        error: null,
      });

    await expect(
      resolveDashboardOrganizationContext({
        supabase,
        userId: "direct-member",
        activeOrganizationId: "missing-school",
      })
    ).resolves.toMatchObject({
      organizationId: "school-direct",
      roleInOrg: "member",
      isOrganizationAdmin: false,
      source: "fallback_membership",
    });

    expect(queries[0].filters).toMatchObject({
      user_id: "direct-member",
      status: "active",
    });
  });

  it("returns null when neither active context nor direct membership is available", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: { data: null, error: null },
      },
      rpcResult: { data: [], error: null },
    });

    await expect(
      resolveDashboardOrganizationContext({
        supabase,
        userId: "user-without-organization",
        activeOrganizationId: "",
      })
    ).resolves.toBeNull();
  });

  it("does not resolve context without a signed-in user", async () => {
    const { supabase, queries } = createSupabaseMock();

    await expect(
      resolveDashboardOrganizationContext({
        supabase,
        userId: "",
        activeOrganizationId: "school-1",
      })
    ).resolves.toBeNull();

    expect(queries).toHaveLength(0);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
