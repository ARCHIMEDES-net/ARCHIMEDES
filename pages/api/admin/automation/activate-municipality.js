import { createClient } from "@supabase/supabase-js";
import {
  handleMunicipalityOnboarding,
  SERVICE_ONBOARDING_RPCS,
} from "../activate-municipality";
import { requireOnboardingAutomation } from "../../../../lib/server/onboardingAutomationAuth";

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

  if (String(req.body?.action || "").trim()) {
    return res.status(400).json({
      error: "Automatizační endpoint nepovoluje ruční změny e-mailového auditu.",
    });
  }

  const approvalReference = String(req.body?.approvalReference || "").trim();
  if (approvalReference.length < 10 || approvalReference.length > 200) {
    return res.status(400).json({
      error: "Chybí jednoznačný odkaz na finální schválení.",
    });
  }

  try {
    const performedBy = await requireOnboardingAutomation(
      req,
      res,
      supabaseAdmin
    );
    if (!performedBy) return;

    return handleMunicipalityOnboarding(req, res, {
      performedBy,
      rpcClient: supabaseAdmin,
      rpcNames: SERVICE_ONBOARDING_RPCS,
      approvalReference,
    });
  } catch (error) {
    console.error("onboarding automation authorization failed", error);
    return res.status(500).json({
      error: "Automatizovaný onboarding se nepodařilo bezpečně autorizovat.",
    });
  }
}
