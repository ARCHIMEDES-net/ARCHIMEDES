import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const dependencies = vi.hoisted(() => {
  const queryState = {
    result: { data: [], error: null },
  };
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    or: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then(resolve, reject) {
      return Promise.resolve(queryState.result).then(resolve, reject);
    },
  };
  const supabase = {
    from: vi.fn(() => builder),
  };

  return {
    queryState,
    builder,
    supabase,
    createClient: vi.fn(() => supabase),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: dependencies.createClient,
}));

import cronHandler from "../../pages/api/cron/send-reminders";
import instagramHandler from "../../pages/api/instagram";

const environmentKeys = [
  "CRON_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "INSTAGRAM_ACCESS_TOKEN",
  "INSTAGRAM_ACCOUNT_ID",
  "INSTAGRAM_GRAPH_API_VERSION",
];
const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]])
);

beforeEach(() => {
  dependencies.createClient.mockClear();
  dependencies.supabase.from.mockClear();
  dependencies.queryState.result = { data: [], error: null };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnvironment[key];
    }
  }
});

describe("Instagram feed endpoint", () => {
  beforeEach(() => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "secret-access-token";
    process.env.INSTAGRAM_ACCOUNT_ID = "1234567890";
    process.env.INSTAGRAM_GRAPH_API_VERSION = "v24.0";
  });

  it("rejects unexpected query parameters without contacting Instagram", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { res } = await invoke(instagramHandler, {
      method: "GET",
      query: { token: "attacker-controlled" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.getHeader("cache-control")).toBe("no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a short-cache empty feed for invalid server configuration", async () => {
    process.env.INSTAGRAM_ACCOUNT_ID = "invalid";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { res } = await invoke(instagramHandler, { method: "GET" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
    expect(res.getHeader("cache-control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses an Authorization header and returns only safe Instagram video links", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: vi.fn(async () => ({
        data: [
          {
            id: "one",
            media_type: "VIDEO",
            permalink: "https://www.instagram.com/reel/one/",
          },
          {
            id: "photo",
            media_type: "IMAGE",
            permalink: "https://www.instagram.com/p/photo/",
          },
          {
            id: "two",
            media_type: "REEL",
            permalink: "https://instagram.com/reel/two/",
          },
          {
            id: "three",
            media_type: "VIDEO",
            permalink: "https://www.instagram.com/reel/three/",
          },
          {
            id: "evil",
            media_type: "VIDEO",
            permalink: "https://instagram.com.evil.example/reel/evil/",
          },
        ],
      })),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { res } = await invoke(instagramHandler, { method: "GET" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.every((item) => item.href.includes("instagram.com"))).toBe(true);
    expect(res.body.every((item) => item.embed.endsWith("/embed/"))).toBe(true);
    expect(res.getHeader("cache-control")).toBe(
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    const [url, options] = fetchMock.mock.calls[0];
    expect(url.hostname).toBe("graph.facebook.com");
    expect(url.searchParams.get("limit")).toBe("6");
    expect(options.headers).toEqual({
      Authorization: "Bearer secret-access-token",
    });
    expect(url.toString()).not.toContain("secret-access-token");
  });

  it("returns a short-cache empty feed when the upstream response fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 })));

    const { res } = await invoke(instagramHandler, { method: "GET" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
    expect(res.getHeader("cache-control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300"
    );
  });
});

describe("reminder cron endpoint", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "cron-secret";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("rejects missing or incorrect Bearer secrets before database access", async () => {
    for (const authorization of [undefined, "Bearer wrong-secret", "Basic cron-secret"]) {
      dependencies.createClient.mockClear();
      const { res } = await invoke(cronHandler, {
        method: "POST",
        headers: authorization ? { authorization } : {},
      });

      expect(res.statusCode).toBe(401);
      expect(dependencies.createClient).not.toHaveBeenCalled();
    }
  });

  it("rejects invalid modes before database access", async () => {
    const { res } = await invoke(cronHandler, {
      method: "POST",
      headers: { authorization: "Bearer cron-secret" },
      query: { mode: "delete" },
    });

    expect(res.statusCode).toBe(400);
    expect(dependencies.createClient).not.toHaveBeenCalled();
  });

  it("builds a side-effect-free preview plan for events in the reminder window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00.000Z"));
    dependencies.queryState.result = {
      data: [
        {
          id: "event-1",
          title: "Live event",
          is_published: true,
          starts_at: "2026-07-29T13:00:00.000Z",
          stream_url: "https://stream.example/watch",
          worksheet_url: null,
          audience: ["teachers"],
        },
        {
          id: "invalid-event",
          title: "Invalid",
          is_published: true,
          starts_at: "invalid",
        },
      ],
      error: null,
    };

    const { res } = await invoke(cronHandler, {
      method: "GET",
      headers: { authorization: "Bearer cron-secret" },
      query: { mode: "preview" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      preview: true,
      found_events: 2,
      reminders_in_window: 1,
    });
    expect(res.body.plan).toEqual([
      expect.objectContaining({
        event_id: "event-1",
        reminder_minutes_before: 60,
        target_at: "2026-07-29T12:00:00.000Z",
      }),
    ]);
    expect(res.body.note).toContain("nic se neposílá");
    expect(dependencies.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role-key",
      { auth: { persistSession: false } }
    );
  });
});
