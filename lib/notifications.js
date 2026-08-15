export const DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES = Object.freeze({
  email_enabled: true,
  push_enabled: false,
  new_event_enabled: true,
  day_before_enabled: true,
  thirty_minutes_before_enabled: true,
  schedule_changes_enabled: true,
  recording_available_enabled: true,
});

export function normalizeNotificationChannelPreferences(row, legacyEmailEnabled = true) {
  return {
    ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES,
    email_enabled:
      typeof row?.email_enabled === "boolean" ? row.email_enabled : legacyEmailEnabled !== false,
    push_enabled: row?.push_enabled === true,
    new_event_enabled: row?.new_event_enabled !== false,
    day_before_enabled: row?.day_before_enabled !== false,
    thirty_minutes_before_enabled: row?.thirty_minutes_before_enabled !== false,
    schedule_changes_enabled: row?.schedule_changes_enabled !== false,
    recording_available_enabled: row?.recording_available_enabled !== false,
  };
}

export function isNotificationFoundationMissing(error) {
  return ["42P01", "PGRST204", "PGRST205"].includes(String(error?.code || ""));
}

export function safeNotificationTargetPath(value) {
  const path = String(value || "").trim();
  return path.startsWith("/") && !path.startsWith("//") ? path : "";
}

export function notificationKindLabel(kind) {
  return (
    {
      new_event: "Nové vysílání",
      event_reminder: "Připomenutí vysílání",
      schedule_changed: "Změna termínu",
      event_cancelled: "Zrušené vysílání",
      recording_available: "Nový záznam",
      system: "ARCHIMEDES Live",
    }[kind] || "Oznámení"
  );
}
