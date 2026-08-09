import { supabase } from "./supabaseClient";

async function fetchPublicEventRows(direction, referenceAt, limit) {
  const { data, error } = await supabase.rpc("get_public_events", {
    p_reference_at: referenceAt,
    p_direction: direction,
    p_limit: limit,
  });

  if (error) return { events: [], error: error.message };
  return { events: data || [], error: "" };
}

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

export function createPublicEventStructuredData(events, pageUrl) {
  const now = Date.now();
  const graph = (events || [])
    .filter((event) => {
      const start = safeDate(event?.starts_at);
      return start && start.getTime() >= now;
    })
    .map((event) => {
      const audience = normalizeAudience(event?.audience_groups);
      const posterUrl = resolvePosterUrl(event);
      const item = {
        "@type": "Event",
        "@id": `${pageUrl}#event-${event.id}`,
        name: event.title,
        startDate: event.starts_at,
        url: pageUrl,
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        organizer: {
          "@id": "https://www.archimedeslive.com/#organization",
          "@type": "Organization",
          name: "ARCHIMEDES Live",
          url: "https://www.archimedeslive.com",
        },
        location: {
          "@type": "VirtualLocation",
          url: pageUrl,
        },
      };

      if (event.category || audience.length) {
        item.description = [
          event.category,
          audience.length ? `pro ${audience.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(" – ");
      }

      if (posterUrl) item.image = [posterUrl];
      if (audience.length) {
        item.audience = {
          "@type": "Audience",
          audienceType: audience.join(", "),
        };
      }

      return item;
    });

  if (!graph.length) return null;
  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Loads published, future events for public (logged-out) display.
 * @param {number} limit - max rows to fetch, ordered by starts_at ascending
 */
export async function fetchPublicUpcomingEvents(limit = 60) {
  const nowIso = new Date().toISOString();
  return fetchPublicEventRows("upcoming", nowIso, limit);
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

  const upcomingResult = await fetchPublicEventRows("upcoming", nowIso, limit);
  if (upcomingResult.error) return upcomingResult;

  const futureEvents = upcomingResult.events;
  const missing = Math.max(0, limit - futureEvents.length);

  if (!missing) {
    return { events: futureEvents.slice(0, limit), error: "" };
  }

  const previousResult = await fetchPublicEventRows("previous", nowIso, missing);
  if (previousResult.error) return { events: futureEvents, error: previousResult.error };

  return {
    events: [...previousResult.events.reverse(), ...futureEvents].slice(-limit),
    error: "",
  };
}
