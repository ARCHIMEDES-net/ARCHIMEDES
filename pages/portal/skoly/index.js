// pages/portal/skoly/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

// DŮLEŽITÉ: mapa jen na klientovi (jinak Next SSR spadne)
const SchoolsMap = dynamic(() => import("../../../components/SchoolsMap"), {
  ssr: false,
  loading: () => <div style={{ color: "rgba(0,0,0,0.65)" }}>Načítám mapu…</div>,
});

function toNum(v) {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("cards"); // "cards" | "map"

  async function load() {
    setLoading(true);
    setErr("");

    // Bereme obě varianty sloupců:
    //  - lat/lng (původně)
    //  - latitude/longitude (aktuálně v DB)
    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,city,region,country,website,school_type,short_description,photo_path,has_archimedes_classroom,is_published,archimedes_since,created_at,lat,lng,latitude,longitude"
      )
      // jen ARCHIMEDES síť (u vás jsou to jen učebny s ARCHIMEDES)
      .eq("has_archimedes_classroom", true)
      .eq("is_published", true)
      // primárně řadíme podle data otevření učebny (nejnovější nahoře)
      .order("archimedes_since", { ascending: false })
      // fallback řazení, když archimedes_since chybí
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const items = useMemo(() => {
    return (rows || []).map((r) => {
      // sjednocení: preferujeme latitude/longitude, pokud existují, jinak lat/lng
      const latA = toNum(r.latitude);
      const lngA = toNum(r.longitude);
      const latB = toNum(r.lat);
      const lngB = toNum(r.lng);

      const finalLat = latA !== null ? latA : latB;
      const finalLng = lngA !== null ? lngA : lngB;

      return {
        ...r,
        photo_url: publicUrlFromPath(r.photo_path),
        lat: finalLat,
        lng: finalLng,
      };
    });
  }, [rows]);

  const withCoords = useMemo(() => {
    return items.filter((r) => typeof r.lat === "number" && typeof r.lng === "number");
  }, [items]);

  // ---- STATISTIKY (marketingově důležité) ----
  const countriesCount = useMemo(() => {
    const set = new Set(
      (items || [])
        .map((r) => String(r.country || "").trim())
        .filter(Boolean)
    );
    return set.size;
  }, [items]);

  const newestYear = useMemo(() => {
    const ds = (items || [])
      .map((r) => safeDate(r.archimedes_since))
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime());
    return ds.length ? ds[0].getFullYear() : null;
  }, [items]);

  function SegButton({ id, label }) {
    const active = view === id;
    return (
      <button
        onClick={() => setView(id)}
        style={{
          border: "1px solid rgba(0,0,0,0.10)",
          background: active ? "rgba(0,0,0,0.90)" : "white",
          color: active ? "white" : "rgba(0,0,0,0.85)",
          padding: "10px 14px",
          borderRadius: 999,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  }

  function StatChip({ label, value, bg, border }) {
    return (
      <span
        style={{
          fontSize: 12,
          padding: "6px 10px",
          borderRadius: 999,
          background: bg || "rgba(0,0,0,0.04)",
          border: border || "1px solid rgba(0,0,0,0.08)",
          color: "rgba(0,0,0,0.75)",
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ opacity: 0.85 }}>{label}:</span> {value}
      </span>
    );
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 14px 40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-end",
            marginBottom: 14,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24, letterSpacing: -0.2 }}>
              Síť učeben ARCHIMEDES
            </h1>
            <div style={{ color: "rgba(0,0,0,0.65)", marginTop: 6, lineHeight: 1.35 }}>
              Přehled škol s učebnou ARCHIMEDES. Slouží jako reference, inspirace a možnost kontaktu.
            </div>

            {/* STATISTIKY */}
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatChip label="Učeben" value={items.length} />
              <StatChip
                label="S GPS"
                value={withCoords.length}
                bg="rgba(59,130,246,0.10)"
                border="1px solid rgba(59,130,246,0.18)"
              />
              <StatChip
                label="Země"
                value={countriesCount}
                bg="rgba(16,185,129,0.10)"
                border="1px solid rgba(16,185,129,0.18)"
              />
              {newestYear ? (
                <StatChip
                  label="Nejnovější"
                  value={newestYear}
                  bg="rgba(245,158,11,0.12)"
                  border="1px solid rgba(245,158,11,0.20)"
                />
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <SegButton id="cards" label="Karty" />
              <SegButton id="map" label="Mapa" />
            </div>
          </div>
        </div>

        {err ? (
          <div
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.18)",
              borderRadius: 14,
              padding: 12,
              color: "rgba(0,0,0,0.85)",
              marginBottom: 14,
            }}
          >
            Chyba: {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>Načítám…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>
            Zatím zde nejsou žádné publikované školy.
          </div>
        ) : view === "map" ? (
          <div
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 18,
              padding: 14,
              boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>
              Mapa učeben
            </div>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.65)", marginBottom: 12 }}>
              Zobrazují se jen školy, které mají vyplněné souřadnice (GPS).{" "}
              Aktuálně: <b>{withCoords.length}</b> z <b>{items.length}</b>.
            </div>

            {withCoords.length === 0 ? (
              <div style={{ color: "rgba(0,0,0,0.65)" }}>
                Zatím nemá žádná škola vyplněné souřadnice.
              </div>
            ) : (
              <SchoolsMap items={withCoords} />
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
              marginTop: 10,
            }}
          >
            {items.map((r) => {
              const hasCoords = typeof r.lat === "number" && typeof r.lng === "number";

              return (
                <Link
                  key={r.id}
                  href={`/portal/skoly/${r.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 18,
                      overflow: "hidden",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ height: 160, background: "rgba(0,0,0,0.04)" }}>
                      {r.photo_url ? (
                        <img
                          src={r.photo_url}
                          alt={r.name || "Učebna"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(0,0,0,0.45)",
                            fontSize: 13,
                          }}
                        >
                          Bez fotky
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 14 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "rgba(0,0,0,0.88)",
                          lineHeight: 1.25,
                        }}
                      >
                        {r.name || "—"}
                      </div>

                      <div style={{ marginTop: 6, fontSize: 13, color: "rgba(0,0,0,0.62)" }}>
                        {(r.city ? r.city : "—")}
                        {r.region ? ` • ${r.region}` : ""}
                        {r.country ? ` • ${r.country}` : ""}
                      </div>

                      {r.short_description ? (
                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 13,
                            color: "rgba(0,0,0,0.72)",
                            lineHeight: 1.35,
                          }}
                        >
                          {r.short_description}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {r.school_type ? (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "rgba(0,0,0,0.04)",
                              border: "1px solid rgba(0,0,0,0.08)",
                              color: "rgba(0,0,0,0.75)",
                              fontWeight: 800,
                            }}
                          >
                            {r.school_type}
                          </span>
                        ) : null}

                        {r.archimedes_since ? (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "rgba(16,185,129,0.10)",
                              border: "1px solid rgba(16,185,129,0.20)",
                              color: "rgba(0,0,0,0.75)",
                              fontWeight: 800,
                            }}
                          >
                            Učebna od {safeDate(r.archimedes_since)?.getFullYear()}
                          </span>
                        ) : null}

                        {hasCoords ? (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "rgba(59,130,246,0.10)",
                              border: "1px solid rgba(59,130,246,0.20)",
                              color: "rgba(0,0,0,0.75)",
                              fontWeight: 800,
                            }}
                          >
                            Má souřadnice
                          </span>
                        ) : null}
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          fontSize: 13,
                          fontWeight: 800,
                          color: "rgba(0,0,0,0.85)",
                        }}
                      >
                        Zobrazit detail →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
