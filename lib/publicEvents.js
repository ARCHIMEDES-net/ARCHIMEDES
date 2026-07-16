import { supabase } from "./supabaseClient";

/**
 * Fields shown to anonymous visitors on the public homepage/calendar.
 *
 * Deliberately excludes stream_url and the broadcast_sessions join (which
 * carries viewer_url) — the join link into a live broadcast must never be
 * exposed to logged-out visitors, only the name/date/category/audience.
 */
const PUBLIC_EVENT_FIELDS =
  "id, title, category, audience_groups, starts_at, is_published, poster_path, poster_url";

export function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function normalizeAudience(aud) {
  if (!aud) return [];
  if (Array.isArray(aud)) return aud.filter(Boolean).map(String);
  const s = String(aud).trim();
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

const POSTER_BUCKET = "posters";

function normalizePosterPath(path) {
  if (!path) return "";
  let s = String(path).trim();
  if (!s) return "";
  if (s.startsWith(`${POSTER_BUCKET}/`)) s = s.slice(POSTER_BUCKET.length + 1);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) s = s.slice(1);
  return s;
}

export function resolvePosterUrl(row) {
  const direct = String(row?.poster_url || "").trim();
  if (direct) return direct;
  const normalized = normalizePosterPath(row?.poster_path);
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  const { data } = supabase.storage.from(POSTER_BUCKET).getPublicUrl(normalized);
  return data?.publicUrl || "";
}

/**
 * Loads published, future events for public (logged-out) display.
 * @param {number} limit - max rows to fetch, ordered by starts_at ascending
 */
export async function fetchPublicUpcomingEvents(limit = 60) {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("events")
    .select(PUBLIC_EVENT_FIELDS)
    .eq("is_published", true)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: data || [], error: "" };
}


/**
 * Returns a five-item editorial programme window for the homepage.
 *
 * Future broadcasts take priority. Until five are published, the window is
 * backfilled with the most recent completed broadcasts. The final result is
 * chronological, so the nearest future broadcast naturally follows the latest
 * completed one. Once five future broadcasts exist, the list starts with the
 * nearest one.
 */
export async function fetchPublicProgramWindow(limit = 5) {
  const nowIso = new Date().toISOString();

  const { data: upcoming, error: upcomingError } = await supabase
    .from("events")
    .select(PUBLIC_EVENT_FIELDS)
    .eq("is_published", true)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (upcomingError) {
    return { events: [], error: upcomingError.message };
  }

  const futureEvents = upcoming || [];
  const missing = Math.max(0, limit - futureEvents.length);

  if (!missing) {
    return { events: futureEvents.slice(0, limit), error: "" };
  }

  const { data: previous, error: previousError } = await supabase
    .from("events")
    .select(PUBLIC_EVENT_FIELDS)
    .eq("is_published", true)
    .lt("starts_at", nowIso)
    .order("starts_at", { ascending: false })
    .limit(missing);

  if (previousError) {
    return { events: futureEvents, error: previousError.message };
  }

  return {
    events: [...(previous || []).reverse(), ...futureEvents].slice(-limit),
    error: "",
  };
}
