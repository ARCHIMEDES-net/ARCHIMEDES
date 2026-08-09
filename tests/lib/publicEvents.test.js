import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../../lib/supabaseClient", () => ({
  supabase: { rpc: mocks.rpc },
}));

import {
  fetchPublicProgramWindow,
  fetchPublicUpcomingEvents,
} from "../../lib/publicEvents";

describe("public event queries", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T10:00:00.000Z"));
    mocks.rpc.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads upcoming events only through the public RPC", async () => {
    const rows = [{ id: "future-1", starts_at: "2026-08-10T10:00:00.000Z" }];
    mocks.rpc.mockResolvedValue({ data: rows, error: null });

    await expect(fetchPublicUpcomingEvents(12)).resolves.toEqual({
      events: rows,
      error: "",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("get_public_events", {
      p_reference_at: "2026-08-09T10:00:00.000Z",
      p_direction: "upcoming",
      p_limit: 12,
    });
  });

  it("backfills the programme window with previous events chronologically", async () => {
    mocks.rpc
      .mockResolvedValueOnce({
        data: [{ id: "future-1", starts_at: "2026-08-10T10:00:00.000Z" }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          { id: "past-2", starts_at: "2026-08-08T10:00:00.000Z" },
          { id: "past-1", starts_at: "2026-08-07T10:00:00.000Z" },
        ],
        error: null,
      });

    const result = await fetchPublicProgramWindow(3);

    expect(mocks.rpc).toHaveBeenNthCalledWith(1, "get_public_events", {
      p_reference_at: "2026-08-09T10:00:00.000Z",
      p_direction: "upcoming",
      p_limit: 3,
    });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "get_public_events", {
      p_reference_at: "2026-08-09T10:00:00.000Z",
      p_direction: "previous",
      p_limit: 2,
    });
    expect(result).toEqual({
      events: [
        { id: "past-1", starts_at: "2026-08-07T10:00:00.000Z" },
        { id: "past-2", starts_at: "2026-08-08T10:00:00.000Z" },
        { id: "future-1", starts_at: "2026-08-10T10:00:00.000Z" },
      ],
      error: "",
    });
  });

  it("does not fall back to the events table when the RPC fails", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "RPC unavailable" },
    });

    await expect(fetchPublicUpcomingEvents()).resolves.toEqual({
      events: [],
      error: "RPC unavailable",
    });
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
});
