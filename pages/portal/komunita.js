// pages/portal/komunita.js
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

const communityBlocks = [
  {
    icon: "🤝",
    title: "Sdílení dobré praxe",
    text:
      "Místo pro inspiraci mezi školami, obcemi a dalšími zapojenými partnery. Postupně zde mohou být ukázky aktivit, projektů a nápadů z různých míst.",
    note: "Postupně rozšiřujeme",
  },
  {
    icon: "🏫",
    title: "Propojení škol a obcí",
    text:
      "ARCHIMEDES Live může být prostorem, kde se nepotkává jen výuka, ale také komunita, zřizovatel a místní spolupráce.",
  },
  {
    icon: "🌍",
    title: "Živá síť ARCHIMEDES",
    text:
      "Cílem je, aby portál nebyl jen místem pro sledování programu, ale také prostředím pro sdílení, inspiraci a spolupráci.",
  },
];

const clubCards = [
  {
    icon: "📖",
    title: "Čtenářský klub",
    text:
      "Společné čtení, doporučené knihy, setkání nad texty a kulturní přesah pro děti i dospělé.",
    href: "/portal/kalendar",
    cta: "Zobrazit program",
    note: "Klub",
  },
  {
    icon: "🧓",
    title: "Senior klub",
    text:
      "Pravidelný program pro seniory zaměřený na aktivní život, setkávání, inspiraci a nové podněty.",
    href: "/portal/kalendar",
    cta: "Zobrazit program",
    note: "Komunita",
  },
  {
    icon: "🏙️",
    title: "Smart City klub",
    text:
      "Program pro žáky, kteří chtějí přemýšlet o městě, obci, veřejném prostoru a budoucnosti svého okolí.",
    href: "/portal/kalendar",
    cta: "Zobrazit program",
    note: "Projekty",
  },
];

export default function KomunitaPage() {
  return (
    <RequireAuth>
      <PortalHeader title="Komunita" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 48px" }}>
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
                  ARCHIMEDES Live • komunita
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
                  Komunita není doplněk.
                  <br />
                  Je to součást programu.
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
                  ARCHIMEDES Live nemá být jen místem, kde škola sleduje vysílání.
                  Má být také prostorem pro sdílení inspirace, propojování škol,
                  obcí a komunitních aktivit a pro rozšiřování programu do dalšího života školy.
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
                <StatCard value="3" label="komunitní směry" />
                <StatCard value="1" label="živá síť" />
                <StatCard value="škola" label="hlavní prostředí" />
                <StatCard value="obec" label="přirozený přesah" />
              </div>
            </div>
          </section>

          <div className="community-main-grid">
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
                      Komunitní rozměr portálu
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                      Tři důvody, proč má Komunita v portálu své místo.
                    </div>
                  </div>
                </div>

                <div className="tiles-grid">
                  {communityBlocks.map((item, idx) => (
                    <Tile
                      key={item.title}
                      href="/portal/kalendar"
                      icon={item.icon}
                      title={item.title}
                      desc={item.text}
                      cta="Otevřít program"
                      note={item.note}
                      highlight={idx === 0}
                      large={idx === 0}
                    />
                  ))}
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
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                      Kluby a komunitní programy
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                      Příklady částí programu, které přirozeně patří do komunity.
                    </div>
                  </div>
                </div>

                <div className="tiles-grid">
                  {clubCards.map((item, idx) => (
                    <Tile
                      key={item.title}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      desc={item.text}
                      cta={item.cta}
                      note={item.note}
                      highlight={idx === 0}
                    />
                  ))}
                </div>
              </section>
            </div>

            <aside
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                padding: 18,
                boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                Co může přijít dál
              </div>
              <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                Bezpečná první verze je jen obsahová. Později se dá rozšířit.
              </div>

              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <SideInfoCard
                  title="Sdílení projektů"
                  text="Postupně lze doplnit ukázky aktivit škol, obcí a dalších členů sítě."
                />
                <SideInfoCard
                  title="Galerie dobré praxe"
                  text="Místo pro fotografie, krátké příběhy a inspiraci z reálného použití."
                />
                <SideInfoCard
                  title="Komunitní výzvy"
                  text="Navazující krok mohou být jednoduché společné výzvy nebo tematické akce."
                />
              </div>

              <Link
                href="/portal/souteze"
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
                Přejít na Soutěže a projekty
              </Link>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 16,
                  background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>
                  Doporučený další krok
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "rgba(15,23,42,0.70)",
                  }}
                >
                  Začni jednoduše. Nech tuto sekci nejdřív jako obsahový a orientační blok.
                  Až budeš spokojený s texty a strukturou, teprve pak na ni napoj data a správu.
                </div>
              </div>
            </aside>
          </div>

          <style jsx>{`
            .community-main-grid {
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

            @media (max-width: 1080px) {
              .community-main-grid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 760px) {
              .tiles-grid {
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

function SideInfoCard({ title, text }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(15,23,42,0.10)",
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>{title}</div>
      <div
        style={{
          marginTop: 6,
          fontSize: 14,
          lineHeight: 1.5,
          color: "rgba(15,23,42,0.70)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
