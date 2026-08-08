import { describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import {
  cleanupNewRegistrant,
  resolveOrganizationRegistrant,
} from "../../lib/server/organizationRegistrant";

const request = (token) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

const authenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  user_metadata: { full_name: "Existing Owner" },
};

describe("organization registrant resolution", () => {
  it("rejects an invalid authenticated session", async () => {
    const { supabase } = createSupabaseMock({
      userError: new Error("expired"),
    });

    await expect(
      resolveOrganizationRegistrant({
        supabaseAdmin: supabase,
        req: request("expired"),
        email: "owner@example.com",
      })
    ).rejects.toMatchObject({ status: 401 });
  });

  it("prevents an authenticated user from registering another email", async () => {
    const { supabase } = createSupabaseMock({ user: authenticatedUser });

    await expect(
      resolveOrganizationRegistrant({
        supabaseAdmin: supabase,
        req: request("valid"),
        email: "other@example.com",
      })
    ).rejects.toMatchObject({
      message: "E-mail v pozvánce se neshoduje s přihlášeným účtem.",
      status: 403,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("reuses the matching authenticated account and preserves rollback context", async () => {
    const { supabase, queries } = createSupabaseMock({
      user: authenticatedUser,
      tableResults: {
        profiles: {
          data: [{ id: "user-1", active_organization_id: "previous-org" }],
          error: null,
        },
      },
    });

    const result = await resolveOrganizationRegistrant({
      supabaseAdmin: supabase,
      req: request("valid"),
      email: " OWNER@example.com ",
      fullName: "",
    });

    expect(result).toEqual({
      userId: "user-1",
      email: "owner@example.com",
      fullName: "Existing Owner",
      isNewAccount: false,
      setupUrl: "",
      previousActiveOrganizationId: "previous-org",
    });
    expect(queries[0].filters).toEqual({ email: "owner@example.com" });
    expect(supabase.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it.each([
    [
      request("valid"),
      authenticatedUser,
      [{ id: "different-user", active_organization_id: null }],
    ],
    [
      request(),
      null,
      [{ id: "existing-user", active_organization_id: null }],
    ],
  ])("requires login when the email belongs to another account", async (req, user, profiles) => {
    const { supabase } = createSupabaseMock({
      user,
      tableResults: {
        profiles: { data: profiles, error: null },
      },
    });

    await expect(
      resolveOrganizationRegistrant({
        supabaseAdmin: supabase,
        req,
        email: "owner@example.com",
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("creates a new confirmed account and one-time password setup link", async () => {
    const { supabase } = createSupabaseMock({
      createUserResult: {
        data: { user: { id: "new-user" } },
        error: null,
      },
      generateLinkResult: {
        data: { properties: { action_link: "https://example.com/setup" } },
        error: null,
      },
      tableResults: {
        profiles: { data: [], error: null },
      },
    });

    const result = await resolveOrganizationRegistrant({
      supabaseAdmin: supabase,
      req: request(),
      email: " NEW@example.com ",
      fullName: " New Owner ",
      redirectTo: "https://example.com/finish",
    });

    expect(result).toMatchObject({
      userId: "new-user",
      email: "new@example.com",
      fullName: "New Owner",
      isNewAccount: true,
      setupUrl: "https://example.com/setup",
    });
    expect(supabase.auth.admin.createUser).toHaveBeenCalledWith({
      email: "new@example.com",
      email_confirm: true,
      user_metadata: { full_name: "New Owner" },
    });
    expect(supabase.auth.admin.generateLink).toHaveBeenCalledWith({
      type: "recovery",
      email: "new@example.com",
      options: { redirectTo: "https://example.com/finish" },
    });
  });

  it("maps duplicate-account creation errors to a safe conflict", async () => {
    const { supabase } = createSupabaseMock({
      createUserResult: {
        data: null,
        error: new Error("User already registered"),
      },
      tableResults: {
        profiles: { data: [], error: null },
      },
    });

    await expect(
      resolveOrganizationRegistrant({
        supabaseAdmin: supabase,
        req: request(),
        email: "existing@example.com",
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("deletes a newly created account when setup-link generation fails", async () => {
    const { supabase } = createSupabaseMock({
      createUserResult: {
        data: { user: { id: "new-user" } },
        error: null,
      },
      generateLinkResult: {
        data: null,
        error: new Error("link failure"),
      },
      tableResults: {
        profiles: { data: [], error: null },
      },
    });

    await expect(
      resolveOrganizationRegistrant({
        supabaseAdmin: supabase,
        req: request(),
        email: "new@example.com",
      })
    ).rejects.toThrow("Nepodařilo se připravit odkaz pro nastavení hesla.");
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith("new-user");
  });
});

describe("organization registrant compensation", () => {
  it("deletes a newly created account", async () => {
    const { supabase } = createSupabaseMock();

    const result = await cleanupNewRegistrant(supabase, {
      userId: "new-user",
      isNewAccount: true,
    });

    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith("new-user");
    expect(result).toEqual({ attempted: true, succeeded: true });
  });

  it("never compensates by rewriting an existing account", async () => {
    const { supabase } = createSupabaseMock();

    const result = await cleanupNewRegistrant(supabase, {
      userId: "existing-user",
      isNewAccount: false,
      previousActiveOrganizationId: "previous-org",
    });

    expect(result).toEqual({ attempted: false, succeeded: true });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it("does nothing without a user and reports cleanup failure", async () => {
    const { supabase } = createSupabaseMock();
    await expect(cleanupNewRegistrant(supabase, null)).resolves.toEqual({
      attempted: false,
      succeeded: true,
    });
    expect(supabase.from).not.toHaveBeenCalled();

    supabase.auth.admin.deleteUser.mockRejectedValueOnce(new Error("cleanup failed"));
    await expect(
      cleanupNewRegistrant(supabase, {
        userId: "new-user",
        isNewAccount: true,
      })
    ).resolves.toEqual({
      attempted: true,
      succeeded: false,
      error: "cleanup failed",
    });
  });

  it("reports an Auth API cleanup error returned without throwing", async () => {
    const { supabase } = createSupabaseMock();
    supabase.auth.admin.deleteUser.mockResolvedValueOnce({
      error: new Error("delete rejected"),
    });

    await expect(
      cleanupNewRegistrant(
        supabase,
        { userId: "new-user", isNewAccount: true },
        { route: "school-registration" }
      )
    ).resolves.toEqual({
      attempted: true,
      succeeded: false,
      error: "delete rejected",
    });
  });
});
