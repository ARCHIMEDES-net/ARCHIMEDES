import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const POSTERS_BUCKET = "posters";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatCz(dt) {
  const d = safeDate(dt);
  if (!d) return "—";
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function posterUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(POSTERS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function normalizeGroups(e) {
  if (Array.isArray(e?.audience_groups) && e.audience_groups.length) return e.audience_groups;
  if (Array.isArray(e?.audience) && e.audience.length) return e.audience;
  if (typeof e?.audience === "string" && e.audience.trim()) return e.audience.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

function Pill({ children, strong }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: strong ? "#111827" : "#fff",
        color: strong ? "#fff" : "#111827",
        fontWeight: strong ? 800 : 700,
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
}

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState(null);

  const safeId = useMemo(() => (id ? String(id) : null), [id]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!safeId) return;

      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,starts_at,category,audience_groups,audience,full_description,stream_url,worksheet_url,is_published,poster_path,poster_url,poster_caption"
        )
        .eq("id", safeId)
        .single();

      if (!isMounted) return;

      if (error) {
        setError(error.message || "Událost se nepodařilo načíst.");
        setEvent(null);
      } else {
        setEvent(data);
      }

      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [safeId]);

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "10px 0 6px" }}>{loading ? "Událost" : event?.title || "Událost"}</h1>
            <div style={{ color: "#374151" }}>{loading ? "Načítám…" : formatCz(event?.starts_at)}</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/portal/kalendar">← Zpět na program</Link>
            <span style={{ width: 1, height: 18, background: "#e5e7eb" }} />
            <Link href="/portal/admin-udalosti">Admin</Link>
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
            <b>Chyba:</b> {error}
          </div>
        ) : null}

        {loading ? (
          <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, color: "#6b7280" }}>
            Načítám…
          </div>
        ) : null}

        {!loading && event ? <EventBody event={event} /> : null}
      </main>
    </RequireAuth>
  );
}

function EventBody({ event }) {
  const groups = normalizeGroups(event);
  const hasStream = !!event.stream_url;
  const hasWorksheet = !!event.worksheet_url;

  const pUrl = event.poster_url || posterUrlFromPath(event.poster_path);

  return (
    <>
      {pUrl ? (
        <section style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Plakát</div>

          {event.poster_caption ? (
            <div style={{ color: "#374151", marginBottom: 10, whiteSpace: "pre-wrap" }}>{event.poster_caption}</div>
          ) : null}

          <a href={pUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <img
              src={pUrl}
              alt="Plakát"
              style={{
                width: "100%",
                maxHeight: 560,
                objectFit: "contain",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            />
          </a>

          <div style={{ color: "#6b7280", marginTop: 10, fontSize: 13 }}>Klikni na plakát pro otevření v plné velikosti.</div>
        </section>
      ) : (
        <section style={{ marginTop: 14, border: "1px dashed #d1d5db", borderRadius: 14, padding: 14, color: "#6b7280" }}>
          Bez plakátu.
        </section>
      )}

      <section style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {event.category ? <Pill strong>{event.category}</Pill> : <Pill strong>Speciál</Pill>}
            {(groups || []).map((g) => (
              <Pill key={g}>{g}</Pill>
            ))}
            {!event.is_published ? <Pill>nepublikováno</Pill> : null}
          </div>

          <div style={{ color: "#6b7280", fontSize: 13 }}>ID: {event.id}</div>
        </div>

        <div style={{ height: 1, background: "#e5e7eb", margin: "14px 0" }} />

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Popis</div>
            <div style={{ color: "#111827", whiteSpace: "pre-wrap" }}>{event.full_description ? event.full_description : "—"}</div>
          </div>

          <div style={{ height: 1, background: "#e5e7eb", margin: "6px 0" }} />

          <div>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Odkazy</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {hasStream ? (
                <a
                  href={event.stream_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                    fontWeight: 800,
                    color: "#111827",
                    background: "#fff",
                  }}
                >
                  ▶ Vysílání
                </a>
              ) : (
                <span style={{ color: "#6b7280", fontSize: 13 }}>Vysílání zatím není nastaveno.</span>
              )}

              {hasWorksheet ? (
                <a
                  href={event.worksheet_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                    fontWeight: 800,
                    color: "#111827",
                    background: "#fff",
                  }}
                >
                  📄 Pracovní list
                </a>
              ) : (
                <span style={{ color: "#6b7280", fontSize: 13 }}>Pracovní list zatím není nastaven.</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
