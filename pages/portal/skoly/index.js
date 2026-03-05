// pages/portal/skoly/index.js
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Head from "next/head";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

/**
 * Mapu rendrujeme jen na klientovi (Leaflet nejede v SSR).
 */
const SchoolsMap = dynamic(() => Promise.resolve(MapInner), { ssr: false });

function MapInner({ points }) {
  // Leaflet načítáme až v prohlížeči
  const ReactLeaflet = require("react-leaflet");
  const L = require("leaflet");

  const { MapContainer, TileLayer, Marker, Popup } = ReactLeaflet;

  // Fix ikon (jinak bývají "missing marker icons" ve webpacku)
  useEffect(() => {
    try {
      // nastavíme default ikony ručně přes CDN
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch (e) {
      // no-op
    }
  }, [L]);

  const hasPoints = points && points.length > 0;

  const center = useMemo(() => {
    // default ČR
    const fallback = [49.8175, 15.4730];

    if (!hasPoints) return fallback;

    const latSum = points.reduce((acc, p) => acc + p.latitude, 0);
    const lngSum = points.reduce((acc, p) => acc + p.longitude, 0);

    return [latSum / points.length, lngSum / points.length];
  }, [hasPoints, points]);

  const bounds = useMemo(() => {
    if (!hasPoints) return null;
    return points.map((p) => [p.latitude, p.longitude]);
  }, [hasPoints, points]);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ padding: 14, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 900, fontSize: 14 }}>Mapa učeben</div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
          Piny se zobrazí jen u škol, které mají vyplněnou zeměpisnou polohu.
        </div>
      </div>

      <div style={{ height: 420, background: "rgba(0,0,0,0.02)" }}>
        <MapContainer
          center={center}
          zoom={hasPoints ? 7 : 6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          whenCreated={(map) => {
            try {
              if (bounds && bounds.length > 0) {
                map.fitBounds(bounds, { padding: [24, 24] });
              }
            } catch (e) {
              // no-op
            }
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasPoints
            ? points.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>
                      {p.name || "—"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      {(p.city ? p.city : "—")}
                      {p.region ? ` • ${p.region}` : ""}
                      {p.country ? ` • ${p.country}` : ""}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <a
                        href={`/portal/skoly/${p.id}`}
                        style={{
                          display: "inline-flex",
                          textDecoration: "none",
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: "#111827",
                          color: "white",
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        Otevřít detail
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))
            : null}
        </MapContainer>
      </div>
    </div>
  );
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,city,region,country,website,school_type,short_description,photo_path,has_archimedes_classroom,is_published,archimedes_since,created_at,latitude,longitude"
      )
      .eq("has_archimedes_classroom", true)
      .eq("is_published", true)
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
    return (rows || []).map((r) => ({
      ...r,
      photo_url: publicUrlFromPath(r.photo_path),
    }));
  }, [rows]);

  const mapPoints = useMemo(() => {
    // jen ty, co mají souřadnice
    return (items || [])
      .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
      .filter((r) => !Number.isNaN(r.latitude) && !Number.isNaN(r.longitude));
  }, [items]);

  return (
    <RequireAuth>
      <Head>
        {/* fallback CSS – pokud ho nedáš do _app.js, toto pomůže */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </Head>

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
          </div>

          <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
            Celkem:{" "}
            <b style={{ color: "rgba(0,0,0,0.85)" }}>{items.length}</b>
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
        ) : (
          <>
            {/* MAPA */}
            <div style={{ marginBottom: 14 }}>
              <SchoolsMap points={mapPoints} />
            </div>

            {/* KARTY */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
                marginTop: 10,
              }}
            >
              {items.map((r) => (
                <Link key={r.id} href={`/portal/skoly/${r.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 18,
                      overflow: "hidden",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                      transition: "transform 120ms ease",
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
                        <div style={{ marginTop: 10, fontSize: 13, color: "rgba(0,0,0,0.72)", lineHeight: 1.35 }}>
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
                            }}
                          >
                            Učebna od {new Date(r.archimedes_since).getFullYear()}
                          </span>
                        ) : null}

                        {typeof r.latitude === "number" && typeof r.longitude === "number" ? (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "rgba(59,130,246,0.10)",
                              border: "1px solid rgba(59,130,246,0.18)",
                              color: "rgba(0,0,0,0.75)",
                            }}
                          >
                            Má souřadnice
                          </span>
                        ) : null}
                      </div>

                      <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.85)" }}>
                        Zobrazit detail →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
