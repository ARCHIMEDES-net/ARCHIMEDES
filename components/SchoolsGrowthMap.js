// components/SchoolsGrowthMap.js
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

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
      map.setView(bounds.getCenter(), 12, { animate: false });
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

// jednoduché „živé“ ikonky (bez dalších knihoven)
function makeDotIcon({ variant = "active", pulse = false }) {
  const bg =
    variant === "planned"
      ? "rgba(245,158,11,0.95)" // oranžová
      : "rgba(37,99,235,0.95)"; // modrá

  const ring =
    variant === "planned"
      ? "rgba(245,158,11,0.35)"
      : "rgba(37,99,235,0.35)";

  const cls = pulse ? "al-dot al-dot--pulse" : "al-dot";

  return L.divIcon({
    className: "",
    html: `
      <div class="${cls}" style="--bg:${bg};--ring:${ring}">
        <div class="al-dot__core"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function yearFrom(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

export default function SchoolsGrowthMap({
  items = [],
  initialYear,
  showPlannedDefault = true,
}) {
  const years = useMemo(() => {
    const ys = (items || [])
      .map((r) => yearFrom(r.archimedes_since) || yearFrom(r.created_at))
      .filter((y) => Number.isFinite(y));
    if (ys.length === 0) return [];
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const out = [];
    for (let y = min; y <= max; y++) out.push(y);
    return out;
  }, [items]);

  const [year, setYear] = useState(() => initialYear || years[years.length - 1] || new Date().getFullYear());
  const [showPlanned, setShowPlanned] = useState(showPlannedDefault);

  useEffect(() => {
    if (!years.length) return;
    if (!years.includes(year)) setYear(years[years.length - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years.length]);

  const filtered = useMemo(() => {
    const y = year;
    return (items || []).filter((r) => {
      if (typeof r.lat !== "number" || typeof r.lng !== "number") return false;

      const status = String(r.status || "active");
      if (status === "planned" && !showPlanned) return false;

      const openedYear = yearFrom(r.archimedes_since) || yearFrom(r.created_at);
      if (!openedYear) return false;

      // active ukazujeme jen do zvoleného roku
      if (status !== "planned") return openedYear <= y;

      // planned ukazujeme vždy (nebo taky podle roku, pokud chceš)
      return true;
    });
  }, [items, year, showPlanned]);

  const stats = useMemo(() => {
    const activeCount = filtered.filter((r) => String(r.status || "active") !== "planned").length;
    const plannedCount = filtered.filter((r) => String(r.status || "active") === "planned").length;
    return { activeCount, plannedCount };
  }, [filtered]);

  const startCenter = [49.8, 15.5];
  const startZoom = 7;

  return (
    <div style={{ width: "100%" }}>
      {/* toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>
            Růst sítě: <span style={{ fontSize: 16 }}>{year}</span>
          </div>

          {years.length ? (
            <input
              type="range"
              min={years[0]}
              max={years[years.length - 1]}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ width: 220 }}
            />
          ) : null}

          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={showPlanned}
              onChange={(e) => setShowPlanned(e.target.checked)}
            />
            Zobrazit „připravujeme“
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.20)" }}>
            Aktivní: <b>{stats.activeCount}</b>
          </span>
          <span style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" }}>
            Připravujeme: <b>{stats.plannedCount}</b>
          </span>
        </div>
      </div>

      {/* map */}
      <div
        style={{
          width: "100%",
          height: 560,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.10)",
          background: "white",
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

          <FitBounds items={filtered} />

          {(filtered || []).map((r) => {
            const status = String(r.status || "active");
            const openedYear = yearFrom(r.archimedes_since) || yearFrom(r.created_at);

            // pulse = body v aktuálním roce (wow efekt)
            const pulse = status !== "planned" && openedYear === year;

            const icon = makeDotIcon({ variant: status === "planned" ? "planned" : "active", pulse });

            const web = normalizeHttp(r.website);

            return (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={icon}>
                <Popup>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>
                    {r.name || "Škola"}
                  </div>

                  <div style={{ fontSize: 13, color: "rgba(0,0,0,0.75)" }}>
                    {(r.city ? r.city : "")}
                    {r.region ? `, ${r.region}` : ""}
                    {r.country ? `, ${r.country}` : ""}
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href={`/portal/skoly/${r.id}`}
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        textDecoration: "none",
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.18)",
                        background: "#111827",
                        color: "white",
                        display: "inline-block",
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
                          fontWeight: 900,
                          textDecoration: "none",
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.18)",
                          background: "white",
                          color: "#111827",
                          display: "inline-block",
                        }}
                      >
                        Web →
                      </a>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    {status === "planned" ? "Stav: připravujeme" : `Otevřeno: ${openedYear || "—"}`}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* CSS pro pulz */}
      <style jsx global>{`
        .al-dot {
          width: 18px;
          height: 18px;
          position: relative;
        }
        .al-dot__core {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: var(--bg);
          border: 2px solid white;
          box-shadow: 0 8px 18px rgba(0,0,0,0.18);
          position: absolute;
          left: 3px;
          top: 3px;
        }
        .al-dot--pulse::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: var(--ring);
          animation: alPulse 1.4s ease-out infinite;
        }
        @keyframes alPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
        }
      `}</style>

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
        Tip: posuň rok a sleduj, jak síť roste. Body v aktuálním roce pulzují (živý efekt).
      </div>
    </div>
  );
}
