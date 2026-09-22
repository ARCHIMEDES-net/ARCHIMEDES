import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../../lib/server/authenticatedRateLimit";
import { resolveWebMeetingParticipants } from "../../../../lib/server/broadcastRecipientResolver";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import { invitationMessage, sendInvitationBatch } from "../../../../lib/server/broadcastInvitationEmail";

const MAX_INVITATION_RECIPIENTS = 1000;

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
      limit: 30,
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
    if (!session) return res.status(404).json({ error: "Vysílání nebylo nalezeno." });
    if (["finished", "cancelled"].includes(String(session.status || "").toLowerCase())) {
      return res.status(409).json({ error: "K dokončenému nebo zrušenému vysílání nelze posílat pozvánky." });
    }

    const { data: event, error: eventError } = await supabaseAdmin.from("events")
      .select("id,title,starts_at,is_published").eq("id", eventId).maybeSingle();
    if (eventError) throw eventError;
    if (!event?.is_published || !event.starts_at || !(new Date(event.starts_at).getTime() > Date.now())) {
      return res.status(409).json({ error: "Pozvánky lze rozesílat jen ke zveřejněnému budoucímu vysílání." });
    }

    const participants = await resolveWebMeetingParticipants(supabaseAdmin, {
      groupCodes: session.recipient_group_codes,
      manualEmails: session.manual_recipient_emails,
    });

    if (participants.length === 0) {
      return res.status(400).json({ error: "Seznam příjemců je prázdný." });
    }
    if (participants.length > MAX_INVITATION_RECIPIENTS) {
      return res.status(400).json({
        error: `Najednou lze odeslat pozvánky nejvýše ${MAX_INVITATION_RECIPIENTS} příjemcům.`,
      });
    }

    const { data: batch, error: batchError } = await supabaseAdmin.rpc("prepare_broadcast_invitation_batch", {
      p_event_id: eventId,
      p_emails: participants.map(({ email }) => email),
      p_message: invitationMessage(event),
      p_admin_id: admin.id,
    });
    if (batchError) throw batchError;
    if (batch?.done) return res.status(200).json({
      done: true, count: batch.accepted, total: batch.total,
      skipped: batch.total - batch.accepted,
    });
    if (!batch?.id || !Array.isArray(batch.payload)) throw new Error("Neplatná dávka pozvánek.");
    const selectedEmails = new Set(participants.map(({ email }) => email));
    if (batch.payload.some((message) => !selectedEmails.has(message.to?.[0]))) {
      return res.status(409).json({ error: "Zůstala nedokončená rozesílka pro jiný seznam příjemců. Nejprve obnovte původní seznam a dokončete ji." });
    }
    const count = await sendInvitationBatch(supabaseAdmin, batch);
    return res.status(200).json({ done: false, count });
  } catch (error) {
    console.error("broadcast invitation error:", error?.code || error?.name);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Pozvánky se nepodařilo odeslat." });
  }
}

