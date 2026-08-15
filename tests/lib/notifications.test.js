import { describe, expect, it } from "vitest";
import {
  isNotificationFoundationMissing,
  normalizeNotificationChannelPreferences,
  notificationKindLabel,
  safeNotificationTargetPath,
} from "../../lib/notifications";

describe("notification helpers", () => {
  it("uses legacy e-mail choice for a profile without channel preferences", () => {
    expect(normalizeNotificationChannelPreferences(null, false).email_enabled).toBe(false);
  });

  it("normalizes stored boolean choices", () => {
    expect(
      normalizeNotificationChannelPreferences({
        email_enabled: true,
        push_enabled: true,
        day_before_enabled: false,
      })
    ).toMatchObject({ email_enabled: true, push_enabled: true, day_before_enabled: false });
  });

  it("accepts only same-origin relative notification paths", () => {
    expect(safeNotificationTargetPath("/portal/udalost/123")).toBe("/portal/udalost/123");
    expect(safeNotificationTargetPath("//evil.example.test")).toBe("");
    expect(safeNotificationTargetPath("https://evil.example.test")).toBe("");
  });

  it("recognizes a foundation that has not been migrated yet", () => {
    expect(isNotificationFoundationMissing({ code: "42P01" })).toBe(true);
    expect(isNotificationFoundationMissing({ code: "23505" })).toBe(false);
  });

  it("provides a safe fallback label", () => {
    expect(notificationKindLabel("event_reminder")).toBe("Připomenutí vysílání");
    expect(notificationKindLabel("future_kind")).toBe("Oznámení");
  });
});
