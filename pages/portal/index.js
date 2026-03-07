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
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (_e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }

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
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 48px" }}>
          {/* HERO / intro */}
          <section
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: "22px 22px 20px",
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 520px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.06)",
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  ARCHIMEDES Live
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 34,
                    lineHeight: 1.08,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Vaše pracovní plocha
                  <br />
                  pro živý program
                </h1>

                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "rgba(15,23,42,0.72)",
                    maxWidth: 760,
                  }}
                >
                  Tady najdete nejrychlejší přístup do programu, archivu, inzerce i sítě učeben.
                  Nejčastěji budete pracovat s kalendářem vysílání a navazujícími materiály.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(130px, 1fr))",
                  gap: 10,
                  flex: "0 1 320px",
                  width: "100%",
                  maxWidth: 320,
                }}
              >
                <StatCard value="1" label="místo pro vstup do programu" />
                <StatCard value="3" label="nejbližší vysílání v přehledu" />
                <StatCard value="4" label="hlavní sekce rychlého přístupu" />
                <StatCard value="24/7" label="přístup pro registrované" />
              </div>
            </div>
          </section>

          {/* top info row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "rgba(15,23,42,0.72)",
              }}
            >
              Přístup k obsahu pro registrované.
            </div>

            <div
              style={{
                marginLeft: "auto",
                fontSize: 13,
                color: "rgba(15,23,42,0.62)",
              }}
            >
              Tip: nejčastěji budete používat <b>Kalendář</b>.
            </div>
          </div>

          {/* main grid */}
          <div className="portal-main-grid">
            {/* left */}
            <div style={{ display: "grid", gap: 16 }}>
              <section
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 18,
                  boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                      Rychlý přístup
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                      Nejrychlejší cesta k tomu, co budete používat nejčastěji.
                    </div>
                  </div>

                  <Link
                    href="/portal/kalendar"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 16px",
                      borderRadius: 14,
                      background: "#0f172a",
                      color: "white",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Otevřít kalendář
                  </Link>
                </div>

                <div className="tiles-grid">
                  <Tile
                    href="/portal/kalendar"
                    icon="🗓️"
                    title="Kalendář"
                    desc="Přehled vysílání, detail programu a nejsnazší vstup do živého obsahu."
                    cta="Otevřít"
                    highlight
                    note="Doporučeno"
                    large
                  />

                  <Tile
                    href="/portal/archiv"
                    icon="📚"
                    title="Archiv"
                    desc="Záznamy, materiály a pracovní listy. Postupně zde bude přibývat další obsah."
                    cta="Otevřít"
                  />

                  <Tile
                    href="/portal/inzerce"
                    icon="📌"
                    title="Inzerce"
                    desc="Nabídky, poptávky a partnerství mezi školami, obcemi a dalšími členy sítě."
                    cta="Otevřít"
                  />

                  <Tile
                    href="/portal/skoly"
                    icon="🏫"
                    title="Síť učeben"
                    desc="Přehled škol s učebnou ARCHIMEDES, inspirace z praxe a kontakty."
                    cta="Otevřít"
                  />
                </div>
              </section>

              <section
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 18,
                  boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                    Administrace
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      color: "rgba(15,23,42,0.72)",
                    }}
                  >
                    vidí jen správci
                  </div>
                </div>

                {checkingAdmin ? (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: "1px dashed rgba(15,23,42,0.18)",
                      background: "rgba(15,23,42,0.02)",
                      color: "rgba(15,23,42,0.70)",
                    }}
                  >
                    Načítám práva…
                  </div>
                ) : isAdmin ? (
                  <div className="tiles-grid admin-grid">
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
                      desc="Moderace, TOP, ARCHIMEDES a správa příspěvků."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-poptavky"
                      icon="📨"
                      title="Poptávky"
                      desc="Přehled leadů a export do CSV."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-skoly"
                      icon="🏫"
                      title="Školy"
                      desc="Správa databáze učeben, fotek, kontaktů a publikace."
                      cta="Otevřít"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: "1px dashed rgba(15,23,42,0.18)",
                      background: "rgba(15,23,42,0.02)",
                      color: "rgba(15,23,42,0.72)",
                      fontSize: 15,
                    }}
                  >
                    Administrace je dostupná jen správcům.
                  </div>
                )}
              </section>
            </div>

            {/* right */}
            <aside
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                padding: 18,
                boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                    Nejbližší vysílání
                  </div>
                  <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                    Přehled nejbližších publikovaných událostí.
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.06)",
                    color: "rgba(15,23,42,0.72)",
                    whiteSpace: "nowrap",
                  }}
                >
                  max. 3
                </div>
              </div>

              {eventsErr ? (
                <div
                  style={{
                    marginTop: 14,
                    background: "#fff3f3",
                    border: "1px solid #ffd0d0",
                    padding: 14,
                    borderRadius: 14,
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
                    marginTop: 14,
                    padding: 16,
                    borderRadius: 16,
                    border: "1px dashed rgba(15,23,42,0.18)",
                    background: "rgba(15,23,42,0.02)",
                    color: "rgba(15,23,42,0.72)",
                    fontSize: 15,
                  }}
                >
                  Zatím nejsou naplánované publikované události.
                </div>
              ) : null}

              {hasEvents ? (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {nextEvents.map((e) => (
                    <EventRow key={e.id} e={e} />
                  ))}
                </div>
              ) : null}

              <Link
                href="/portal/kalendar"
                style={{
                  display: "inline-flex",
                  marginTop: 16,
                  textDecoration: "none",
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(15,23,42,0.18)",
                  background: "#0f172a",
                  color: "white",
                  fontWeight: 900,
                  justifyContent: "center",
                  width: "100%",
                  fontSize: 16,
                }}
              >
                Otevřít kalendář
              </Link>
            </aside>
          </div>

          <style jsx>{`
            .portal-main-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.9fr);
              gap: 18px;
              align-items: start;
            }

            .tiles-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }

            .admin-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            @media (max-width: 1080px) {
              .portal-main-grid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 760px) {
              .tiles-grid,
              .admin-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </div>
      </div>
    </RequireAuth>
  );
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 18,
        padding: "14px 14px 12px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          lineHeight: 1,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.68)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Tile({ href, icon, title, desc, cta = "Otevřít", highlight, note, large = false }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "#0f172a",
        borderRadius: 20,
        border: highlight ? "2px solid rgba(15,23,42,0.92)" : "1px solid rgba(15,23,42,0.10)",
        background: highlight ? "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)" : "white",
        padding: large ? 18 : 16,
        boxShadow: highlight
          ? "0 16px 36px rgba(15,23,42,0.08)"
          : "0 10px 28px rgba(15,23,42,0.05)",
        minHeight: large ? 210 : 190,
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
        <div
          style={{
            width: large ? 52 : 46,
            height: large ? 52 : 46,
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.03)",
            fontSize: large ? 24 : 22,
            flex: "0 0 auto",
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                fontWeight: 900,
                lineHeight: 1.15,
                fontSize: large ? 18 : 16,
              }}
            >
              {title}
            </div>

            {note ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: highlight ? "#0f172a" : "rgba(15,23,42,0.06)",
                  color: highlight ? "white" : "#0f172a",
                  whiteSpace: "nowrap",
                }}
              >
                {note}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "calc(100% - 64px)",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {desc ? (
            <div
              style={{
                fontSize: large ? 15 : 14,
                opacity: 0.76,
                lineHeight: 1.5,
              }}
            >
              {desc}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-start",
            padding: "11px 14px",
            borderRadius: 14,
            background: highlight ? "#0f172a" : "rgba(15,23,42,0.06)",
            color: highlight ? "white" : "#0f172a",
            fontWeight: 900,
            fontSize: 14,
            whiteSpace: "nowrap",
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
  const short = desc ? (desc.length > 115 ? desc.slice(0, 115) + "…" : desc) : "";

  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 16,
            lineHeight: 1.25,
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "rgba(15,23,42,0.70)",
            marginTop: 5,
            lineHeight: 1.45,
          }}
        >
          {dt}
          {cat ? <span style={{ marginLeft: 8 }}>• {cat}</span> : null}
        </div>

        {short ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "rgba(15,23,42,0.72)",
              lineHeight: 1.5,
            }}
          >
            {short}
          </div>
        ) : null}
      </div>

      <Link
        href="/portal/kalendar"
        style={{
          textDecoration: "none",
          padding: "11px 14px",
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.18)",
          background: "#0f172a",
          color: "white",
          fontWeight: 900,
          whiteSpace: "nowrap",
          flex: "0 0 auto",
        }}
      >
        Otevřít
      </Link>
    </div>
  );
}
