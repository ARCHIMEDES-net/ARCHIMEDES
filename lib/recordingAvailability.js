import { getArchiveVideoUrl, normalizeBroadcastSession } from "./archiveRecording";

export const RECORDING_PROMISE = "Záznam vysílání bude k dispozici nejpozději do 48 hodin po jeho skončení.";
export function recordingAvailability(event, now = new Date()) {
  const session = normalizeBroadcastSession(event?.broadcast_sessions || event?.broadcast_session);
  if (getArchiveVideoUrl(event)) return { state: "published", message: "" };
  if (event?.status === "cancelled") return { state: "cancelled", message: "Vysílání bylo zrušeno." };
  if (event?.recording_expected === false) return { state: "none", message: "Z tohoto vysílání nebude dostupný záznam." };
  const start = Date.parse(event?.starts_at || "");
  const end = Date.parse(session?.ended_at || event?.ends_at || "") || (start + 60 * 60 * 1000);
  const expected = event?.recording_expected === true || ["processing", "ready", "failed"].includes(session?.recording_status);
  if (now.getTime() < end) return { state: "upcoming", message: RECORDING_PROMISE };
  if (!Number.isFinite(end) || !expected) return { state: "unknown", message: "" };
  if (now.getTime() > end + 48 * 60 * 60 * 1000) return { state: "overdue", message: "Zveřejnění záznamu se opozdilo. Děkujeme za trpělivost." };
  return { state: "processing", message: `Záznam připravujeme. Zveřejníme jej nejpozději do 48 hodin po skončení vysílání. Děkujeme za trpělivost.` };
}
