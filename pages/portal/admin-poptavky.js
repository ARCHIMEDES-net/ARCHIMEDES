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

function statusLabel(s) {
  const v = (s || "").toLowerCase();
  if (v === "approved") return "Schváleno";
  if (v === "in_progress") return "Řeší se";
  if (v === "done") return "Vyřízeno";
  return "Nová";
}

function statusChipStyle(s) {
  const v = (s || "").toLowerCase();
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    whiteSpace: "nowrap",
  };

  if (v === "approved") return { ...base, background: "#ecfeff", border: "1px solid #a5f3fc" };
  if (v === "done") return { ...base, background: "#ecfdf5", border: "1px solid #a7f3d0" };
  if (v === "in_progress") return { ...base, background: "#eff6ff", border: "1px solid #bfdbfe" };
  return { ...base, background: "#fff7ed", border: "1px solid #fed7aa" };
}

function isDemoLead(row) {
  const hay = [
    row?.type,
    row?.organization,
    row?.contact_name,
    row?.email,
    row?.phone,
    row?.note,
  ]
    .map((x) => norm(x).toLowerCase())
    .join(" | ");

  return hay.includes("demo");
}

export default function AdminPoptavky() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [typeFilter, setTypeFilter] = useState("all"); // all | obec | skola | senior | demo
  const [statusFilter, setStatusFilter] = useState("all"); // all | new | in_progress | approved | done
  const [q, setQ] = useState("");

  const [approvingId, setApprovingId] = useState("");
  const [actionMsg, setActionMsg] = useState("");

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
      .select("id, created_at, type, organization, contact_name, email, phone, note, status")
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

  async function setStatus(id, status) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));

    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      setRows(prev);
      alert("Nepodařilo se uložit stav: " + error.message);
    }
  }

  async function approveDemo(row) {
    if (!row?.id) return;

    const email = norm(row.email);
    if (!email) {
      alert("U této žádosti chybí e-mail.");
      return;
    }

    const ok = window.confirm(
      `Schválit demo přístup pro ${email}?`
    );
    if (!ok) return;

    setApprovingId(row.id);
    setActionMsg("");

    try {
      const res = await fetch("/api/admin/approve-demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: row.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Schválení demo přístupu se nepodařilo.");
      }

      setRows((prev) =>
        prev.map((x) =>
          x.id === row.id
            ? { ...x, status: "approved" }
            : x
        )
      );

      setActionMsg(`Demo přístup schválen pro ${email}.`);
    } catch (e) {
      alert(e.message || "Schválení demo přístupu se nepodařilo.");
    } finally {
      setApprovingId("");
    }
  }

  const filtered = useMemo(() => {
    let out = rows || [];

    if (typeFilter !== "all") {
      out = out.filter((r) => {
        const t = norm(r?.type).toLowerCase();
        const n = norm(r?.note).toLowerCase();

        if (typeFilter === "demo") {
          return isDemoLead(r) || n.includes("demo");
        }
        if (typeFilter === "skola") return t.includes("skola") || t.includes("škola") || t.includes("zš") || t.includes("zs");
        if (typeFilter === "senior") return t.includes("senior");
        return t.includes("obec");
      });
    }

    if (statusFilter !== "all") {
      out = out.filter((r) => (r.status || "new") === statusFilter);
    }

    const qq = q.trim().toLowerCase();
    if (qq) {
      out = out.filter((r) => {
        const hay = [
          r.type,
          r.organization,
          r.contact_name,
          r.email,
          r.phone,
          r.note,
          r.status,
        ]
          .map((x) => norm(x).toLowerCase())
          .join(" | ");
        return hay.includes(qq);
      });
    }

    return out;
  }, [rows, typeFilter, statusFilter, q]);

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "24px 16px" }}>
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
                fontWeight: 800,
              }}
            >
              Obnovit
            </button>
          </div>
        </div>

        <p style={{ marginTop: 6, color: "#555" }}>
          Přehled poptávek z formuláře <code>/poptavka</code>. Řazeno podle nejnovějších.
        </p>

        {actionMsg ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              border: "1px solid #a7f3d0",
              background: "#ecfdf5",
              color: "#166534",
            }}
          >
            {actionMsg}
          </div>
        ) : null}

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
                Typ:{" "}
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
                  <option value="demo">Demo</option>
                  <option value="obec">Obec</option>
                  <option value="skola">Škola</option>
                  <option value="senior">Senior</option>
                </select>
              </label>

              <label style={{ color: "#444" }}>
                Stav:{" "}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    marginLeft: 8,
                  }}
                >
                  <option value="all">Vše</option>
                  <option value="new">Nová</option>
                  <option value="in_progress">Řeší se</option>
                  <option value="approved">Schváleno</option>
                  <option value="done">Vyřízeno</option>
                </select>
              </label>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hledat (obec, email, poznámka…)…"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  minWidth: 260,
                  flex: "1 1 260px",
                }}
              />

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
                    <th style={thStyle}>Stav</th>
                    <th style={thStyle}>Typ</th>
                    <th style={thStyle}>Organizace</th>
                    <th style={thStyle}>Kontakt</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Telefon</th>
                    <th style={thStyle}>Poznámka</th>
                    <th style={thStyle}>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td style={tdStyle} colSpan={9}>
                        Načítám…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td style={tdStyle} colSpan={9}>
                        Zatím žádné poptávky.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const s = r.status || "new";
                      const demoLead = isDemoLead(r);

                      return (
                        <tr key={r.id}>
                          <td style={tdStyle}>{formatDateTimeCS(r.created_at)}</td>
                          <td style={tdStyle}>
                            <span style={statusChipStyle(s)}>{statusLabel(s)}</span>
                          </td>
                          <td style={tdStyle}>
                            {norm(r.type) || "—"}
                            {demoLead ? (
                              <div style={{ marginTop: 6 }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: "#eef2ff",
                                    color: "#1e3a8a",
                                    fontSize: 11,
                                    fontWeight: 800,
                                  }}
                                >
                                  demo
                                </span>
                              </div>
                            ) : null}
                          </td>
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
                          <td style={tdStyle}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={() => setStatus(r.id, "new")}
                                style={miniBtn(s === "new")}
                                title="Nastavit: Nová"
                              >
                                Nová
                              </button>
                              <button
                                onClick={() => setStatus(r.id, "in_progress")}
                                style={miniBtn(s === "in_progress")}
                                title="Nastavit: Řeší se"
                              >
                                Řeší se
                              </button>
                              <button
                                onClick={() => setStatus(r.id, "done")}
                                style={miniBtn(s === "done")}
                                title="Nastavit: Vyřízeno"
                              >
                                Vyřízeno
                              </button>

                              {demoLead ? (
                                <button
                                  onClick={() => approveDemo(r)}
                                  disabled={approvingId === r.id || s === "approved"}
                                  style={approveBtn(approvingId === r.id || s === "approved")}
                                  title="Schválit demo přístup"
                                >
                                  {approvingId === r.id ? "Schvaluji..." : s === "approved" ? "Schváleno" : "Schválit demo"}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

function miniBtn(active) {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid " + (active ? "#111827" : "#e5e7eb"),
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111827",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  };
}

function approveBtn(disabled) {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid " + (disabled ? "#d1d5db" : "#1d4ed8"),
    background: disabled ? "#f3f4f6" : "#eff6ff",
    color: disabled ? "#6b7280" : "#1d4ed8",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 800,
    fontSize: 12,
  };
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
