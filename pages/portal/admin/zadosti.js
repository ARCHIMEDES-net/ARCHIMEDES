import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

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

function statusBadgeStyle(status) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30,
    padding: "0 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  };

  if (status === "approved") {
    return {
      ...base,
      background: "#ecfdf3",
      color: "#166534",
      borderColor: "#b7ebc6",
    };
  }

  if (status === "rejected") {
    return {
      ...base,
      background: "#fff1f1",
      color: "#a40000",
      borderColor: "#f2c9c9",
    };
  }

  if (status === "contacted") {
    return {
      ...base,
      background: "#eff6ff",
      color: "#1d4ed8",
      borderColor: "#bfdbfe",
    };
  }

  return {
    ...base,
    background: "#f8fafc",
    color: "#334155",
    borderColor: "#e2e8f0",
  };
}

function cardRowStyle() {
  return {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(17,24,39,0.08)",
    boxShadow: "0 8px 24px rgba(17,24,39,0.05)",
    padding: 18,
  };
}

export default function AdminZadostiPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: loadError } = await supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (loadError) {
        throw new Error(loadError.message || "Žádosti se nepodařilo načíst.");
      }

      setRows(data || []);
    } catch (e) {
      setError(e.message || "Žádosti se nepodařilo načíst.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, nextStatus) {
    setSavingId(id);
    setError("");
    setMessage("");

    try {
      const { error: updateError } = await supabase
        .from("access_requests")
        .update({ status: nextStatus })
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message || "Stav se nepodařilo uložit.");
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: nextStatus } : row
        )
      );

      setMessage("Stav žádosti byl uložen.");
    } catch (e) {
      setError(e.message || "Stav se nepodařilo uložit.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <RequireAuth>
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <PortalHeader title="Admin • žádosti o přístup" />

        <main
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "32px 16px 70px",
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: 38,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Žádosti o přístup
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: "rgba(17,24,39,0.70)",
                maxWidth: 840,
              }}
            >
              Přehled nových zájemců o přístup do ARCHIMEDES Live. Tady můžeš
              sledovat nové žádosti a měnit jejich stav podle dalšího postupu.
            </p>
          </div>

          {error ? (
            <div
              style={{
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

          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              border: "1px solid rgba(17,24,39,0.08)",
              boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid rgba(17,24,39,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 800, color: "#111827" }}>
                Celkem žádostí: {rows.length}
              </div>

              <button
                type="button"
                onClick={loadRows}
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 42,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(17,24,39,0.12)",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Načítám..." : "Obnovit"}
              </button>
            </div>

            {/* Desktop tabulka */}
            <div className="desktopTableWrap">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      textAlign: "left",
                    }}
                  >
                    {[
                      "Datum",
                      "Jméno",
                      "Organizace",
                      "Typ",
                      "E-mail",
                      "Telefon",
                      "Adresa",
                      "Stav",
                      "Poznámka",
                    ].map((label) => (
                      <th
                        key={label}
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "rgba(17,24,39,0.68)",
                          fontWeight: 800,
                          borderBottom: "1px solid rgba(17,24,39,0.08)",
                          verticalAlign: "top",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {!loading && rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          padding: 22,
                          color: "rgba(17,24,39,0.62)",
                        }}
                      >
                        Zatím tu nejsou žádné žádosti.
                      </td>
                    </tr>
                  ) : null}

                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{formatDate(row.created_at)}</td>
                      <td style={tdStyleStrong}>{row.contact_name || "—"}</td>
                      <td style={tdStyle}>{row.organization || "—"}</td>
                      <td style={tdStyle}>{row.license_type || "—"}</td>
                      <td style={tdStyle}>
                        {row.email ? (
                          <a
                            href={`mailto:${row.email}`}
                            style={{
                              color: "#0f172a",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            {row.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={tdStyle}>
                        {row.phone ? (
                          <a
                            href={`tel:${row.phone}`}
                            style={{
                              color: "#0f172a",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            {row.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={tdStyle}>{row.address || "—"}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "grid", gap: 8 }}>
                          <span style={statusBadgeStyle(row.status)}>
                            {STATUS_OPTIONS.find((s) => s.value === row.status)?.label ||
                              row.status ||
                              "Nová"}
                          </span>

                          <select
                            value={row.status || "new"}
                            disabled={savingId === row.id}
                            onChange={(e) => updateStatus(row.id, e.target.value)}
                            style={selectStyle}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td style={tdStyleNote}>
                        {row.message ? (
                          <div style={{ whiteSpace: "pre-wrap" }}>{row.message}</div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobilní karty */}
            <div className="mobileCards">
              {!loading && rows.length === 0 ? (
                <div
                  style={{
                    padding: 18,
                    color: "rgba(17,24,39,0.62)",
                  }}
                >
                  Zatím tu nejsou žádné žádosti.
                </div>
              ) : null}

              {rows.map((row) => (
                <div key={row.id} style={cardRowStyle()}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {row.contact_name || "Bez jména"}
                      </div>
                      <div
                        style={{
                          color: "rgba(17,24,39,0.60)",
                          fontSize: 14,
                        }}
                      >
                        {formatDate(row.created_at)}
                      </div>
                    </div>

                    <span style={statusBadgeStyle(row.status)}>
                      {STATUS_OPTIONS.find((s) => s.value === row.status)?.label ||
                        row.status ||
                        "Nová"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <InfoRow label="Organizace" value={row.organization || "—"} />
                    <InfoRow label="Typ" value={row.license_type || "—"} />
                    <InfoRow label="E-mail" value={row.email || "—"} isEmail={!!row.email} />
                    <InfoRow label="Telefon" value={row.phone || "—"} isPhone={!!row.phone} />
                    <InfoRow label="Adresa" value={row.address || "—"} />
                    <InfoRow label="Poznámka" value={row.message || "—"} multiline />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      Změnit stav
                    </label>

                    <select
                      value={row.status || "new"}
                      disabled={savingId === row.id}
                      onChange={(e) => updateStatus(row.id, e.target.value)}
                      style={selectStyle}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <style jsx>{`
          .desktopTableWrap {
            display: block;
            overflow-x: auto;
          }

          .mobileCards {
            display: none;
            padding: 16px;
            gap: 14px;
          }

          @media (max-width: 920px) {
            .desktopTableWrap {
              display: none;
            }

            .mobileCards {
              display: grid;
            }
          }
        `}</style>
      </div>
    </RequireAuth>
  );
}

function InfoRow({ label, value, multiline = false, isEmail = false, isPhone = false }) {
  const valueStyle = {
    color: "#111827",
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: multiline ? "pre-wrap" : "normal",
    wordBreak: "break-word",
  };

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "rgba(17,24,39,0.58)",
          marginBottom: 2,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>

      {isEmail ? (
        <a href={`mailto:${value}`} style={{ ...valueStyle, textDecoration: "none" }}>
          {value}
        </a>
      ) : isPhone ? (
        <a href={`tel:${value}`} style={{ ...valueStyle, textDecoration: "none" }}>
          {value}
        </a>
      ) : (
        <div style={valueStyle}>{value}</div>
      )}
    </div>
  );
}

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(17,24,39,0.08)",
  verticalAlign: "top",
  color: "#111827",
  fontSize: 14,
  lineHeight: 1.5,
};

const tdStyleStrong = {
  ...tdStyle,
  fontWeight: 700,
};

const tdStyleNote = {
  ...tdStyle,
  minWidth: 260,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const selectStyle = {
  width: "100%",
  minHeight: 40,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(17,24,39,0.14)",
  background: "#fff",
  fontSize: 14,
  color: "#111827",
  boxSizing: "border-box",
};
