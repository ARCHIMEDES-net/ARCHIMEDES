// pages/portal/skoly/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "schools";

// DŮLEŽITÉ: mapy jen na klientovi (jinak Next SSR spadne)
const SchoolsMap = dynamic(() => import("../../../components/SchoolsMap"), {
  ssr: false,
  loading: () => <div style={{ color: "rgba(0,0,0,0.65)" }}>Načítám mapu…</div>,
});

const SchoolsGrowthMap = dynamic(
  () => import("../../../components/SchoolsGrowthMap"),
  {
    ssr: false,
    loading: () => (
      <div style={{ color: "rgba(0,0,0,0.65)" }}>Načítám mapu růstu…</div>
    ),
  }
);

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function safeYear(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeLatLng(row) {
  // kompatibilita: někde může být latitude/longitude, jinde lat/lng
  const lat =
    toNumberOrNull(row?.latitude) ?? toNumberOrNull(row?.lat) ?? null;
  const lng =
    toNumberOrNull(row?.longitude) ?? toNumberOrNull(row?.lng) ?? null;

  return {
    ...row,
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
  };
}

function SegButton({ id, label, current, onClick }) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        background: active ? "#111827" : "white",
        color: active ? "white" : "#111827",
        fontWeight: 900,
        padding: "8px 12px",
        borderRadius: 999,
        cursor: "pointer",
        boxShadow: active ? "0 10px 22px rgba(0,0,0,0.10)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function StatPill({ label, value, tint = "neutral" }) {
  const bg =
    tint === "blue"
      ? "rgba(37,99,235,0.10)"
      : tint === "green"
      ? "rgba(16,185,129,0.10)"
      : tint === "orange"
      ? "rgba(245,158,11,0.10)"
      : "rgba(0,0,0,0.04)";
  const br =
    tint === "blue"
      ? "rgba(37,99,235,0.18)"
      : tint === "green"
      ? "rgba(16,185,129,0.18)"
      : tint === "orange"
      ? "rgba(245,158,11,0.22)"
      : "rgba(0,0,0,0.08)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${br}`,
        fontSize: 12,
        fontWeight: 900,
        color: "#111827",
        whiteSpace: "nowrap",
      }}
    >
      {label}: <span style={{ fontSize: 13 }}>{value}</span>
    </span>
  );
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // "cards" | "map" | "growth"
  const [view, setView] = useState("cards");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select("*")
      // jen publikované školy (až bude veřejně)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows((data || []).map(normalizeLatLng));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const withCoords = useMemo(
    () =>
      rows.filter(
        (r) => typeof r.lat === "number" && typeof r.lng === "number"
      ),
    [rows]
  );

  const photoUrlByPath = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const p = r?.photo_path;
      if (p && !m.has(p)) m.set(p, publicUrlFromPath(p));
    }
    return m;
  }, [rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const withGps = withCoords.length;

    const countriesSet = new Set(
      rows
        .map((r) => String(r.country || "").trim())
        .filter((s) => s.length > 0)
    );

    const newestYear =
      rows
        .map((r) => safeYear(r.archimedes_since) || safeYear(r.created_at))
        .filter((y) => Number.isFinite(y))
        .sort((a, b) => b - a)[0] || "—";

    return {
      total,
      withGps,
      countries: countriesSet.size || 0,
      newestYear,
    };
  }, [rows, withCoords]);

  return (
    <RequireAuth>
      <PortalHeader title="Síť učeben" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "20px 16px 60px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Link
              href="/portal"
              style={{
                textDecoration: "none",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              ← Zpět do portálu
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 1000,
                  letterSpacing: "-0.02em",
                  color: "#0f172a",
                }}
              >
                Síť učeben ARCHIMEDES
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(0,0,0,0.60)",
                  maxWidth: 720,
                }}
              >
                Přehled škol s učebnou ARCHIMEDES. Slouží jako reference,
                inspirace a možnost kontaktu.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                <StatPill label="Učeben" value={stats.total} />
                <StatPill label="S GPS" value={stats.withGps} tint="blue" />
                <StatPill label="Země" value={stats.countries} tint="green" />
                <StatPill label="Nejnovější" value={stats.newestYear} tint="orange" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SegButton
                id="cards"
                label="Karty"
                current={view}
                onClick={setView}
              />
              <SegButton
                id="map"
                label="Mapa"
                current={view}
                onClick={setView}
              />
              <SegButton
                id="growth"
                label="Růst"
                current={view}
                onClick={setView}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            {loading ? (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                Načítám…
              </div>
            ) : err ? (
              <div
                style={{
                  background: "#fff3f3",
                  border: "1px solid #ffd0d0",
                  padding: 12,
                  borderRadius: 12,
                  color: "#8a1f1f",
                  whiteSpace: "pre-wrap",
                }}
              >
                Chyba: {err}
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
                <div
                  style={{ fontSize: 16, fontWeight: 1000, marginBottom: 6 }}
                >
                  Mapa učeben
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(0,0,0,0.60)",
                    marginBottom: 12,
                  }}
                >
                  Zobrazuji se jen školy, které mají vyplněné souřadnice (GPS).
                  Aktuálně: <b>{withCoords.length}</b> z <b>{rows.length}</b>.
                </div>

                <SchoolsMap items={withCoords} />
              </div>
            ) : view === "growth" ? (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 18,
                  padding: 14,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: 1000, marginBottom: 6 }}
                >
                  Růst sítě
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(0,0,0,0.60)",
                    marginBottom: 12,
                  }}
                >
                  Posuň rok a sleduj expanzi sítě. Body v aktuálním roce pulzují.
                </div>

                <SchoolsGrowthMap items={withCoords} />
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                {rows.map((r) => {
                  const photoUrl = r?.photo_path
                    ? photoUrlByPath.get(r.photo_path) || null
                    : null;

                  return (
                    <Link
                      key={r.id}
                      href={`/portal/skoly/${r.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          background: "white",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "0 14px 34px rgba(0,0,0,0.06)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            height: 150,
                            background: "rgba(0,0,0,0.03)",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(0,0,0,0.45)",
                            fontWeight: 900,
                          }}
                        >
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={r?.name || "Fotka učebny"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          ) : (
                            "Bez fotky"
                          )}
                        </div>

                        <div style={{ padding: 14 }}>
                          <div
                            style={{
                              fontWeight: 1000,
                              fontSize: 18,
                              lineHeight: 1.15,
                            }}
                          >
                            {r.name || "Škola"}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 13,
                              color: "rgba(0,0,0,0.60)",
                            }}
                          >
                            {r.city ? r.city : "—"}
                            {r.country ? ` • ${r.country}` : ""}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              marginTop: 10,
                            }}
                          >
                            {r.type ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: "rgba(0,0,0,0.04)",
                                  border: "1px solid rgba(0,0,0,0.08)",
                                  fontWeight: 900,
                                }}
                              >
                                {String(r.type).toLowerCase()}
                              </span>
                            ) : null}

                            {typeof r.lat === "number" &&
                            typeof r.lng === "number" ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  background: "rgba(37,99,235,0.10)",
                                  border: "1px solid rgba(37,99,235,0.18)",
                                  fontWeight: 900,
                                }}
                              >
                                Má souřadnice
                              </span>
                            ) : null}
                          </div>

                          <div
                            style={{
                              marginTop: 12,
                              fontWeight: 900,
                              color: "#111827",
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

          <style jsx>{`
            @media (max-width: 980px) {
              div[style*="grid-template-columns: repeat(3"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </div>
    </RequireAuth>
  );
}
