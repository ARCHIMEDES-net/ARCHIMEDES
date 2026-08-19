import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import {
  cleanupNewAuthUser,
  CustomerOnboardingError,
  resolveLocalAdministrator,
  sendCustomerOnboardingAuditCopy,
  sendCustomerOnboardingEmail,
  updateAuthPreparationStatus,
  validateCustomerOnboardingEmailConfiguration,
} from "../../../lib/server/customerOnboarding";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function updateAttempt(attemptId, status, values = {}) {
  const { error } = await supabaseAdmin
    .from("municipality_admin_invitation_attempts")
    .update({ status, updated_at: new Date().toISOString(), ...values })
    .eq("id", attemptId);
  if (error) throw error;
}

async function claimAttempt({
  idempotencyKey,
  organizationId,
  email,
  fullName,
  initiatedBy,
}) {
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("municipality_admin_invitation_attempts")
    .insert({
      idempotency_key: idempotencyKey,
      organization_id: organizationId,
      initiated_by: initiatedBy,
      recipient_email: email,
      recipient_full_name: fullName,
      status: "preparing",
    })
    .select("*")
    .maybeSingle();

  if (!insertError && inserted) return { attempt: inserted, replayed: false };
  if (insertError?.code !== "23505") throw insertError;

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("municipality_admin_invitation_attempts")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!existing) {
    throw new CustomerOnboardingError(
      "Pro tento e-mail už probíhá jiná pozvánka. Zkontrolujte audit.",
      409,
      "INVITATION_IN_PROGRESS"
    );
  }
  if (
    existing.organization_id !== organizationId ||
    existing.recipient_email !== email ||
    existing.recipient_full_name !== fullName
  ) {
    throw new CustomerOnboardingError(
      "Identifikátor požadavku už patří jiné pozvánce.",
      409,
      "INVITATION_IDEMPOTENCY_CONFLICT"
    );
  }
  if (["sent", "sent_copy_failed"].includes(existing.status)) {
    return { attempt: existing, replayed: true };
  }
  if (["failed", "rolled_back"].includes(existing.status)) {
    const { data: reclaimed, error: reclaimError } = await supabaseAdmin
      .from("municipality_admin_invitation_attempts")
      .update({
        status: "preparing",
        user_id: null,
        membership_id: null,
        account_created: false,
        error_code: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("status", existing.status)
      .select("*")
      .maybeSingle();
    if (reclaimError) throw reclaimError;
    if (reclaimed) return { attempt: reclaimed, replayed: false };
  }
  throw new CustomerOnboardingError(
    ["sending", "delivery_unknown"].includes(existing.status)
      ? "Výsledek odeslání pozvánky není bezpečně známý. E-mail neopakujte; zkontrolujte audit."
      : "Tato pozvánka už byla zahájena a vyžaduje kontrolu auditu.",
    409,
    "INVITATION_MANUAL_REVIEW"
  );
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let attempt = null;
  let localAdministrator = null;
  let profileCreated = false;
  let membershipCreated = false;
  let membershipId = null;
  let emailSendingStarted = false;
  let organizationId = "";
  let idempotencyKey = "";

  try {
    const platformAdmin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!platformAdmin) return;

    organizationId = String(req.body?.organizationId || "").trim();
    idempotencyKey = String(req.body?.idempotencyKey || "").trim();
    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
    const cleanFullName = String(req.body?.fullName || "").trim();

    if (!UUID_PATTERN.test(organizationId)) {
      return res.status(400).json({ error: "ID obce nemá platný formát." });
    }
    if (!UUID_PATTERN.test(idempotencyKey)) {
      return res.status(400).json({ error: "ID požadavku nemá platný formát." });
    }
    if (!isValidEmail(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ error: "Zadejte platný pracovní e-mail." });
    }
    if (cleanFullName.length < 2 || cleanFullName.length > 120) {
      return res.status(400).json({ error: "Jméno musí mít 2 až 120 znaků." });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-invite-municipality-admin",
      userId: platformAdmin.id,
      resourceId: organizationId,
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo provedeno příliš mnoho pokusů. Zkuste to prosím později.",
      });
    }

    const { data: municipality, error: municipalityError } = await supabaseAdmin
      .from("organizations")
      .select(
        "id, name, org_type, status, parent_organization_id, registration_number, license_plan, license_valid_until"
      )
      .eq("id", organizationId)
      .maybeSingle();
    if (municipalityError) throw municipalityError;
    if (
      !municipality ||
      !["municipality", "obec"].includes(municipality.org_type) ||
      municipality.parent_organization_id
    ) {
      return res.status(404).json({ error: "Obec nebyla nalezena." });
    }
    if (municipality.status !== "active") {
      return res.status(409).json({
        error: "Správce lze přidat pouze k aktivní obci.",
      });
    }
    if (!LICENSE_LABELS[municipality.license_plan]) {
      return res.status(409).json({
        error: "Obec nemá podporovanou aktivní licenci.",
      });
    }

    validateCustomerOnboardingEmailConfiguration();
    const claim = await claimAttempt({
      idempotencyKey,
      organizationId,
      email: cleanEmail,
      fullName: cleanFullName,
      initiatedBy: platformAdmin.id,
    });
    attempt = claim.attempt;
    if (claim.replayed) {
      return res.status(200).json({
        ok: true,
        replayed: true,
        organizationId,
        userId: attempt.user_id,
        membershipId: attempt.membership_id,
        invitationSent: true,
        auditCopySent: attempt.status === "sent",
        message: "Pozvánka už byla bezpečně zpracována.",
      });
    }

    localAdministrator = await resolveLocalAdministrator({
      supabaseAdmin,
      email: cleanEmail,
      fullName: cleanFullName,
      redirectTo: `${getServerSiteUrl()}/nastavit-heslo`,
      idempotencyKey,
      organizationId,
      performedBy: platformAdmin.id,
    });

    const { data: existingMembership, error: existingMembershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("id, role_in_org, status")
        .eq("organization_id", organizationId)
        .eq("user_id", localAdministrator.userId)
        .maybeSingle();
    if (existingMembershipError) throw existingMembershipError;
    if (existingMembership) {
      throw new CustomerOnboardingError(
        existingMembership.role_in_org === "organization_admin" &&
          existingMembership.status === "active"
          ? "Tento uživatel už je aktivním správcem obce."
          : "Uživatel už má u obce jiné členství. Je nutná kontrola.",
        409,
        "MEMBERSHIP_EXISTS"
      );
    }

    if (localAdministrator.isNewAccount) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: localAdministrator.userId,
            email: cleanEmail,
            full_name: cleanFullName,
            is_active: true,
            must_set_password: true,
            user_type: "organization",
            active_organization_id: organizationId,
          },
          { onConflict: "id" }
        );
      if (profileError) throw profileError;
      profileCreated = true;
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: organizationId,
        user_id: localAdministrator.userId,
        role_in_org: "organization_admin",
        status: "active",
      })
      .select("id")
      .single();
    if (membershipError) throw membershipError;
    membershipCreated = true;
    membershipId = membership.id;

    const preparationCommitted = await updateAuthPreparationStatus(
      supabaseAdmin,
      localAdministrator.authPreparationId,
      "committed"
    );
    if (!preparationCommitted) {
      throw new Error("Přípravu Auth účtu se nepodařilo dokončit v auditu.");
    }

    await updateAttempt(attempt.id, "sending", {
      user_id: localAdministrator.userId,
      membership_id: membershipId,
      account_created: localAdministrator.isNewAccount,
      error_code: null,
    });
    emailSendingStarted = true;

    const emailValues = {
      email: cleanEmail,
      fullName: localAdministrator.fullName,
      organizationName: municipality.name,
      organizationType: municipality.org_type,
      registrationNumber: municipality.registration_number,
      licensePlanLabel: LICENSE_LABELS[municipality.license_plan],
      licenseValidUntil: municipality.license_valid_until,
      siteUrl: getServerSiteUrl(),
      setupUrl: localAdministrator.setupUrl,
    };

    try {
      await sendCustomerOnboardingEmail(emailValues);
    } catch (emailError) {
      await updateAttempt(attempt.id, "delivery_unknown", {
        error_code: "client_smtp_delivery_unknown",
      });
      throw new CustomerOnboardingError(
        "Přístup byl připraven, ale výsledek doručení klientovi není známý. E-mail automaticky neopakujte; zkontrolujte audit.",
        502,
        "CLIENT_EMAIL_DELIVERY_UNKNOWN"
      );
    }

    const clientSentAt = new Date().toISOString();
    try {
      await sendCustomerOnboardingAuditCopy(emailValues);
    } catch (copyError) {
      await updateAttempt(attempt.id, "sent_copy_failed", {
        client_sent_at: clientSentAt,
        error_code: "audit_copy_smtp_failed",
      });
      return res.status(200).json({
        ok: true,
        organizationId,
        userId: localAdministrator.userId,
        membershipId,
        invitationSent: true,
        auditCopySent: false,
        message:
          "Pozvánka byla klientovi odeslána. Bezpečnou kopii Zuzaně se nepodařilo doručit; je evidována k ruční kontrole.",
      });
    }

    await updateAttempt(attempt.id, "sent", {
      client_sent_at: clientSentAt,
      audit_copy_sent_at: new Date().toISOString(),
      error_code: null,
    });
    return res.status(200).json({
      ok: true,
      organizationId,
      userId: localAdministrator.userId,
      membershipId,
      invitationSent: true,
      auditCopySent: true,
      message: "Pozvánka byla odeslána a správce byl přidán k obci.",
    });
  } catch (error) {
    if (emailSendingStarted) {
      console.error("invite-municipality-admin delivery error:", error);
      return res.status(error instanceof CustomerOnboardingError ? error.status : 500).json({
        error:
          error instanceof CustomerOnboardingError
            ? error.message
            : "Výsledek odeslání pozvánky není známý. Zkontrolujte audit.",
      });
    }

    let rollbackStatus = "rolled_back";
    if (localAdministrator?.userId) {
      if (membershipCreated) {
        const { error: membershipRollbackError } = await supabaseAdmin
          .from("organization_members")
          .delete()
          .eq("id", membershipId);
        if (membershipRollbackError) rollbackStatus = "cleanup_required";
      }
      if (profileCreated) {
        const { error: profileRollbackError } = await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("id", localAdministrator.userId);
        if (profileRollbackError) rollbackStatus = "cleanup_required";
      }
      if (localAdministrator.cleanupEligible) {
        const cleanupSucceeded = await cleanupNewAuthUser(
          supabaseAdmin,
          localAdministrator.userId,
          { idempotencyKey, organizationId }
        );
        if (!cleanupSucceeded) rollbackStatus = "cleanup_required";
        await updateAuthPreparationStatus(
          supabaseAdmin,
          localAdministrator.authPreparationId,
          rollbackStatus,
          { recovery_reason: "municipality_admin_invitation_failed" }
        );
      }
    }

    if (attempt?.id) {
      try {
        await updateAttempt(
          attempt.id,
          rollbackStatus,
          { error_code: error?.code || "invitation_failed" }
        );
      } catch (_) {
        console.error("invite-municipality-admin audit rollback failed");
      }
    }

    console.error("invite-municipality-admin error:", error);
    return res
      .status(error instanceof CustomerOnboardingError ? error.status : 500)
      .json({
        error:
          error instanceof CustomerOnboardingError
            ? error.message
            : "Správce obce se nepodařilo bezpečně přidat.",
      });
  }
}
