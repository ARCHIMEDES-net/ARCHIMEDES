// pages/portal/uzivatele.js
import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function UzivateleSkolyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationJoinCode, setOrganizationJoinCode] = useState("");

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("member");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    setMessage("");
    setCopyMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      setCurrentUserId(user.id);

      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id, role_in_org, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!membership) throw new Error("Uživatel není přiřazen k žádné organizaci.");

      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, name, join_code")
        .eq("id", membership.organization_id)
        .maybeSingle();

      if (organizationError) throw organizationError;
      if (!organization) throw new Error("Organizace uživatele nebyla nalezena.");

      setOrganizationId(organization.id);
      setOrganizationName(organization.name || "");
      setOrganizationJoinCode(organization.join_code || "");

      const admin = membership.role_in_org === "organization_admin";
      setIsOrgAdmin(admin);

      if (!admin) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select("user_id, role_in_org, status, created_at")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;

      const userIds = (members || []).map((m) => m.user_id);

      let profilesById = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, is_active")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        profilesById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
      }

      const mergedRows = (members || []).map((m) => ({
        id: m.user_id,
        full_name: profilesById[m.user_id]?.full_name || "",
        email: profilesById[m.user_id]?.email || "",
        is_active: m.status === "active",
        role_in_org: m.role_in_org,
        created_at: m.created_at,
      }));

      setRows(mergedRows);
    } catch (e) {
      setError(e.message || "Nepodařilo se načíst uživatele organizace.");
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
      if (!isOrgAdmin) {
        throw new Error("Tuto akci může provádět jen administrátor organizace.");
      }

      if (!currentUserId) {
        throw new Error("Chybí identita přihlášeného uživatele.");
      }

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
          inviterUserId: currentUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit uživatele.");
      }

      setNewEmail("");
      setNewFullName("");
      setNewRole("member");
      setMessage("Pozvánka byla odeslána a uživatel byl přidán do organizace.");

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
      const nextStatus = row.is_active ? "inactive" : "active";

      const { error: updateMembershipError } = await supabase
        .from("organization_members")
        .update({ status: nextStatus })
        .eq("organization_id", organizationId)
        .eq("user_id", row.id);

      if (updateMembershipError) throw updateMembershipError;

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);

      if (updateProfileError) throw updateProfileError;

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

  async function handleCopyCode() {
    try {
      if (!organizationJoinCode) return;
      await navigator.clipboard.writeText(organizationJoinCode);
      setCopyMessage("Kód organizace byl zkopírován.");
      setTimeout(() => setCopyMessage(""), 1800);
    } catch (_e) {
      setCopyMessage("Kód zkopírujte ručně.");
      setTimeout(() => setCopyMessage(""), 1800);
    }
  }

  function roleLabel(value) {
    if (value === "organization_admin") return "Administrátor organizace";
    return "Člen organizace";
  }

  if (loading) {
    return (
      <RequireAuth>
        <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
          <PortalHeader />
          <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
            Načítám uživatele organizace…
          </main>
        </div>
      </RequireAuth>
    );
  }

  if (!isOrgAdmin) {
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
              <h1 style={{ marginTop: 0 }}>Uživatelé organizace</h1>
              <p style={{ color: "rgba(0,0,0,0.7)", marginBottom: 8 }}>
                Tato sekce je dostupná pouze administrátorovi organizace.
              </p>
              {organizationName ? (
                <p style={{ color: "rgba(0,0,0,0.55)", marginBottom: 0 }}>
                  Vaše organizace: <strong>{organizationName}</strong>
                </p>
              ) : null}
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
              Uživatelé organizace
            </h1>

            <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)" }}>
              Zde může administrátor organizace vytvářet a spravovat přístupy pro další uživatele.
            </p>

            {organizationName ? (
              <p style={{ marginTop: 0, marginBottom: 8, color: "rgba(0,0,0,0.55)" }}>
                Organizace: <strong>{organizationName}</strong>
              </p>
            ) : null}

            {organizationJoinCode ? (
              <div
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  padding: 14,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontSize: 14, color: "rgba(0,0,0,0.6)", marginBottom: 6 }}>
                  Kód organizace
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    marginBottom: 8,
                  }}
                >
                  {organizationJoinCode}
                </div>

                <div style={{ fontSize: 14, color: "rgba(0,0,0,0.62)", marginBottom: 12 }}>
                  Kolegové se mohou připojit sami přes stránku <strong>/join</strong> pomocí tohoto
                  kódu, nebo jim můžete poslat pozvánku e-mailem níže.
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: "#fff",
                      color: "#111827",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Zkopírovat kód
                  </button>
                </div>

                {copyMessage ? (
                  <div style={{ marginTop: 10, fontSize: 14, color: "#166534" }}>
                    {copyMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "rgba(0,0,0,0.68)",
                fontSize: 14,
              }}
            >
              Doporučený postup: nejprve pošlete kolegům <strong>kód organizace</strong> a až když
              budete potřebovat, využijte pozvánku e-mailem pro konkrétního uživatele.
            </div>

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
                  gridTemplateColumns: "1.2fr 1.2fr 1fr auto",
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
                    placeholder="uzivatel@organizace.cz"
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
                    <option value="member">Člen organizace</option>
                    <option value="organization_admin">Administrátor organizace</option>
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
                    <td style={{ padding: "12px 10px" }}>{roleLabel(row.role_in_org)}</td>
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
