import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  try {
    const { group, debug } = req.query;

    if (!group) {
      return res.status(400).json({ error: "Missing group parameter" });
    }

    // 1) najdi user_ids podle interestu
    const { data: interests, error: interestsError } = await supabaseAdmin
      .from("user_interests")
      .select("user_id, interest_slug")
      .eq("interest_slug", group);

    if (interestsError) {
      return res.status(500).json({
        step: "user_interests",
        error: interestsError.message,
      });
    }

    const userIds = [...new Set((interests || []).map((i) => i.user_id).filter(Boolean))];

    if (userIds.length === 0) {
      return res.status(200).json({
        group,
        count: 0,
        users: [],
        ...(debug === "1"
          ? { debug: { interestsFound: 0, userIdsFound: 0, profilesFound: 0 } }
          : {}),
      });
    }

    // 2) načti profily
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, email_notifications_enabled")
      .in("id", userIds)
      .or("email_notifications_enabled.is.null,email_notifications_enabled.eq.true");

    if (profilesError) {
      return res.status(500).json({
        step: "profiles",
        error: profilesError.message,
      });
    }

    const users = (profiles || []).filter((p) => !!p.email);

    return res.status(200).json({
      group,
      count: users.length,
      users,
      ...(debug === "1"
        ? {
            debug: {
              interestsFound: interests?.length || 0,
              userIdsFound: userIds.length,
              profilesFound: profiles?.length || 0,
            },
          }
        : {}),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
