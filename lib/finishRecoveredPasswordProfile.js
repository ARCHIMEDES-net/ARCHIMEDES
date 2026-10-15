/**
 * Confirm that a successful Supabase Auth password update is reflected in the
 * application profile. PostgREST may return no error after updating zero rows.
 */
export async function finishRecoveredPasswordProfile(supabase, userId) {
  if (!userId) return { ok: false, code: "missing_user_id" };

  const { data, error } = await supabase
    .from("profiles")
    .update({ must_set_password: false })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error || data?.id !== userId) {
    return { ok: false, code: error?.code || "profile_not_updated" };
  }
  return { ok: true, code: null };
}
