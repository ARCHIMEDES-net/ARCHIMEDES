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

function mapLicenseTypeToOrgType(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["skola", "škola", "school"].includes(v)) return "school";
  if (["obec", "mesto", "město", "municipality", "city"].includes(v)) return "municipality";
  if (["senior", "senior-klub", "senior klub", "senior_club"].includes(v)) return "senior_club";
  if (["komunita", "community", "spolek", "association"].includes(v)) return "community_center";

  return "community_center";
}

function makeJoinCode() {
  return "ORG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AdminZadostiPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [creatingOrgId, setCreatingOrgId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: loadError } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message || "Žádosti se nepodařilo načíst.");
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

    const { error: updateError } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message || "Stav se nepodařilo uložit.");
      setSavingId("");
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    setMessage("Stav žádosti byl uložen.");
    setSavingId("");
  }

  async function createOrganizationFromRequest(row) {
    setCreatingOrgId(row.id);
    setError("");
    setMessage("");

    try {
      if (row.organization_id) {
        setMessage("Organizace už byla z této žádosti vytvořena.");
        setCreatingOrgId("");
        return;
      }

      const orgName = String(row.organization || "").trim();
      if (!orgName) {
        throw new Error("Žádost nemá vyplněný název organizace.");
      }

      let joinCode = makeJoinCode();

      // pokusíme se předejít kolizi join_code
      for (let i = 0; i < 5; i += 1) {
        const { data: existingCode } = await supabase
          .from("organizations")
          .select("id")
          .eq("join_code", joinCode)
          .maybeSingle();

        if (!existingCode) break;
        joinCode = makeJoinCode();
      }

      const orgType = mapLicenseTypeToOrgType(row.license_type);

      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgName,
            org_type: orgType,
            status: "active",
            join_code: joinCode,
          },
        ])
        .select()
        .single();

      if (orgError) {
        throw new Error(orgError.message || "Nepodařilo se vytvořit organizaci.");
      }

      const { error: requestUpdateError } = await supabase
        .from("access_requests")
        .update({
          organization_id: newOrg.id,
        })
        .eq("id", row.id);

      if (requestUpdateError) {
        throw new Error(
          requestUpdateError.message ||
            "Organizace byla vytvořena, ale nepodařilo se propojit žádost."
        );
      }

      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, organization_id: newOrg.id } : item
        )
      );

      setMessage(`Organizace „${newOrg.name}“ byla vytvořena.`);
    } catch (e) {
      setError(e.message || "Při vytváření organizace došlo k chybě.");
    } finally {
      setCreatingOrgId("");
    }
  }

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyle = {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    fontSize: 14,
    verticalAlign: "top",
  };

  const actionButtonStyle = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader title="Admin • žádosti" />

        <main style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px" }}>
          <h1 style={{ fontSize: 32, marginBottom: 10 }}>Žádosti o přístup</h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              color: "rgba(0,0,0,0.68)",
              lineHeight: 1.6,
              maxWidth: 860,
            }}
          >
            Tady vidíš nové žádosti o přístup do ARCHIMEDES Live. Můžeš měnit stav
            žádosti a z vybraných žádostí vytvořit organizaci, aniž by se žadatel
            automaticky stal administrátorem.
          </p>

          {error ? (
            <div
              style={{
                padding: 12,
                background: "#fff1f1",
                border: "1px solid #f2c9c9",
                borderRadius: 10,
                marginBottom: 16,
                color: "#a40000",
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                padding: 12,
                background: "#eefaf0",
                border: "1px solid #cfe8d3",
                borderRadius: 10,
                marginBottom: 16,
                color: "#166534",
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
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 700, color: "#111827" }}>
                Celkem žádostí: {rows.length}
              </div>

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
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Datum</th>
                    <th style={thStyle}>Jméno</th>
                    <th style={thStyle}>Organizace</th>
                    <th style={thStyle}>Typ</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Telefon</th>
                    <th style={thStyle}>Adresa</th>
                    <th style={thStyle}>Stav</th>
                    <th style={thStyle}>Organizace v systému</th>
                    <th style={thStyle}>Akce</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td style={tdStyle} colSpan={10}>
                        Načítám…
                      </td>
                    </tr>
                  ) : null}

                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td style={tdStyle} colSpan={10}>
                        Zatím žádné žádosti.
                      </td>
                    </tr>
                  ) : null}

                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{formatDate(row.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700 }}>{row.contact_name || "—"}</div>
                        {row.message ? (
                          <div
                            style={{
                              marginTop: 6,
                              color: "rgba(0,0,0,0.62)",
                              whiteSpace: "pre-wrap",
                              maxWidth: 280,
                            }}
                          >
                            {row.message}
                          </div>
                        ) : null}
                      </td>

                      <td style={tdStyle}>{row.organization || "—"}</td>

                      <td style={tdStyle}>{row.license_type || "—"}</td>

                      <td style={tdStyle}>
                        {row.email ? (
                          <a href={`mailto:${row.email}`} style={{ color: "#111827" }}>
                            {row.email}
                          </a>
                        ) : (
                          "—"
                        )}
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

                      <td style={tdStyle}>{row.address || "—"}</td>

                      <td style={tdStyle}>
                        <select
                          value={row.status || "new"}
                          disabled={savingId === row.id}
                          onChange={(e) => updateStatus(row.id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(0,0,0,0.2)",
                            minWidth: 150,
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
                        {row.organization_id ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minHeight: 30,
                              padding: "0 10px",
                              borderRadius: 999,
                              background: "#eefaf0",
                              color: "#166534",
                              border: "1px solid #cfe8d3",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Vytvořena
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              minHeight: 30,
                              padding: "0 10px",
                              borderRadius: 999,
                              background: "#f8fafc",
                              color: "#475569",
                              border: "1px solid #e2e8f0",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Zatím ne
                          </span>
                        )}
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => createOrganizationFromRequest(row)}
                            disabled={!!row.organization_id || creatingOrgId === row.id}
                            style={{
                              ...actionButtonStyle,
                              opacity:
                                row.organization_id || creatingOrgId === row.id ? 0.65 : 1,
                              cursor:
                                row.organization_id || creatingOrgId === row.id
                                  ? "default"
                                  : "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {creatingOrgId === row.id
                              ? "Vytvářím..."
                              : row.organization_id
                              ? "Organizace existuje"
                              : "Vytvořit organizaci"}
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
