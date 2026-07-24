import { createClient } from "@supabase/supabase-js";
import { consumePublicRateLimit } from "../../../lib/server/publicRateLimit";
import {
  inspectMunicipalityInvite,
  MunicipalityInviteError,
} from "../../../lib/server/municipalityOrganizationInvite";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rateLimitAllowed = await consumePublicRateLimit({
      supabaseAdmin,
      req,
      route: "municipality-invite-context",
      limit: 60,
      windowSeconds: 60 * 60,
    });

    if (!rateLimitAllowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error:
          "Bylo provedeno příliš mnoho pokusů o ověření. Zkuste to prosím později.",
      });
    }

    const organizationType = String(req.body?.organizationType || "").trim();
    if (!["school", "association"].includes(organizationType)) {
      return res.status(400).json({ error: "Neplatný typ organizace." });
    }

    const { invite, municipality } = await inspectMunicipalityInvite({
      supabaseAdmin,
      rawToken: req.body?.inviteToken,
      organizationType,
    });

    return res.status(200).json({
      invitedEmail: String(invite.invited_email || "").trim().toLowerCase(),
      municipalityName: municipality.name,
      organizationType: invite.organization_type,
    });
  } catch (error) {
    const expectedError = error instanceof MunicipalityInviteError;
    return res.status(expectedError ? error.status : 500).json({
      error: expectedError
        ? error.message
        : "Pozvánku se nepodařilo ověřit.",
    });
  }
}
