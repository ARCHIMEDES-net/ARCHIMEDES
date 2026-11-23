import { supabase } from "./supabaseClient";

function pragueDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function storageKey(kind, eventId, userId) {
  return `archimedes-usage:${kind}:${eventId || "-"}:${userId}`;
}

function alreadyRecordedToday(key, day) {
  try {
    return window.localStorage.getItem(key) === day;
  } catch (_error) {
    return false;
  }
}

function rememberRecorded(key, day) {
  try {
    window.localStorage.setItem(key, day);
  } catch (_error) {
    // Storage may be unavailable (private mode); the server is idempotent anyway.
  }
}

// Background, best-effort usage record. Never throws and never blocks the UI.
export async function recordPortalUsage(kind, eventId = "") {
  if (typeof window === "undefined") return;

  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.access_token || !session.user?.id) return;

    const day = pragueDay();
    const key = storageKey(kind, eventId, session.user.id);
    if (alreadyRecordedToday(key, day)) return;

    const response = await fetch("/api/portal/usage", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(eventId ? { kind, eventId } : { kind }),
    });

    if (response.ok) rememberRecorded(key, day);
  } catch (_error) {
    // Measurement must never disturb the portal.
  }
}

export const __test__ = { pragueDay, storageKey };
