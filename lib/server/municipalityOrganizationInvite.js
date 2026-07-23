import crypto from "crypto";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class MunicipalityInviteError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "MunicipalityInviteError";
    this.status = status;
  }
}

export async function resolveMunicipalityInvite({
  supabaseAdmin,
  rawToken,
  organizationType,
  email,
}) {
  const cleanToken = String(rawToken || "").trim();
  if (!cleanToken) {
    throw new MunicipalityInviteError(
      "Registraci musí zahájit obec jednorázovou pozvánkou.",
      403
    );
  }

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("municipality_organization_invites")
    .select("id, municipality_id, organization_type, invited_email, status, expires_at")
    .eq("token_hash", hashToken(cleanToken))
    .maybeSingle();

  if (inviteError) throw inviteError;
  if (!invite) {
    throw new MunicipalityInviteError("Pozvánka není platná.", 404);
  }
  if (invite.organization_type !== organizationType) {
    throw new MunicipalityInviteError(
      organizationType === "school"
        ? "Tato pozvánka není určena pro školu."
        : "Tato pozvánka není určena pro spolek.",
      403
    );
  }
  if (invite.status !== "pending") {
    throw new MunicipalityInviteError("Pozvánka už byla použita nebo zrušena.", 409);
  }
  if (new Date(invite.expires_at) < new Date()) {
    await supabaseAdmin
      .from("municipality_organization_invites")
      .update({ status: "expired" })
      .eq("id", invite.id)
      .eq("status", "pending");
    throw new MunicipalityInviteError("Platnost pozvánky vypršela.", 410);
  }

  const invitedEmail = String(invite.invited_email || "").trim().toLowerCase();
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (invitedEmail && invitedEmail !== cleanEmail) {
    throw new MunicipalityInviteError(
      "Pozvánka je určena pro jinou e-mailovou adresu.",
      403
    );
  }

  const { data: municipality, error: municipalityError } = await supabaseAdmin
    .from("organizations")
    .select("id, name, status, license_status, license_valid_until")
    .eq("id", invite.municipality_id)
    .in("org_type", ["municipality", "obec"])
    .maybeSingle();

  if (municipalityError) throw municipalityError;

  const expired =
    municipality?.license_valid_until &&
    new Date(municipality.license_valid_until) < new Date();

  if (
    !municipality ||
    municipality.status !== "active" ||
    municipality.license_status !== "active" ||
    expired
  ) {
    throw new MunicipalityInviteError(
      "Program obce není aktivní. Obraťte se na obec.",
      403
    );
  }

  return { invite, municipality };
}

export async function consumeMunicipalityInvite({
  supabaseAdmin,
  inviteId,
  organizationId,
}) {
  const { data, error } = await supabaseAdmin
    .from("municipality_organization_invites")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      used_organization_id: organizationId,
    })
    .eq("id", inviteId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new MunicipalityInviteError(
      "Pozvánku mezitím použil někdo jiný. Organizace nebyla připojena.",
      409
    );
  }
}
