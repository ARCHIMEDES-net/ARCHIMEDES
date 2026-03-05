import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!points || points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    const b = L.latLngBounds(points);
    map.fitBounds(b, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

export default function SchoolsMap({ items }) {
  const points = useMemo(() => {
    return (items || [])
      .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
      .map((r) => [r.lat, r.lng]);
  }, [items]);

  // default center (když je 0 bodů) – ČR
  const fallbackCenter = [49.8, 15.5];

  return (
    <div
      style={{
        height: 560,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.04)",
      }}
    >
      <MapContainer
        center={points[0] || fallbackCenter}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points} />

        {(items || [])
          .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
          .map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={markerIcon}
            >
              <Popup>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  {r.name || "Škola"}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {(r.city || "—")}
                  {r.region ? `, ${r.region}` : ""}
                </div>
                <div style={{ marginTop: 8 }}>
                  <a href={`/portal/skoly/${r.id}`} style={{ fontWeight: 700 }}>
                    Otevřít detail →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
