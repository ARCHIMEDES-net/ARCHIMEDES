import { describe, expect, it, vi } from "vitest";
import { finishRecoveredPasswordProfile } from "../../lib/finishRecoveredPasswordProfile";

function stubProfileUpdate({ data = { id: "user-1" }, error = null } = {}) {
  const maybeSingle = vi.fn(async () => ({ data, error }));
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));
  return { supabase: { from }, from, update, eq, select, maybeSingle };
}

describe("activation flag after password recovery", () => {
  it("succeeds only after the user's own profile is updated", async () => {
    const db = stubProfileUpdate();
    expect(await finishRecoveredPasswordProfile(db.supabase, "user-1"))
      .toEqual({ ok: true, code: null });
    expect(db.from).toHaveBeenCalledWith("profiles");
    expect(db.update).toHaveBeenCalledWith({ must_set_password: false });
    expect(db.eq).toHaveBeenCalledWith("id", "user-1");
    expect(db.select).toHaveBeenCalledWith("id");
  });

  it("does not report success if RLS silently updated no rows", async () => {
    const db = stubProfileUpdate({ data: null });
    expect(await finishRecoveredPasswordProfile(db.supabase, "user-1"))
      .toEqual({ ok: false, code: "profile_not_updated" });
  });

  it("does not report success on a rejected write", async () => {
    const db = stubProfileUpdate({ data: null, error: { code: "42501" } });
    expect(await finishRecoveredPasswordProfile(db.supabase, "user-1"))
      .toEqual({ ok: false, code: "42501" });
  });

  it("does not accept a result from a different account", async () => {
    const db = stubProfileUpdate({ data: { id: "other-user" } });
    expect(await finishRecoveredPasswordProfile(db.supabase, "user-1"))
      .toEqual({ ok: false, code: "profile_not_updated" });
  });

  it("does not write when the authenticated account id is missing", async () => {
    const db = stubProfileUpdate();
    expect(await finishRecoveredPasswordProfile(db.supabase, ""))
      .toEqual({ ok: false, code: "missing_user_id" });
    expect(db.from).not.toHaveBeenCalled();
  });
});
