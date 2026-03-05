// pages/portal/index.js
import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PortalIndex() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [nextEvents, setNextEvents] = useState([]);
  const [eventsErr, setEventsErr] = useState("");

  useEffect(() => {
    (async () => {
      // 1) admin práva
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }

      // 2) nejbližší vysílání (publikované + budoucí)
      try {
        setEventsErr("");
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
          .from("events")
          .select("id,title,starts_at,category,full_description")
          .eq("is_published", true)
          .gt("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(3);

        if (error) setEventsErr(error.message);
        else setNextEvents(data || []);
      } catch (e) {
        setEventsErr(e?.message || "Nepodařilo se načíst nejbližší vysílání.");
      }
    })();
  }, []);

  const hasEvents = nextEvents && nextEvents.length > 0;

  return (
    <RequireAuth>
      <PortalHeader title="Portál" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 40px" }}>
          {/* Horní intro řádek */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline", marginBottom: 14 }}>
            <div style={{ fontSize: 14, opacity: 0.75 }}>Přístup k obsahu pro registrované.</div>

            <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>
              Tip: nejčastěji budeš používat <b>Kalendář</b>.
            </div>
          </div>

          {/* DASHBOARD GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: 14,
              alignItems: "start",
            }}
          >
            {/* LEVÝ SLOUPEC */}
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Rychlý přístup</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 10,
                  }}
                >
                  <Tile
                    href="/portal/kalendar"
                    icon="🗓️"
                    title="Kalendář"
                    desc="Přehled vysílání jako TV program + detail."
                    cta="Otevřít"
                    highlight
                    note="Doporučeno"
                  />
                  <Tile
                    href="/portal/archiv"
                    icon="📚"
                    title="Archiv"
                    desc="Záznamy, materiály a pracovní listy (postupně doplníme)."
                    cta="Otevřít"
                  />
                  <Tile
                    href="/portal/inzerce"
                    icon="📌"
                    title="Inzerce"
                    desc="Nabídky, poptávky a partnerství mezi školami a obcemi."
                    cta="Otevřít"
                  />

                  {/* ✅ NOVĚ: Síť učeben */}
                  <Tile
                    href="/portal/skoly"
                    icon="🏫"
                    title="Síť učeben"
                    desc="Přehled škol s učebnou ARCHIMEDES + inspirace a kontakt."
                    cta="Otevřít"
                  />
                </div>
              </div>

              {/* ADMIN jen pro správce */}
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 900 }}>Administrace</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>vidí jen správci</div>
                </div>

                {checkingAdmin ? (
                  <div style={{ padding: 12, opacity: 0.7 }}>Načítám práva…</div>
                ) : isAdmin ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <Tile
                      href="/portal/admin-udalosti"
                      icon="🛠️"
                      title="Události"
                      desc="Vkládání, úpravy a správa programu."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-inzerce"
                      icon="✅"
                      title="Inzerce"
                      desc="Moderace, TOP, ARCHIMEDES, mazání."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-poptavky"
                      icon="📨"
                      title="Poptávky"
                      desc="Přehled leadů + export CSV."
                      cta="Otevřít"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px dashed rgba(0,0,0,0.18)",
                      opacity: 0.75,
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    Administrace je dostupná jen správcům.
                  </div>
                )}
              </div>
            </div>

            {/* PRAVÝ SLOUPEC */}
            <div
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 18,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <div style={{ fontWeight: 900 }}>Nejbližší vysílání</div>
                <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>max. 3</div>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Kompletní seznam je v Kalendáři.</div>

              {eventsErr ? (
                <div
                  style={{
                    marginTop: 10,
                    background: "#fff3f3",
                    border: "1px solid #ffd0d0",
                    padding: 12,
                    borderRadius: 12,
                    color: "#8a1f1f",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Chyba: {eventsErr}
                </div>
              ) : null}

              {!eventsErr && !hasEvents ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(0,0,0,0.02)",
                    opacity: 0.75,
                  }}
                >
                  Zatím nejsou naplánované publikované události.
                </div>
              ) : null}

              {hasEvents ? (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {nextEvents.map((e) => (
                    <EventRow key={e.id} e={e} />
                  ))}
                </div>
              ) : null}

              <Link
                href="/portal/kalendar"
                style={{
                  display: "inline-flex",
                  marginTop: 12,
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "#111827",
                  color: "white",
                  fontWeight: 900,
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                Otevřít kalendář
              </Link>
            </div>
          </div>

          {/* RESPONSIVE */}
          <style jsx>{`
            @media (max-width: 980px) {
              div[style*="grid-template-columns: 1.15fr 0.85fr"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </div>
    </RequireAuth>
  );
}

/**
 * ✅ OPRAVA překryvu: dlaždice má dvě řádky:
 * - nahoře: ikona + (název + badge)
 * - dole: popis + tlačítko (tlačítko se nikdy nepřekryje)
 */
function Tile({ href, icon, title, desc, cta = "Otevřít", highlight, note }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "#0f172a",
        borderRadius: 16,
        border: highlight ? "2px solid rgba(15,23,42,0.85)" : "1px solid rgba(0,0,0,0.10)",
        background: "white",
        padding: 14,
        boxShadow: highlight ? "0 12px 30px rgba(0,0,0,0.08)" : "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      {/* ROW 1 */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.02)",
            fontSize: 18,
            flex: "0 0 auto",
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontWeight: 900, lineHeight: 1.2 }}>{title}</div>

            {note ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: highlight ? "#111827" : "rgba(0,0,0,0.06)",
                  color: highlight ? "white" : "#111827",
                  whiteSpace: "nowrap",
                }}
              >
                {note}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {desc ? <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>{desc}</div> : null}
        </div>

        <div
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            background: highlight ? "#111827" : "rgba(0,0,0,0.06)",
            color: highlight ? "white" : "#111827",
            fontWeight: 900,
            fontSize: 13,
            whiteSpace: "nowrap",
            flex: "0 0 auto",
          }}
        >
          {cta}
        </div>
      </div>
    </Link>
  );
}

function EventRow({ e }) {
  const title = e?.title || "—";
  const dt = formatDateTimeCS(e?.starts_at);
  const cat = e?.category ? String(e.category) : "";
  const desc = stripHtml(e?.full_description || "");
  const short = desc ? (desc.length > 90 ? desc.slice(0, 90) + "…" : desc) : "";

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 16,
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
          {dt}
          {cat ? <span style={{ marginLeft: 8 }}>• {cat}</span> : null}
        </div>
        {short ? <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>{short}</div> : null}
      </div>

      <Link
        href="/portal/kalendar"
        style={{
          textDecoration: "none",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.18)",
          background: "#111827",
          color: "white",
          fontWeight: 900,
          whiteSpace: "nowrap",
        }}
      >
        Otevřít
      </Link>
    </div>
  );
}
