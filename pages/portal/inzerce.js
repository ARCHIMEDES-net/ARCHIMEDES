import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(date) {
  return date.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isActiveNow(row) {
  const now = new Date();
  const s = safeDate(row.starts_at);
  const e = safeDate(row.ends_at);

  if (row.is_published === false) return false;
  if (s && s > now) return false;
  if (e && e < now) return false;
  return true;
}

export default function Inzerce() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false); // false = jen aktivní, true = vše publikované

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,starts_at,ends_at,url,description,is_published,created_at,updated_at")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setErr(error.message || "Chyba načítání");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => r.is_published !== false)
      .filter((r) => (showAll ? true : isActiveNow(r)))
      .filter((r) => {
        if (!qq) return true;
        const text = `${r.title || ""} ${r.description || ""}`.toLowerCase();
        return text.includes(qq);
      });
  }, [rows, q, showAll]);

  const card = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  };

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "10px 0 6px" }}>Inzerce</h1>
            <p style={{ margin: 0, color: "#374151" }}>
              Pozvánky, nabídky kroužků, komunitní oznámení, akce v obci.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/portal/admin-inzerce">Admin inzerce</Link>
          </div>
        </div>

        <section style={{ ...card, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Hledat</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Název nebo text…"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center", whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              Zobrazit i neaktivní
            </label>
          </div>
        </section>

        {err ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 14 }}>Načítám…</p> : null}

        {!loading && !err ? (
          <section style={{ marginTop: 14 }}>
            {visible.length === 0 ? (
              <div style={{ ...card, color: "#6b7280" }}>
                Žádná inzerce podle zvolených filtrů.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {visible.map((r) => {
                  const s = safeDate(r.starts_at);
                  const e = safeDate(r.ends_at);
                  const active = isActiveNow(r);

                  return (
                    <div key={r.id} style={card}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{r.title}</div>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "1px solid #e5e7eb",
                            background: active ? "#ecfdf5" : "#f3f4f6",
                            fontWeight: 900,
                          }}
                        >
                          {active ? "aktivní" : "neaktivní"}
                        </span>
                      </div>

                      <div style={{ marginTop: 8, color: "#374151" }}>
                        {s ? <span>Od {formatDateTimeCS(s)}</span> : <span>Od kdykoli</span>}
                        {e ? <span> &nbsp; • &nbsp; Do {formatDateTimeCS(e)}</span> : <span> &nbsp; • &nbsp; Bez konce</span>}
                      </div>

                      {r.description ? (
                        <div style={{ marginTop: 10, whiteSpace: "pre-wrap", color: "#111827" }}>
                          {r.description}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {r.url ? (
                          <a href={r.url} target="_blank" rel="noreferrer">
                            → Otevřít odkaz
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </RequireAuth>
  );
}
