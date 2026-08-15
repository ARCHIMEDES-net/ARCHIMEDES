import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { requireOnboardingAutomation } from "../../../lib/server/onboardingAutomationAuth";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import {
  buildOnboardingTestOrganizationName,
  isOnboardingTestEmailAllowed,
  isUuid,
} from "../../../lib/server/onboardingTestRuns";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function loadRun(runId) {
  const { data, error } = await supabaseAdmin
    .from("onboarding_test_runs")
    .select("*")
    .eq("id", runId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findAuthUserByEmail(email) {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const users = data?.users || [];
    const match = users.find(
      (user) => String(user.email || "").trim().toLowerCase() === email
    );
    if (match) return match;
    if (users.length < 200) return null;
  }
  throw new Error("Auth user scan exceeded the safe pagination limit.");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const performedBy = req.headers["x-onboarding-e2e-automation"] === "1"
      ? await requireOnboardingAutomation(req, res, supabaseAdmin)
      : await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!performedBy) return;

    const resourceId = String(
      req.query?.runId || req.body?.runId || req.body?.email || req.method
    ).trim();
    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-onboarding-e2e-runs",
      userId: performedBy.id,
      resourceId,
      limit: 30,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Příliš mnoho operací s produkčními testovacími běhy.",
      });
    }

    if (req.method === "POST") {
      const allowedEmail = String(req.body?.email || "").trim().toLowerCase();
      if (!isOnboardingTestEmailAllowed(allowedEmail)) {
        return res.status(400).json({
          error:
            "Testovací e-mail není na serverovém allowlistu produkčního E2E režimu.",
        });
      }

      const [{ data: existingProfile }, { data: existingOrganization }, existingAuthUser] =
        await Promise.all([
          supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", allowedEmail)
            .maybeSingle(),
          supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("contact_email", allowedEmail)
            .maybeSingle(),
          findAuthUserByEmail(allowedEmail),
        ]);
      if (existingProfile || existingOrganization || existingAuthUser) {
        return res.status(409).json({
          error:
            "Testovací adresa už patří existujícímu účtu nebo zákazníkovi. Nejdříve dokončete předchozí cleanup.",
        });
      }

      const runId = randomUUID();
      const expectedOrganizationName = buildOnboardingTestOrganizationName(runId);
      const { data, error } = await supabaseAdmin
        .from("onboarding_test_runs")
        .insert({
          id: runId,
          created_by: performedBy.id,
          allowed_email: allowedEmail,
          expected_organization_name: expectedOrganizationName,
        })
        .select("id, allowed_email, expected_organization_name, expires_at, status")
        .single();
      if (error) throw error;

      return res.status(201).json({
        ok: true,
        run: data,
        orderPath: `/zadost?type=obec&testRun=${encodeURIComponent(runId)}`,
      });
    }

    const runId = String(req.query?.runId || req.body?.runId || "").trim();
    if (!isUuid(runId)) {
      return res.status(400).json({ error: "Chybí platné ID testovacího běhu." });
    }
    const run = await loadRun(runId);
    if (!run) return res.status(404).json({ error: "Testovací běh nebyl nalezen." });

    if (req.method === "GET") {
      const organizationId = run.organization_id;
      const [{ data: organization }, { data: acceptance }, { data: onboarding }] =
        organizationId
          ? await Promise.all([
              supabaseAdmin
                .from("organizations")
                .select("id, name, status, license_status, contract_status, is_test, test_run_id")
                .eq("id", organizationId)
                .maybeSingle(),
              supabaseAdmin
                .from("customer_order_acceptances")
                .select("status, attempt_count, error_code, sent_at")
                .eq("organization_id", organizationId)
                .maybeSingle(),
              supabaseAdmin
                .from("organization_onboarding_runs")
                .select("email_status, email_attempt_count, email_error_code, local_admin_user_id")
                .eq("organization_id", organizationId)
                .maybeSingle(),
            ])
          : [{ data: null }, { data: null }, { data: null }];
      const [{ count: memberships }, { count: acceptances }, { count: onboardingRuns }] =
        organizationId
          ? await Promise.all([
              supabaseAdmin
                .from("organization_members")
                .select("id", { count: "exact", head: true })
                .eq("organization_id", organizationId),
              supabaseAdmin
                .from("customer_order_acceptances")
                .select("id", { count: "exact", head: true })
                .eq("organization_id", organizationId),
              supabaseAdmin
                .from("organization_onboarding_runs")
                .select("id", { count: "exact", head: true })
                .eq("organization_id", organizationId),
            ])
          : [{ count: 0 }, { count: 0 }, { count: 0 }];

      return res.status(200).json({
        ok: true,
        run,
        organization,
        acceptance,
        onboarding,
        cleanupPreview: { memberships, acceptances, onboardingRuns },
      });
    }

    if (run.status === "prepared" && !run.organization_id) {
      const { error: cancelError } = await supabaseAdmin
        .from("onboarding_test_runs")
        .update({
          status: "cleaned",
          cleanup_started_at: new Date().toISOString(),
          cleanup_finished_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("status", "prepared");
      if (cancelError) throw cancelError;
      return res.status(200).json({ ok: true, runId, status: "cleaned" });
    }

    if (!["submitted", "activated", "cleanup_pending", "failed", "expired"].includes(run.status)) {
      return res.status(409).json({
        error: "Testovací běh v tomto stavu nelze uklidit.",
      });
    }

    let cleanupRows = [];
    if (run.organization_id) {
      const { data, error: cleanupError } = await supabaseAdmin.rpc(
        "cleanup_onboarding_test_run_service_v1",
        { p_run_id: runId, p_performed_by: performedBy.id }
      );
      if (cleanupError) throw cleanupError;
      cleanupRows = data || [];
    } else if (run.status !== "cleanup_pending") {
      return res.status(409).json({
        error: "Testovací běh nemá organizaci určenou k bezpečnému úklidu.",
      });
    }

    const localAdminUserId = cleanupRows?.[0]?.local_admin_user_id || run.local_admin_user_id;
    if (localAdminUserId) {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        localAdminUserId
      );
      if (authDeleteError) {
        return res.status(500).json({
          error:
            "Databázová testovací data byla odstraněna, ale testovací Auth účet vyžaduje opakovaný cleanup.",
          cleanupPending: true,
        });
      }
    }

    const { error: completeError } = await supabaseAdmin
      .from("onboarding_test_runs")
      .update({
        status: "cleaned",
        cleanup_finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .eq("status", "cleanup_pending");
    if (completeError) throw completeError;

    return res.status(200).json({ ok: true, runId, status: "cleaned" });
  } catch (error) {
    console.error("onboarding E2E run error", error);
    return res.status(500).json({
      error: "Testovací onboardingový běh se nepodařilo bezpečně zpracovat.",
    });
  }
}
