import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import {
  cleanupNewAuthUser,
  CustomerOnboardingError,
  parseCentralAdminUserIds,
  resolveConfiguredCentralAdmins,
  resolveLocalAdministrator,
  sendCustomerOnboardingAuditCopy,
  sendCustomerOnboardingEmail,
  sendWrittenOrderAcceptanceAuditCopy,
  sendWrittenOrderAcceptanceEmail,
  updateAuthPreparationStatus,
  validateCustomerOnboardingEmailConfiguration,
} from "../../../lib/server/customerOnboarding";
import { LEGAL_DOCUMENT_VERSION } from "../../../lib/legalDocuments";
import {
  getBearerToken,
  requirePlatformAdmin,
} from "../../../lib/server/platformAdminApi";
import { getServerSiteUrl } from "../../../lib/server/siteUrl";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const LICENSE_LABELS = {
  paid_monthly: "Měsíční licence",
  paid_annual: "Roční licence",
  classroom_free_12m: "12 měsíců zdarma pro obec s učebnou ARCHIMEDES",
};
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function acceptanceSnapshotMatches(row, expected) {
  return (
    row.recipient_email === expected.recipientEmail &&
    row.license_plan === expected.licensePlan &&
    new Date(row.license_started_at).toISOString() === expected.licenseStartedAt &&
    (row.license_valid_until
      ? new Date(row.license_valid_until).toISOString()
      : null) === expected.licenseValidUntil &&
    row.billing_status === expected.billingStatus &&
    row.legal_document_version === LEGAL_DOCUMENT_VERSION
  );
}

async function ensureWrittenOrderAcceptance({
  customer,
  performedBy,
  idempotencyKey,
  licensePlan,
  licenseStartedAt,
  licenseValidUntil,
  billingStatus,
  siteUrl,
}) {
  if (!customer.terms_accepted_at) return { required: false };
  const recipientEmail = String(customer.contact_email || "").trim().toLowerCase();
  const recipientName = String(customer.contact_name || "").trim();
  if (!recipientName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    throw new CustomerOnboardingError(
      "Písemné přijetí nelze odeslat: objednatel nemá platné jméno a e-mail."
    );
  }
  const expected = {
    recipientEmail,
    licensePlan,
    licenseStartedAt,
    licenseValidUntil,
    billingStatus,
  };
  const { data: existing, error: loadError } = await supabaseAdmin
    .from("customer_order_acceptances")
    .select("*")
    .eq("organization_id", customer.id)
    .maybeSingle();
  if (loadError) throw loadError;
  if (existing) {
    if (!acceptanceSnapshotMatches(existing, expected)) {
      throw new CustomerOnboardingError(
        "Objednávka už byla písemně přijata nebo připravena s jinými parametry. Změnu řešte samostatným řízeným postupem."
      );
    }
    if (existing.status === "sent") return { required: true, sent: true };
    if (["sending", "delivery_unknown"].includes(existing.status)) {
      throw new CustomerOnboardingError(
        "Výsledek doručení písemného přijetí není bezpečně známý. Neopakujte odeslání; nejprve zkontrolujte poštu a audit."
      );
    }
  }

  validateCustomerOnboardingEmailConfiguration();

  const acceptanceReference = existing?.acceptance_reference || idempotencyKey;
  const now = new Date().toISOString();
  const payload = {
    organization_id: customer.id,
    performed_by: performedBy.id,
    recipient_name: recipientName,
    recipient_email: recipientEmail,
    license_plan: licensePlan,
    license_started_at: licenseStartedAt,
    license_valid_until: licenseValidUntil,
    billing_status: billingStatus,
    legal_document_version: LEGAL_DOCUMENT_VERSION,
    acceptance_reference: acceptanceReference,
    status: "sending",
    attempt_count: (existing?.attempt_count || 0) + 1,
    attempted_at: now,
    sent_at: null,
    error_code: null,
  };
  const write = existing
    ? supabaseAdmin
        .from("customer_order_acceptances")
        .update(payload)
        .eq("id", existing.id)
        .in("status", ["pending", "failed"])
    : supabaseAdmin.from("customer_order_acceptances").insert(payload);
  const { data: claimedRows, error: claimError } = await write.select("id");
  if (claimError) throw claimError;
  const claimed = claimedRows?.[0];
  if (!claimed?.id) {
    throw new CustomerOnboardingError(
      "Písemné přijetí právě zpracovává jiný požadavek. Obnovte stránku."
    );
  }

  try {
    const emailValues = {
      email: recipientEmail,
      fullName: recipientName,
      organizationName: customer.name,
      organizationType: customer.org_type,
      licensePlanLabel: LICENSE_LABELS[licensePlan],
      licenseStartedAt,
      licenseValidUntil,
      billingStatus,
      legalDocumentVersion: LEGAL_DOCUMENT_VERSION,
      acceptanceReference,
      siteUrl,
    };
    const clientReceipt = await sendWrittenOrderAcceptanceEmail({
      ...emailValues,
      idempotencyKey: `written-order-acceptance:${claimed.id}:client`,
    });
    let auditCopyReceipt = null;
    let auditCopyErrorCode = null;
    try {
      auditCopyReceipt = await sendWrittenOrderAcceptanceAuditCopy(
        emailValues,
        `written-order-acceptance:${claimed.id}:audit`
      );
    } catch {
      auditCopyErrorCode = "audit_copy_provider_failed";
    }

    const { error: completeError } = await supabaseAdmin
      .from("customer_order_acceptances")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        email_provider: clientReceipt.provider,
        client_provider_message_id: clientReceipt.messageId,
        audit_copy_provider_message_id: auditCopyReceipt?.messageId || null,
        audit_copy_sent_at: auditCopyReceipt ? new Date().toISOString() : null,
        error_code: auditCopyErrorCode,
      })
      .eq("id", claimed.id)
      .eq("status", "sending");
    if (completeError) throw completeError;
  } catch (error) {
    await supabaseAdmin
      .from("customer_order_acceptances")
      .update({
        status: "delivery_unknown",
        error_code: "registration_email_delivery_unknown",
      })
      .eq("id", claimed.id)
      .eq("status", "sending");
    throw new CustomerOnboardingError(
      "Výsledek doručení písemného přijetí není známý. Obec nebyla aktivována; e-mail automaticky neopakujte."
    );
  }
  return { required: true, sent: true };
}

