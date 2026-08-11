import { describe, expect, it } from "vitest";
import { getEventStart } from "../../lib/broadcastState";

describe("getEventStart", () => {
  it("uses the event start as the authoritative portal date", () => {
    const start = getEventStart({
      starts_at: "2026-09-25T08:00:00.000Z",
      broadcast_sessions: [
        { starts_at: "2026-05-12T08:00:00.000Z" },
      ],
    });

    expect(start?.toISOString()).toBe("2026-09-25T08:00:00.000Z");
  });

  it("falls back to the broadcast session for legacy events without a date", () => {
    const start = getEventStart({
      broadcast_sessions: [
        { starts_at: "2026-09-25T08:00:00.000Z" },
      ],
    });

    expect(start?.toISOString()).toBe("2026-09-25T08:00:00.000Z");
  });
});
