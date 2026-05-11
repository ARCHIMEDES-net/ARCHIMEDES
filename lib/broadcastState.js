export function normalizeBroadcastStatus(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["ready", "pripraveno", "připraveno", "scheduled", "naplanovano", "naplánováno"].includes(v)) return "ready";
  if (["live", "on_air", "onair", "vysilame", "vysíláme", "running"].includes(v)) return "live";
  if (["draft", "rozpracovano", "rozpracováno"].includes(v)) return "draft";
  if (["done", "finished", "completed", "dokonceno", "dokončeno"].includes(v)) return "done";
  if (["cancelled", "canceled", "zruseno", "zrušeno"].includes(v)) return "cancelled";

  return "unset";
}

export function normalizeBroadcastSession(session) {
  if (!session) return null;
  if (Array.isArray(session)) return session[0] || null;
  return session;
}

export function isPublishedEvent(event) {
  if (!event) return false;
  if (typeof event.is_published === "boolean") return event.is_published;
  if (typeof event.published === "boolean") return event.published;
  if (typeof event.is_visible === "boolean") return event.is_visible;
  return true;
}

export function getEventStart(event) {
  const session = normalizeBroadcastSession(event?.broadcast_sessions || event?.broadcast_session);

  const raw =
    session?.starts_at ||
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
  const session = normalizeBroadcastSession(event?.broadcast_sessions || event?.broadcast_session);

  return (
    session?.viewer_url ||
    session?.meet_link ||
    event?.stream_url ||
    event?.streamUrl ||
    event?.meet_link ||
    event?.google_meet_url ||
    ""
  );
}

export function getBroadcastStatus(event) {
  const session = normalizeBroadcastSession(event?.broadcast_sessions || event?.broadcast_session);

  return normalizeBroadcastStatus(
    session?.status ||
      session?.broadcast_status ||
      event?.broadcast_status ||
      event?.stream_status ||
      event?.status_vysilani ||
      null
  );
}

export function getJoinWindow(event) {
  const start = getEventStart(event);
  if (!start) return { start: null, openFrom: null, openUntil: null };

  return {
    start,
    openFrom: new Date(start.getTime() - 15 * 60 * 1000),
    openUntil: new Date(start.getTime() + 4 * 60 * 60 * 1000),
  };
}

export function getJoinButtonState(event, now = new Date()) {
  if (!event) {
    return { state: "hidden", label: "", href: "", start: null, reason: "missing-event" };
  }

  if (!isPublishedEvent(event)) {
    return { state: "hidden", label: "", href: "", start: null, reason: "not-published" };
  }

  const href = getStreamUrl(event);
  const status = getBroadcastStatus(event);
  const { start, openFrom, openUntil } = getJoinWindow(event);

  if (status === "cancelled") {
    return { state: "disabled", label: "Vysílání zrušeno", href: "", start, reason: "cancelled" };
  }

  if (!href) {
    return { state: "detail", label: "Detail", href: "", start, reason: "missing-url" };
  }

  if (!start || !openFrom || !openUntil) {
    if (["ready", "live", "draft", "unset"].includes(status)) {
      return {
        state: "join",
        label: "Přejít do vysílání",
        href,
        start,
        reason: "ready-no-date",
      };
    }

    if (status === "done") {
      return {
        state: "finished",
        label: "Přejít do archivu",
        href: "",
        start,
        reason: "finished-no-date",
      };
    }

    return { state: "detail", label: "Detail", href: "", start, reason: "missing-start" };
  }

  const isJoinWindowOpen = now >= openFrom && now <= openUntil;

  if (status === "live" || isJoinWindowOpen) {
    return {
      state: "join",
      label: "Přejít do vysílání",
      href,
      start,
      openFrom,
      openUntil,
      reason: "open",
    };
  }

  if (now < openFrom) {
    return {
      state: "waiting",
      label: `Vstoupit do vysílání od ${openFrom.toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      href: "",
      start,
      openFrom,
      openUntil,
      reason: "too-early",
    };
  }

  if (status === "done" || now > openUntil) {
    return {
      state: "finished",
      label: "Přejít do archivu",
      href: "",
      start,
      openFrom,
      openUntil,
      reason: "after-window",
    };
  }

  return {
    state: "detail",
    label: "Detail",
    href: "",
    start,
    openFrom,
    openUntil,
    reason: "fallback",
  };
}

export function shouldShowJoinButton(event, now = new Date()) {
  return getJoinButtonState(event, now).state === "join";
}

export function getLiveBadge(event, now = new Date()) {
  const state = getJoinButtonState(event, now);
  const status = getBroadcastStatus(event);
  const start = getEventStart(event);

  if (!start) return null;

  if (state.state === "join") return "Právě vysíláme";
  if (state.state === "waiting") return "Vysílání připraveno";
  if (status === "draft") return "Rozpracováno";
  if (status === "done") return "Dokončeno";

  return null;
}
