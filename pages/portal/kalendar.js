import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTime(d) {
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeAudience(aud) {
  if (!aud) return "";
  if (Array.isArray(aud)) return aud.join(", ");
  return String(aud);
}

function Badge({ children, variant = "neutral" }) {
  const styles = {
    neutral: { background: "#eef2ff", color: "#1e3a8a" },
    red: { background: "#fee2e2", color: "#991b1b" },
    gray: { background: "#e5e7eb", color: "#111827" },
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}

function ButtonLink({ href, children, variant = "light" }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid #e5e7eb",
  };

  const variants = {
    light: { background: "white", color: "#111827" },
    red: { background: "#ef4444", color: "white", border: "1px solid #ef4444" },
    blue: { background: "#2563eb", color: "white", border: "1px solid #2563eb" },
  };

  return (
    <a href={href} style={{ ...base, ...variants[variant] }}>
      {children}
    </a>
  );
}

function KalendarInner() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,starts_at,audience,full_description,stream_url,worksheet_url,is_published,created_at"
        )
        .order("starts_at", { ascending: true, nullsFirst: false });

      if (!alive) return;

      if (error) {
        setErr(error.message || "Chyba načítání událostí.");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const normalized = useMemo(() => {
    return rows
      .filter((r) => r && r.is_published !== false) // defaultně publikované; nepublikované skryjeme
      .map((r) => ({
        ...r,
        _starts: safeDate(r.starts_at),
        _aud: normalizeAudience(r.audience),
      }));
  }, [rows]);

  const upcoming = useMemo(() => {
    return normalized
      .filter((r) => r._starts && r._starts.getTime() >= now.getTime())
      .sort((a, b) => a._starts.getTime() - b._starts.getTime());
  }, [normalized, now]);

  const archive = useMemo(() => {
    return normalized
      .filter((r) => r._starts && r._starts.getTime() < now.getTime())
      .sort((a, b) => b._starts.getTime() - a._starts.getTime());
  }, [normalized, now]);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <h1 style={{ fontSize: 44, margin: "10px 0 6px" }}>Program vysílání</h1>
      <p style={{ margin: 0, color: "#475569" }}>
        Přehled živých vysílání ARCHIMEDES Live
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <Link href="/portal" style={miniBtn}>
          ← Zpět do portálu
        </Link>
        <Link href="/portal/admin-udalosti" style={{ ...miniBtn, background: "#111827", color: "white" }}>
          Admin – události
        </Link>
      </div>

      {loading && (
        <div style={{ marginTop: 26, color: "#334155" }}>Načítám…</div>
      )}

      {!loading && err && (
        <div
          style={{
            marginTop: 26,
            padding: 14,
            borderRadius: 12,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          Chyba: {err}
        </div>
      )}

      {!loading && !err && (
        <>
          <Section title="Nadcházející vysílání">
            {upcoming.length === 0 ? (
              <Empty>Žádná nadcházející vysílání.</Empty>
            ) : (
              upcoming.map((e) => <EventCard key={e.id} e={e} />)
            )}
          </Section>

          <Section title="Archiv vysílání">
            {archive.length === 0 ? (
              <Empty>Archiv je zatím prázdný.</Empty>
            ) : (
              archive.map((e) => <EventCard key={e.id} e={e} isArchive />)
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginTop: 34 }}>
      <h2 style={{ fontSize: 26, margin: "0 0 16px" }}>{title}</h2>
      <div style={{ display: "grid", gap: 16 }}>{children}</div>
    </section>
  );
}

function Empty({ children }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "white",
        color: "#475569",
      }}
    >
      {children}
    </div>
  );
}

function EventCard({ e, isArchive = false }) {
  const dt = e._starts ? formatDateTime(e._starts) : "bez data";
  const aud = e._aud;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 18,
        padding: 18,
        borderRadius: 18,
        background: "white",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
      }}
    >
      <div
        style={{
          height: 180,
          borderRadius: 14,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: 13,
        }}
      >
        bez plakátu
      </div>

      <div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          {e.title || "(bez názvu)"}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant={isArchive ? "gray" : "red"}>{isArchive ? "Záznam" : "Živé"}</Badge>
          {aud ? <Badge variant="neutral">{aud}</Badge> : null}
          <span style={{ color: "#64748b" }}>{dt}</span>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/portal/udalost/${e.id}`} style={btnDetail}>
            Detail
          </Link>

          {e.stream_url ? (
            <ButtonLink href={e.stream_url} variant="red">
              ▶ Vysílání
            </ButtonLink>
          ) : (
            <span style={{ ...disabledBtn }}>▶ Vysílání</span>
          )}

          {e.worksheet_url ? (
            <ButtonLink href={e.worksheet_url} variant="blue">
              Pracovní list
            </ButtonLink>
          ) : (
            <span style={{ ...disabledBtn }}>Pracovní list</span>
          )}
        </div>
      </div>
    </div>
  );
}

const miniBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  background: "#f3f4f6",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
};

const btnDetail = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 10,
  background: "#e5e7eb",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
  border: "1px solid #e5e7eb",
};

const disabledBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 10,
  background: "#f3f4f6",
  color: "#9ca3af",
  fontWeight: 700,
  fontSize: 14,
  border: "1px solid #e5e7eb",
};

export default function KalendarPage() {
  // ✅ TÍMTO je zaručeno, že na stránce bude hlavička s logem (z RequireAuth)
  return (
    <RequireAuth>
      <KalendarInner />
    </RequireAuth>
  );
}
