import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function UzivateleSkolyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [schoolId, setSchoolId] = useState(null);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("teacher");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
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

      setCurrentUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, school_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profil uživatele nebyl nalezen.");
      if (!profile.school_id) throw new Error("Uživatel není přiřazen ke škole.");

      const admin = profile.role === "school_admin";
      setIsSchoolAdmin(admin);
      setSchoolId(profile.school_id);

      if (!admin) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, is_active, created_at")
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      setRows(users || []);
    } catch (e) {
      setError(e.message || "Nepodařilo se načíst uživatele školy.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!isSchoolAdmin) throw new Error("Tuto akci může provádět jen administrátor školy.");
      if (!schoolId) throw new Error("Chybí school_id.");
      if (!newEmail.trim()) throw new Error("Vyplňte e-mail.");
      if (!newFullName.trim()) throw new Error("Vyplňte jméno a příjmení.");

      const response = await fetch("/api/invite-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          fullName: newFullName.trim(),
          role: newRole,
          schoolId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit uživatele.");
      }

      setNewEmail("");
      setNewFullName("");
      setNewRole("teacher");
      setMessage("Pozvánka byla odeslána a uživatel byl přidán.");

      await loadAll();
    } catch (e) {
      setError(e.message || "Nepodařilo se vytvořit uživatele.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row) {
    setError("");
    setMessage("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);

      if (updateError) throw updateError;

      setMessage(
        row.is_active
          ? "Uživatel byl deaktivován."
          : "Uživatel byl znovu aktivován."
      );

      await loadAll();
    } catch (e) {
      setError(e.message || "Nepodařilo se změnit stav uživatele.");
    }
  }

  function roleLabel(value) {
    if (value === "school_admin") return "Administrátor školy";
    return "Uživatel školy";
  }

  if (loading) {
    return (
      <RequireAuth>
        <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
          <PortalHeader />
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
            Načítám uživatele školy…
          </main>
        </div>
      </RequireAuth>
    );
  }

  if (!isSchoolAdmin) {
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
              <h1 style={{ marginTop: 0 }}>Uživatelé školy</h1>
              <p style={{ color: "rgba(0,0,0,0.7)", marginBottom: 0 }}>
                Tato sekce je dostupná pouze administrátorovi školy.
              </p>
            </div>
          </main>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader />

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.08)",
              marginBottom: 20,
            }}
          >
            <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32 }}>
              Uživatelé školy
            </h1>

            <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)" }}>
              Zde může administrátor školy vytvářet a spravovat přístupy pro učitele.
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

            <form onSubmit={handleCreateUser}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.2fr 0.9fr auto",
                  gap: 12,
                  alignItems: "end",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ucitel@skola.cz"
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
                    Jméno a příjmení
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
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
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.15)",
                      background: "#fff",
                    }}
                  >
                    <option value="teacher">Uživatel školy</option>
                    <option value="school_admin">Administrátor školy</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "#111827",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.7 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {saving ? "Odesílám…" : "Přidat uživatele"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.08)",
              overflowX: "auto",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Seznam uživatelů</h2>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 10px" }}>Jméno</th>
                  <th style={{ padding: "12px 10px" }}>E-mail</th>
                  <th style={{ padding: "12px 10px" }}>Role</th>
                  <th style={{ padding: "12px 10px" }}>Stav</th>
                  <th style={{ padding: "12px 10px" }}>Akce</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px" }}>
                      {row.full_name || "—"}
                      {row.id === currentUserId ? (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "#eef2ff",
                            color: "#3730a3",
                          }}
                        >
                          vy
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: "12px 10px" }}>{row.email || "—"}</td>
                    <td style={{ padding: "12px 10px" }}>{roleLabel(row.role)}</td>
                    <td style={{ padding: "12px 10px" }}>
                      {row.is_active ? "Aktivní" : "Neaktivní"}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <button
                        onClick={() => toggleActive(row)}
                        disabled={row.id === currentUserId}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          cursor: row.id === currentUserId ? "not-allowed" : "pointer",
                          opacity: row.id === currentUserId ? 0.5 : 1,
                        }}
                      >
                        {row.is_active ? "Deaktivovat" : "Aktivovat"}
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "16px 10px", color: "rgba(0,0,0,0.6)" }}>
                      Zatím zde nejsou žádní další uživatelé.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
