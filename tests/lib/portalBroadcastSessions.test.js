import { describe, expect, it, vi } from "vitest";
import {
  attachPortalBroadcastSession,
  attachPortalBroadcastSessions,
} from "../../lib/portalBroadcastSessions";

function createSupabaseMock(sessionRows = [], error = null) {
  const inMock = vi.fn().mockResolvedValue({ data: sessionRows, error });
  const selectMock = vi.fn(() => ({ in: inMock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));

  return {
    client: { from: fromMock },
    fromMock,
    selectMock,
    inMock,
  };
}

describe("attachPortalBroadcastSessions", () => {
  it("loads only the narrow portal view and attaches sessions by event", async () => {
    const mock = createSupabaseMock([
      { id: "s2", event_id: "e2", status: "scheduled" },
      { id: "s1", event_id: "e1", status: "finished" },
    ]);

    const result = await attachPortalBroadcastSessions(mock.client, [
      { id: "e1", title: "První" },
      { id: "e2", title: "Druhá" },
      { id: "e3", title: "Bez vysílání" },
    ]);

    expect(mock.fromMock).toHaveBeenCalledWith("portal_broadcast_sessions");
    expect(mock.inMock).toHaveBeenCalledWith("event_id", ["e1", "e2", "e3"]);
    expect(result[0].broadcast_sessions).toEqual([
      { id: "s1", event_id: "e1", status: "finished" },
    ]);
    expect(result[1].broadcast_sessions).toEqual([
      { id: "s2", event_id: "e2", status: "scheduled" },
    ]);
    expect(result[2].broadcast_sessions).toEqual([]);
  });

  it("does not query Supabase for an empty event collection", async () => {
    const mock = createSupabaseMock();
    await expect(attachPortalBroadcastSessions(mock.client, [])).resolves.toEqual([]);
    expect(mock.fromMock).not.toHaveBeenCalled();
  });

  it("propagates view query errors instead of silently using the base table", async () => {
    const error = new Error("view unavailable");
    const mock = createSupabaseMock([], error);

    await expect(
      attachPortalBroadcastSessions(mock.client, [{ id: "e1" }])
    ).rejects.toThrow("view unavailable");
  });
});

describe("attachPortalBroadcastSession", () => {
  it("preserves the single-event shape expected by the detail page", async () => {
    const mock = createSupabaseMock([
      { id: "s1", event_id: "e1", has_external_meeting: true },
    ]);

    const result = await attachPortalBroadcastSession(mock.client, {
      id: "e1",
      title: "Událost",
    });

    expect(result).toEqual({
      id: "e1",
      title: "Událost",
      broadcast_sessions: [
        { id: "s1", event_id: "e1", has_external_meeting: true },
      ],
    });
  });
});
