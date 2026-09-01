import { normalizeManualRecipientEmails } from "../broadcastRecipients";
import { webMeetingParticipantNumber } from "./broadcastAccess";
import { getEmailGroups } from "./emailGroups";

function splitName(fullName, email) {
  const fallback = String(email || "")
    .split("@")[0]
    .replace(/[._-]+/gu, " ")
    .trim();
  const words = String(fullName || fallback || "Účastník")
    .trim()
    .split(/\s+/u)
    .filter(Boolean);
  const firstname = words.shift() || "Účastník";
  const surname = words.join(" ") || "ARCHIMEDES";
  return { firstname, surname };
}

function participantFromProfile(profile) {
  const email = String(profile?.email || "").trim().toLowerCase();
  const { firstname, surname } = splitName(profile?.full_name, email);
  let number = "";

  if (profile?.id) {
    number = webMeetingParticipantNumber(profile.id);
  }

  return {
    number,
    surname,
    firstname,
    email,
    profileId: profile?.id || null,
  };
}

export async function resolveWebMeetingParticipants(
  supabaseAdmin,
  { groupCodes = [], manualEmails = [] } = {}
) {
  const requestedGroups = [
    ...new Set(
      (Array.isArray(groupCodes) ? groupCodes : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    ),
  ];
  const manual = normalizeManualRecipientEmails(manualEmails);

  if (manual.invalid.length > 0) {
    throw new Error(`Neplatné e-mailové adresy: ${manual.invalid.join(", ")}`);
  }

  const groups = requestedGroups.length > 0 ? await getEmailGroups(supabaseAdmin) : [];
  const groupsBySlug = new Map(groups.map((group) => [group.slug, group]));
  const unknownGroups = requestedGroups.filter((slug) => !groupsBySlug.has(slug));

  if (unknownGroups.length > 0) {
    throw new Error("Uložený výběr obsahuje neplatnou skupinu příjemců.");
  }

  const recipientsByEmail = new Map();

  for (const slug of requestedGroups) {
    for (const profile of groupsBySlug.get(slug).users) {
      const participant = participantFromProfile(profile);
      if (!participant.email || recipientsByEmail.has(participant.email)) continue;
      recipientsByEmail.set(participant.email, participant);
    }
  }

  let manualProfiles = [];
  if (manual.emails.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .in("email", manual.emails);
    if (error) throw error;
    manualProfiles = data || [];
  }
  const profilesByEmail = new Map(
    manualProfiles.map((profile) => [String(profile.email || "").trim().toLowerCase(), profile])
  );

  for (const email of manual.emails) {
    if (recipientsByEmail.has(email)) continue;
    const profile = profilesByEmail.get(email) || { email };
    recipientsByEmail.set(email, participantFromProfile(profile));
  }

  return [...recipientsByEmail.values()].sort((a, b) =>
    a.email.localeCompare(b.email, "cs")
  );
}
