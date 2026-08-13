import { describe, expect, it } from "vitest";
import {
  canSyncBroadcastResults,
  getBroadcastLifecycle,
} from "../../lib/broadcastLifecycle";

const NOW = new Date("2026-08-13T10:00:00.000Z");

describe("broadcast lifecycle", () => {
  it("keeps a future broadcast editable after a premature results sync", () => {
    expect(
      getBroadcastLifecycle({
        startsAt: "2026-08-14T07:00:00.000Z",
        status: "scheduled",
        recordingStatus: "processing",
        providerStatus: "results_synced",
        now: NOW,
      })
    ).toBe("planned");
  });

  it("still locks genuinely finished broadcasts", () => {
    expect(
      getBroadcastLifecycle({
        startsAt: "2026-08-14T07:00:00.000Z",
        status: "finished",
        now: NOW,
      })
    ).toBe("finished");

    expect(
      getBroadcastLifecycle({
        startsAt: "2026-08-14T07:00:00.000Z",
        recordingStatus: "ready",
        now: NOW,
      })
    ).toBe("finished");
  });

  it("allows result synchronization only once the scheduled start is reached", () => {
    expect(
      canSyncBroadcastResults({
        startsAt: "2026-08-13T10:00:01.000Z",
        now: NOW,
      })
    ).toBe(false);

    expect(
      canSyncBroadcastResults({
        startsAt: "2026-08-13T10:00:00.000Z",
        now: NOW,
      })
    ).toBe(true);
  });
});