const AUTHENTICATED_ONBOARDING_RPCS = Object.freeze({
  onboard: "onboard_customer_v3",
  claimEmail: "claim_onboarding_email_attempt",
  completeEmail: "complete_onboarding_email_attempt",
});

export const SERVICE_ONBOARDING_RPCS = Object.freeze({
  onboard: "onboard_customer_service_v1",
  claimEmail: "claim_onboarding_email_attempt_service_v1",
  completeEmail: "complete_onboarding_email_attempt_service_v1",
});

function createAuthenticatedClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );
}

function parseDate(value, required = false, endOfDay = false) {
  const clean = String(value || "").trim();
  if (!clean) {
    if (required) {
      throw new CustomerOnboardingError("Vyplňte datum konce licence.");
    }
    return null;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(clean);
  const date = new Date(
    dateOnly
      ? `${clean}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : clean
  );
  if (Number.isNaN(date.getTime())) {
    throw new CustomerOnboardingError("Datum licence není platné.");
  }
  return date.toISOString();
}

function safeRpcError(error) {
  const message = String(error?.message || "");

  if (error?.code === "23505" || /duplicate|already|existuje|onboarded/i.test(message)) {
    return {
      status: 409,
      message:
        "Onboarding koliduje s existujícím uživatelem, organizací, IČO nebo členstvím. Zkontrolujte existující záznamy.",
    };
  }
  if (/platformov/i.test(message)) {
    return { status: 403, message: "Tuto akci může provést pouze správce platformy." };
  }
  if (/nebyl nalezen/i.test(message)) {
    return { status: 404, message: "Zákazník nebyl nalezen." };
  }
  if (/licenc|smlouv|faktur|datum|učebn|správc|e-mail/i.test(message)) {
    return { status: 400, message: "Zkontrolujte onboardingové údaje zákazníka." };
  }

  return { status: 500, message: "Onboarding zákazníka se nepodařilo dokončit." };
}

function firstRpcRow(data) {
  return Array.isArray(data) ? data[0] : data;
}

async function completeEmailAttempt(
  authenticatedClient,
  attemptId,
  outcome,
  errorCode = null,
  rpcNames = AUTHENTICATED_ONBOARDING_RPCS,
  performedBy = null
) {
  const { data, error } = await authenticatedClient.rpc(
    rpcNames.completeEmail,
    {
      ...(performedBy ? { p_performed_by: performedBy.id } : {}),
      p_attempt_id: attemptId,
      p_outcome: outcome,
      p_error_code: errorCode,
    }
  );
  if (error) {
    console.error("customer onboarding email attempt completion failed", {
      attemptId,
      outcome,
    });
    return { recorded: false, row: null };
  }
  return { recorded: true, row: firstRpcRow(data) };
}

async function deliverOnboardingEmail({
  authenticatedClient,
  onboardingRunId,
  claimAction,
  claimReason,
  customer,
  localAdministrator,
  prepareLocalAdministrator,
  licensePlan,
  licenseValidUntil,
  siteUrl,
  rpcNames = AUTHENTICATED_ONBOARDING_RPCS,
  performedBy = null,
}) {
  const { data: claimRows, error: claimError } = await authenticatedClient.rpc(
    rpcNames.claimEmail,
    {
      ...(performedBy ? { p_performed_by: performedBy.id } : {}),
      p_onboarding_run_id: onboardingRunId,
      p_action: claimAction,
      p_reason: claimReason,
    }
  );
  if (claimError) throw claimError;

  const claim = firstRpcRow(claimRows);
  if (!claim?.claimed) {
    return {
      onboardingEmailSent: claim?.email_status === "sent",
      emailDeliveryInProgress: claim?.email_status === "sending",
      emailManualReviewRequired:
        claim?.email_status === "delivery_unknown",
      emailRetryRequired: claim?.email_status === "failed",
      emailAttemptNumber: claim?.attempt_number || 0,
    };
  }

  let deliveryAdministrator = localAdministrator;
  if (!deliveryAdministrator && prepareLocalAdministrator) {
    try {
      deliveryAdministrator = await prepareLocalAdministrator();
    } catch {
      console.error("customer onboarding setup link preparation failed", {
        onboardingRunId,
        attemptId: claim.attempt_id,
      });
      const completion = await completeEmailAttempt(
        authenticatedClient,
        claim.attempt_id,
        "failed",
        "setup_link_generation_failed",
        rpcNames,
        performedBy
      );
      return {
        onboardingEmailSent: false,
        emailDeliveryInProgress: false,
        emailManualReviewRequired: !completion.recorded,
        emailRetryRequired: completion.recorded,
        emailAttemptNumber: claim.attempt_number,
      };
    }
  }

  try {
    validateCustomerOnboardingEmailConfiguration();
  } catch {
    const completion = await completeEmailAttempt(
      authenticatedClient,
      claim.attempt_id,
      "failed",
      "registration_email_configuration_missing",
      rpcNames,
      performedBy
    );
    return {
      onboardingEmailSent: false,
      emailDeliveryInProgress: false,
      emailManualReviewRequired: !completion.recorded,
      emailRetryRequired: completion.recorded,
      emailAttemptNumber: claim.attempt_number,
    };
  }

  try {
    const emailValues = {
      email: deliveryAdministrator.email,
      fullName: deliveryAdministrator.fullName,
      organizationName: customer.name,
      organizationType: customer.org_type,
      registrationNumber: customer.registration_number,
      licensePlanLabel: LICENSE_LABELS[licensePlan],
      licenseValidUntil,
      siteUrl,
      setupUrl: deliveryAdministrator.setupUrl,
    };
    const clientReceipt = await sendCustomerOnboardingEmail({
      ...emailValues,
      idempotencyKey: `municipality-onboarding:${claim.attempt_id}:client`,
    });
    const { error: clientReceiptError } = await supabaseAdmin
      .from("organization_onboarding_email_attempts")
      .update({
        email_provider: clientReceipt.provider,
        client_provider_message_id: clientReceipt.messageId,
      })
      .eq("id", claim.attempt_id)
      .eq("status", "sending");
    if (clientReceiptError) throw clientReceiptError;

    let auditCopyReceipt = null;
    let auditCopyFailed = false;
    try {
      auditCopyReceipt = await sendCustomerOnboardingAuditCopy(
        emailValues,
        `municipality-onboarding:${claim.attempt_id}:audit`
      );
      const { error: auditReceiptError } = await supabaseAdmin
        .from("organization_onboarding_email_attempts")
        .update({
          audit_copy_provider_message_id: auditCopyReceipt.messageId,
          audit_copy_sent_at: new Date().toISOString(),
        })
        .eq("id", claim.attempt_id)
        .eq("status", "sending");
      if (auditReceiptError) throw auditReceiptError;
    } catch {
      auditCopyFailed = true;
    }
    const completion = await completeEmailAttempt(
      authenticatedClient,
      claim.attempt_id,
      "sent",
      auditCopyFailed ? "audit_copy_provider_failed" : null,
      rpcNames,
      performedBy
    );
    return {
      onboardingEmailSent: true,
      emailDeliveryInProgress: false,
      emailManualReviewRequired: !completion.recorded || auditCopyFailed,
      emailRetryRequired: false,
      emailAttemptNumber: claim.attempt_number,
    };
  } catch (emailError) {
    console.error("customer onboarding email error", {
      onboardingRunId,
      attemptId: claim.attempt_id,
    });
    const completion = await completeEmailAttempt(
      authenticatedClient,
      claim.attempt_id,
      "delivery_unknown",
      "registration_email_delivery_unknown",
      rpcNames,
      performedBy
    );
    return {
      onboardingEmailSent: false,
      emailDeliveryInProgress: !completion.recorded,
      emailManualReviewRequired: true,
      emailRetryRequired: false,
      emailAttemptNumber: claim.attempt_number,
    };
  }
}

async function loadEmailState(organizationId) {
  const { data: run, error: runError } = await supabaseAdmin
    .from("organization_onboarding_runs")
    .select(
      "id, organization_id, local_admin_user_id, local_admin_email, local_admin_full_name, license_plan, license_valid_until, email_status, email_attempted_at, email_error_code, email_attempt_count, email_resolution_action, email_resolution_reason, email_resolved_at, email_resolved_by"
    )
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (runError) throw runError;
  if (!run) return null;

  const { data: attempts, error: attemptsError } = await supabaseAdmin
    .from("organization_onboarding_email_attempts")
    .select(
      "id, attempt_number, previous_attempt_id, status, initiation_reason, initiated_by, claimed_at, completed_at, completed_by, error_code, resolution_action, resolution_reason, resolved_by, resolved_at"
    )
    .eq("onboarding_run_id", run.id)
    .order("attempt_number", { ascending: false });
  if (attemptsError) throw attemptsError;
  return { ...run, attempts: attempts || [] };
}

function serializeEmailStateForClient(emailState) {
  if (!emailState) return null;

  const attemptNumberById = new Map(
    (emailState.attempts || []).map((attempt) => [
      attempt.id,
      attempt.attempt_number,
    ])
  );

  return {
    local_admin_email: emailState.local_admin_email,
    local_admin_full_name: emailState.local_admin_full_name,
    email_status: emailState.email_status,
    email_attempted_at: emailState.email_attempted_at,
    email_attempt_count: emailState.email_attempt_count,
    email_resolution_action: emailState.email_resolution_action,
    email_resolution_reason: emailState.email_resolution_reason,
    email_resolved_at: emailState.email_resolved_at,
    attempts: (emailState.attempts || []).map((attempt) => ({
      attempt_number: attempt.attempt_number,
      previous_attempt_number:
        attemptNumberById.get(attempt.previous_attempt_id) || null,
      status: attempt.status,
      initiation_reason: attempt.initiation_reason,
      claimed_at: attempt.claimed_at,
      completed_at: attempt.completed_at,
      resolution_action: attempt.resolution_action,
      resolution_reason: attempt.resolution_reason,
      resolved_at: attempt.resolved_at,
    })),
  };
}

export async function handleMunicipalityOnboarding(req, res, serverContext = null) {
  res.setHeader("Cache-Control", "no-store");

  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let localAdministrator = null;
  let databaseCommitted = false;

  try {
    const performedBy =
      serverContext?.performedBy ||
      (await requirePlatformAdmin(req, res, supabaseAdmin));
    if (!performedBy) return;

    const token = serverContext ? null : getBearerToken(req);
    const siteUrl = getServerSiteUrl();
    const organizationId = String(
      req.method === "GET"
        ? req.query?.organizationId || ""
        : req.body?.organizationId || ""
    ).trim();

    if (!UUID_PATTERN.test(organizationId)) {
      return res.status(400).json({ error: "ID organizace nemá platný formát." });
    }

    const authenticatedClient =
      serverContext?.rpcClient || createAuthenticatedClient(token);
    const onboardingRpcNames =
      serverContext?.rpcNames || AUTHENTICATED_ONBOARDING_RPCS;
    const servicePerformedBy = serverContext ? performedBy : null;
    const approvalAuditSuffix = serverContext?.approvalReference
      ? ` Schválení: ${serverContext.approvalReference}`
      : "";

    if (req.method === "GET") {
      const emailStateBeforeReconciliation = await loadEmailState(organizationId);
      if (!emailStateBeforeReconciliation) {
        return res.status(404).json({
          error: "Pro tuto organizaci neexistuje audit jednotného onboardingu.",
        });
      }

      const { error: staleError } = await authenticatedClient.rpc(
        "mark_stale_onboarding_email_attempt",
        { p_onboarding_run_id: emailStateBeforeReconciliation.id }
      );
      if (staleError) throw staleError;

      const emailState = await loadEmailState(organizationId);
      return res.status(200).json({
        ok: true,
        emailState: serializeEmailStateForClient(emailState),
      });
    }

    const emailAction = String(req.body?.action || "").trim();
    if (emailAction) {
      if (
        ![
          "send_pending",
          "retry_failed",
          "confirm_not_delivered_and_retry",
          "resolve_without_resend",
        ].includes(emailAction)
      ) {
        return res.status(400).json({ error: "Neplatná akce e-mailového auditu." });
      }

      const reason = String(req.body?.reason || "").trim();
      if (reason.length < 3 || reason.length > 500) {
        return res.status(400).json({
          error: "Uveďte auditní důvod v délce 3 až 500 znaků.",
        });
      }

      const allowed = await consumeAuthenticatedRateLimit({
        supabaseAdmin,
        req,
        route: "admin-onboarding-email-resolution",
        userId: performedBy.id,
        resourceId: organizationId,
        limit: 10,
        windowSeconds: 10 * 60,
      });
      if (!allowed) {
        res.setHeader("Retry-After", "600");
        return res.status(429).json({
          error: "E-mailový audit byl měněn příliš často. Zkuste to později.",
        });
      }

      const emailState = await loadEmailState(organizationId);
      if (!emailState) {
        return res.status(404).json({
          error: "Pro tuto organizaci neexistuje audit jednotného onboardingu.",
        });
      }

      if (emailAction === "resolve_without_resend") {
        const { error: resolutionError } = await authenticatedClient.rpc(
          "resolve_onboarding_email_without_resend",
          {
            p_onboarding_run_id: emailState.id,
            p_reason: reason,
          }
        );
        if (resolutionError) {
          const safeError = safeRpcError(resolutionError);
          return res.status(safeError.status).json({ error: safeError.message });
        }
        return res.status(200).json({
          ok: true,
          emailState: serializeEmailStateForClient(
            await loadEmailState(organizationId)
          ),
        });
      }

      const { data: customer, error: customerError } = await supabaseAdmin
        .from("organizations")
        .select("id, name, org_type, registration_number")
        .eq("id", organizationId)
        .maybeSingle();
      if (customerError) throw customerError;
      if (!customer) {
        return res.status(404).json({ error: "Zákazník nebyl nalezen." });
      }

      const delivery = await deliverOnboardingEmail({
        authenticatedClient,
        onboardingRunId: emailState.id,
        claimAction:
          emailAction === "send_pending" ? "initial_delivery" : emailAction,
        claimReason: reason,
        customer,
        prepareLocalAdministrator: () =>
          resolveLocalAdministrator({
            supabaseAdmin,
            email: emailState.local_admin_email,
            fullName: emailState.local_admin_full_name,
            redirectTo: `${siteUrl}/nastavit-heslo`,
            prepareSetupLink: true,
          }),
        licensePlan: emailState.license_plan,
        licenseValidUntil: emailState.license_valid_until,
        siteUrl,
      });
      return res.status(200).json({
        ok: true,
        ...delivery,
        emailState: serializeEmailStateForClient(
          await loadEmailState(organizationId)
        ),
      });
    }

    const idempotencyKey = String(req.body?.idempotencyKey || "").trim();
    const licensePlan = String(req.body?.licensePlan || "").trim();
    const contractStatus = String(req.body?.contractStatus || "").trim();
    const billingStatus = String(req.body?.billingStatus || "").trim();
    const localAdminEmail = String(req.body?.localAdminEmail || "")
      .trim()
      .toLowerCase();
    const localAdminFullName = String(req.body?.localAdminFullName || "").trim();
    const classroomEligibilityVerified =
      req.body?.classroomEligibilityVerified === true;

    if (!UUID_PATTERN.test(idempotencyKey)) {
      return res.status(400).json({ error: "Chybí platný identifikátor onboardingu." });
    }
    if (!LICENSE_LABELS[licensePlan]) {
      return res.status(400).json({ error: "Vyberte variantu licence." });
    }
    if (contractStatus !== "accepted") {
      return res.status(400).json({ error: "Před aktivací potvrďte uzavření smlouvy." });
    }
    if (!['pending', 'paid', 'not_applicable'].includes(billingStatus)) {
      return res.status(400).json({ error: "Vyberte stav fakturace." });
    }
    if (
      localAdminFullName.length < 2 ||
      localAdminFullName.length > 120 ||
      localAdminEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localAdminEmail)
    ) {
      return res.status(400).json({
        error: "Vyplňte samostatně platné jméno a e-mail lokálního správce.",
      });
    }
    if (licensePlan === "classroom_free_12m" && billingStatus !== "not_applicable") {
      return res.status(400).json({
        error: "Bezplatná licence musí mít stav fakturace „Bez úhrady“.",
      });
    }
    if (licensePlan === "classroom_free_12m" && !classroomEligibilityVerified) {
      return res.status(400).json({
        error: "Před bezplatnou aktivací potvrďte ověření učebny ARCHIMEDES.",
      });
    }

    const licenseStartedAt =
      parseDate(req.body?.licenseStartedAt) || new Date().toISOString();
    const needsEndDate = ["paid_annual", "classroom_free_12m"].includes(
      licensePlan
    );
    const licenseValidUntil = parseDate(
      req.body?.licenseValidUntil,
      needsEndDate,
      true
    );

    if (
      licenseValidUntil &&
      new Date(licenseValidUntil) <= new Date(licenseStartedAt)
    ) {
      return res.status(400).json({
        error: "Datum konce licence musí být později než datum začátku.",
      });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-onboard-customer",
      userId: performedBy.id,
      resourceId: organizationId,
      limit: 10,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Onboarding byl spuštěn příliš mnohokrát. Zkuste to prosím později.",
      });
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("organizations")
      .select(
        "id, name, org_type, parent_organization_id, contact_name, contact_email, registration_number, terms_accepted_at, is_test, test_run_id"
      )
      .eq("id", organizationId)
      .maybeSingle();

    if (customerError) throw customerError;
    if (
      !customer ||
      !["municipality", "obec", "school", "association", "spolek"].includes(
        customer.org_type
      ) ||
      customer.parent_organization_id
    ) {
      return res.status(404).json({ error: "Samostatný zákazník nebyl nalezen." });
    }

    const isMunicipality = ["municipality", "obec"].includes(customer.org_type);

    if (customer.is_test) {
      const { data: testRun, error: testRunError } = await supabaseAdmin
        .from("onboarding_test_runs")
        .select("id, allowed_email, expected_organization_name, status, expires_at")
        .eq("id", customer.test_run_id)
        .maybeSingle();
      if (testRunError) throw testRunError;
      if (
        !testRun ||
        testRun.status !== "submitted" ||
        new Date(testRun.expires_at) <= new Date() ||
        testRun.expected_organization_name !== customer.name ||
        testRun.allowed_email !== String(customer.contact_email || "").trim().toLowerCase() ||
        testRun.allowed_email !== localAdminEmail
      ) {
        return res.status(409).json({
          error: "Produkční testovací onboarding neodpovídá připravenému běhu.",
        });
      }
    }

    await ensureWrittenOrderAcceptance({
      customer,
      performedBy,
      idempotencyKey,
      licensePlan,
      licenseStartedAt,
      licenseValidUntil,
      billingStatus,
      siteUrl,
    });

    const centralAdminUserIds = isMunicipality
      ? await resolveConfiguredCentralAdmins({
          supabaseAdmin,
          configuredUserIds: parseCentralAdminUserIds(
            process.env.MUNICIPALITY_CENTRAL_ADMIN_USER_IDS
          ),
        })
      : [];

    const { data: previousOnboarding, error: previousOnboardingError } =
      await supabaseAdmin
        .from("organization_onboarding_runs")
        .select("id, local_admin_user_id, local_admin_email, email_status")
        .eq("organization_id", customer.id)
        .maybeSingle();

    if (previousOnboardingError) throw previousOnboardingError;
    if (
      previousOnboarding &&
      String(previousOnboarding.local_admin_email || "").trim().toLowerCase() !==
        localAdminEmail
    ) {
      return res.status(409).json({
        error:
          "Zákazník už byl onboardován s jiným lokálním správcem. Změnu proveďte samostatným řízeným postupem.",
      });
    }

    localAdministrator = await resolveLocalAdministrator({
      supabaseAdmin,
      email: localAdminEmail,
      fullName: localAdminFullName,
      redirectTo: `${siteUrl}/nastavit-heslo`,
      prepareSetupLink:
        !previousOnboarding ||
        ["pending", "failed"].includes(previousOnboarding.email_status),
      idempotencyKey,
      organizationId: customer.id,
      performedBy: performedBy.id,
    });

    const { data: onboardingRows, error: onboardingError } =
      await authenticatedClient.rpc(onboardingRpcNames.onboard, {
        ...(servicePerformedBy
          ? { p_performed_by: servicePerformedBy.id }
          : {}),
        p_idempotency_key: idempotencyKey,
        p_organization_id: customer.id,
        p_local_admin_user_id: localAdministrator.userId,
        p_local_admin_email: localAdministrator.email,
        p_local_admin_full_name: localAdministrator.fullName,
        p_central_admin_user_ids: centralAdminUserIds,
        p_license_plan: licensePlan,
        p_license_started_at: licenseStartedAt,
        p_license_valid_until: licenseValidUntil,
        p_contract_status: contractStatus,
        p_billing_status: billingStatus,
        p_classroom_eligibility_verified: classroomEligibilityVerified,
        p_local_admin_must_set_password: localAdministrator.mustSetPassword,
      });

    if (onboardingError) {
      const safeError = safeRpcError(onboardingError);
      if (localAdministrator.cleanupEligible) {
        const rollbackSucceeded = await cleanupNewAuthUser(
          supabaseAdmin,
          localAdministrator.userId,
          { idempotencyKey, organizationId: customer.id }
        );
        await updateAuthPreparationStatus(
          supabaseAdmin,
          localAdministrator.authPreparationId,
          rollbackSucceeded ? "rolled_back" : "cleanup_required",
          { auth_user_id: localAdministrator.userId }
        );
        if (!rollbackSucceeded) {
          return res.status(500).json({
            error:
              "Databázový onboarding byl vrácen zpět, ale dočasný Auth účet vyžaduje ruční odstranění. Událost je v serverovém auditu.",
          });
        }
      }
      return res.status(safeError.status).json({ error: safeError.message });
    }

    databaseCommitted = true;
    const onboarding = onboardingRows?.[0];
    if (!onboarding?.onboarding_run_id) {
      throw new Error("Onboarding RPC nevrátilo auditní identifikátor.");
    }

    if (customer.is_test) {
      const { error: testActivationError } = await supabaseAdmin
        .from("onboarding_test_runs")
        .update({
          status: "activated",
          activated_at: new Date().toISOString(),
          local_admin_user_id: localAdministrator.userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.test_run_id)
        .eq("status", "submitted");
      if (testActivationError) {
        console.error("onboarding test run activation audit failed", {
          testRunId: customer.test_run_id,
        });
      }
    }

    const authPreparationRecorded = await updateAuthPreparationStatus(
      supabaseAdmin,
      localAdministrator.authPreparationId,
      "committed",
      { auth_user_id: localAdministrator.userId }
    );

    if (onboarding.replayed === true && onboarding.email_status === "sent") {
      return res.status(200).json({
        ok: true,
        localAdminAccountCreated: false,
        centralAdminCount: centralAdminUserIds.length,
        onboardingEmailSent: true,
        emailRetryRequired: false,
        executionSource: serverContext ? "automation" : "admin_ui",
        authPreparationManualReviewRequired: !authPreparationRecorded,
      });
    }

    if (
      onboarding.replayed === true &&
      ["sending", "delivery_unknown"].includes(onboarding.email_status)
    ) {
      return res.status(200).json({
        ok: true,
        localAdminAccountCreated: false,
        centralAdminCount: centralAdminUserIds.length,
        onboardingEmailSent: false,
        emailDeliveryInProgress: onboarding.email_status === "sending",
        emailManualReviewRequired:
          onboarding.email_status === "delivery_unknown",
        emailRetryRequired: false,
        executionSource: serverContext ? "automation" : "admin_ui",
        authPreparationManualReviewRequired: !authPreparationRecorded,
      });
    }

    const delivery = await deliverOnboardingEmail({
      authenticatedClient,
      onboardingRunId: onboarding.onboarding_run_id,
      claimAction:
        onboarding.email_status === "failed"
          ? "retry_failed"
          : "initial_delivery",
      claimReason:
        onboarding.email_status === "failed"
          ? `Opakování bezpečné chyby před odesláním v rámci stejného požadavku.${approvalAuditSuffix}`
          : `První onboardingový e-mail po úspěšném databázovém onboardingu.${approvalAuditSuffix}`,
      customer: {
        ...customer,
        registration_number:
          onboarding.registration_number || customer.registration_number,
      },
      localAdministrator,
      licensePlan,
      licenseValidUntil,
      siteUrl,
      rpcNames: onboardingRpcNames,
      performedBy: servicePerformedBy,
    });

    return res.status(200).json({
      ok: true,
      localAdminAccountCreated: localAdministrator.isNewAccount,
      centralAdminCount: centralAdminUserIds.length,
      ...delivery,
      executionSource: serverContext ? "automation" : "admin_ui",
      authPreparationManualReviewRequired: !authPreparationRecorded,
    });
  } catch (error) {
    if (localAdministrator?.cleanupEligible && !databaseCommitted) {
      const rollbackSucceeded = await cleanupNewAuthUser(
        supabaseAdmin,
        localAdministrator.userId,
        {
          idempotencyKey: String(req.body?.idempotencyKey || "").trim(),
          organizationId: String(req.body?.organizationId || "").trim(),
        }
      );
      await updateAuthPreparationStatus(
        supabaseAdmin,
        localAdministrator.authPreparationId,
        rollbackSucceeded ? "rolled_back" : "cleanup_required",
        { auth_user_id: localAdministrator.userId }
      );
    }

    if (error instanceof CustomerOnboardingError) {
      const safeMessage = error.message;
      return res.status(error.status).json({ error: safeMessage });
    }

    console.error("customer onboarding error", error);
    return res.status(500).json({
      error: "Onboarding zákazníka se nepodařilo bezpečně dokončit.",
    });
  }
}

export default async function handler(req, res) {
  return handleMunicipalityOnboarding(req, res);
}
