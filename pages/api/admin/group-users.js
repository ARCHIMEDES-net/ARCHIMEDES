import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    const { group } = req.query;

    if (!group) {
      return res.status(400).json({ error: "Missing group parameter" });
    }

    // 1. Najdi user_ids podle interestu
    const { data: interests, error: interestsError } = await supabase
      .from("user_interests")
      .select("user_id")
      .eq("interest_slug", group);

    if (interestsError) {
      return res.status(500).json({ error: interestsError.message });
    }

    const userIds = interests.map((i) => i.user_id);

    if (userIds.length === 0) {
      return res.status(200).json({
        group,
        count: 0,
        users: [],
      });
    }

    // 2. Načti profily (včetně těch, co mají NULL flag)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, email_notifications_enabled")
      .in("id", userIds)
      .or("email_notifications_enabled.is.null,email_notifications_enabled.eq.true");

    if (profilesError) {
      return res.status(500).json({ error: profilesError.message });
    }

    return res.status(200).json({
      group,
      count: profiles.length,
      users: profiles,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
