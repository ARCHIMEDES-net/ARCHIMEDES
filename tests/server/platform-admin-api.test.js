import { describe, expect, it } from "vitest";
import { createResponse } from "../helpers/http";
import { createSupabaseMock } from "../helpers/supabase";
import {
  getBearerToken,
  requirePlatformAdmin,
} from "../../lib/server/platformAdminApi";

describe("platform admin authentication", () => {
  it.each([
    [{ authorization: "Bearer access-token" }, "access-token"],
    [{ Authorization: "bearer mixed-case-token" }, "mixed-case-token"],
    [{ authorization: "Basic credentials" }, null],
    [{ authorization: "" }, null],
    [{}, null],
  ])("parses only bearer authorization headers", (headers, expected) => {
    expect(getBearerToken({ headers })).toBe(expected);
  });

  it("rejects missing authorization before querying Supabase", async () => {
    const { supabase } = createSupabaseMock();
    const res = createResponse();

    const result = await requirePlatformAdmin({ headers: {} }, res, supabase);

    expect(result).toBeNull();
    expect(res.statusCode).toBe(401);
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
  });

  it("rejects invalid or expired sessions", async () => {
    const { supabase } = createSupabaseMock({
      userError: new Error("invalid token"),
    });
    const res = createResponse();

    const result = await requirePlatformAdmin(
      { headers: { authorization: "Bearer expired" } },
      res,
      supabase
    );

    expect(result).toBeNull();
    expect(res.statusCode).toBe(401);
    expect(supabase.auth.getUser).toHaveBeenCalledWith("expired");
  });

  it("rejects authenticated users without the platform admin role", async () => {
    const user = { id: "user-1" };
    const { supabase } = createSupabaseMock({
      user,
      tableResults: {
        platform_admins: { data: null, error: null },
      },
    });
    const res = createResponse();

    const result = await requirePlatformAdmin(
      { headers: { authorization: "Bearer valid" } },
      res,
      supabase
    );

    expect(result).toBeNull();
    expect(res.statusCode).toBe(403);
  });

  it("returns the authenticated platform admin", async () => {
    const user = { id: "admin-1", email: "admin@example.test" };
    const { supabase, queries } = createSupabaseMock({
      user,
      tableResults: {
        platform_admins: {
          data: { user_id: user.id, role: "super_admin" },
          error: null,
        },
        profiles: {
          data: {
            id: user.id,
            email: user.email,
            is_active: true,
          },
          error: null,
        },
      },
    });
    const res = createResponse();

    const result = await requirePlatformAdmin(
      { headers: { authorization: "Bearer valid" } },
      res,
      supabase
    );

    expect(result).toBe(user);
    expect(queries).toMatchObject([
      {
        table: "platform_admins",
        filters: { user_id: user.id },
      },
      {
        table: "profiles",
        filters: { id: user.id },
      },
    ]);
  });

  it("rejects an admin row without a live active matching profile", async () => {
    const user = { id: "admin-1", email: "admin@example.test" };
    const { supabase } = createSupabaseMock({
      user,
      tableResults: {
        platform_admins: {
          data: { user_id: user.id, role: "admin" },
          error: null,
        },
        profiles: {
          data: {
            id: user.id,
            email: user.email,
            is_active: false,
          },
          error: null,
        },
      },
    });

    const result = await requirePlatformAdmin(
      { headers: { authorization: "Bearer valid" } },
      createResponse(),
      supabase
    );

    expect(result).toBeNull();
  });

  it("fails closed when the admin lookup fails", async () => {
    const databaseError = new Error("database unavailable");
    const { supabase } = createSupabaseMock({
      user: { id: "user-1" },
      tableResults: {
        platform_admins: { data: null, error: databaseError },
      },
    });

    await expect(
      requirePlatformAdmin(
        { headers: { authorization: "Bearer valid" } },
        createResponse(),
        supabase
      )
    ).rejects.toBe(databaseError);
  });
});
