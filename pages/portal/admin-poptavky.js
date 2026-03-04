// pages/portal/admin-poptavky.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function formatDateTimeCS(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function norm(v) {
  return (v ?? "").toString().trim();
}

export default function AdminPoptavky() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [typeFilter, setTypeFilter] = useState("all"); // all | obec | skola | senior

  useEffect(() => {
    (async () => {
      setCheckingAdmin(true);
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
        else setIsAdmin(false);
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    })();
  }, []);

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("leads")
      .select("id, created_at, type, organization, contact_name, email, phone, note")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!checkingAdmin && isAdmin) load();
  }, [checkingAdmin, isAdmin]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return rows;

    const key =
      typeFilter === "obec"
        ? "obec"
        : typeFilter === "skola"
        ? "škola"
        : "senior";

    return (rows || []).filter((r) => {
      const t = norm(r?.type).toLowerCase();
      if (typeFilter === "skola") {
        // bereme i varianty bez diakritiky
        return t.includes("skola") || t.includes("škola") || t.includes("zs") || t.includes("zš");
      }
      if (typeFilter === "senior") return t.includes("senior");
      return t.includes(key);
    });
  }, [rows, typeFilter]);

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Admin – poptávky</h1>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/portal" style={{ textDecoration: "none" }}>
              ← Zpět do portálu
            </Link>
            <button
              onClick={load}
              disabled={loading || checkingAdmin || !isAdmin}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: loading ? "#f5f5f5" : "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Obnovit
            </button>
          </div>
        </div>

        <p style={{ marginTop: 6, color: "#555" }}>
          Přehled poptávek z formuláře <code>/poptavka</code>. Řazeno podle nejnovějších.
        </p>

        {checkingAdmin ? (
          <div style={{ marginTop: 14 }}>Ověřuji oprávnění…</div>
        ) : !isAdmin ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              border: "1px solid #f2c3c3",
              background: "#fff5f5",
              color: "#7a1f1f",
            }}
          >
            Nemáš administrátorské oprávnění pro zobrazení poptávek.
          </div>
        ) : (
          <>
            {err ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #f2c3c3",
                  background: "#fff5f5",
                  color: "#7a1f1f",
                }}
              >
                Chyba: {err}
              </div>
            ) : null}

            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <label style={{ color: "#444" }}>
                Filtr typu:{" "}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    marginLeft: 8,
                  }}
                >
                  <option value="all">Vše</option>
                  <option value="obec">Obec</option>
                  <option value="skola">Škola</option>
                  <option value="senior">Senior</option>
                </select>
              </label>

              <div style={{ marginLeft: "auto", color: "#555" }}>
                Záznamů: <strong>{filtered.length}</strong>
              </div>
            </div>

            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  border: "1px solid #e6e6e6",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={thStyle}>Datum</th>
                    <th style={thStyle}>Typ</th>
                    <th style={thStyle}>Organizace</th>
                    <th style={thStyle}>Kontakt</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Telefon</th>
                    <th style={thStyle}>Poznámka</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td style={tdStyle} colSpan={7}>
                        Načítám…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td style={tdStyle} colSpan={7}>
                        Zatím žádné poptávky.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id}>
                        <td style={tdStyle}>{formatDateTimeCS(r.created_at)}</td>
                        <td style={tdStyle}>{norm(r.type) || "—"}</td>
                        <td style={tdStyle}>{norm(r.organization) || "—"}</td>
                        <td style={tdStyle}>{norm(r.contact_name) || "—"}</td>
                        <td style={tdStyle}>
                          {norm(r.email) ? (
                            <a href={`mailto:${norm(r.email)}`} style={{ textDecoration: "none" }}>
                              {norm(r.email)}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={tdStyle}>
                          {norm(r.phone) ? (
                            <a href={`tel:${norm(r.phone)}`} style={{ textDecoration: "none" }}>
                              {norm(r.phone)}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ whiteSpace: "pre-wrap" }}>{norm(r.note) || "—"}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 12px",
  borderBottom: "1px solid #e6e6e6",
  fontSize: 13,
  color: "#555",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 14,
  color: "#222",
  verticalAlign: "top",
};
