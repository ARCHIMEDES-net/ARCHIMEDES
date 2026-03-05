// components/SchoolsMap.js
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Oprava ikon (Leaflet v bundlerech často nenajde default assety)
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

    // když je jen jeden bod, uděláme rozumný zoom (aby to nebylo moc daleko)
    const ptsCount = (items || []).filter(
      (r) => typeof r.lat === "number" && typeof r.lng === "number"
    ).length;

    if (ptsCount === 1) {
      const center = bounds.getCenter();
      map.setView(center, 12, { animate: false });
      return;
    }

    map.fitBounds(bounds, {
      padding: [24, 24],
      animate: false,
    });
  }, [bounds, items, map]);

  return null;
}

export default function SchoolsMap({ items = [] }) {
  // fallback start pozice (než se provede fitBounds)
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
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds items={items} />

          {(items || []).map((r) => {
            if (typeof r.lat !== "number" || typeof r.lng !== "number") return null;

            return (
              <Marker key={r.id} position={[r.lat, r.lng]}>
                <Popup>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    {r.name || "Škola"}
                  </div>

                  <div style={{ fontSize: 13, color: "rgba(0,0,0,0.75)" }}>
                    {(r.city ? r.city : "")}
                    {r.region ? `, ${r.region}` : ""}
                    {r.country ? `, ${r.country}` : ""}
                  </div>

                  {r.website ? (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={
                          r.website.startsWith("http")
                            ? r.website
                            : `https://${r.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, fontWeight: 700 }}
                      >
                        Web školy →
                      </a>
                    </div>
                  ) : null}

                  <div style={{ marginTop: 8 }}>
                    <a
                      href={`/portal/skoly/${r.id}`}
                      style={{ fontSize: 13, fontWeight: 800 }}
                    >
                      Otevřít detail →
                    </a>
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
