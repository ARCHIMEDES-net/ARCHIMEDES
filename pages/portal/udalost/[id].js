import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import { supabase } from "../../../lib/supabaseClient";

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isValidDate(d) ? d : null;
}

function formatDay(date) {
  return date.toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function normalizeAudience(aud) {
  if (!aud) return "";
  if (Array.isArray(aud)) return aud.filter(Boolean).join(", ");
  return String(aud);
}

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [row, setRow] = useState(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,short_description,full_description,audience,starts_at,is_published,stream_url,worksheet_url,archive_url,poster_url,promo_short_text"
        )
        .eq("id", id)
        .single();

      if (!alive) return;

      if (error) {
        setErr(error.message || "Nepodařilo se načíst detail události.");
        setRow(null);
      } else {
        setRow(data || null);
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const start = useMemo(() => safeDate(row?.starts_at), [row?.starts_at]);
  const aud = useMemo(() => normalizeAudience(row?.audience), [row?.audience]);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/portal">← Portál</Link>
          <span style={{ opacity: 0.6 }}>|</span>
          <Link href="/portal/kalendar">Kalendář</Link>
        </div>

        {loading && <p style={{ marginTop: 16 }}>Načítám…</p>}
        {!loading && err && <p style={{ marginTop: 16, color: "crimson" }}>Chyba: {err}</p>}

        {!loading && !err && !row && (
          <p style={{ marginTop: 16 }}>Událost nebyla nalezena.</p>
        )}

        {!loading && !err && row && (
          <>
            <h1 style={{ marginTop: 18 }}>{row.title || "(bez názvu)"}</h1>

            <div
              style={{
                marginTop: 12,
                padding: 14,
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>
                  {start ? `${formatDay(start)} • ${formatTime(start)}` : "Bez data"}
                </div>

                {aud ? (
                  <div style={{ opacity: 0.85 }}>Cílovka: {aud}</div>
                ) : (
                  <div style={{ opacity: 0.6 }}>Cílovka: —</div>
                )}

                <div style={{ marginLeft: "auto", fontSize: 13, opacity: 0.75 }}>
                  Stav: {row.is_published ? "PUBLISHED" : "DRAFT"}
                </div>
              </div>

              {(row.short_description || row.promo_short_text) && (
                <div style={{ marginTop: 10, fontSize: 16 }}>
                  {row.short_description || row.promo_short_text}
                </div>
              )}

              {row.full_description && (
                <div style={{ marginTop: 10, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                  {row.full_description}
                </div>
              )}

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {row.stream_url ? (
                  <a
                    href={row.stream_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    ▶ Vysílání
                  </a>
                ) : (
                  <span style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #eee", opacity: 0.6 }}>
                    ▶ Vysílání
                  </span>
                )}

                {row.worksheet_url ? (
                  <a
                    href={row.worksheet_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    📄 Pracovní list
                  </a>
                ) : (
                  <span style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #eee", opacity: 0.6 }}>
                    📄 Pracovní list
                  </span>
                )}

                {row.archive_url ? (
                  <a
                    href={row.archive_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    🎬 Záznam
                  </a>
                ) : null}

                {row.poster_url ? (
                  <a
                    href={row.poster_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    🖼 Plakát
                  </a>
                ) : null}
              </div>
            </div>

            <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75 }}>
              ID události: {row.id}
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
