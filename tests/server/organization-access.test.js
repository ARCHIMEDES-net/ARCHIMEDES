import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import { resolveOrganizationAccess } from "../../lib/server/organizationAccess";

describe("organization access resolver", () => {
  it("returns a direct active membership", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: {
          data: {
            organization_id: "school-1",
            role_in_org: "member",
            status: "active",
          },
          error: null,
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "user-1",
        organizationId: "school-1",
      })
    ).resolves.toEqual({
      organizationId: "school-1",
      roleInOrg: "member",
      inherited: false,
      sourceOrganizationId: "school-1",
    });
  });

  it("requires a direct admin when requireAdmin is enabled", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: ({ filters }) => {
          if (filters.organization_id === "school-1") {
            return {
              data: {
                organization_id: "school-1",
                role_in_org: "member",
                status: "active",
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        organizations: ({ filters }, queries) => {
          const organizationQueries = queries.filter((query) => query.table === "organizations");
          if (organizationQueries.length === 1) {
            return {
              data: {
                id: "school-1",
                parent_organization_id: null,
                status: "active",
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "user-1",
        organizationId: "school-1",
        requireAdmin: true,
      })
    ).resolves.toBeNull();
  });

  it("inherits admin access from the active parent municipality", async () => {
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        organization_members: ({ filters }) => {
          if (filters.organization_id === "municipality-1") {
            return {
              data: {
                organization_id: "municipality-1",
                role_in_org: "organization_admin",
                status: "active",
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        organizations: (_query, allQueries) => {
          const organizationQueries = allQueries.filter((query) => query.table === "organizations");
          if (organizationQueries.length === 1) {
            return {
              data: {
                id: "school-1",
                parent_organization_id: "municipality-1",
                status: "active",
              },
              error: null,
            };
          }
          return {
            data: {
              id: "municipality-1",
              org_type: "municipality",
              status: "active",
            },
            error: null,
          };
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "user-1",
        organizationId: "school-1",
        requireAdmin: true,
      })
    ).resolves.toEqual({
      organizationId: "school-1",
      roleInOrg: "organization_admin",
      inherited: true,
      sourceOrganizationId: "municipality-1",
    });

    expect(queries.at(-1).filters).toMatchObject({
      user_id: "user-1",
      organization_id: "municipality-1",
      role_in_org: "organization_admin",
      status: "active",
    });
  });

  it.each([
    [{ id: "municipality-1", org_type: "company", status: "active" }],
    [{ id: "municipality-1", org_type: "municipality", status: "inactive" }],
  ])("does not inherit access from an invalid parent organization", async (parent) => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: { data: null, error: null },
        organizations: (_query, allQueries) => {
          const organizationQueries = allQueries.filter((query) => query.table === "organizations");
          if (organizationQueries.length === 1) {
            return {
              data: {
                id: "school-1",
                parent_organization_id: "municipality-1",
                status: "active",
              },
              error: null,
            };
          }
          return { data: parent, error: null };
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "user-1",
        organizationId: "school-1",
      })
    ).resolves.toBeNull();
  });

  it("does not inherit access across unrelated municipalities", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: { data: null, error: null },
        organizations: (_query, allQueries) => {
          const organizationQueries = allQueries.filter((query) => query.table === "organizations");
          if (organizationQueries.length === 1) {
            return {
              data: {
                id: "school-1",
                parent_organization_id: "municipality-1",
                status: "active",
              },
              error: null,
            };
          }
          return {
            data: {
              id: "municipality-1",
              org_type: "obec",
              status: "active",
            },
            error: null,
          };
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "admin-of-another-municipality",
        organizationId: "school-1",
        requireAdmin: true,
      })
    ).resolves.toBeNull();
  });
});
