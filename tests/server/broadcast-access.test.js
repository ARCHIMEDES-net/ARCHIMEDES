import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import {
  assertJoinWindow,
  BroadcastAccessError,
  requireBroadcastViewer,
  webMeetingParticipant,
} from "../../lib/server/broadcastAccess";

const validUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "viewer@example.com",
  user_metadata: {},
};

function viewerRequest(token = "valid-token") {
  return { headers: token ? { authorization: `Bearer ${token}` } : {} };
}

function viewerTables(overrides = {}) {
  return {
    platform_admins: { data: null, error: null },
    profiles: {
      data: {
        id: validUser.id,
        email: validUser.email,
        full_name: "Jana Nováková",
        is_active: true,
        active_organization_id: "org-1",
      },
      error: null,
    },
    organization_members: {
      data: { organization_id: "org-1" },
      error: null,
    },
    organizations: {
      data: {
        id: "org-1",
        org_type: "school",
        status: "active",
        license_status: "active",
        license_valid_until: null,
        parent_organization_id: null,
      },
      error: null,
    },
    ...overrides,
  };
}

describe("broadcast viewer authorization", () => {
  it("requires a bearer token", async () => {
    const { supabase } = createSupabaseMock();

    await expect(requireBroadcastViewer(viewerRequest(null), supabase)).rejects.toMatchObject({
      name: "BroadcastAccessError",
      status: 401,
    });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("rejects an invalid session", async () => {
    const { supabase } = createSupabaseMock({
      userError: new Error("expired"),
    });

    await expect(requireBroadcastViewer(viewerRequest(), supabase)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("allows platform admins without organization membership or a license", async () => {
    const { supabase } = createSupabaseMock({
      user: validUser,
      tableResults: viewerTables({
        platform_admins: { data: { user_id: validUser.id }, error: null },
        profiles: {
          data: {
            id: validUser.id,
            email: validUser.email,
            full_name: "Admin User",
            is_active: true,
            active_organization_id: null,
          },
          error: null,
        },
      }),
    });

    const identity = await requireBroadcastViewer(viewerRequest(), supabase);

    expect(identity).toMatchObject({
      user: validUser,
      isPlatformAdmin: true,
      organizationId: null,
    });
    expect(supabase.from).not.toHaveBeenCalledWith("organization_members");
  });

  it.each([
    [
      "inactive profile",
      {
        profiles: {
          data: {
            id: validUser.id,
            email: validUser.email,
            is_active: false,
            active_organization_id: "org-1",
          },
          error: null,
        },
      },
      "Váš účet není aktivní.",
    ],
    [
      "missing active organization",
      {
        profiles: {
          data: {
            id: validUser.id,
            email: validUser.email,
            is_active: true,
            active_organization_id: null,
          },
          error: null,
        },
      },
      "Pro vstup zvolte aktivní organizaci v profilu.",
    ],
    [
      "missing active membership",
      { organization_members: { data: null, error: null } },
      "Nemáte aktivní členství ve zvolené organizaci.",
    ],
    [
      "inactive organization",
      {
        organizations: {
          data: {
            id: "org-1",
            status: "pending",
            license_status: "active",
          },
          error: null,
        },
      },
      "Zvolená organizace není aktivní.",
    ],
  ])("rejects %s", async (_case, overrides, message) => {
    const { supabase } = createSupabaseMock({
      user: validUser,
      tableResults: viewerTables(overrides),
    });

    await expect(requireBroadcastViewer(viewerRequest(), supabase)).rejects.toThrow(message);
  });

  it("allows an active member of a directly licensed organization", async () => {
    const { supabase } = createSupabaseMock({
      user: validUser,
      tableResults: viewerTables(),
    });

    const identity = await requireBroadcastViewer(viewerRequest(), supabase);

    expect(identity).toMatchObject({
      email: validUser.email,
      organizationId: "org-1",
      isPlatformAdmin: false,
    });
  });

  it("allows a child organization covered by an active municipality license", async () => {
    const organizations = [
      {
        data: {
          id: "school-1",
          org_type: "school",
          status: "active",
          license_status: "inactive",
          parent_organization_id: "municipality-1",
        },
        error: null,
      },
      {
        data: {
          id: "municipality-1",
          org_type: "municipality",
          status: "active",
          license_status: "active",
          license_valid_until: "2099-01-01T00:00:00.000Z",
        },
        error: null,
      },
    ];
    let organizationCall = 0;
    const { supabase } = createSupabaseMock({
      user: validUser,
      tableResults: viewerTables({
        organizations: () => organizations[organizationCall++],
      }),
    });

    const identity = await requireBroadcastViewer(viewerRequest(), supabase);

    expect(identity.organizationId).toBe("org-1");
    expect(organizationCall).toBe(2);
  });

  it("rejects expired direct and parent licenses", async () => {
    const organizations = [
      {
        data: {
          id: "school-1",
          org_type: "school",
          status: "active",
          license_status: "active",
          license_valid_until: "2020-01-01T00:00:00.000Z",
          parent_organization_id: "municipality-1",
        },
        error: null,
      },
      {
        data: {
          id: "municipality-1",
          org_type: "municipality",
          status: "active",
          license_status: "active",
          license_valid_until: "2020-01-01T00:00:00.000Z",
        },
        error: null,
      },
    ];
    let organizationCall = 0;
    const { supabase } = createSupabaseMock({
      user: validUser,
      tableResults: viewerTables({
        organizations: () => organizations[organizationCall++],
      }),
    });

    await expect(requireBroadcastViewer(viewerRequest(), supabase)).rejects.toThrow(
      "Zvolená organizace nemá aktivní program ARCHIMEDES Live."
    );
  });
});

describe("broadcast join window", () => {
  const start = "2026-07-29T12:00:00.000Z";

  it("lets platform admins bypass the time window", () => {
    expect(() => assertJoinWindow("not-a-date", true)).not.toThrow();
  });

  it("rejects an invalid start time", () => {
    expect(() => assertJoinWindow("not-a-date", false)).toThrow(
      "Vysílání nemá platný čas začátku."
    );
  });

  it("opens exactly 15 minutes before the start", () => {
    expect(() =>
      assertJoinWindow(start, false, new Date("2026-07-29T11:45:00.000Z"))
    ).not.toThrow();
    expect(() =>
      assertJoinWindow(start, false, new Date("2026-07-29T11:44:59.999Z"))
    ).toThrow("Vstup se otevře 15 minut před začátkem vysílání.");
  });

  it("closes after the four-hour access window", () => {
    expect(() =>
      assertJoinWindow(start, false, new Date("2026-07-29T16:00:00.000Z"))
    ).not.toThrow();

    try {
      assertJoinWindow(start, false, new Date("2026-07-29T16:00:00.001Z"));
      throw new Error("expected access rejection");
    } catch (error) {
      expect(error).toBeInstanceOf(BroadcastAccessError);
      expect(error.status).toBe(410);
    }
  });
});

describe("WebMeeting participant mapping", () => {
  it("creates a stable participant record from the authenticated identity", () => {
    const identity = {
      user: validUser,
      email: "jana@example.com",
      fullName: "Jana Marie Nováková",
    };

    const first = webMeetingParticipant(identity);
    const second = webMeetingParticipant(identity);

    expect(first).toEqual({
      number: expect.any(Number),
      firstname: "Jana",
      surname: "Marie Nováková",
      email: "jana@example.com",
    });
    expect(first.number).toBeGreaterThan(0);
    expect(first.number).toBeLessThanOrEqual(2147483646);
    expect(second.number).toBe(first.number);
  });

  it("uses email-derived name fallbacks", () => {
    expect(
      webMeetingParticipant({
        user: validUser,
        email: "viewer@example.com",
        fullName: "",
      })
    ).toMatchObject({
      firstname: "viewer",
      surname: "ARCHIMEDES",
    });
  });

  it.each([
    [
      { user: validUser, email: "", fullName: "Viewer" },
      "V profilu chybí platný e-mail",
    ],
    [
      { user: { id: "not-a-uuid" }, email: "viewer@example.com", fullName: "Viewer" },
      "Uživatel nemá platný technický identifikátor.",
    ],
  ])("rejects identities that WebMeeting cannot represent", (identity, message) => {
    expect(() => webMeetingParticipant(identity)).toThrow(message);
  });
});
