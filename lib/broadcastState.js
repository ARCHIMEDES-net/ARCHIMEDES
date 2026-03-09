export function normalizeBroadcastStatus(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["ready", "pripraveno", "připraveno"].includes(v)) return "ready";
  if (["live", "on_air", "onair", "vysilame", "vysíláme"].includes(v)) return "live";
  if (["draft", "rozpracovano", "rozpracováno"].includes(v)) return "draft";
  if (["done", "finished", "completed", "dokonceno", "dokončeno"].includes(v)) return "done";

  return "unset";
}

export function isPublishedEvent(event) {
  if (!event) return false;

  // Podpora pro více možných názvů sloupců
  if (typeof event.is_published === "boolean") return event.is_published;
  if (typeof event.published === "boolean") return event.published;
  if (typeof event.is_visible === "boolean") return event.is_visible;

  // Když publikační příznak není k dispozici, raději pustíme dál
  return true;
}

export function getEventStart(event) {
  const raw =
    event?.starts_at ||
    event?.start_at ||
    event?.date ||
    event?.datetime ||
    null;

  if (!raw) return null;

  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function getStreamUrl(event) {
  return (
    event?.stream_url ||
    event?.meet_link ||
    event?.google_meet_url ||
    event?.broadcast_sessions?.meet_link ||
    null
  );
}

export function getBroadcastStatus(event) {
  return normalizeBroadcastStatus(
    event?.broadcast_status ||
      event?.stream_status ||
      event?.broadcast_sessions?.broadcast_status ||
      event?.status_vysilani ||
      null
  );
}

export function shouldShowJoinButton(event, now = new Date()) {
  if (!event) return false;
  if (!isPublishedEvent(event)) return false;

  const streamUrl = getStreamUrl(event);
  if (!streamUrl) return false;

  const status = getBroadcastStatus(event);
  if (!["ready", "live"].includes(status)) return false;

  const start = getEventStart(event);
  if (!start) return false;

  const openFrom = new Date(start.getTime() - 15 * 60 * 1000); // 15 min předem
  const openUntil = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4 hod po startu

  return now >= openFrom && now <= openUntil;
}

export function getLiveBadge(event, now = new Date()) {
  const start = getEventStart(event);
  const status = getBroadcastStatus(event);

  if (!start) return null;

  const liveFrom = new Date(start.getTime() - 5 * 60 * 1000);
  const liveUntil = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (status === "live" || (now >= liveFrom && now <= liveUntil && status === "ready")) {
    return "Právě vysíláme";
  }

  if (shouldShowJoinButton(event, now)) {
    return "Vysílání připraveno";
  }

  return null;
}
