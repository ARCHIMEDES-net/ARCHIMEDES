import { createClient } from "@supabase/supabase-js";
import { getEmailGroups } from "../../../lib/server/emailGroups";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import {
  MAX_MANUAL_RECIPIENT_EMAILS,
  normalizeManualRecipientEmails,
} from "../../../lib/broadcastRecipients";

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

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const requestedGroups = Array.isArray(req.body?.groups)
      ? [...new Set(req.body.groups.map((item) => String(item || "").trim()).filter(Boolean))]
      : [];

    if (requestedGroups.length === 0) {
      return res.status(400).json({ error: "Vyberte alespoň jednu skupinu zájmu." });
    }

    if (requestedGroups.length > 50 || requestedGroups.some((slug) => slug.length > 100)) {
      return res.status(400).json({ error: "Výběr skupin je příliš rozsáhlý nebo neplatný." });
    }

    const manualRecipients = normalizeManualRecipientEmails(req.body?.manualEmails || []);

    if (manualRecipients.invalid.length > 0) {
      return res.status(400).json({
        error: `Opravte neplatné e-mailové adresy: ${manualRecipients.invalid.join(", ")}`,
      });
    }

    if (
      manualRecipients.inputCount > MAX_MANUAL_RECIPIENT_EMAILS ||
      manualRecipients.emails.length > MAX_MANUAL_RECIPIENT_EMAILS
    ) {
      return res.status(400).json({
        error: `Ručně lze přidat nejvýše ${MAX_MANUAL_RECIPIENT_EMAILS} e-mailových adres.`,
      });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-broadcast-recipients",
      userId: admin.id,
      resourceId: requestedGroups.slice().sort().join(","),
      limit: 30,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Seznam příjemců byl vytvořen příliš mnohokrát. Zkuste to prosím později.",
      });
    }

    const groups = await getEmailGroups(supabaseAdmin);
    const groupsBySlug = new Map(groups.map((group) => [group.slug, group]));
    const unknownGroups = requestedGroups.filter((slug) => !groupsBySlug.has(slug));

    if (unknownGroups.length > 0) {
      return res.status(400).json({ error: "Výběr obsahuje neplatnou skupinu zájmu." });
    }

    const recipientsByEmail = new Map();

    for (const slug of requestedGroups) {
      for (const user of groupsBySlug.get(slug).users) {
        const normalizedEmail = String(user.email || "").trim().toLowerCase();
        if (!normalizedEmail || recipientsByEmail.has(normalizedEmail)) continue;
        recipientsByEmail.set(normalizedEmail, { email: user.email.trim() });
      }
    }

    for (const email of manualRecipients.emails) {
      if (!recipientsByEmail.has(email)) {
        recipientsByEmail.set(email, { email });
      }
    }

    const users = [...recipientsByEmail.values()].sort((a, b) =>
      a.email.localeCompare(b.email, "cs")
    );

    return res.status(200).json({ groups: requestedGroups, count: users.length, users });
  } catch (error) {
    console.error("broadcast-recipients error:", error);
    return res.status(500).json({ error: "Nepodařilo se vytvořit seznam příjemců." });
  }
}
