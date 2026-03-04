// pages/program.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "posters";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function normalizeAudienceValue(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProgramPublic() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // jednoduché filtry (nepovinné)
  const [q, setQ] = useState("");
  const [onlyFuture, setOnlyFuture] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");

    // Na veřejném programu ukazujeme jen publikované
    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,category,audience,full_description,worksheet_url,poster_path,is_published,created_at"
      )
      .eq("is_published", true)
      .order("starts_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const now = useMemo(() => new Date(), []); // fixne se pro render; při refreshi se aktualizuje
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (events || [])
      .filter((e) => {
        if (!e) return false;

        if (onlyFuture) {
          const d = safeDate(e.starts_at);
          if (!d) return false;
          if (d < new Date()) return false;
        }

        if (!query) return true;

        const aud = normalizeAudienceValue(e.audience).join(" ").toLowerCase();
        const hay = `${e.title || ""} ${e.category || ""} ${aud} ${
          e.full_description || ""
        }`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0;
        const db = safeDate(b.starts_at)?.getTime() ?? 0;
        return da - db;
      });
  }, [events, q, onlyFuture]);

  const future = useMemo(() => {
    const t = Date.now();
    return filtered.filter((e) => (safeDate(e.starts_at)?.getTime() ?? 0) >= t);
  }, [filtered]);

  const past = useMemo(() => {
    const t = Date.now();
    return filtered
      .filter((e) => (safeDate(e.starts_at)?.getTime() ?? 0) < t)
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0;
        const db = safeDate(b.starts_at)?.getTime() ?? 0;
        return db - da; // minulost od nejnovější
      });
  }, [filtered]);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* jednoduchá veřejná hlavička */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 16px",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {/* LOGO jako v portálu */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="archimedes live"
              style={{ height: 34, width: "auto", display: "block" }}
            />
          </Link>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{ textDecoration: "none", color: "black", opacity: 0.8 }}
            >
              Domů
            </Link>
            <Link
              href="/portal"
              style={{ textDecoration: "none", color: "black", opacity: 0.8 }}
            >
              Portál
            </Link>
            <span style={{ fontWeight: 700 }}>Program</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 40px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 26 }}>Program</h1>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hledat v programu…"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                minWidth: 260,
                background: "white",
              }}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "white",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={onlyFuture}
                onChange={(e) => setOnlyFuture(e.target.checked)}
              />
              Jen nadcházející
            </label>
          </div>
        </div>

        <div style={{ opacity: 0.75, marginBottom: 14 }}>
          Veřejný přehled vysílání. Odkaz na vysílání je dostupný registrovaným v portálu.
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

        {loading ? (
          <div style={{ padding: 14, opacity: 0.7 }}>Načítám…</div>
        ) : future.length === 0 && past.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.7 }}>Zatím žádné publikované události.</div>
        ) : (
          <>
            {/* NADCHÁZEJÍCÍ */}
            <Section title="Nadcházející" count={future.length}>
              {future.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </Section>

            {/* MINULÉ (volitelně) */}
            {!onlyFuture ? (
              <div style={{ marginTop: 18 }}>
                <Section title="Proběhlo" count={past.length}>
                  {past.slice(0, 30).map((e) => (
                    <EventCard key={e.id} e={e} />
                  ))}
                </Section>
              </div>
            ) : null}
          </>
        )}

        <div style={{ marginTop: 18, opacity: 0.7, fontSize: 13 }}>
          Pozn.: Zobrazuji jen položky, které mají v adminu <b>Publikováno</b>.
        </div>
      </div>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
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
          display: "flex",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ marginLeft: "auto", opacity: 0.7 }}>{count} položek</div>
      </div>
      <div style={{ display: "grid" }}>{children}</div>
    </div>
  );
}

function EventCard({ e }) {
  const posterUrl = publicUrlFromPath(e.poster_path);
  const aud = normalizeAudienceValue(e.audience);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 12,
        padding: 14,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 140,
          height: 90,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.1)",
          background: "rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Plakát"
            src={posterUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ opacity: 0.6, fontSize: 12 }}>Bez plakátu</span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{e.title || "—"}</div>
          <div style={{ opacity: 0.75 }}>{formatDateTimeCS(e.starts_at)}</div>

          {e.category ? (
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.12)",
                opacity: 0.9,
              }}
            >
              {e.category}
            </span>
          ) : null}
        </div>

        {aud.length ? (
          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {aud.slice(0, 8).map((t) => (
              <span
                key={`${e.id}-${t}`}
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.1)",
                  opacity: 0.85,
                }}
              >
                {t}
              </span>
            ))}
            {aud.length > 8 ? (
              <span style={{ fontSize: 12, opacity: 0.6 }}>+{aud.length - 8}</span>
            ) : null}
          </div>
        ) : null}

        {e.full_description ? (
          <div style={{ marginTop: 8, opacity: 0.85, lineHeight: 1.35, maxWidth: 760 }}>
            {String(e.full_description).slice(0, 220)}
            {String(e.full_description).length > 220 ? "…" : ""}
          </div>
        ) : null}

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Veřejně: klidně pracovní list, pokud je to OK – jinak smaž */}
          {e.worksheet_url ? (
            <a
              href={e.worksheet_url}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "white",
                color: "black",
              }}
            >
              📄 Pracovní list
            </a>
          ) : null}

          {/* CTA do portálu */}
          <Link
            href="/portal"
            style={{
              textDecoration: "none",
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.18)",
              background: "black",
              color: "white",
              fontWeight: 700,
            }}
          >
            Přihlásit se do portálu
          </Link>
        </div>
      </div>
    </div>
  );
}
