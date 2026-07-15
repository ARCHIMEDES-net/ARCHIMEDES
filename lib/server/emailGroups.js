import { LEGACY_INTEREST_MAP } from "../interestMappings";

export { LEGACY_INTEREST_MAP } from "../interestMappings";

const LEGACY_ONLY_GROUPS = [
  {
    code: "zajmove-skupiny",
    label: "Zájmové skupiny (původní)",
    section: "legacy",
    sort_order: 999,
  },
];

function addRecipient(groupRecipients, code, profileId) {
  if (!code || !profileId) return;
  if (!groupRecipients.has(code)) groupRecipients.set(code, new Set());
  groupRecipients.get(code).add(profileId);
}

async function fetchProfiles(supabaseAdmin, ids) {
  if (ids.length === 0) return [];

  const result = [];
  const batchSize = 500;

  for (let index = 0; index < ids.length; index += batchSize) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, email_notifications_enabled")
      .in("id", ids.slice(index, index + batchSize))
      .or("email_notifications_enabled.is.null,email_notifications_enabled.eq.true");

    if (error) throw error;
    result.push(...(data || []));
  }

  return result.filter((profile) => String(profile.email || "").trim());
}

export async function getEmailGroups(supabaseAdmin) {
  const [categoriesResult, preferencesResult, legacyResult] = await Promise.all([
    supabaseAdmin
      .from("activity_categories")
      .select("code, label, section, sort_order")
      .eq("is_active", true)
      .order("section")
      .order("sort_order"),
    supabaseAdmin
      .from("notification_preferences")
      .select("profile_id, activity_code, enabled"),
    supabaseAdmin.from("user_interests").select("user_id, interest_slug"),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (preferencesResult.error) throw preferencesResult.error;
  if (legacyResult.error) throw legacyResult.error;

  const categories = [...(categoriesResult.data || []), ...LEGACY_ONLY_GROUPS];
  const categoryCodes = new Set(categories.map((category) => category.code));
  const groupRecipients = new Map();
  const explicitPreferences = new Map();

  for (const preference of preferencesResult.data || []) {
    explicitPreferences.set(
      `${preference.profile_id}:${preference.activity_code}`,
      preference.enabled === true
    );
    if (categoryCodes.has(preference.activity_code)) {
      if (preference.enabled === true) {
        addRecipient(groupRecipients, preference.activity_code, preference.profile_id);
      }
    }
  }

  for (const legacyInterest of legacyResult.data || []) {
    const canonicalCode =
      LEGACY_INTEREST_MAP[legacyInterest.interest_slug] || legacyInterest.interest_slug;

    // Jakmile uživatel udělá v novém profilu výslovnou volbu, má tato
    // volba (včetně enabled=false) přednost před historickým řádkem.
    if (explicitPreferences.has(`${legacyInterest.user_id}:${canonicalCode}`)) continue;

    if (categoryCodes.has(canonicalCode)) {
      addRecipient(groupRecipients, canonicalCode, legacyInterest.user_id);
    }
  }

  const allProfileIds = [
    ...new Set([...groupRecipients.values()].flatMap((ids) => [...ids])),
  ];
  const profiles = await fetchProfiles(supabaseAdmin, allProfileIds);
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return categories.map((category) => {
    const seenEmails = new Set();
    const users = [];

    for (const profileId of groupRecipients.get(category.code) || []) {
      const profile = profilesById.get(profileId);
      if (!profile) continue;

      const normalizedEmail = profile.email.trim().toLowerCase();
      if (seenEmails.has(normalizedEmail)) continue;

      seenEmails.add(normalizedEmail);
      users.push(profile);
    }

    users.sort((a, b) => a.email.localeCompare(b.email, "cs"));

    return {
      slug: category.code,
      label: category.label,
      section: category.section,
      sort_order: category.sort_order,
      count: users.length,
      users,
    };
  });
}
