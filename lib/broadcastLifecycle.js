const FINISHED_RECORDING_STATUSES = new Set(["ready", "published"]);

export function canSyncBroadcastResults({ startsAt, now = new Date() } = {}) {
  const start = startsAt ? new Date(startsAt) : null;
  return Boolean(
    start &&
      !Number.isNaN(start.getTime()) &&
      start.getTime() <= now.getTime()
  );
}

export function getBroadcastLifecycle({
  startsAt,
  status,
  recordingStatus,
  recordingUrl,
  now = new Date(),
} = {}) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const normalizedRecordingStatus = String(recordingStatus || "").trim().toLowerCase();

  if (
    normalizedStatus === "finished" ||
    FINISHED_RECORDING_STATUSES.has(normalizedRecordingStatus) ||
    Boolean(String(recordingUrl || "").trim())
  ) {
    return "finished";
  }

  if (canSyncBroadcastResults({ startsAt, now })) {
    return "live";
  }

  return "planned";
}

export function canUpdateWebMeeting(config) {
  return getBroadcastLifecycle(config) === "planned";
}
