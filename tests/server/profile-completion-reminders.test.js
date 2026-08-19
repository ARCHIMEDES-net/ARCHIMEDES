import { describe, expect, it } from "vitest";
import {
  auditCopyMessage,
  nextReminderStep,
  reminderReason,
} from "../../lib/server/profileCompletionReminders";

const now = Date.UTC(2026, 7, 16, 12, 0, 0);

function profile(overrides = {}) {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    email: "user@example.com",
    full_name: "Test User",
    created_at: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    must_set_password: true,
    profile_completed_at: null,
    ...overrides,
  };
}

describe("profile completion reminder eligibility", () => {
  it("distinguishes password and profile work", () => {
    expect(reminderReason(profile())).toBe("password_and_profile");
    expect(reminderReason(profile({ profile_completed_at: new Date().toISOString() }))).toBe("password");
    expect(reminderReason(profile({ must_set_password: false }))).toBe("profile");
    expect(
      reminderReason(
        profile({ must_set_password: false, profile_completed_at: new Date().toISOString() })
      )
    ).toBeNull();
  });

  it("sends at most the two scheduled steps", () => {
    expect(nextReminderStep({ profile: profile(), now })).toBe(1);
    expect(
      nextReminderStep({
        profile: profile(),
        attempts: [{ reminder_step: 1, status: "sent" }],
        now,
      })
    ).toBe(2);
    expect(
      nextReminderStep({
        profile: profile(),
        attempts: [
          { reminder_step: 1, status: "sent" },
          { reminder_step: 2, status: "sent" },
        ],
        now,
      })
    ).toBeNull();
  });

  it("stops after an ambiguous delivery and skips completed or inactive users", () => {
    expect(
      nextReminderStep({
        profile: profile(),
        attempts: [{ reminder_step: 1, status: "delivery_unknown" }],
        now,
      })
    ).toBeNull();
    expect(
      nextReminderStep({
        profile: profile({ must_set_password: false, profile_completed_at: new Date().toISOString() }),
        now,
      })
    ).toBeNull();
    expect(nextReminderStep({ profile: profile({ is_active: false }), now })).toBeNull();
  });
  it("creates a safe audit copy without password or profile links", () => {
    const copy = auditCopyMessage({
      recipientEmail: "user@example.com",
      fullName: "Test User",
      reason: "password_and_profile",
      step: 1,
    });

    expect(copy.subject).toContain("Kopie upozornění");
    expect(copy.text).toContain("user@example.com");
    expect(copy.text).toContain("nastavení vlastního hesla a dokončení profilu");
    expect(copy.text).not.toContain("http");
    expect(copy.text).not.toContain("token");
    expect(copy.text).not.toContain("Nastavit heslo:");
  });
});
