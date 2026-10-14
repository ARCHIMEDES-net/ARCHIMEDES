import { describe, expect, it } from "vitest";
import {
  auditCopyMessage,
  nextReminderStep,
  reminderReason,
  selectFeaturedProgrammes,
  FEATURED_REMINDER_LIMIT,
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

describe("balanced programme selection for reminder emails", () => {
  const events = [
    {id:"eco",title:"Šetrný turismus",starts_at:"2026-10-20T08:00:00Z"},
    {id:"science",title:"Science ON",starts_at:"2026-11-04T08:00:00Z"},
    {id:"zoo",title:"Zoo Praha: Gaviál indický",starts_at:"2026-12-10T09:00:00Z"},
    {id:"creative",title:"Tvořivá dílna – papírová dýně",starts_at:"2026-10-23T09:00:00Z"},
    {id:"wellbeing",title:"Wellbeing: Vyrůstání v Česku",starts_at:"2026-10-16T08:00:00Z"},
    {id:"english",title:"Angličtina: SPOOKY BRITAIN",starts_at:"2026-11-05T10:00:00Z"},
  ];
  it("includes four different subjects including December Zoo rather than simply next four", () => {
    const selected = selectFeaturedProgrammes(events);
    expect(FEATURED_REMINDER_LIMIT).toBe(4);
    expect(selected.map(x=>x.id)).toEqual(["wellbeing","creative","english","zoo"]);
  });
  it("falls back to other published events without duplicates if a subject is missing", () => {
    const selected = selectFeaturedProgrammes(events.filter(x=>x.id!=="english"));
    expect(selected.map(x=>x.id)).toEqual(["wellbeing","eco","creative","zoo"]);
    expect(new Set(selected.map(x=>x.id)).size).toBe(selected.length);
  });
  it("shows only available verified events when fewer than four are eligible", () => {
    expect(selectFeaturedProgrammes(events.slice(0,2))).toHaveLength(2);
    expect(selectFeaturedProgrammes([])).toEqual([]);
  });
});

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
        attempts: [{ reminder_step: 1, status: "sent", client_delivery_status: "delivered",
          sent_at: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString() }],
        now,
      })
    ).toBe(2);
    expect(
      nextReminderStep({
        profile: profile(),
        attempts: [
          { reminder_step: 1, status: "sent", client_delivery_status: "delivered" },
          { reminder_step: 2, status: "sent", client_delivery_status: "delivered" },
        ],
        now,
      })
    ).toBeNull();
  });

  it("never sends the second reminder fewer than five days after the first", () => {
    const recentFirst = [{
      reminder_step: 1, status: "sent", client_delivery_status: "delivered",
      sent_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    }];
    expect(nextReminderStep({ profile: profile(), attempts: recentFirst, now })).toBeNull();
    expect(nextReminderStep({ profile: profile(), attempts: recentFirst,
      now: now + 4 * 24 * 60 * 60 * 1000 })).toBe(2);
  });

  it("requires a valid timestamp for a delivered first attempt before a follow-up", () => {
    expect(nextReminderStep({ profile: profile(), now,
      attempts: [{ reminder_step: 1, status: "sent", client_delivery_status: "delivered" }],
    })).toBeNull();
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

  it("does not schedule another email until the recipient mail server confirms delivery", () => {
    expect(
      nextReminderStep({
        profile: profile(),
        attempts: [
          { reminder_step: 1, status: "sent", client_delivery_status: "accepted" },
        ],
        now,
      })
    ).toBeNull();
    expect(
      nextReminderStep({
        profile: profile(),
        attempts: [{ reminder_step: 1, status: "failed" }],
        now,
      })
    ).toBeNull();
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
