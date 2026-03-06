import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const AUDIENCES = [
  "1. stupeň",
  "2. stupeň",
  "deváťáci",
  "učitelé",
  "rodiče",
  "senioři",
  "komunita",
];

const CATEGORIES = [
  "Science ON",
  "Smart City Club",
  "Kariérní poradenství",
  "Generace Z",
  "Wellbeing",
  "Čtenářský klub",
  "Senior klub",
  "Komunita",
  "Mezinárodní propojení",
];

export default function MujProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [schoolId, setSchoolId] = useState(null);

  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, school_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setFullName(profile.full_name || "");
        setRole(profile.role || "");
        setSchoolId(profile.school_id || null);
      }

      const { data: audRows, error: audError } = await supabase
        .from("user_audience_preferences")
        .select("audience_slug")
        .eq("user_id", user.id);

      if (audError) throw audError;

      const { data: catRows, error: catError } = await supabase
        .from("user_category_preferences")
        .select("category_slug")
        .eq("user_id", user.id);

      if (catError) throw catError;

      setSelectedAudiences((audRows || []).map((x) => x.audience_slug));
      setSelectedCategories((catRows || []).map((x) => x.category_slug));
    } catch (e) {
      setError(e.message || "Nepodařilo se načíst profil.");
    } finally {
      setLoading(false);
    }
  }

  function toggleValue(value, selected, setSelected) {
    if (selected.includes(value)) {
      setSelected(selected.filter((x) => x !== value));
    } else {
      setSelected([...selected, value]);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!userId) throw new Error("Chybí userId.");
      if (!fullName.trim()) throw new Error("Vyplňte jméno.");
      if (!schoolId) throw new Error("Uživatel není přiřazen ke škole.");

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: fullName.trim(),
          role: role || "teacher",
          school_id: schoolId,
          is_active: true,
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      const { error: deleteAudError } = await supabase
        .from("user_audience_preferences")
        .delete()
        .eq("user_id", userId);

      if (deleteAudError) throw deleteAudError;

      if (selectedAudiences.length > 0) {
        const audPayload = selectedAudiences.map((audience) => ({
          user_id: userId,
          audience_slug: audience,
        }));

        const { error: insertAudError } = await supabase
          .from("user_audience_preferences")
          .insert(audPayload);

        if (insertAudError) throw insertAudError;
      }

      const { error: deleteCatError } = await supabase
        .from("user_category_preferences")
        .delete()
        .eq("user_id", userId);

      if (deleteCatError) throw deleteCatError;

      if (selectedCategories.length > 0) {
        const catPayload = selectedCategories.map((category) => ({
          user_id: userId,
          category_slug: category,
        }));

        const { error: insertCatError } = await supabase
          .from("user_category_preferences")
          .insert(catPayload);

        if (insertCatError) throw insertCatError;
      }

      setMessage("Profil byl uložen.");
    } catch (e) {
      setError(e.message || "Uložení se nepodařilo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
          <PortalHeader />
          <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
            Načítám profil…
          </main>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader />

        <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32 }}>
              Můj profil
            </h1>

            <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)" }}>
              Nastavte si své údaje, cílovky a rubriky, které vás zajímají.
            </p>

            {error ? (
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: "#fff1f1",
                  color: "#a40000",
                  border: "1px solid #f2c9c9",
                }}
              >
                Chyba: {error}
              </div>
            ) : null}

            {message ? (
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: "#eefaf0",
                  color: "#166534",
                  border: "1px solid #cfe8d3",
                }}
              >
                {message}
              </div>
            ) : null}

            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      background: "#f3f4f6",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Jméno a příjmení
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Např. Jana Nováková"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      background: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={role === "school_admin" ? "Administrátor školy" : "Uživatel školy"}
                    disabled
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      background: "#f3f4f6",
                    }}
                  />
                </div>

                <div>
                  <div style={{ marginBottom: 10, fontWeight: 600 }}>Zajímají mě cílovky</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {AUDIENCES.map((item) => {
                      const active = selectedAudiences.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleValue(item, selectedAudiences, setSelectedAudiences)
                          }
                          style={{
                            padding: "10px 14px",
                            borderRadius: 999,
                            border: active
                              ? "1px solid #111827"
                              : "1px solid rgba(0,0,0,0.15)",
                            background: active ? "#111827" : "#fff",
                            color: active ? "#fff" : "#111827",
                            cursor: "pointer",
                          }}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: 10, fontWeight: 600 }}>Zajímají mě rubriky</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {CATEGORIES.map((item) => {
                      const active = selectedCategories.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleValue(item, selectedCategories, setSelectedCategories)
                          }
                          style={{
                            padding: "10px 14px",
                            borderRadius: 999,
                            border: active
                              ? "1px solid #111827"
                              : "1px solid rgba(0,0,0,0.15)",
                            background: active ? "#111827" : "#fff",
                            color: active ? "#fff" : "#111827",
                            cursor: "pointer",
                          }}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ paddingTop: 8 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "#111827",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Ukládám…" : "Uložit profil"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
