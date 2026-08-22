import { suggestRecipientGroups } from "../broadcastRecipients";
import { LEGACY_INTEREST_MAP } from "../interestMappings";
import { normalizeNotificationChannelPreferences } from "../notifications";

const DAY_MINUTES = 1440;
const HALF_HOUR_MINUTES = 30;
const REMINDER_GRACE_MINUTES = 20;
const MAX_CANDIDATES_PER_RUN = 2000;

function eventForSession(session) {
  return Array.isArray(session?.events) ? session.events[0] : session?.events;
}

function validDate(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? null : date;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function addProfile(target, key, profileId) {
  if (!key || !profileId) return;
  if (!target.has(key)) target.set(key, new Set());
  target.get(key).add(profileId);
}

function isReminderDue(now, startsAt, minutesBefore) {
  const scheduledFor = new Date(startsAt.getTime() - minutesBefore * 60_000);
  const lateBy = now.getTime() - scheduledFor.getTime();
  return lateBy >= 0 && lateBy < REMINDER_GRACE_MINUTES * 60_000;
}

function reminderCopy(title, minutesBefore) {
  if (minutesBefore === DAY_MINUTES) {
    return {
      title: `Zítra vysíláme: ${title}`,
      body: "Vysílání začne přibližně za 24 hodin.",
    };
  }

  return {
    title: `Za 30 minut vysíláme: ${title}`,
    body: "Vysílání začne přibližně za 30 minut.",
  };
}

export function buildNotificationCandidates({
  now = new Date(),
  sessions = [],
  standaloneEvents = [],
  subscriptions = [],
  activityPreferences = [],
  legacyInterests = [],
  profiles = [],
  channelPreferences = [],
  pushProfileIds = [],
}) {
  const profilesById = new Map(
    profiles
      .filter((profile) => profile?.id && profile?.is_active !== false)
      .map((profile) => [profile.id, profile])
  );
  const channelsByProfile = new Map(
    channelPreferences.map((preference) => [preference.profile_id, preference])
  );
  const profilesWithPush = new Set(pushProfileIds);
  const explicitActivityChoices = new Map();
  const profilesByGroup = new Map();

  for (const preference of activityPreferences) {
    const key = `${preference.profile_id}:${preference.activity_code}`;
    explicitActivityChoices.set(key, preference.enabled === true);
    if (preference.enabled === true) {
      addProfile(profilesByGroup, preference.activity_code, preference.profile_id);
    }
  }

  for (const interest of legacyInterests) {
    const groupCode = LEGACY_INTEREST_MAP[interest.interest_slug] || interest.interest_slug;
    if (explicitActivityChoices.has(`${interest.user_id}:${groupCode}`)) continue;
    addProfile(profilesByGroup, groupCode, interest.user_id);
  }

  const subscriptionsByEvent = new Map();
  for (const subscription of subscriptions) {
    if (subscription.enabled !== false) {
      addProfile(subscriptionsByEvent, subscription.event_id, subscription.profile_id);
    }
  }

  const candidates = [];
  const seen = new Set();

  function appendCandidate({
    profileId,
    eventId,
    kind,
    title,
    body,
    availableAt,
    dedupeKey,
    deliveryPolicy,
  }) {
    const profile = profilesById.get(profileId);
    if (!profile || seen.has(dedupeKey)) return;

    const channelChoice = normalizeNotificationChannelPreferences(
      channelsByProfile.get(profileId),
      profile.email_notifications_enabled !== false
    );

    seen.add(dedupeKey);
    const allowEmail = deliveryPolicy === "archimedes_all";
    const allowPush = ["in_app_and_push", "archimedes_all"].includes(deliveryPolicy);

    candidates.push({
      profile_id: profileId,
      event_id: eventId,
      kind,
      title,
      body,
      target_path: `/portal/udalost/${eventId}`,
      available_at: availableAt.toISOString(),
      dedupe_key: dedupeKey,
      email_enabled: allowEmail && channelChoice.email_enabled === true,
      push_enabled:
        allowPush && channelChoice.push_enabled === true && profilesWithPush.has(profileId),
    });
  }

  function appendNewEventCandidates({ eventId, title, groupCodes }) {
    const groupRecipients = new Set();
    for (const groupCode of unique(groupCodes || [])) {
      for (const profileId of profilesByGroup.get(groupCode) || []) {
        groupRecipients.add(profileId);
      }
    }

    for (const profileId of groupRecipients) {
      const preference = normalizeNotificationChannelPreferences(
        channelsByProfile.get(profileId),
        profilesById.get(profileId)?.email_notifications_enabled !== false
      );
      if (!preference.new_event_enabled) continue;

      appendCandidate({
        profileId,
        eventId,
        kind: "new_event",
        title: `Nové vysílání: ${title}`,
        body: "Podívejte se na detail a zapněte si připomenutí.",
        availableAt: now,
        dedupeKey: `new-event:${eventId}:${profileId}`,
        // Jednotlivá nová vysílání patří jen do centra novinek.
        deliveryPolicy: "in_app_only",
      });
    }
  }

  for (const session of sessions) {
    if (session?.notifications_enabled !== true || session?.is_published !== true) continue;

    const event = eventForSession(session);
    const eventId = session.event_id || event?.id;
    const startsAt = validDate(session.starts_at || event?.starts_at);
    const title = String(event?.title || "Vysílání ARCHIMEDES Live").trim();
    const deliveryPolicy = String(session.notification_delivery_policy || "in_app_only");
    if (!eventId || !startsAt || startsAt <= now) continue;

    appendNewEventCandidates({
      eventId,
      title,
      groupCodes: session.recipient_group_codes,
    });

    const offsets = unique(session.reminder_minutes || [DAY_MINUTES, HALF_HOUR_MINUTES])
      .map(Number)
      .filter((minutes) => [DAY_MINUTES, HALF_HOUR_MINUTES].includes(minutes));

    for (const profileId of subscriptionsByEvent.get(eventId) || []) {
      const preference = normalizeNotificationChannelPreferences(
        channelsByProfile.get(profileId),
        profilesById.get(profileId)?.email_notifications_enabled !== false
      );

      for (const minutesBefore of offsets) {
        const allowed =
          minutesBefore === DAY_MINUTES
            ? preference.day_before_enabled
            : preference.thirty_minutes_before_enabled;
        if (!allowed || !isReminderDue(now, startsAt, minutesBefore)) continue;

        const copy = reminderCopy(title, minutesBefore);
        appendCandidate({
          profileId,
          eventId,
          kind: "event_reminder",
          ...copy,
          availableAt: now,
          dedupeKey: `event-reminder:${eventId}:${profileId}:${minutesBefore}`,
          // Produkční účet WebMeetingu posílá systémový přístupový e-mail
          // automaticky 30 minut před začátkem. ARCHIMEDES proto tento offset
          // drží pouze v interní schránce, i kdyby správce pro vysílání povolil
          // externí kanály. Tím nevznikne souběžný e-mail ani push.
          deliveryPolicy: minutesBefore === HALF_HOUR_MINUTES ? "in_app_only" : deliveryPolicy,
        });
      }
    }
  }

  for (const event of standaloneEvents) {
    if (event?.is_published !== true) continue;

    const eventId = event.id;
    const startsAt = validDate(event.starts_at);
    const title = String(event.title || "Vysílání ARCHIMEDES Live").trim();
    if (!eventId || !startsAt || startsAt <= now) continue;

    appendNewEventCandidates({
      eventId,
      title,
      groupCodes: event.recipient_group_codes,
    });
  }

  const reminderPairs = new Set(
    candidates
      .filter((candidate) => candidate.kind === "event_reminder")
      .map((candidate) => `${candidate.profile_id}:${candidate.event_id}`)
  );
  const calmCandidates = candidates.filter(
    (candidate) =>
      candidate.kind !== "new_event" ||
      !reminderPairs.has(`${candidate.profile_id}:${candidate.event_id}`)
  );

  if (calmCandidates.length > MAX_CANDIDATES_PER_RUN) {
    throw new Error(`Notification candidate limit exceeded (${MAX_CANDIDATES_PER_RUN}).`);
  }

  return calmCandidates;
}

async function queryOrThrow(query, label) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message || error.code || "query failed"}`);
  return data || [];
}

export async function prepareNotificationQueue(supabaseAdmin, { now = new Date(), preview = false } = {}) {
  const from = new Date(now.getTime() - REMINDER_GRACE_MINUTES * 60_000);
  const to = new Date(now.getTime() + 45 * 24 * 60 * 60_000);

  const [sessions, publishedEvents, availableGroups] = await Promise.all([
    queryOrThrow(
      supabaseAdmin
        .from("broadcast_sessions")
        .select(
          "id,event_id,starts_at,is_published,notifications_enabled,notification_delivery_policy,reminder_minutes,recipient_group_codes,events!inner(id,title,starts_at)"
        )
        .gte("starts_at", from.toISOString())
        .lte("starts_at", to.toISOString()),
      "Broadcast sessions"
    ),
    queryOrThrow(
      supabaseAdmin
        .from("events")
        .select("id,title,starts_at,audience,audience_groups,is_published")
        .eq("is_published", true)
        .gte("starts_at", from.toISOString())
        .lte("starts_at", to.toISOString()),
      "Published events"
    ),
    queryOrThrow(
      supabaseAdmin
        .from("activity_categories")
        .select("code")
        .eq("is_active", true),
      "Activity categories"
    ),
  ]);

  const sessionEventIds = new Set(sessions.map((session) => session.event_id));
  const standaloneEvents = publishedEvents
    .filter((event) => !sessionEventIds.has(event.id))
    .map((event) => ({
      ...event,
      recipient_group_codes: suggestRecipientGroups(event, availableGroups),
    }));

  const sources = [...sessions, ...standaloneEvents];
  if (sources.length === 0) {
    return { preview, sessions: 0, candidates: 0, notificationsInserted: 0, deliveriesInserted: 0 };
  }

  const eventIds = unique(sources.map((source) => source.event_id || source.id));
  const groupCodes = unique(sources.flatMap((source) => source.recipient_group_codes || []));

  const subscriptions = await queryOrThrow(
    supabaseAdmin
      .from("event_reminder_subscriptions")
      .select("event_id,profile_id,enabled")
      .in("event_id", eventIds)
      .eq("enabled", true),
    "Reminder subscriptions"
  );

  const activityPreferences = groupCodes.length
    ? await queryOrThrow(
        supabaseAdmin
          .from("notification_preferences")
          .select("profile_id,activity_code,enabled")
          .in("activity_code", groupCodes),
        "Activity preferences"
      )
    : [];

  const relevantLegacySlugs = unique([
    ...groupCodes,
    ...Object.entries(LEGACY_INTEREST_MAP)
      .filter(([, code]) => groupCodes.includes(code))
      .map(([slug]) => slug),
  ]);
  const legacyInterests = relevantLegacySlugs.length
    ? await queryOrThrow(
        supabaseAdmin
          .from("user_interests")
          .select("user_id,interest_slug")
          .in("interest_slug", relevantLegacySlugs),
        "Legacy interests"
      )
    : [];

  const profileIds = unique([
    ...subscriptions.map((row) => row.profile_id),
    ...activityPreferences.map((row) => row.profile_id),
    ...legacyInterests.map((row) => row.user_id),
  ]);

  const [profiles, channelPreferences, pushSubscriptions] = profileIds.length
    ? await Promise.all([
        queryOrThrow(
          supabaseAdmin
            .from("profiles")
            .select("id,email_notifications_enabled,is_active")
            .in("id", profileIds),
          "Profiles"
        ),
        queryOrThrow(
          supabaseAdmin
            .from("notification_channel_preferences")
            .select(
              "profile_id,email_enabled,push_enabled,new_event_enabled,day_before_enabled,thirty_minutes_before_enabled"
            )
            .in("profile_id", profileIds),
          "Channel preferences"
        ),
        queryOrThrow(
          supabaseAdmin.from("push_subscriptions").select("profile_id").in("profile_id", profileIds),
          "Push subscriptions"
        ),
      ])
    : [[], [], []];

  const candidates = buildNotificationCandidates({
    now,
    sessions,
    standaloneEvents,
    subscriptions,
    activityPreferences,
    legacyInterests,
    profiles,
    channelPreferences,
    pushProfileIds: unique(pushSubscriptions.map((row) => row.profile_id)),
  });

  if (preview || candidates.length === 0) {
    return {
      preview,
      sessions: sources.length,
      candidates: candidates.length,
      notificationsInserted: 0,
      deliveriesInserted: 0,
    };
  }

  const { data, error } = await supabaseAdmin.rpc("enqueue_notification_candidates", {
    p_candidates: candidates,
  });
  if (error) {
    throw new Error(`Notification queue: ${error.message || error.code || "enqueue failed"}`);
  }

  const result = Array.isArray(data) ? data[0] : data;
  return {
    preview: false,
    sessions: sources.length,
    candidates: candidates.length,
    notificationsInserted: Number(result?.notifications_inserted || 0),
    deliveriesInserted: Number(result?.deliveries_inserted || 0),
  };
}
