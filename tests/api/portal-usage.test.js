import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const dependencies = vi.hoisted(() => {
  const state = {
    user: { id: "user-1" },
    profile: { data: { active_organization_id: "org-1" }, error: null },
    event: { data: { id: "00000000-0000-4000-8000-000000000020" }, error: null },
    rpcCalls: [],
  };

  const supabaseAdmin = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user }, error: null })),
    },
    from: vi.fn((table) => {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        maybeSingle: vi.fn(async () => (table === "events" ? state.event : state.profile)),
      };
      return builder;
    }),
    rpc: vi.fn(async (name, args) => {
      state.rpcCalls.push({ name, args });
      return { data: true, error: null };
    }),
  };

  return { state, supabaseAdmin, consumeAuthenticatedRateLimit: vi.fn() };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => dependencies.supabaseAdmin),
}));

vi.mock("../../lib/server/authenticatedRateLimit", () => ({
  consumeAuthenticatedRateLimit: dependencies.consumeAuthenticatedRateLimit,
}));

import usage from "../../pages/api/portal/usage";

const eventId = "00000000-0000-4000-8000-000000000020";

beforeEach(() => {
  dependencies.state.rpcCalls.length = 0;
  dependencies.state.user = { id: "user-1" };
  dependencies.state.event = { data: { id: eventId }, error: null };
  dependencies.consumeAuthenticatedRateLimit.mockReset();
  dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(true);
});

describe("portal usage endpoint", () => {
  it("requires a known activity kind and a valid broadcast id", async () => {
    const unknown = await invoke(usage, { method: "POST", body: { kind: "x" } });
    expect(unknown.res.statusCode).toBe(400);

    const missingEvent = await invoke(usage, {
      method: "POST",
      body: { kind: "broadcast_join", eventId: "nope" },
      headers: { authorization: "Bearer token" },
    });
    expect(missingEvent.res.statusCode).toBe(400);
    expect(dependencies.state.rpcCalls).toEqual([]);
  });

  it("requires a signed-in user", async () => {
    const { res } = await invoke(usage, { method: "POST", body: { kind: "portal_visit" } });
    expect(res.statusCode).toBe(401);
    expect(dependencies.state.rpcCalls).toEqual([]);
  });

  it("records a portal visit for the active organization", async () => {
    const { res } = await invoke(usage, {
      method: "POST",
      body: { kind: "portal_visit" },
      headers: { authorization: "Bearer token" },
    });
    expect(res.statusCode).toBe(200);
    expect(dependencies.state.rpcCalls).toEqual([
      {
        name: "record_portal_usage",
        args: {
          p_user_id: "user-1",
          p_organization_id: "org-1",
          p_kind: "portal_visit",
          p_event_id: null,
        },
      },
    ]);
  });

  it("records a broadcast join only for an existing broadcast", async () => {
    const ok = await invoke(usage, {
      method: "POST",
      body: { kind: "broadcast_join", eventId },
      headers: { authorization: "Bearer token" },
    });
    expect(ok.res.statusCode).toBe(200);
    expect(dependencies.state.rpcCalls[0].args.p_event_id).toBe(eventId);

    dependencies.state.event = { data: null, error: null };
    const missing = await invoke(usage, {
      method: "POST",
      body: { kind: "broadcast_join", eventId },
      headers: { authorization: "Bearer token" },
    });
    expect(missing.res.statusCode).toBe(404);
    expect(dependencies.state.rpcCalls).toHaveLength(1);
  });

  it("stops after the rate limit", async () => {
    dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(false);
    const { res } = await invoke(usage, {
      method: "POST",
      body: { kind: "portal_visit" },
      headers: { authorization: "Bearer token" },
    });
    expect(res.statusCode).toBe(429);
    expect(dependencies.state.rpcCalls).toEqual([]);
  });
});
