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
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setSavingId(id);

    const { error } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    }

    setSavingId("");
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
  };

  const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    fontSize: 14,
    verticalAlign: "top",
  };

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader />

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
          <h1 style={{ fontSize: 32, marginBottom: 20 }}>
            Žádosti o přístup
          </h1>

          {error && (
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
          )}

          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
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
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td style={tdStyle} colSpan={8}>
                      Načítám…
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={8}>
                      Zatím žádné žádosti.
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={tdStyle}>{formatDate(row.created_at)}</td>

                    <td style={tdStyle}>{row.contact_name}</td>

                    <td style={tdStyle}>{row.organization}</td>

                    <td style={tdStyle}>{row.license_type}</td>

                    <td style={tdStyle}>
                      {row.email && (
                        <a href={`mailto:${row.email}`}>
                          {row.email}
                        </a>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {row.phone && (
                        <a href={`tel:${row.phone}`}>
                          {row.phone}
                        </a>
                      )}
                    </td>

                    <td style={tdStyle}>{row.address}</td>

                    <td style={tdStyle}>
                      <select
                        value={row.status || "new"}
                        disabled={savingId === row.id}
                        onChange={(e) =>
                          updateStatus(row.id, e.target.value)
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(0,0,0,0.2)",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
