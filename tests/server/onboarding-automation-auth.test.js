import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";
import { requireOnboardingAutomation } from "../../lib/server/onboardingAutomationAuth";

const ACTOR_ID = "11111111-1111-4111-8111-111111111111";
const SECRET = "a-secure-automation-secret-with-32-chars";

function query(result) {
  return {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
}

function supabase({ active = true } = {}) {
  return {
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user: { id: ACTOR_ID, email: "admin@example.test" } },
          error: null,
        }),
      },
    },
    from: vi.fn((table) => {
      if (table === "platform_admins") {
        return query({
          data: { user_id: ACTOR_ID, role: "super_admin" },
          error: null,
        });
      }
      if (table === "profiles") {
        return query({
          data: {
            id: ACTOR_ID,
            email: "admin@example.test",
            is_active: active,
          },
          error: null,
        });
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

async function authHandler(req, res, client) {
  const actor = await requireOnboardingAutomation(req, res, client);
  if (actor) return res.status(200).json({ ok: true, actorId: actor.id });
}

beforeEach(() => {
  process.env.ONBOARDING_AUTOMATION_SECRET = SECRET;
  process.env.ONBOARDING_AUTOMATION_ADMIN_USER_ID = ACTOR_ID;
});

afterEach(() => {
  delete process.env.ONBOARDING_AUTOMATION_SECRET;
  delete process.env.ONBOARDING_AUTOMATION_ADMIN_USER_ID;
});

describe("onboarding automation authorization", () => {
  it("requires a safely configured secret and actor", async () => {
    delete process.env.ONBOARDING_AUTOMATION_SECRET;
    const client = supabase();
    const { res } = await invoke((req, response) => authHandler(req, response, client), {
      method: "POST",
      headers: { authorization: `Bearer ${SECRET}` },
    });

    expect(res.statusCode).toBe(503);
    expect(client.auth.admin.getUserById).not.toHaveBeenCalled();
  });

  it("accepts the secret only from the bearer header", async () => {
    const client = supabase();
    const { res } = await invoke((req, response) => authHandler(req, response, client), {
      method: "POST",
      query: { token: SECRET },
    });

    expect(res.statusCode).toBe(401);
    expect(client.auth.admin.getUserById).not.toHaveBeenCalled();
  });

  it("rejects an inactive audit actor", async () => {
    const client = supabase({ active: false });
    const { res } = await invoke((req, response) => authHandler(req, response, client), {
      method: "POST",
      headers: { authorization: `Bearer ${SECRET}` },
    });

    expect(res.statusCode).toBe(403);
  });

  it("returns the live platform administrator for a valid request", async () => {
    const client = supabase();
    const { res } = await invoke((req, response) => authHandler(req, response, client), {
      method: "POST",
      headers: { authorization: `Bearer ${SECRET}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, actorId: ACTOR_ID });
  });
});
