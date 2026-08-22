import { describe, expect, it } from "vitest";
import { buildNotificationCandidates } from "../../lib/server/notificationQueue";

const PROFILE_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_ID = "22222222-2222-4222-8222-222222222222";
const NOW = new Date("2026-08-15T10:00:00.000Z");

function baseInput(overrides = {}) {
  return {
    now: NOW,
    sessions: [
      {
        event_id: EVENT_ID,
        starts_at: "2026-08-16T10:00:00.000Z",
        is_published: true,
        notifications_enabled: true,
        notification_delivery_policy: "in_app_only",
        recipient_group_codes: ["ucitele"],
        reminder_minutes: [1440, 30],
        events: { id: EVENT_ID, title: "Bezpečný internet" },
      },
    ],
    standaloneEvents: [],
    subscriptions: [{ event_id: EVENT_ID, profile_id: PROFILE_ID, enabled: true }],
    activityPreferences: [
      { profile_id: PROFILE_ID, activity_code: "ucitele", enabled: true },
    ],
    legacyInterests: [],
    profiles: [
      { id: PROFILE_ID, is_active: true, email_notifications_enabled: true },
    ],
    channelPreferences: [
      {
        profile_id: PROFILE_ID,
        email_enabled: true,
        push_enabled: true,
        new_event_enabled: true,
        day_before_enabled: true,
        thirty_minutes_before_enabled: true,
      },
    ],
    pushProfileIds: [PROFILE_ID],
    ...overrides,
  };
}

describe("notification queue candidate planning", () => {
  it("prefers one due reminder over a duplicate new-event item", () => {
    const candidates = buildNotificationCandidates(baseInput());

    expect(candidates).toHaveLength(1);
    expect(candidates[0].kind).toBe("event_reminder");
    expect(candidates.every((candidate) => candidate.target_path === `/portal/udalost/${EVENT_ID}`)).toBe(true);
  });

  it("keeps WebMeeting notifications in-app only by default", () => {
    const candidates = buildNotificationCandidates(baseInput());

    expect(candidates.every((candidate) => candidate.email_enabled === false)).toBe(true);
    expect(candidates.every((candidate) => candidate.push_enabled === false)).toBe(true);
  });

  it("queues push but no email only after the session explicitly owns push", () => {
    const input = baseInput();
    input.sessions[0].notification_delivery_policy = "in_app_and_push";

    const candidates = buildNotificationCandidates(input);

    expect(candidates.every((candidate) => candidate.email_enabled === false)).toBe(true);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].push_enabled).toBe(true);
  });

  it("queues e-mail only after explicit full ARCHIMEDES channel ownership", () => {
    const input = baseInput();
    input.sessions[0].notification_delivery_policy = "archimedes_all";

    const candidates = buildNotificationCandidates(input);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].email_enabled).toBe(true);
  });

  it("never duplicates the WebMeeting 30-minute e-mail with an external delivery", () => {
    const input = baseInput();
    input.sessions[0].starts_at = "2026-08-15T10:30:00.000Z";
    input.sessions[0].notification_delivery_policy = "archimedes_all";

    const candidates = buildNotificationCandidates(input);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      kind: "event_reminder",
      email_enabled: false,
      push_enabled: false,
    });
  });

  it("respects an explicit disabled reminder preference", () => {
    const input = baseInput();
    input.channelPreferences[0].day_before_enabled = false;

    const candidates = buildNotificationCandidates(input);
    expect(candidates.map((candidate) => candidate.kind)).toEqual(["new_event"]);
    expect(candidates[0]).toMatchObject({ email_enabled: false, push_enabled: false });
  });

  it("does not plan anything for a disabled or unpublished session", () => {
    for (const sessionPatch of [
      { notifications_enabled: false },
      { is_published: false },
    ]) {
      const input = baseInput();
      Object.assign(input.sessions[0], sessionPatch);
      expect(buildNotificationCandidates(input)).toEqual([]);
    }
  });

  it("creates an in-app unread item for a published legacy event without a session", () => {
    const input = baseInput({
      sessions: [],
      standaloneEvents: [
        {
          id: EVENT_ID,
          title: "Nový pořad",
          starts_at: "2026-08-20T10:00:00.000Z",
          is_published: true,
          recipient_group_codes: ["ucitele"],
        },
      ],
      subscriptions: [],
    });

    expect(buildNotificationCandidates(input)).toEqual([
      expect.objectContaining({
        kind: "new_event",
        event_id: EVENT_ID,
        email_enabled: false,
        push_enabled: false,
      }),
    ]);
  });

  it("lets an explicit modern opt-out override a legacy interest", () => {
    const input = baseInput({
      activityPreferences: [
        { profile_id: PROFILE_ID, activity_code: "ucitele", enabled: false },
      ],
      legacyInterests: [{ user_id: PROFILE_ID, interest_slug: "ucitele" }],
      subscriptions: [],
    });

    expect(buildNotificationCandidates(input)).toEqual([]);
  });
});
