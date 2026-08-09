import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";
import { LEAKED_PASSWORD_MESSAGE } from "../../lib/authPasswordErrors";

const dependencies = vi.hoisted(() => {
  const createUser = vi.fn();
  const deleteUser = vi.fn();

  const supabaseAdmin = {
    auth: {
      admin: { createUser, deleteUser },
    },
    from: vi.fn((table) => {
      const result =
        table === "organizations"
          ? {
              data: {
                id: "organization-1",
                name: "Testovací škola",
                org_type: "school",
                status: "active",
              },
              error: null,
            }
          : table === "profiles"
            ? { data: [], error: null }
            : { data: null, error: new Error(`Unexpected table: ${table}`) };

      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        ilike: vi.fn(() => builder),
        limit: vi.fn(async () => result),
        maybeSingle: vi.fn(async () => result),
      };

      return builder;
    }),
  };

  return {
    createUser,
    deleteUser,
    supabaseAdmin,
    consumePublicRateLimit: vi.fn(),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => dependencies.supabaseAdmin),
}));

vi.mock("../../lib/server/platformAdminApi", () => ({
  getBearerToken: vi.fn(() => null),
}));

vi.mock("../../lib/server/publicRateLimit", () => ({
  consumePublicRateLimit: dependencies.consumePublicRateLimit,
}));

import joinOrganizationHandler from "../../pages/api/join-organization";

beforeEach(() => {
  dependencies.createUser.mockReset();
  dependencies.deleteUser.mockReset();
  dependencies.supabaseAdmin.from.mockClear();
  dependencies.consumePublicRateLimit.mockReset();
  dependencies.consumePublicRateLimit.mockResolvedValue(true);
});

describe("public organization join password protection", () => {
  it("returns a localized 400 response for a leaked password", async () => {
    dependencies.createUser.mockResolvedValueOnce({
      data: { user: null },
      error: {
        name: "AuthWeakPasswordError",
        code: "weak_password",
        reasons: ["pwned"],
        message: "Password is known to be weak and easy to guess",
      },
    });

    const { res } = await invoke(joinOrganizationHandler, {
      method: "POST",
      body: {
        email: "ucitel@example.test",
        password: "valid-length-password",
        fullName: "Jan Učitel",
        joinCode: "SKOLA-1",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: LEAKED_PASSWORD_MESSAGE });
    expect(dependencies.deleteUser).not.toHaveBeenCalled();
  });
});
