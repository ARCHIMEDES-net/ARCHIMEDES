import { createClient } from "@supabase/supabase-js";
import {
  assertJoinWindow,
  BroadcastAccessError,
  requireBroadcastViewer,
  webMeetingParticipant,
} from "../../../../lib/server/broadcastAccess";
import { WebMeetingApiError, webMeeting } from "../../../../lib/server/webmeetingClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  if (value && typeof value === "object") return value[0] ?? value["0"];
  return value;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.query.eventId || "").trim();

  try {
    const identity = await requireBroadcastViewer(req, supabaseAdmin);

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, is_published, starts_at")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) throw eventError;
    if (!event) throw new BroadcastAccessError("Událost nebyla nalezena.", 404);
    if (event.is_published === false && !identity.isPlatformAdmin) {
      throw new BroadcastAccessError("Vysílání zatím není zveřejněno.", 404);
    }

    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .select("id, status, starts_at, external_meeting_id")
      .eq("event_id", eventId)
      .limit(1);

    if (sessionError) throw sessionError;
    const session = sessions?.[0];
    if (!session?.external_meeting_id) {
      throw new BroadcastAccessError("Vysílání ještě není technicky připraveno.", 409);
    }
    if (["finished", "cancelled"].includes(String(session.status || "").toLowerCase())) {
      throw new BroadcastAccessError("Živé vysílání už není dostupné.", 410);
    }

    assertJoinWindow(session.starts_at || event.starts_at, identity.isPlatformAdmin);

    const participant = webMeetingParticipant(identity);
    const imported = await webMeeting.importParticipants(
      session.external_meeting_id,
      [participant],
      1
    );
    const participantId = firstValue(imported);
    if (participantId === null || participantId === undefined || participantId === "") {
      throw new WebMeetingApiError("WebMeeting nevrátil ID účastníka.", { status: 502 });
    }

    const url = await webMeeting.getParticipantEnterURL(
      session.external_meeting_id,
      participantId
    );
    if (!url) throw new WebMeetingApiError("WebMeeting nevrátil vstupní odkaz.", { status: 502 });

    const { error: auditError } = await supabaseAdmin.from("broadcast_participants").upsert(
      {
        session_id: session.id,
        user_id: identity.user.id,
        organization_id: identity.organizationId,
        provider_participant_id: String(participantId),
        join_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id,user_id" }
    );

    if (auditError) throw auditError;

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ url });
  } catch (error) {
    console.error("webmeeting viewer join error:", error);
    const status =
      error instanceof BroadcastAccessError || error instanceof WebMeetingApiError
        ? error.status
        : 500;
    return res.status(status).json({
      error: error.message || "Vstup do vysílání se nepodařilo připravit.",
    });
  }
}
