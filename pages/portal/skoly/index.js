// pages/portal/skoly/index.js
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

// Leaflet komponenty načteme jen na klientovi (Next.js SSR safe)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function safeNum(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n;
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [view, setView] = useState("cards"); // "cards" | "map"
  const mapRef = useRef(null);

  async function load() {
    setLoading(true);
    setErr("");

    // ⚠️ Důležité: načítáme i lat/lng
    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,city,region,country,website,school_type,short_description,photo_path,has_archimedes_classroom,is_published,archimedes_since,created_at,lat,lng"
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
      lat: safeNum(r.lat),
      lng: safeNum(r.lng),
    }));
  }, [rows]);

  const mapItems = useMemo(() => {
    // Do mapy dáme jen ty, co mají souřadnice
    return (items || []).filter((r) => r.lat !== null && r.lng !== null);
  }, [items]);

  // ✅ OPRAVA “malého čtverečku”:
  // Když přepnu na mapu, Leaflet si musí přepočítat velikost.
  useEffect(() => {
    if (view !== "map") return;

    const t = setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;

      try {
        map.invalidateSize();

        // Auto zoom na značky
        if (mapItems.length >= 2) {
          const bounds = mapItems.map((r) => [r.lat, r.lng]);
          map.fitBounds(bounds, { padding: [30, 30] });
        } else if (mapItems.length === 1) {
          map.setView([mapItems[0].lat, mapItems[0].lng], 12);
        } else {
          // default CZ
          map.setView([49.8, 15.5], 7);
        }
      } catch (e) {
        // no-op
      }
    }, 80);

    return () => clearTimeout(t);
  }, [view, mapItems]);

  return (
    <RequireAuth>
      <PortalHeader />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 14px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, letterSpacing: -0.2 }}>Síť učeben ARCHIMEDES</h1>
            <div style={{ color: "rgba(0,0,0,0.65)", marginTop: 6, lineHeight: 1.35 }}>
              Přehled škol s učebnou ARCHIMEDES. Slouží jako reference, inspirace a možnost kontaktu.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
              Celkem: <b style={{ color: "rgba(0,0,0,0.85)" }}>{items.length}</b>
            </div>

            <div
              style={{
                display: "inline-flex",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                padding: 4,
                gap: 4,
              }}
            >
              <button
                onClick={() => setView("cards")}
                style={{
                  border: 0,
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: view === "cards" ? "#111827" : "transparent",
                  color: view === "cards" ? "white" : "#111827",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Karty
              </button>
              <button
                onClick={() => setView("map")}
                style={{
                  border: 0,
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: view === "map" ? "#111827" : "transparent",
                  color: view === "map" ? "white" : "#111827",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Mapa
              </button>
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
        ) : view === "map" ? (
          <div
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Mapa učeben</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(0,0,0,0.65)" }}>
                Zobrazují se jen školy, které mají vyplněné souřadnice (lat/lng).
              </div>
            </div>

            {/* ✅ DŮLEŽITÉ: pevná výška kontejneru */}
            <div style={{ height: 520, width: "100%" }}>
              <MapContainer
                center={[49.8, 15.5]}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => {
                  mapRef.current = map;
                }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapItems.map((r) => (
                  <Marker key={r.id} position={[r.lat, r.lng]}>
                    <Popup>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>{r.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {(r.city ? r.city : "—")}
                        {r.region ? ` • ${r.region}` : ""}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <a href={`/portal/skoly/${r.id}`} style={{ fontWeight: 900 }}>
                          Otevřít detail →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>Zatím zde nejsou žádné publikované školy.</div>
        ) : (
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
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
                    <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(0,0,0,0.88)", lineHeight: 1.25 }}>
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

                      {/* malý štítek, jestli má souřadnice */}
                      {r.lat !== null && r.lng !== null ? (
                        <span
                          style={{
                            fontSize: 12,
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(59,130,246,0.10)",
                            border: "1px solid rgba(59,130,246,0.20)",
                            color: "rgba(0,0,0,0.75)",
                          }}
                        >
                          má bod na mapě
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
        )}
      </div>
    </RequireAuth>
  );
}
