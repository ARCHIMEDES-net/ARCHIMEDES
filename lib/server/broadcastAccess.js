import { getBearerToken } from "./platformAdminApi";

export class BroadcastAccessError extends Error {
  constructor(message, status = 403) {
    super(message);
    this.name = "BroadcastAccessError";
    this.status = status;
  }
}

function normalized(value) {
  return String(value || "").trim().toLowerCase();
}

function hasActiveLicense(organization, now = new Date()) {
  if (!organization || normalized(organization.status) !== "active") return false;
  if (normalized(organization.license_status) !== "active") return false;
  if (!organization.license_valid_until) return true;

  const validUntil = new Date(organization.license_valid_until);
  return !Number.isNaN(validUntil.getTime()) && validUntil >= now;
}

export async function requireBroadcastViewer(req, supabaseAdmin) {
  const token = getBearerToken(req);
  if (!token) throw new BroadcastAccessError("Pro vstup se nejprve přihlaste.", 401);

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    throw new BroadcastAccessError("Přihlášení vypršelo. Přihlaste se prosím znovu.", 401);
  }

  const [{ data: admin }, { data: profile, error: profileError }] = await Promise.all([
    supabaseAdmin
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, is_active, active_organization_id")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (profileError) throw profileError;
  if (profile?.is_active === false) {
    throw new BroadcastAccessError("Váš účet není aktivní.");
  }

  const identity = {
    user,
    profile,
    email: String(profile?.email || user.email || "").trim().toLowerCase(),
    fullName: String(profile?.full_name || user.user_metadata?.full_name || "").trim(),
    organizationId: profile?.active_organization_id || null,
    isPlatformAdmin: Boolean(admin?.user_id),
  };

  if (identity.isPlatformAdmin) return identity;
  if (!identity.organizationId) {
    throw new BroadcastAccessError("Pro vstup zvolte aktivní organizaci v profilu.");
  }

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", identity.organizationId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership?.organization_id) {
    throw new BroadcastAccessError("Nemáte aktivní členství ve zvolené organizaci.");
  }

  const { data: organization, error: organizationError } = await supabaseAdmin
    .from("organizations")
    .select("id, org_type, status, license_status, license_valid_until, parent_organization_id")
    .eq("id", identity.organizationId)
    .maybeSingle();

  if (organizationError) throw organizationError;
  if (!organization || normalized(organization.status) !== "active") {
    throw new BroadcastAccessError("Zvolená organizace není aktivní.");
  }

  if (hasActiveLicense(organization)) return identity;

  if (organization.parent_organization_id) {
    const { data: parent, error: parentError } = await supabaseAdmin
      .from("organizations")
      .select("id, org_type, status, license_status, license_valid_until")
      .eq("id", organization.parent_organization_id)
      .maybeSingle();

    if (parentError) throw parentError;
    if (
      parent &&
      ["municipality", "obec"].includes(normalized(parent.org_type)) &&
      hasActiveLicense(parent)
    ) {
      return identity;
    }
  }

  throw new BroadcastAccessError("Zvolená organizace nemá aktivní program ARCHIMEDES Live.");
}

export function assertJoinWindow(startsAt, isPlatformAdmin = false, now = new Date()) {
  if (isPlatformAdmin) return;
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    throw new BroadcastAccessError("Vysílání nemá platný čas začátku.", 409);
  }

  const openFrom = new Date(start.getTime() - 15 * 60 * 1000);
  const openUntil = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  if (now < openFrom) {
    throw new BroadcastAccessError("Vstup se otevře 15 minut před začátkem vysílání.", 409);
  }
  if (now > openUntil) {
    throw new BroadcastAccessError("Živé vysílání už skončilo.", 410);
  }
}

export function webMeetingParticipant(identity) {
  const fallback = identity.email.split("@")[0] || "Účastník";
  const words = (identity.fullName || fallback).split(/\s+/).filter(Boolean);
  const firstname = words.shift() || "Účastník";
  const surname = words.join(" ") || "ARCHIMEDES";

  if (!identity.email) {
    throw new BroadcastAccessError("V profilu chybí platný e-mail pro vstup do vysílání.", 409);
  }

  return {
    number: identity.user.id,
    firstname,
    surname,
    email: identity.email,
  };
}
