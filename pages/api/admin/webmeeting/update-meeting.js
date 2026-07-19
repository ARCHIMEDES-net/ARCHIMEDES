import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import { WebMeetingApiError, webMeeting } from "../../../../lib/server/webmeetingClient";
import { canUpdateWebMeeting } from "../../../../lib/broadcastLifecycle";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function configuredMeetingType() {
  const requested = Number.parseInt(String(process.env.WEBMEETING_MEETING_TYPE || ""), 10);
  if (!Number.isFinite(requested) || requested <= 0) {
    throw new WebMeetingApiError(
      "Ve Vercelu chybí potvrzená hodnota WEBMEETING_MEETING_TYPE pro tarif pro_premium_live.",
      { status: 503, action: "updateMeeting" }
    );
  }
  return requested;
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

    const [{ data: event, error: eventError }, { data: sessions, error: sessionError }] =
      await Promise.all([
        supabaseAdmin.from("events").select("*").eq("id", eventId).maybeSingle(),
        supabaseAdmin
          .from("broadcast_sessions")
          .select("*")
          .eq("event_id", eventId)
          .limit(1),
      ]);

    if (eventError) throw eventError;
    if (sessionError) throw sessionError;
    if (!event) return res.status(404).json({ error: "Událost nebyla nalezena." });
    if (!event.starts_at) return res.status(400).json({ error: "Událost nemá nastavený začátek." });

    const session = sessions?.[0] || null;
    if (!session?.external_meeting_id) {
      return res.status(200).json({ synced: false, reason: "meeting_not_created" });
    }

    if (
      !canUpdateWebMeeting({
        startsAt: event.starts_at || session.starts_at,
        status: session.status,
        recordingStatus: session.recording_status,
        recordingUrl: session.recording_url,
        providerStatus: session.provider_status,
      })
    ) {
      return res.status(409).json({
        error:
          "Technické nastavení WebMeetingu je po začátku vysílání uzamčeno. Upravovat lze už jen záznam a interní poznámku v ARCHIMEDES.",
      });
    }

    const moderatorName = String(session.moderator_name || "ARCHIMEDES Live").trim();
    await webMeeting.updateMeeting({
      meetingId: session.external_meeting_id,
      name: String(event.title || "Vysílání ARCHIMEDES Live").trim(),
      startsAt: event.starts_at,
      speakerName: moderatorName,
      description: String(event.full_description || event.description || "").trim(),
      type: configuredMeetingType(),
    });

    const syncedAt = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("broadcast_sessions")
      .update({
        starts_at: event.starts_at,
        provider_status: "updated",
        last_synced_at: syncedAt,
        last_provider_error: null,
      })
      .eq("id", session.id);
    if (updateError) throw updateError;

    return res.status(200).json({
      synced: true,
      meetingId: String(session.external_meeting_id),
      startsAt: event.starts_at,
    });
  } catch (error) {
    console.error("webmeeting update meeting error:", error);
    const status = error instanceof WebMeetingApiError ? error.status : 500;
    return res.status(status).json({
      error: error.message || "Změny se nepodařilo propsat do WebMeetingu.",
    });
  }
}
