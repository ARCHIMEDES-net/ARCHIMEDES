// pages/portal/skoly/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "schools";

// ✅ Leaflet komponenty – načítáme pouze na klientu (SSR off)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("cards"); // "cards" | "map"

  async function load() {
    setLoading(true);
    setErr("");

    // 🔎 bereme i lat/lng (souřadnice pro mapu)
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

  // ✅ Fix ikon markerů (jinak v Next často nevidíš marker)
  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const L = (await import("leaflet")).default;

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
        // když leaflet není nainstalovaný, build stejně spadne dřív – tohle je jen safety.
      }
    })();
  }, []);

  const items = useMemo(() => {
    return (rows || []).map((r) => ({
      ...r,
      photo_url: publicUrlFromPath(r.photo_path),
      latN: safeNum(r.lat),
      lngN: safeNum(r.lng),
    }));
  }, [rows]);

  const mapPoints = useMemo(() => items.filter((r) => r.latN && r.lngN), [items]);

  const defaultCenter = useMemo(() => {
    // když máme body, centrovat na jejich průměr; jinak ČR
    if (mapPoints.length === 0) return [49.8175, 15.4730];
    const avgLat = mapPoints.reduce((a, b) => a + b.latN, 0) / mapPoints.length;
    const avgLng = mapPoints.reduce((a, b) => a + b.lngN, 0) / mapPoints.length;
    return [avgLat, avgLng];
  }, [mapPoints]);

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
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 260 }}>
            <h1 style={{ margin: 0, fontSize: 24, letterSpacing: -0.2 }}>
              Síť učeben ARCHIMEDES
            </h1>
            <div style={{ color: "rgba(0,0,0,0.65)", marginTop: 6, lineHeight: 1.35 }}>
              Přehled škol s učebnou ARCHIMEDES. Slouží jako reference, inspirace a možnost kontaktu.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
              Celkem:{" "}
              <b style={{ color: "rgba(0,0,0,0.85)" }}>{items.length}</b>
            </div>

            {/* Přepínač */}
            <div
              style={{
                display: "inline-flex",
                background: "white",
                border: "1px solid rgba(0,0,0,0.10)",
                borderRadius: 999,
                padding: 4,
                boxShadow: "0 10px 28px rgba(0,0,0,0.04)",
              }}
            >
              <button
                onClick={() => setView("cards")}
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 900,
                  background: view === "cards" ? "#111827" : "transparent",
                  color: view === "cards" ? "white" : "rgba(0,0,0,0.75)",
                }}
              >
                Karty
              </button>
              <button
                onClick={() => setView("map")}
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 900,
                  background: view === "map" ? "#111827" : "transparent",
                  color: view === "map" ? "white" : "rgba(0,0,0,0.75)",
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
              whiteSpace: "pre-wrap",
            }}
          >
            Chyba: {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>Načítám…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>Zatím zde nejsou žádné publikované školy.</div>
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
            <div style={{ padding: 14, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 900 }}>Mapa učeben</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Zobrazují se jen školy, které mají vyplněné souřadnice (lat/lng).
              </div>
            </div>

            <div style={{ height: 520 }}>
              <MapContainer
                center={defaultCenter}
                zoom={mapPoints.length ? 7 : 7}
                style={{ width: "100%", height: "100%" }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapPoints.map((r) => (
                  <Marker key={r.id} position={[r.latN, r.lngN]}>
                    <Popup>
                      <div style={{ fontWeight: 900 }}>{r.name || "—"}</div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                        {(r.city ? r.city : "—")}
                        {r.region ? ` • ${r.region}` : ""}
                        {r.country ? ` • ${r.country}` : ""}
                      </div>
                      <div style={{ marginTop: 8 }}>
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
                      {r.latN && r.lngN ? (
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
                          Má souřadnice
                        </span>
                      ) : null}
                    </div>

                    <div style={{ marginTop: 14, fontSize: 13, fontWeight: 900, color: "rgba(0,0,0,0.85)" }}>
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
