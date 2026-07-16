import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import { WebMeetingApiError, webMeeting } from "../../../../lib/server/webmeetingClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function values(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function latestRecording(recordings) {
  return values(recordings)
    .filter((item) => item?.url)
    .sort((a, b) => {
      const aTime = Date.parse(a?.startTime || "") || 0;
      const bTime = Date.parse(b?.startTime || "") || 0;
      return bTime - aTime;
    })[0] || null;
}

function presenceByParticipant(presence) {
  const map = new Map();
  for (const item of values(presence)) {
    if (item?.participant_id === null || item?.participant_id === undefined) continue;
    map.set(String(item.participant_id), item);
  }
  return map;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.body?.eventId || "").trim();
  if (!eventId) return res.status(400).json({ error: "Chybí ID události." });

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .select("id, external_meeting_id, recording_status")
      .eq("event_id", eventId)
      .limit(1);

    if (sessionError) throw sessionError;
    const session = sessions?.[0];
    if (!session?.external_meeting_id) {
      return res.status(409).json({ error: "Místnost ve WebMeetingu zatím není vytvořena." });
    }

    const [recordings, presence, participantRows] = await Promise.all([
      webMeeting.getRecordings(session.external_meeting_id),
      webMeeting.getPresence(session.external_meeting_id),
      supabaseAdmin
        .from("broadcast_participants")
        .select("id, provider_participant_id")
        .eq("session_id", session.id),
    ]);

    if (participantRows.error) throw participantRows.error;
    const syncedAt = new Date().toISOString();
    const recording = latestRecording(recordings);
    const sessionPatch = {
      last_synced_at: syncedAt,
      last_provider_error: null,
      provider_status: "results_synced",
    };

    if (recording?.url) {
      sessionPatch.recording_url = recording.url;
      sessionPatch.recording_status =
        session.recording_status === "published" ? "published" : "ready";
    }

    const { error: updateSessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .update(sessionPatch)
      .eq("id", session.id);
    if (updateSessionError) throw updateSessionError;

    const presenceMap = presenceByParticipant(presence);
    let attendanceCount = 0;

    for (const participant of participantRows.data || []) {
      const participantPresence = presenceMap.get(String(participant.provider_participant_id));
      if (!participantPresence) continue;

      const { error: updatePresenceError } = await supabaseAdmin
        .from("broadcast_participants")
        .update({
          presence_data: participantPresence,
          last_presence_sync_at: syncedAt,
          updated_at: syncedAt,
        })
        .eq("id", participant.id);

      if (updatePresenceError) throw updatePresenceError;
      attendanceCount += 1;
    }

    return res.status(200).json({
      recordingFound: Boolean(recording?.url),
      recordingUrl: recording?.url || null,
      recordingLengthMinutes: recording?.length ?? null,
      attendanceCount,
      unmatchedPresenceCount: Math.max(0, presenceMap.size - attendanceCount),
    });
  } catch (error) {
    console.error("webmeeting sync results error:", error);
    const status = error instanceof WebMeetingApiError ? error.status : 500;
    return res.status(status).json({
      error: error.message || "Výsledky vysílání se nepodařilo synchronizovat.",
    });
  }
}
