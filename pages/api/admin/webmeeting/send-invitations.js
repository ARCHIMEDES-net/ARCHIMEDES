import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../../lib/server/authenticatedRateLimit";
import { resolveWebMeetingParticipants } from "../../../../lib/server/broadcastRecipientResolver";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import { WebMeetingApiError, webMeeting } from "../../../../lib/server/webmeetingClient";

const MAX_WEBMEETING_RECIPIENTS = 200;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.body?.eventId || "").trim();
  if (!eventId) return res.status(400).json({ error: "Chybí ID události." });

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "webmeeting-send-invitations",
      userId: admin.id,
      resourceId: eventId,
      limit: 3,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Pozvánky byly spouštěny příliš často. Zkuste to prosím později.",
      });
    }

    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .select(
        "external_meeting_id, status, recipient_group_codes, manual_recipient_emails"
      )
      .eq("event_id", eventId)
      .limit(1);

    if (sessionError) throw sessionError;
    const session = sessions?.[0];
    if (!session?.external_meeting_id) {
      return res.status(409).json({ error: "Místnost ve WebMeetingu zatím není vytvořena." });
    }
    if (["finished", "cancelled"].includes(String(session.status || "").toLowerCase())) {
      return res.status(409).json({ error: "K dokončenému nebo zrušenému vysílání nelze posílat pozvánky." });
    }

    const participants = await resolveWebMeetingParticipants(supabaseAdmin, {
      groupCodes: session.recipient_group_codes,
      manualEmails: session.manual_recipient_emails,
    });

    if (participants.length === 0) {
      return res.status(400).json({ error: "Seznam příjemců je prázdný." });
    }
    if (participants.length > MAX_WEBMEETING_RECIPIENTS) {
      return res.status(400).json({
        error: `WebMeeting umožňuje v tomto režimu nejvýše ${MAX_WEBMEETING_RECIPIENTS} příjemců.`,
      });
    }

    const providerParticipants = participants.map(
      ({ number, surname, firstname, email }) => ({ number, surname, firstname, email })
    );

    await webMeeting.importParticipants(
      session.external_meeting_id,
      providerParticipants,
      1
    );
    await webMeeting.sendInvitations(session.external_meeting_id, {
      mode: 0,
      filter: 1,
      body: "",
    });

    return res.status(200).json({
      count: participants.length,
      onlyPreviouslyUninvited: true,
    });
  } catch (error) {
    console.error("webmeeting send invitations error:", error);
    const expectedError = error instanceof WebMeetingApiError;
    return res.status(expectedError ? error.status : 500).json({
      error: expectedError ? error.message : "Pozvánky se nepodařilo odeslat.",
    });
  }
}
