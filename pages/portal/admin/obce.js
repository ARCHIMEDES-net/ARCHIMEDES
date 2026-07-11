import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("cs-CZ");
}

export default function AdminObcePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState("");
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
      .from("organizations")
      .select(
        "id, name, registration_number, license_status, status, contact_name, contact_email, contact_phone, created_at"
      )
      .eq("org_type", "obec")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Obce se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function activateObec(row) {
    setActivatingId(row.id);
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("organizations")
      .update({ license_status: "active", status: "active" })
      .eq("id", row.id);

    if (error) {
      setError("Aktivaci se nepodařilo uložit.");
      setActivatingId("");
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, license_status: "active", status: "active" } : r
      )
    );
    setMessage(`Obec „${row.name}“ byla aktivována.`);
    setActivatingId("");
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
    <RequirePlatformAdmin>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader title="Admin • obce" />

        <main style={{ maxWidth: 1240, margin: "0 auto", padding: 40 }}>
          <h1 style={{ marginTop: 0, marginBottom: 10 }}>Obce</h1>

          <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)", maxWidth: 900 }}>
            Přehled obcí založených přes /zadost. Nová obec vzniká rovnou se
            stavem „Čeká na schválení“ — tlačítkem níže ji aktivuješ, aby
            mohla program používat a pod jejím registračním číslem se mohly
            registrovat spolky.
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
              <div style={{ fontWeight: 700 }}>Celkem obcí: {rows.length}</div>

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
                    <th style={thStyle}>Obec</th>
                    <th style={thStyle}>Reg. číslo</th>
                    <th style={thStyle}>Kontakt</th>
                    <th style={thStyle}>Stav</th>
                    <th style={thStyle}>Akce</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td style={tdStyle} colSpan={6}>
                        Načítám…
                      </td>
                    </tr>
                  ) : null}

                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td style={tdStyle} colSpan={6}>
                        Zatím žádné obce.
                      </td>
                    </tr>
                  ) : null}

                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{formatDate(row.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700 }}>{row.name}</div>
                      </td>

                      <td style={tdStyle}>{row.registration_number || "—"}</td>

                      <td style={tdStyle}>
                        {row.contact_name ? (
                          <div style={{ fontWeight: 600 }}>{row.contact_name}</div>
                        ) : null}
                        {row.contact_email ? (
                          <a
                            href={`mailto:${row.contact_email}`}
                            style={{ color: "#111827", display: "block", marginTop: 4 }}
                          >
                            {row.contact_email}
                          </a>
                        ) : null}
                        {row.contact_phone ? (
                          <a
                            href={`tel:${row.contact_phone}`}
                            style={{ color: "#111827", display: "block", marginTop: 4 }}
                          >
                            {row.contact_phone}
                          </a>
                        ) : null}
                        {!row.contact_name && !row.contact_email && !row.contact_phone
                          ? "—"
                          : null}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: 28,
                            padding: "0 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background:
                              row.license_status === "active" ? "#eefaf0" : "#f8fafc",
                            color: row.license_status === "active" ? "#166534" : "#475569",
                            border:
                              row.license_status === "active"
                                ? "1px solid #cfe8d3"
                                : "1px solid #e2e8f0",
                          }}
                        >
                          {row.license_status === "active"
                            ? "Aktivní"
                            : "Čeká na schválení"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          style={{
                            ...actionButtonStyle,
                            opacity:
                              row.license_status === "active" || activatingId === row.id
                                ? 0.7
                                : 1,
                            cursor:
                              row.license_status === "active" || activatingId === row.id
                                ? "default"
                                : "pointer",
                          }}
                          onClick={() => activateObec(row)}
                          disabled={row.license_status === "active" || activatingId === row.id}
                        >
                          {activatingId === row.id
                            ? "Aktivuji..."
                            : row.license_status === "active"
                              ? "Aktivní"
                              : "Aktivovat"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
