import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import { resolveOrganizationAccess } from "../../lib/server/organizationAccess";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

describe("organization access gap matrix", () => {
  it("keeps a direct active school administrator authorized", async () => {
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        organization_members: {
          data: {
            organization_id: "school-1",
            role_in_org: "organization_admin",
            status: "active",
          },
          error: null,
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "school-admin",
        organizationId: "school-1",
        requireAdmin: true,
      })
    ).resolves.toEqual({
      organizationId: "school-1",
      roleInOrg: "organization_admin",
      inherited: false,
      sourceOrganizationId: "school-1",
    });

    expect(queries.filter((query) => query.table === "organizations")).toHaveLength(0);
  });

  it("rejects inherited access when the target child organization is inactive", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: { data: null, error: null },
        organizations: {
          data: {
            id: "school-1",
            parent_organization_id: "municipality-1",
            status: "inactive",
          },
          error: null,
        },
      },
    });

    await expect(
      resolveOrganizationAccess({
        supabaseAdmin: supabase,
        userId: "municipality-admin",
        organizationId: "school-1",
        requireAdmin: true,
      })
    ).resolves.toBeNull();
  });

  it("rejects an inactive or missing municipality administrator membership", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: { data: null, error: null },
        organizations: (_query, allQueries) => {
          const organizationQueries = allQueries.filter(
            (query) => query.table === "organizations"
          );

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
        userId: "former-municipality-admin",
        organizationId: "school-1",
        requireAdmin: true,
      })
    ).resolves.toBeNull();
  });

  it("does not inherit through a non-municipality parent or multiple levels", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        organization_members: { data: null, error: null },
        organizations: (_query, allQueries) => {
          const organizationQueries = allQueries.filter(
            (query) => query.table === "organizations"
          );

          if (organizationQueries.length === 1) {
            return {
              data: {
                id: "club-1",
                parent_organization_id: "school-1",
                status: "active",
              },
              error: null,
            };
          }

          return {
            data: {
              id: "school-1",
              org_type: "school",
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
        userId: "municipality-admin",
        organizationId: "club-1",
        requireAdmin: true,
      })
    ).resolves.toBeNull();
  });

  it("does not introduce Auth, password, or account mutations", () => {
    const productionFiles = [
      "components/PortalHeader.js",
      "components/RequireAuth.js",
      "lib/activeOrganizationContext.js",
      "lib/server/organizationAccess.js",
      "lib/server/broadcastAccess.js",
      "pages/api/invite-user.js",
      "pages/portal/archiv.js",
    ];

    const source = productionFiles.map(read).join("\n").toLowerCase();

    expect(source).not.toContain("updateuserbyid");
    expect(source).not.toContain("deleteuser");
    expect(source).not.toContain("password:");
    expect(source).not.toContain("auth.admin.update");
  });
});
