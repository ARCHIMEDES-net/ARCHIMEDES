import { useEffect, useState } from "react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const STATUS_OPTIONS = [
  { value: "new", label: "Nová" },
  { value: "contacted", label: "Kontaktováno" },
  { value: "approved", label: "Schváleno" },
  { value: "rejected", label: "Zamítnuto" },
];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("cs-CZ");
}

export default function AdminZadostiPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrgId, setCreatingOrgId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [invitingId, setInvitingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Žádosti se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setSavingId(id);
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      setError("Stav se nepodařilo uložit.");
      setSavingId("");
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setMessage("Stav žádosti byl uložen.");
    setSavingId("");
  }

  async function createOrganizationFromRequest(row) {
    setCreatingOrgId(row.id);
    setError("");
    setMessage("");

    try {
      if (row.organization_id) {
        setMessage("Organizace už existuje.");
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;
      const user = session?.user;

      if (!user || !accessToken) {
        throw new Error("Nejste přihlášen.");
      }

      const response = await fetch("/api/admin/create-organization-from-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requestId: row.id,
          organizationName: row.organization,
          licenseType: row.license_type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit organizaci.");
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                organization_id: result.organization?.id || r.organization_id,
              }
            : r
        )
      );

      setMessage(
        `Organizace „${result.organization?.name || row.organization}“ byla vytvořena.`
      );
    } catch (e) {
      setError(e.message || "Nepodařilo se vytvořit organizaci.");
    } finally {
      setCreatingOrgId("");
    }
  }

  async function inviteOrganizationAdmin(row) {
    setInvitingId(row.id);
    setError("");
    setMessage("");

    try {
      if (!row.organization_id) {
        throw new Error("Nejdříve vytvoř organizaci.");
      }

      const email = window.prompt(
        "Zadej e-mail skutečného administrátora organizace:",
        row.admin_invited_email || row.email || ""
      );

      if (!email) return;

      const trimmedEmail = email.trim().toLowerCase();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

      if (!emailOk) {
        throw new Error("Zadej platný e-mail administrátora.");
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: "https://archimedeslive.com/login",
        },
      });

      if (otpError) {
        throw new Error(otpError.message || "Pozvánku se nepodařilo odeslat.");
      }

      const { error: updateError } = await supabase
        .from("access_requests")
        .update({
          admin_invited_email: trimmedEmail,
        })
        .eq("id", row.id);

      if (updateError) {
        throw new Error(
          updateError.message ||
            "Pozvánka odešla, ale nepodařilo se uložit e-mail administrátora."
        );
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, admin_invited_email: trimmedEmail } : r
        )
      );

      setMessage(`Pozvánka administrátorovi byla odeslána na ${trimmedEmail}.`);
    } catch (e) {
      setError(e.message || "Pozvánku se nepodařilo odeslat.");
    } finally {
      setInvitingId("");
    }
  }

  const actionButtonStyle = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };

  const thStyle = {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    fontSize: 14,
  };

  const tdStyle = {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    verticalAlign: "top",
    fontSize: 14,
  };

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader title="Admin • žádosti" />

        <main style={{ maxWidth: 1240, margin: "0 auto", padding: 40 }}>
          <h1 style={{ marginTop: 0, marginBottom: 10 }}>Žádosti o přístup</h1>

          <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)", maxWidth: 900 }}>
            Přehled zájemců o vstup do ARCHIMEDES Live. Z této stránky můžeš měnit
            stav žádosti, vytvořit organizaci a pozvat konkrétního administrátora.
          </p>

          {error ? (
            <div
              style={{
                color: "#a40000",
                background: "#fff1f1",
                border: "1px solid #f2c9c9",
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                color: "#166534",
                background: "#eefaf0",
                border: "1px solid #cfe8d3",
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}
            >
              {message}
            </div>
          ) : null}

          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 700 }}>Celkem žádostí: {rows.length}</div>

              <button
                type="button"
                onClick={loadRows}
                disabled={loading}
                style={{
                  ...actionButtonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading ? "Načítám..." : "Obnovit"}
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Datum</th>
                    <th style={thStyle}>Jméno</th>
                    <th style={thStyle}>Organizace</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Telefon</th>
                    <th style={thStyle}>Stav</th>
                    <th style={thStyle}>Akce</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td style={tdStyle} colSpan={7}>
                        Načítám…
                      </td>
                    </tr>
                  ) : null}

                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td style={tdStyle} colSpan={7}>
                        Zatím žádné žádosti.
                      </td>
                    </tr>
                  ) : null}

                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{formatDate(row.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700 }}>{row.contact_name || "—"}</div>
                        {row.address ? (
                          <div style={{ marginTop: 6, color: "rgba(0,0,0,0.62)" }}>
                            {row.address}
                          </div>
                        ) : null}
                        {row.message ? (
                          <div
                            style={{
                              marginTop: 6,
                              color: "rgba(0,0,0,0.62)",
                              whiteSpace: "pre-wrap",
                              maxWidth: 260,
                            }}
                          >
                            {row.message}
                          </div>
                        ) : null}
                      </td>

                      <td style={tdStyle}>
                        {row.organization || "—"}
                        <div style={{ marginTop: 8 }}>
                          {row.organization_id ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: 28,
                                padding: "0 10px",
                                borderRadius: 999,
                                background: "#eefaf0",
                                color: "#166534",
                                border: "1px solid #cfe8d3",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              Organizace vytvořena
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: 28,
                                padding: "0 10px",
                                borderRadius: 999,
                                background: "#f8fafc",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              Bez organizace
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {row.email ? (
                          <a href={`mailto:${row.email}`} style={{ color: "#111827" }}>
                            {row.email}
                          </a>
                        ) : (
                          "—"
                        )}

                        {row.admin_invited_email ? (
                          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
                            Pozvánka: {row.admin_invited_email}
                          </div>
                        ) : null}
                      </td>

                      <td style={tdStyle}>
                        {row.phone ? (
                          <a href={`tel:${row.phone}`} style={{ color: "#111827" }}>
                            {row.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={tdStyle}>
                        <select
                          value={row.status || "new"}
                          disabled={savingId === row.id}
                          onChange={(e) => updateStatus(row.id, e.target.value)}
                          style={{
                            minWidth: 150,
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.15)",
                            background: "#fff",
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <button
                            type="button"
                            style={{
                              ...actionButtonStyle,
                              opacity:
                                row.organization_id || creatingOrgId === row.id ? 0.7 : 1,
                              cursor:
                                row.organization_id || creatingOrgId === row.id
                                  ? "default"
                                  : "pointer",
                            }}
                            onClick={() => createOrganizationFromRequest(row)}
                            disabled={!!row.organization_id || creatingOrgId === row.id}
                          >
                            {creatingOrgId === row.id
                              ? "Vytvářím..."
                              : row.organization_id
                              ? "Organizace existuje"
                              : "Vytvořit organizaci"}
                          </button>

                          <button
                            type="button"
                            style={{
                              ...actionButtonStyle,
                              opacity: !row.organization_id || invitingId === row.id ? 0.7 : 1,
                              cursor:
                                !row.organization_id || invitingId === row.id
                                  ? "default"
                                  : "pointer",
                            }}
                            onClick={() => inviteOrganizationAdmin(row)}
                            disabled={!row.organization_id || invitingId === row.id}
                          >
                            {invitingId === row.id
                              ? "Odesílám..."
                              : row.admin_invited_email
                              ? "Pozvat znovu admina"
                              : "Pozvat administrátora"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
