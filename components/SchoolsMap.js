// components/SchoolsMap.js
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Oprava ikon (Leaflet v bundlerech často nenajde default assety)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function FitBounds({ items }) {
  const map = useMap();

  const bounds = useMemo(() => {
    const pts = (items || [])
      .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
      .map((r) => [r.lat, r.lng]);

    if (pts.length === 0) return null;
    return L.latLngBounds(pts);
  }, [items]);

  useEffect(() => {
    if (!bounds) return;

    const ptsCount = (items || []).filter(
      (r) => typeof r.lat === "number" && typeof r.lng === "number"
    ).length;

    if (ptsCount === 1) {
      const center = bounds.getCenter();
      map.setView(center, 12, { animate: false });
      return;
    }

    map.fitBounds(bounds, { padding: [24, 24], animate: false });
  }, [bounds, items, map]);

  return null;
}

function normalizeHttp(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

function pillStyle(bg, border) {
  return {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    color: "rgba(0,0,0,0.78)",
    fontWeight: 800,
    lineHeight: 1,
  };
}

export default function SchoolsMap({ items = [] }) {
  const startCenter = [49.8, 15.5]; // CZ-ish
  const startZoom = 7;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          height: 520,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.10)",
        }}
      >
        <MapContainer
          center={startCenter}
          zoom={startZoom}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds items={items} />

          {(items || []).map((r) => {
            if (typeof r.lat !== "number" || typeof r.lng !== "number") return null;

            const web = normalizeHttp(r.website);
            const photo = String(r.photo_url || "").trim();
            const isArch = !!r.has_archimedes_classroom;

            return (
              <Marker key={r.id} position={[r.lat, r.lng]}>
                <Popup closeButton={true} autoPan={true} maxWidth={340}>
                  <div style={{ width: 320 }}>
                    {/* PHOTO */}
                    <div
                      style={{
                        height: 110,
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.06)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      {photo ? (
                        <img
                          src={photo}
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
                            fontSize: 12,
                            color: "rgba(0,0,0,0.55)",
                          }}
                        >
                          Bez fotky
                        </div>
                      )}
                    </div>

                    {/* TEXT */}
                    <div style={{ padding: "10px 2px 2px" }}>
                      <div
                        style={{
                          fontWeight: 950,
                          fontSize: 16,
                          letterSpacing: -0.2,
                          color: "rgba(0,0,0,0.90)",
                          lineHeight: 1.2,
                        }}
                      >
                        {r.name || "Škola"}
                      </div>

                      <div style={{ marginTop: 4, fontSize: 13, color: "rgba(0,0,0,0.70)" }}>
                        {r.city ? r.city : "—"}
                        {r.region ? ` • ${r.region}` : ""}
                        {r.country ? ` • ${r.country}` : ""}
                      </div>

                      {/* PILLS */}
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {isArch ? (
                          <span style={pillStyle("rgba(16,185,129,0.12)", "rgba(16,185,129,0.22)")}>
                            ARCHIMEDES
                          </span>
                        ) : null}

                        {r.school_type ? (
                          <span style={pillStyle("rgba(0,0,0,0.04)", "rgba(0,0,0,0.10)")}>
                            {r.school_type}
                          </span>
                        ) : null}
                      </div>

                      {/* CTA BUTTONS */}
                      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                        <a
                          href={`/portal/skoly/${r.id}`}
                          style={{
                            fontSize: 13,
                            fontWeight: 950,
                            textDecoration: "none",
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.18)",
                            background: "#111827",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 92,
                          }}
                        >
                          Detail →
                        </a>

                        {web ? (
                          <a
                            href={web}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 13,
                              fontWeight: 950,
                              textDecoration: "none",
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: "1px solid rgba(0,0,0,0.18)",
                              background: "white",
                              color: "#111827",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 92,
                            }}
                          >
                            Web →
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
        Tip: kolečkem myši přibližuješ/oddaluješ, tažením posouváš mapu.
      </div>
    </div>
  );
}
