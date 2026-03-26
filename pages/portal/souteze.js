// pages/portal/souteze.js
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

const contestCards = [
  {
    icon: "🏙️",
    title: "Navrhni své město",
    text:
      "Jak by mohla vypadat obec nebo město budoucnosti? Prostor pro nápady žáků, škol i komunit.",
    note: "Doporučeno",
  },
  {
    icon: "🧪",
    title: "Experiment týdne",
    text:
      "Jednoduché zadání pro školy, které chtějí sdílet pokus, pozorování nebo zajímavý výsledek své práce.",
    note: "Škola a věda",
  },
  {
    icon: "🎥",
    title: "Příběh z vaší obce",
    text:
      "Krátký projekt, reportáž, video nebo prezentace o lidech, místech a nápadech ve vaší obci.",
    note: "Komunita",
  },
];

const nextStepCards = [
  {
    title: "Odevzdávání projektů",
    text:
      "V další fázi lze doplnit formulář pro přihlášení nebo odevzdání výstupu přímo přes portál.",
  },
  {
    title: "Galerie výsledků",
    text:
      "Později může vzniknout galerie projektů, kde budou vidět práce škol, obcí a dalších zapojených partnerů.",
  },
  {
    title: "Vyhodnocení a ocenění",
    text:
      "Dalším krokem může být výběr inspirativních projektů, zveřejnění výsledků nebo veřejné představení prací.",
  },
];

export default function SoutezePage() {
  return (
    <RequireAuth>
      <PortalHeader title="Soutěže a projekty" />

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
                  ARCHIMEDES Live • soutěže a projekty
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
                  Program nekončí sledováním.
                  <br />
                  Má vést k vlastní aktivitě.
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
                  Tato sekce je místem pro výzvy, projekty a soutěže, které mohou školy
                  a komunity rozvíjet po zhlédnutí programu nebo jako samostatnou aktivitu.
                  Cílem je, aby ARCHIMEDES Live nebyl jen pasivní, ale také tvůrčí a akční.
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
                <StatCard value="3" label="ukázky výzev" />
                <StatCard value="1" label="bezpečná MVP vrstva" />
                <StatCard value="škola" label="hlavní účastník" />
                <StatCard value="projekt" label="další logický krok" />
              </div>
            </div>
          </section>

          <div className="projects-main-grid">
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
                      Ukázky soutěží a projektových výzev
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                      Obsahová vrstva, kterou lze později napojit na data, formuláře a správu.
                    </div>
                  </div>
                </div>

                <div className="tiles-grid">
                  {contestCards.map((item, idx) => (
                    <Tile
                      key={item.title}
                      href="/portal/komunita"
                      icon={item.icon}
                      title={item.title}
                      desc={item.text}
                      cta="Zjistit více"
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
                      Proč tato sekce dává smysl
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                      Posouvá portál od sledování obsahu k aktivnímu zapojení.
                    </div>
                  </div>
                </div>

                <div className="info-grid">
                  <InfoCard
                    title="Vyšší zapojení"
                    text="Žáci, škola i komunita získají důvod s programem dále pracovat."
                  />
                  <InfoCard
                    title="Silnější hodnota pro školu"
                    text="Portál působí jako prostředí pro činnost, ne jen jako přehled vysílání."
                  />
                  <InfoCard
                    title="Obsah pro síť a marketing"
                    text="Výstupy projektů mohou později vytvářet přirozený obsah pro další komunikaci."
                  />
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
                Další kroky až ve chvíli, kdy budeš spokojený s texty a strukturou.
              </div>

              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                {nextStepCards.map((item) => (
                  <SideInfoCard key={item.title} title={item.title} text={item.text} />
                ))}
              </div>

              <Link
                href="/portal/komunita"
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
                Přejít do Komunity
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
                  Nejdřív nech tuto sekci jako bezpečnou obsahovou vrstvu. Až potom případně
                  doplníme přihlášení do projektů, uploady, galerii nebo správu přes admin.
                </div>
              </div>
            </aside>
          </div>

          <style jsx>{`
            .projects-main-grid {
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

            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 14px;
            }

            @media (max-width: 1080px) {
              .projects-main-grid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 900px) {
              .info-grid {
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

function InfoCard({ title, text }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2, color: "#0f172a" }}>
        {title}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(15,23,42,0.72)",
        }}
      >
        {text}
      </div>
    </div>
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
