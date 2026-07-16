import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import { WebMeetingApiError, webMeeting } from "../../../../lib/server/webmeetingClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function configuredMeetingType() {
  const requested = Number.parseInt(String(process.env.WEBMEETING_MEETING_TYPE || "11"), 10);
  return Number.isFinite(requested) && requested > 0 ? requested : 11;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.body?.eventId || "").trim();
  if (!eventId) return res.status(400).json({ error: "Chybí ID události." });

  let createdMeetingId = null;
  let meetingPersisted = false;

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, title, description, starts_at")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) throw eventError;
    if (!event) return res.status(404).json({ error: "Událost nebyla nalezena." });
    if (!event.starts_at) return res.status(400).json({ error: "Událost nemá nastavený začátek." });

    const { data: existingSessions, error: sessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .select("*")
      .eq("event_id", eventId)
      .limit(1);

    if (sessionError) throw sessionError;
    const existingSession = existingSessions?.[0] || null;

    if (existingSession?.external_meeting_id) {
      return res.status(409).json({
        error: "Pro tuto událost už byla místnost ve WebMeetingu vytvořena.",
      });
    }

    const startsAt = existingSession?.starts_at || event.starts_at;
    const moderatorName = String(existingSession?.moderator_name || "ARCHIMEDES Live").trim();
    const externalMeetingId = await webMeeting.createMeeting({
      name: String(event.title || "Vysílání ARCHIMEDES Live").trim(),
      startsAt,
      speakerName: moderatorName,
      description: String(event.description || "").trim(),
      type: configuredMeetingType(),
    });
    createdMeetingId = externalMeetingId;

    const logoutUrl = String(process.env.WEBMEETING_LOGOUT_URL || "").trim();
    await webMeeting.configureMeeting(externalMeetingId, {
      ...(logoutUrl ? { logout_url: logoutUrl } : {}),
      is_public: 0,
      restrict_enter_multiplicity: 1,
    });

    const sessionPatch = {
      event_id: eventId,
      platform: "webmeeting",
      status: "scheduled",
      starts_at: startsAt,
      external_meeting_id: String(externalMeetingId),
      provider_status: "created",
      last_synced_at: new Date().toISOString(),
      last_provider_error: null,
    };

    let savedSession;
    if (existingSession?.id) {
      const { data, error } = await supabaseAdmin
        .from("broadcast_sessions")
        .update(sessionPatch)
        .eq("id", existingSession.id)
        .select()
        .single();
      if (error) throw error;
      savedSession = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("broadcast_sessions")
        .insert([{ ...sessionPatch, recording_status: "none" }])
        .select()
        .single();
      if (error) throw error;
      savedSession = data;
    }
    meetingPersisted = true;

    return res.status(201).json({
      meetingId: String(externalMeetingId),
      sessionId: savedSession.id,
      status: savedSession.status,
    });
  } catch (error) {
    if (createdMeetingId && !meetingPersisted) {
      try {
        await webMeeting.deleteMeeting(createdMeetingId);
      } catch (cleanupError) {
        console.error("webmeeting orphan cleanup error:", cleanupError);
      }
    }
    console.error("webmeeting create meeting error:", error);
    const status = error instanceof WebMeetingApiError ? error.status : 500;
    return res.status(status).json({
      error: error.message || "Místnost ve WebMeetingu se nepodařilo vytvořit.",
    });
  }
}
