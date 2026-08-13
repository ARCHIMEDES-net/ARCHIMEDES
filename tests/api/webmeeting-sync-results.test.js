import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const dependencies = vi.hoisted(() => {
  const state = {
    event: {
      data: { id: "event-1", starts_at: "2099-08-14T07:00:00.000Z" },
      error: null,
    },
    sessions: {
      data: [
        {
          id: "session-1",
          external_meeting_id: "meeting-1",
          recording_status: "processing",
        },
      ],
      error: null,
    },
    updates: [],
  };

  const supabaseAdmin = {
    from: vi.fn((table) => {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        maybeSingle: vi.fn(async () => state.event),
        limit: vi.fn(async () => state.sessions),
        update: vi.fn((values) => {
          state.updates.push({ table, values });
          return builder;
        }),
      };
      return builder;
    }),
  };

  return {
    state,
    supabaseAdmin,
    requirePlatformAdmin: vi.fn(),
    consumeAuthenticatedRateLimit: vi.fn(),
    getRecordings: vi.fn(),
    getPresence: vi.fn(),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => dependencies.supabaseAdmin),
}));

vi.mock("../../lib/server/platformAdminApi", () => ({
  requirePlatformAdmin: dependencies.requirePlatformAdmin,
}));

vi.mock("../../lib/server/authenticatedRateLimit", () => ({
  consumeAuthenticatedRateLimit: dependencies.consumeAuthenticatedRateLimit,
}));

vi.mock("../../lib/server/webmeetingClient", () => ({
  WebMeetingApiError: class WebMeetingApiError extends Error {},
  webMeeting: {
    getRecordings: dependencies.getRecordings,
    getPresence: dependencies.getPresence,
  },
}));

import syncResults from "../../pages/api/admin/webmeeting/sync-results";

beforeEach(() => {
  dependencies.state.updates.length = 0;
  dependencies.supabaseAdmin.from.mockClear();
  dependencies.requirePlatformAdmin.mockReset();
  dependencies.consumeAuthenticatedRateLimit.mockReset();
  dependencies.getRecordings.mockReset();
  dependencies.getPresence.mockReset();
  dependencies.requirePlatformAdmin.mockResolvedValue({ id: "admin-1" });
  dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(true);
});

describe("WebMeeting result synchronization", () => {
  it("does not synchronize or lock a broadcast before its scheduled start", async () => {
    const { res } = await invoke(syncResults, {
      method: "POST",
      body: { eventId: "event-1" },
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toContain("až po plánovaném začátku");
    expect(dependencies.getRecordings).not.toHaveBeenCalled();
    expect(dependencies.getPresence).not.toHaveBeenCalled();
    expect(dependencies.state.updates).toEqual([]);
  });
});
