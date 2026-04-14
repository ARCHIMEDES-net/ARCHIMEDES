import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  try {
    // 1. načti všechny interests
    const { data, error } = await supabaseAdmin
      .from("user_interests")
      .select("interest_slug");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 2. spočítej počty
    const counts = {};

    (data || []).forEach((row) => {
      if (!row.interest_slug) return;
      counts[row.interest_slug] = (counts[row.interest_slug] || 0) + 1;
    });

    // 3. převeď na pole
    const result = Object.entries(counts).map(([slug, count]) => ({
      slug,
      count,
    }));

    // 4. seřaď od největší
    result.sort((a, b) => b.count - a.count);

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
