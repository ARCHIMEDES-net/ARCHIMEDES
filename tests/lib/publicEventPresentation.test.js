import { describe, expect, it } from "vitest";
import {
  formatPublicEventDate,
  getPublicEventLiveState,
} from "../../lib/publicEventPresentation";

describe("public event presentation", () => {
  it("formats summer dates explicitly in Europe/Prague", () => {
    expect(formatPublicEventDate("2026-05-06T11:00:00.000Z")).toBe(
      "6. května 13:00"
    );
  });

  it("formats winter dates explicitly in Europe/Prague", () => {
    expect(formatPublicEventDate("2026-12-06T11:00:00.000Z")).toBe(
      "6. prosince 12:00"
    );
  });

  it("returns an empty label for an invalid date", () => {
    expect(formatPublicEventDate("not-a-date")).toBe("");
  });

  it("keeps the live window based on the actual instant", () => {
    expect(
      getPublicEventLiveState(
        "2026-08-14T20:30:00.000Z",
        "2026-08-14T21:15:00.000Z"
      )
    ).toBe("live");
  });

  it("compares the today badge in the Prague calendar day", () => {
    expect(
      getPublicEventLiveState(
        "2026-08-14T03:00:00.000Z",
        "2026-08-14T20:30:00.000Z"
      )
    ).toBe("today");
    expect(
      getPublicEventLiveState(
        "2026-08-14T20:30:00.000Z",
        "2026-08-15T22:30:00.000Z"
      )
    ).toBeNull();
  });
});
