const FINISHED_RECORDING_STATUSES = new Set(["ready", "published"]);
const FINISHED_PROVIDER_STATUSES = new Set(["results_synced"]);

export function getBroadcastLifecycle({
  startsAt,
  status,
  recordingStatus,
  recordingUrl,
  providerStatus,
  now = new Date(),
} = {}) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const normalizedRecordingStatus = String(recordingStatus || "").trim().toLowerCase();
  const normalizedProviderStatus = String(providerStatus || "").trim().toLowerCase();

  if (
    normalizedStatus === "finished" ||
    FINISHED_RECORDING_STATUSES.has(normalizedRecordingStatus) ||
    Boolean(String(recordingUrl || "").trim()) ||
    FINISHED_PROVIDER_STATUSES.has(normalizedProviderStatus)
  ) {
    return "finished";
  }

  const start = startsAt ? new Date(startsAt) : null;
  if (start && !Number.isNaN(start.getTime()) && start.getTime() <= now.getTime()) {
    return "live";
  }

  return "planned";
}

export function canUpdateWebMeeting(config) {
  return getBroadcastLifecycle(config) === "planned";
}
