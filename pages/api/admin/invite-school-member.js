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
import { registrationEmailWasDefinitelyNotSent } from "../../../lib/server/registrationEmailProvider";

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
    .from("school_member_invitation_attempts")
    .update({ status, updated_at: new Date().toISOString(), ...values })
    .eq("id", attemptId).select("id,status").single();
  if (error) throw error;
}

async function claimAttempt({
  idempotencyKey,
  organizationId,
  email,
  fullName,
  initiatedBy,
  role,
}) {
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("school_member_invitation_attempts")
    .insert({
      idempotency_key: idempotencyKey,
      organization_id: organizationId,
      initiated_by: initiatedBy,
      recipient_email: email,
      recipient_full_name: fullName,
      role_in_org: role,
      status: "preparing",
    })
    .select("*")
    .maybeSingle();

  if (!insertError && inserted) return { attempt: inserted, replayed: false };
  if (insertError?.code !== "23505") throw insertError;

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("school_member_invitation_attempts")
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
    existing.recipient_full_name !== fullName || existing.role_in_org !== role
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
      .from("school_member_invitation_attempts")
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

  if (!["POST", "GET"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
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

    if (req.method === "GET") {
      const schoolId = String(req.query?.organizationId || "");
      if (!UUID_PATTERN.test(schoolId)) return res.status(400).json({ error: "Neplatné ID školy." });
      const { data: school, error: schoolError } = await supabaseAdmin.from("organizations")
        .select("id,name,org_type,parent_organization_id,registration_number,status,school_izo,legal_identifier,registered_address")
        .eq("id", schoolId).maybeSingle();
      if (schoolError) throw schoolError;
      if (!school || school.org_type !== "school" || !school.parent_organization_id) return res.status(404).json({ error: "Podřízená škola nebyla nalezena." });
      const [{ data: members, error: membersError }, { data: attempts, error: attemptsError }] = await Promise.all([
        supabaseAdmin.from("organization_members").select("user_id,role_in_org,status").eq("organization_id", schoolId),
        supabaseAdmin.from("school_member_invitation_attempts")
          .select("recipient_email,recipient_full_name,role_in_org,status,created_at,client_sent_at")
          .eq("organization_id", schoolId).order("created_at", { ascending: false }).limit(50),
      ]);
      if (membersError || attemptsError) throw membersError || attemptsError;
      let profiles = [];
      if (members?.length) {
        const result = await supabaseAdmin.from("profiles").select("id,email,full_name,is_active,must_set_password")
          .in("id", members.map((member) => member.user_id));
        if (result.error) throw result.error;
        profiles = result.data || [];
      }
      return res.status(200).json({ school, members: (members || []).map((member) => ({
        role: member.role_in_org, status: member.status,
        profile: profiles.find((profile) => profile.id === member.user_id) || null,
      })), attempts: attempts || [] });
    }
    organizationId = String(req.body?.organizationId || "").trim();
    idempotencyKey = String(req.body?.idempotencyKey || "").trim();
    const role = req.body?.role === "member" ? "member" : "organization_admin";
    if (!["member", "organization_admin"].includes(req.body?.role)) return res.status(400).json({ error: "Vyberte správce školy nebo učitele." });
    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
    const cleanFullName = String(req.body?.fullName || "").trim();

    if (!UUID_PATTERN.test(organizationId)) {
      return res.status(400).json({ error: "ID školy nemá platný formát." });
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
      route: "admin-invite-school-member",
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
        "id, name, org_type, status, parent_organization_id, registration_number, license_status, license_plan, license_valid_until"
      )
      .eq("id", organizationId)
      .maybeSingle();
    if (municipalityError) throw municipalityError;
    if (
      !municipality ||
      municipality.org_type !== "school" ||
      !municipality.parent_organization_id
    ) {
      return res.status(404).json({ error: "Podřízená škola nebyla nalezena." });
    }
    if (municipality.status !== "active") {
      return res.status(409).json({
        error: "Správce lze přidat pouze k aktivní škole.",
      });
    }
    const { data: parent, error: parentError } = await supabaseAdmin.from("organizations")
      .select("id,org_type,status,license_status,license_plan,license_valid_until")
      .eq("id", municipality.parent_organization_id).maybeSingle();
    if (parentError) throw parentError;
    if (!parent || !["municipality","obec"].includes(parent.org_type)) return res.status(409).json({ error: "Škola nemá platnou vazbu na obec." });
    const licence = municipality.license_plan ? municipality : parent;
    if (licence.status !== "active" || licence.license_status !== "active" ||
      (licence.license_valid_until && new Date(licence.license_valid_until) < new Date()) || !LICENSE_LABELS[licence.license_plan]) {
      return res.status(409).json({
        error: "Škola nemá podporovanou aktivní licenci.",
      });
    }

    validateCustomerOnboardingEmailConfiguration();
    const claim = await claimAttempt({
      idempotencyKey,
      organizationId,
      email: cleanEmail,
      fullName: cleanFullName,
      initiatedBy: platformAdmin.id,
      role,
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
        existingMembership.role_in_org === role &&
          existingMembership.status === "active"
          ? "Tento uživatel už je aktivním členem školy."
          : "Uživatel už má u školy jiné členství. Je nutná kontrola.",
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
        role_in_org: role,
        status: "active",
      })
      .select("id")
      .single();
    if (membershipError) throw membershipError;
    membershipCreated = true;
    membershipId = membership.id;

    const { data: readMembership, error: readMembershipError } = await supabaseAdmin.from("organization_members")
      .select("id,user_id,organization_id,role_in_org,status").eq("id", membershipId).single();
    const { data: readProfile, error: readProfileError } = await supabaseAdmin.from("profiles")
      .select("id,email,is_active").eq("id", localAdministrator.userId).single();
    if (readMembershipError || readProfileError || readMembership?.organization_id !== organizationId ||
      readMembership?.user_id !== localAdministrator.userId || readMembership?.role_in_org !== role ||
      readMembership?.status !== "active" || readProfile?.is_active !== true || readProfile?.email?.toLowerCase() !== cleanEmail) {
      throw new Error("Read-back verification failed");
    }
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
      prepared_user_id: localAdministrator.userId,
      prepared_membership_id: membershipId,
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
      licensePlanLabel: LICENSE_LABELS[licence.license_plan],
      licenseValidUntil: licence.license_valid_until,
      memberRole: role,
      siteUrl: getServerSiteUrl(),
      setupUrl: localAdministrator.setupUrl,
    };

    try {
      const clientReceipt = await sendCustomerOnboardingEmail({
        ...emailValues,
        idempotencyKey: `school-member-invitation:${attempt.id}:client`,
      });
      await updateAttempt(attempt.id, "sending", {
        email_provider: clientReceipt.provider,
        client_provider_message_id: clientReceipt.messageId,
      });
    } catch (emailError) {
      if (registrationEmailWasDefinitelyNotSent(emailError)) {
        emailSendingStarted = false;
        throw new CustomerOnboardingError(
          "Provider pozvánku prokazatelně odmítl před odesláním. Připravené změny budou vráceny zpět a po opravě lze pokus bezpečně zopakovat.",
          502,
          emailError.code
        );
      }
      await updateAttempt(attempt.id, "delivery_unknown", {
        error_code: "client_registration_email_delivery_unknown",
      });
      throw new CustomerOnboardingError(
        "Přístup byl připraven, ale výsledek doručení klientovi není známý. E-mail automaticky neopakujte; zkontrolujte audit.",
        502,
        "CLIENT_EMAIL_DELIVERY_UNKNOWN"
      );
    }

    const clientSentAt = new Date().toISOString();
    try {
      const auditCopyReceipt = await sendCustomerOnboardingAuditCopy(
        emailValues,
        `school-member-invitation:${attempt.id}:audit`
      );
      await updateAttempt(attempt.id, "sending", {
        audit_copy_provider_message_id: auditCopyReceipt.messageId,
      });
    } catch (copyError) {
      await updateAttempt(attempt.id, "sent_copy_failed", {
        client_sent_at: clientSentAt,
        error_code: "audit_copy_provider_failed",
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
      message: "Pozvánka byla odeslána a uživatel byl přidán ke škole.",
    });
  } catch (error) {
    if (emailSendingStarted) {
      console.error("invite-school-member delivery error:", error);
      return res.status(error instanceof CustomerOnboardingError ? error.status : 500).json({
        error:
          error instanceof CustomerOnboardingError
            ? error.message
            : "Výsledek odeslání pozvánky není známý. Zkontrolujte audit.",
      });
    }

    let rollbackStatus = "rolled_back";
    if (attempt?.id && (membershipCreated || profileCreated)) {
      try { await updateAttempt(attempt.id, "preparing", { user_id: null, membership_id: null }); }
      catch (_) { return res.status(500).json({ error: "Pokus vyžaduje ruční kontrolu auditu. Neopakujte pozvánku." }); }
    }
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
        console.error("invite-school-member audit rollback failed");
      }
    }

    console.error("invite-school-member error:", error);
    return res
      .status(error instanceof CustomerOnboardingError ? error.status : 500)
      .json({
        error:
          error instanceof CustomerOnboardingError
            ? error.message
            : "Uživatele školy se nepodařilo bezpečně přidat.",
      });
  }
}
