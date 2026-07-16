export function normalizeBroadcastSession(session) {
  if (!session) return null;
  if (Array.isArray(session)) return session[0] || null;
  return session;
}

export function extractYouTubeId(url) {
  if (!url) return "";

  try {
    const parsed = new URL(String(url).trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return (parsed.pathname || "").replace(/^\//, "").split("/")[0] || "";
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return videoId;

      const parts = (parsed.pathname || "").split("/").filter(Boolean);
      const videoIndex = parts.findIndex(
        (part) => part === "embed" || part === "shorts" || part === "live"
      );
      if (videoIndex >= 0 && parts[videoIndex + 1]) return parts[videoIndex + 1];
    }

    if (host === "youtube-nocookie.com") {
      const parts = (parsed.pathname || "").split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === "embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
  } catch (_error) {
    return "";
  }

  return "";
}

export function isGoogleMeetUrl(url) {
  if (!url) return false;

  try {
    return new URL(String(url).trim()).hostname.toLowerCase() === "meet.google.com";
  } catch (_error) {
    return false;
  }
}

export function getRecordingUrl(event) {
  const session = normalizeBroadcastSession(
    event?.broadcast_sessions || event?.broadcast_session
  );

  return session?.recording_url || event?.broadcast_recording_url || "";
}

export function getArchiveVideoUrl(event) {
  const session = normalizeBroadcastSession(
    event?.broadcast_sessions || event?.broadcast_session
  );
  const recordingUrl = getRecordingUrl(event);
  const recordingStatus = String(session?.recording_status || "").trim().toLowerCase();

  // Nové záznamy se ukážou až po výslovném publikování správcem.
  if (
    recordingStatus === "published" &&
    recordingUrl &&
    !isGoogleMeetUrl(recordingUrl)
  ) {
    return recordingUrl;
  }

  // Staré YouTube záznamy jsou zatím uložené ve stream_url a stav
  // recording_status historicky nemají. Jiný live odkaz sem nesmí.
  if (extractYouTubeId(event?.stream_url)) return event.stream_url;

  return "";
}

export function hasArchiveRecording(event) {
  return Boolean(getArchiveVideoUrl(event));
}
