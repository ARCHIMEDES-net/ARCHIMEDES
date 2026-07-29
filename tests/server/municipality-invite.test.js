import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import {
  consumeMunicipalityInvite,
  inspectMunicipalityInvite,
  MunicipalityInviteError,
  resolveMunicipalityInvite,
} from "../../lib/server/municipalityOrganizationInvite";

const rawToken = "A".repeat(43);
const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

function validInvite(overrides = {}) {
  return {
    id: "invite-1",
    municipality_id: "municipality-1",
    organization_type: "school",
    invited_email: "school@example.com",
    status: "pending",
    expires_at: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function activeMunicipality(overrides = {}) {
  return {
    id: "municipality-1",
    name: "Testovací obec",
    status: "active",
    license_status: "active",
    license_valid_until: null,
    ...overrides,
  };
}

describe("municipality organization invitation inspection", () => {
  it.each([
    ["", 403],
    ["short", 404],
    ["!".repeat(43), 404],
    ["A".repeat(129), 404],
  ])("rejects invalid tokens before querying the database", async (token, status) => {
    const { supabase } = createSupabaseMock();

    await expect(
      inspectMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken: token,
        organizationType: "school",
      })
    ).rejects.toMatchObject({
      name: "MunicipalityInviteError",
      status,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("looks up only the SHA-256 token hash", async () => {
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: null, error: null },
      },
    });

    await expect(
      inspectMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
      })
    ).rejects.toMatchObject({ status: 404 });

    expect(queries[0].filters).toEqual({ token_hash: tokenHash });
    expect(JSON.stringify(queries)).not.toContain(rawToken);
  });

  it.each([
    [
      validInvite({ organization_type: "association" }),
      "Tato pozvánka není určena pro školu.",
      403,
    ],
    [
      validInvite({ status: "used" }),
      "Pozvánka už byla použita nebo zrušena.",
      409,
    ],
  ])("rejects invitations with invalid state or organization type", async (invite, message, status) => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: invite, error: null },
      },
    });

    await expect(
      inspectMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
      })
    ).rejects.toMatchObject({ message, status });
  });

  it("marks expired invitations before rejecting them", async () => {
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: {
          data: validInvite({ expires_at: "2020-01-01T00:00:00.000Z" }),
          error: null,
        },
      },
    });

    await expect(
      inspectMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
      })
    ).rejects.toMatchObject({
      message: "Platnost pozvánky vypršela.",
      status: 410,
    });

    expect(queries[1]).toMatchObject({
      table: "municipality_organization_invites",
      filters: { id: "invite-1", status: "pending" },
      mutation: { type: "update", value: { status: "expired" } },
    });
  });

  it.each([
    [null],
    [activeMunicipality({ status: "pending" })],
    [activeMunicipality({ license_status: "inactive" })],
    [activeMunicipality({ license_valid_until: "2020-01-01T00:00:00.000Z" })],
  ])("requires the inviting municipality to have an active program", async (municipality) => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: validInvite(), error: null },
        organizations: { data: municipality, error: null },
      },
    });

    await expect(
      inspectMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
      })
    ).rejects.toMatchObject({
      message: "Program obce není aktivní. Obraťte se na obec.",
      status: 403,
    });
  });

  it("returns a valid invite and constrains the municipality lookup by type", async () => {
    const invite = validInvite();
    const municipality = activeMunicipality();
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: invite, error: null },
        organizations: { data: municipality, error: null },
      },
    });

    await expect(
      inspectMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
      })
    ).resolves.toEqual({ invite, municipality });
    expect(queries[1].filters).toEqual({
      id: "municipality-1",
      org_type: ["municipality", "obec"],
    });
  });
});

describe("municipality invitation binding and consumption", () => {
  it("matches an invited email case-insensitively", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: {
          data: validInvite({ invited_email: " School@Example.COM " }),
          error: null,
        },
        organizations: { data: activeMunicipality(), error: null },
      },
    });

    await expect(
      resolveMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
        email: "school@example.com",
      })
    ).resolves.toMatchObject({ municipality: { id: "municipality-1" } });
  });

  it("rejects use by a different email address", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: validInvite(), error: null },
        organizations: { data: activeMunicipality(), error: null },
      },
    });

    await expect(
      resolveMunicipalityInvite({
        supabaseAdmin: supabase,
        rawToken,
        organizationType: "school",
        email: "attacker@example.com",
      })
    ).rejects.toMatchObject({
      message: "Pozvánka je určena pro jinou e-mailovou adresu.",
      status: 403,
    });
  });

  it("atomically consumes only a pending invitation", async () => {
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: { id: "invite-1" }, error: null },
      },
    });

    await consumeMunicipalityInvite({
      supabaseAdmin: supabase,
      inviteId: "invite-1",
      organizationId: "school-1",
    });

    expect(queries[0]).toMatchObject({
      filters: { id: "invite-1", status: "pending" },
      mutation: {
        type: "update",
        value: {
          status: "used",
          used_organization_id: "school-1",
        },
      },
    });
    expect(queries[0].mutation.value.used_at).toEqual(expect.any(String));
  });

  it("detects concurrent or repeated invitation consumption", async () => {
    const { supabase } = createSupabaseMock({
      tableResults: {
        municipality_organization_invites: { data: null, error: null },
      },
    });

    await expect(
      consumeMunicipalityInvite({
        supabaseAdmin: supabase,
        inviteId: "invite-1",
        organizationId: "school-1",
      })
    ).rejects.toBeInstanceOf(MunicipalityInviteError);
  });
});
