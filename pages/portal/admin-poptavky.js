// pages/portal/admin-poptavky.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function formatDateTimeCS(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeLabel(t) {
  if (t === "obec") return "Obec";
  if (t === "skola") return "Škola";
  if (t === "senior") return "Senior klub";
  return t || "—";
}

export default function AdminPoptavky() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  async function load() {
    setLoading(true);
    setErr("");

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (type !== "all") query = query.eq("type", type);

    // jednoduché fulltext filtrování přes ilike (bez OR helperu držíme jednoduché)
    // uděláme filtr až na klientu, aby to bylo kompatibilní všude
    const { data, error } = await query;

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
    load();
  }, [type]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;

    return (rows || []).filter((r) => {
      const hay = [
        r.type,
        r.organization,
        r.contact_name,
        r.email,
        r.phone,
        r.note,
        r.source_path,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(needle);
    });
  }, [rows, q]);

  async function deleteLead(r) {
    if (!confirm(`Smazat poptávku od „${r.contact_name}“ (${r.organization})?`)) return;
    setErr("");

    const { error } = await supabase.from("leads").delete().eq("id", r.id);
    if (error) {
      setErr(error.message);
      return;
    }
    await load();
  }

  function exportCSV() {
    const cols = [
      "created_at",
      "type",
      "organization",
      "contact_name",
      "email",
      "phone",
      "note",
      "source_path",
      "id",
    ];

    const esc = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      // CSV escaping
      if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [
      cols.join(","),
      ...filtered.map((r) => cols.map((c) => esc(r[c])).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `poptavky_archimedeslive_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Link href="/portal" style={{ textDecoration: "none" }}>
            ← Zpět do portálu
          </Link>
          <span style={{ opacity: 0.5 }}>|</span>
          <div style={{ fontWeight: 800 }}>Admin – poptávky</div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={load}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              ↻ Obnovit
            </button>

            <button
              onClick={exportCSV}
              disabled={loading || filtered.length === 0}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "black",
                color: "white",
                cursor: loading || filtered.length === 0 ? "not-allowed" : "pointer",
                fontWeight: 900,
              }}
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {err ? (
          <div
            style={{
              background: "#fff3f3",
              border: "1px solid #ffd0d0",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              color: "#8a1f1f",
              whiteSpace: "pre-wrap",
            }}
          >
            Chyba: {err}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat… (obec, škola, email, telefon, poznámka)"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.18)",
              minWidth: 360,
              background: "white",
            }}
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.18)",
              background: "white",
              fontWeight: 800,
            }}
          >
            <option value="all">Vše</option>
            <option value="obec">Obec</option>
            <option value="skola">Škola</option>
            <option value="senior">Senior klub</option>
          </select>

          <div style={{ marginLeft: "auto", opacity: 0.7 }}>
            {loading ? "Načítám…" : `${filtered.length} poptávek`}
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 16,
            overflow: "hidden",
            background: "white",
          }}
        >
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              display: "grid",
              gridTemplateColumns: "160px 110px 240px 220px 1fr 110px",
              gap: 10,
              fontWeight: 900,
              fontSize: 13,
              opacity: 0.85,
            }}
          >
            <div>Datum</div>
            <div>Typ</div>
            <div>Obec/škola</div>
            <div>Kontakt</div>
            <div>Poznámka</div>
            <div style={{ textAlign: "right" }}>Akce</div>
          </div>

          {loading ? (
            <div style={{ padding: 14, opacity: 0.7 }}>Načítám…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 14, opacity: 0.7 }}>Zatím žádné poptávky.</div>
          ) : (
            <div style={{ display: "grid" }}>
              {filtered.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: 14,
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    display: "grid",
                    gridTemplateColumns: "160px 110px 240px 220px 1fr 110px",
                    gap: 10,
                    alignItems: "start",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{formatDateTimeCS(r.created_at)}</div>

                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "3px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "rgba(0,0,0,0.03)",
                        fontWeight: 800,
                      }}
                    >
                      {typeLabel(r.type)}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800 }}>{r.organization || "—"}</div>

                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontWeight: 800 }}>{r.contact_name || "—"}</div>
                    <div style={{ opacity: 0.85 }}>
                      <a href={`mailto:${r.email}`} style={{ color: "black", textDecoration: "none" }}>
                        {r.email || "—"}
                      </a>
                    </div>
                    {r.phone ? <div style={{ opacity: 0.75 }}>{r.phone}</div> : null}
                  </div>

                  <div style={{ whiteSpace: "pre-wrap", opacity: 0.9, lineHeight: 1.35 }}>
                    {r.note || <span style={{ opacity: 0.55 }}>—</span>}
                    {r.source_path ? (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                        Zdroj: {r.source_path}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => deleteLead(r)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.18)",
                        background: "white",
                        cursor: "pointer",
                      }}
                      title="Smazat"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, opacity: 0.65, fontSize: 12 }}>
          Pozn.: Pokud se ti zde ukáže „permission denied“ nebo prázdno i když poptávky existují, znamená to, že není správně nastavená RLS politika
          `leads_select_admin` nebo daný účet není v `admin_users`.
        </div>
      </div>
    </RequireAuth>
  );
}
