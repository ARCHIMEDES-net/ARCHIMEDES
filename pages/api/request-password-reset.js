import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";
import {
  sendPasswordRecoveryEmail,
  validatePasswordRecoveryEmailConfiguration,
} from "../../lib/server/passwordRecoveryEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/nastavit-heslo`;
const GENERIC_MESSAGE =
  "Pokud je tento e-mail v systému registrován, poslali jsme vám odkaz pro nastavení nového hesla.";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function idempotencyKey(userId, setupUrl) {
  const digest = crypto
    .createHash("sha256")
    .update(String(setupUrl || ""))
    .digest("hex")
    .slice(0, 32);
  return `password-recovery:${userId}:${digest}`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();

  if (!isValidEmail(cleanEmail) || cleanEmail.length > 254) {
    return res.status(400).json({ error: "Zadejte platný e-mail." });
  }

  try {
    const rateLimitAllowed = await consumePublicRateLimit({
      supabaseAdmin,
      req,
      route: "request-password-reset",
      limit: 10,
      windowSeconds: 60 * 60,
    });

    if (!rateLimitAllowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo odesláno příliš mnoho požadavků. Zkuste to prosím později.",
      });
    }

    try {
      validatePasswordRecoveryEmailConfiguration();
    } catch (configurationError) {
      console.error("password-reset email configuration unavailable", {
        code: configurationError?.code || "unknown",
      });
      return res.status(503).json({
        error: "Obnova hesla je nyní dočasně nedostupná. Zkuste to prosím později.",
      });
    }

    const { data, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: cleanEmail,
        options: {
          redirectTo: REDIRECT_TO,
        },
      });

    const userId = data?.user?.id || "";
    const setupUrl = data?.properties?.action_link || "";

    if (linkError || !userId || !setupUrl) {
      console.info("password-reset link not issued", {
        code: linkError?.code || "not_available",
        status: linkError?.status || null,
      });
      return res.status(202).json({ success: true, message: GENERIC_MESSAGE });
    }

    try {
      const receipt = await sendPasswordRecoveryEmail(
        { recipientEmail: cleanEmail, setupUrl },
        idempotencyKey(userId, setupUrl)
      );
      console.info("password-reset delivered to provider", {
        userId,
        provider: receipt.provider,
        messageId: receipt.messageId,
      });
    } catch (deliveryError) {
      console.error("password-reset delivery failed", {
        userId,
        code: deliveryError?.code || "unknown",
        deliveryOutcome: deliveryError?.deliveryOutcome || "unknown",
        httpStatus: deliveryError?.httpStatus || null,
      });
    }

    return res.status(202).json({ success: true, message: GENERIC_MESSAGE });
  } catch (requestError) {
    console.error("password-reset request failed", {
      code: requestError?.code || "unknown",
      status: requestError?.status || null,
    });
    return res.status(503).json({
      error: "Obnova hesla je nyní dočasně nedostupná. Zkuste to prosím později.",
    });
  }
}
