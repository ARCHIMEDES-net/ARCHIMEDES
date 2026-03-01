import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

function fmtDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("cs-CZ", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function normalizeAudience(aud) {
  if (!aud) return "";
  return String(aud).trim();
}

export default function Kalendar() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [q, setQ] = useState("");
  const [onlyFuture, setOnlyFuture] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setErr("");

      // 1) zjistit admin práva (pokud RPC existuje)
      let admin = false;
      try {
        const { data, error } = await supabase.rpc("is_platform_admin");
        if (!error && data === true) admin = true;
      } catch {
        // když RPC není nebo selže, admin=false a jedeme dál
      }

      if (!mounted) return;
      setIsAdmin(admin);

      // 2) načíst události
      // - běžný uživatel: jen is_published=true
      // - admin: všechno
      try {
        let query = supabase
          .from("events")
          .select(
            "id,name,start_at,audience,full_description,stream_url,worksheet_url,is_published,created_at,updated_at"
          )
          .order("start_at", { ascending: true, nullsFirst: false });

        if (!admin) query = query.eq("is_published", true);

        const { data, error } = await query;
        if (error) throw error;

        if (!mounted) return;
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Nepodařilo se načíst události.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const qq = q.trim().toLowerCase();

    return (events || [])
      .filter((ev) => {
        if (onlyFuture && ev?.start_at) {
          const d = new Date(ev.start_at);
          if (!Number.isNaN(d.getTime()) && d < now) return false;
        }
        if (!qq) return true;

        const hay = [
          ev?.name,
          ev?.audience,
          ev?.full_description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(qq);
      })
      .map((ev) => ({
        ...ev,
        audience: normalizeAudience(ev?.audience),
      }));
  }, [events, q, onlyFuture]);

  return (
    <RequireAuth>
      <div
        style={{
          maxWidth: 980,
          margin: "40px auto",
          fontFamily: "system-ui",
          padding: 16,
        }}
      >
        <h1>Kalendář</h1>

        <p style={{ marginTop: 8 }}>
          <Link href="/portal">← Zpět do portálu</Link>
          {isAdmin ? (
            <span style={{ marginLeft: 12, fontWeight: 600 }}>
              (admin režim)
            </span>
          ) : null}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat (název / cílovka / popis)…"
            style={{
              width: 360,
              maxWidth: "100%",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={onlyFuture}
              onChange={(e) => setOnlyFuture(e.target.checked)}
            />
            Jen budoucí
          </label>

          {isAdmin ? (
            <Link href="/portal/admin/udalosti" style={{ marginLeft: "auto" }}>
              Admin – události →
            </Link>
          ) : null}
        </div>

        {loading ? (
          <p style={{ marginTop: 18 }}>Načítám…</p>
        ) : err ? (
          <div style={{ marginTop: 18 }}>
            <p style={{ color: "crimson", fontWeight: 600 }}>
              Chyba: {err}
            </p>
            <p style={{ opacity: 0.85 }}>
              Tip: zkontroluj v Supabase tabulku <b>events</b> a RLS policy.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ marginTop: 18 }}>Zatím tu nejsou žádné události.</p>
        ) : (
          <div style={{ marginTop: 18 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                    Datum a čas
                  </th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                    Název
                  </th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                    Cílovka
                  </th>
                  {isAdmin ? (
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>
                      Publikováno
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", width: 230 }}>
                      {fmtDateTime(ev.start_at) || <span style={{ opacity: 0.6 }}>—</span>}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                      <Link href={`/portal/udalost/${ev.id}`}>
                        {ev.name || "(bez názvu)"}
                      </Link>
                      {!ev.is_published && isAdmin ? (
                        <span style={{ marginLeft: 10, color: "#b45309", fontWeight: 600 }}>
                          draft
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", width: 220 }}>
                      {ev.audience || <span style={{ opacity: 0.6 }}>—</span>}
                    </td>
                    {isAdmin ? (
                      <td style={{ padding: 10, borderBottom: "1px solid #eee", width: 120 }}>
                        {ev.is_published ? "ANO" : "NE"}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={{ marginTop: 14, opacity: 0.8 }}>
              Klikni na název události pro detail.
            </p>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
