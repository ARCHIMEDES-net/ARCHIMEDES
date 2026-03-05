// pages/index.js
import { useState } from "react";
import Link from "next/link";

const MAX_WIDTH = 1100;

function Section({ id, eyebrow, title, subtitle, children, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <section
      id={id}
      style={{
        padding: "64px 16px",
        background: isDark ? "#0b1220" : "transparent",
        color: isDark ? "white" : "inherit",
      }}
    >
      <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
        {eyebrow ? (
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 13,
              letterSpacing: 0.2,
              background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)",
              border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.06)",
              marginBottom: 14,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} />
            <span style={{ opacity: isDark ? 0.9 : 0.8 }}>{eyebrow}</span>
          </div>
        ) : null}

        {title ? (
          <h2
            style={{
              fontSize: 34,
              lineHeight: 1.15,
              margin: 0,
              marginBottom: subtitle ? 12 : 0,
              letterSpacing: -0.2,
            }}
          >
            {title}
          </h2>
        ) : null}

        {subtitle ? (
          <p
            style={{
              margin: 0,
              maxWidth: 760,
              fontSize: 17,
              lineHeight: 1.6,
              opacity: isDark ? 0.85 : 0.75,
            }}
          >
            {subtitle}
          </p>
        ) : null}

        <div style={{ marginTop: 26 }}>{children}</div>
      </div>
    </section>
  );
}

function Card({ children, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <div
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "white",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: 18,
        padding: 18,
        boxShadow: isDark ? "none" : "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function ButtonLink({ href, label, variant = "primary" }) {
  const primary = variant === "primary";
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        textDecoration: "none",
        padding: "12px 14px",
        borderRadius: 14,
        fontWeight: 650,
        fontSize: 15,
        border: primary ? "1px solid rgba(0,0,0,0.85)" : "1px solid rgba(0,0,0,0.12)",
        background: primary ? "rgba(0,0,0,0.92)" : "white",
        color: primary ? "white" : "rgba(0,0,0,0.9)",
        boxShadow: primary ? "0 14px 40px rgba(0,0,0,0.22)" : "0 10px 24px rgba(0,0,0,0.06)",
      }}
    >
      <span>{label}</span>
      <span aria-hidden style={{ opacity: 0.9 }}>
        →
      </span>
    </Link>
  );
}

function Pill({ text, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 13,
        border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.10)",
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        opacity: isDark ? 0.92 : 0.85,
      }}
    >
      {text}
    </span>
  );
}

function EndorsementsModal({ open, onClose, items }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dokumenty záštit"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 100%)",
          maxHeight: "86vh",
          overflow: "auto",
          background: "white",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 22px 70px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Záštity – dokumenty</div>
            <div style={{ opacity: 0.7, marginTop: 2, fontSize: 13 }}>
              Náhledy dokumentů záštit uvedených na webu.
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            Zavřít ✕
          </button>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          {items.map((it) => (
            <div
              key={it.key}
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                padding: 12,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{it.title}</div>
                  <div style={{ opacity: 0.75, marginTop: 4, lineHeight: 1.5 }}>{it.subtitle}</div>
                </div>

                <a
                  href={it.imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    alignSelf: "center",
                    textDecoration: "none",
                    fontWeight: 750,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    padding: "10px 12px",
                    color: "rgba(0,0,0,0.9)",
                  }}
                >
                  Otevřít ve větším →
                </a>
              </div>

              <div style={{ marginTop: 10 }}>
                <img
                  src={it.imgUrl}
                  alt={it.alt || it.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "white",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 16px 16px", opacity: 0.65, fontSize: 12, lineHeight: 1.6 }}>
          Tip: Na homepage ukazujeme jen stručné „trust badges“. Detailní skeny jsou v modalu po kliknutí.
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [endorsementsOpen, setEndorsementsOpen] = useState(false);

  const endorsementsDocs = [
    {
      key: "mpo",
      title: "Záštita Ministerstva průmyslu a obchodu (MPO)",
      subtitle: "Dokument záštity – náhled.",
      imgUrl:
        "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000182-a2f4fa2f53/zastita%20MPO.jpeg?ph=fb18f7b042",
      alt: "Záštita MPO pro projekt ARCHIMEDES",
    },
    {
      key: "mzp",
      title: "Záštita Ministerstva životního prostředí (MŽP)",
      subtitle: "Dokument záštity – náhled.",
      imgUrl:
        "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000256-b95eab95ec/za%CC%81s%CC%8Ctita%20-%20ARCHIMEDES_Stra%CC%81nka_2.jpeg?ph=fb18f7b042",
      alt: "Záštita MŽP pro projekt ARCHIMEDES",
    },
    {
      key: "mmr",
      title: "Záštita Ministerstva pro místní rozvoj (MMR)",
      subtitle: "Dokument záštity – náhled.",
      imgUrl:
        "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000260-cf481cf483/IMG_9784.jpeg?ph=fb18f7b042",
      alt: "Záštita MMR pro projekt ARCHIMEDES",
    },
  ];

  const trustBadges = [
    "Záštita Evy Pavlové",
    "Záštita MPO",
    "Záštita MŽP",
    "Záštita MMR",
    "Síť učeben v ČR",
    "Hosté z praxe",
    "Pracovní listy",
    "Živé vstupy",
  ];

  const guests = [
    { name: "Inspirativní hosté", role: "věda • kultura • řemesla • bezpečnost • wellbeing" },
    { name: "Odborníci z praxe", role: "krátké a srozumitelné vstupy do výuky" },
    { name: "Osobnosti pro komunitu", role: "program i pro dospělé a seniory v obci" },
  ];

  const sampleProgram = [
    { when: "Týden 1", what: "Živý vstup pro 1. stupeň + pracovní list" },
    { when: "Týden 2", what: "Živý vstup pro 2. stupeň + pracovní list" },
    { when: "Týden 3", what: "Komunitní program (např. senior / rodiče / spolek)" },
    { when: "Týden 4", what: "Bonus: záznamy + inspirace + materiály k tématu" },
  ];

  const benefits = [
    { t: "Pro školu", d: "Hotový program do výuky. Živí hosté. Materiály. Jednoduché použití." },
    { t: "Pro obec", d: "Smysluplný program pro komunitu. Prestiž. Propojení generací." },
    { t: "Pro učitele", d: "Méně příprav, více kvality. Pracovní listy a ověřený scénář hodiny." },
    { t: "Pro děti", d: "Zážitková výuka a kontakt s reálným světem. Motivace a zvídavost." },
  ];

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* Hlavičku řeší pages/_app.js (PublicHeader) */}

      {/* HERO */}
      <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: "74px 16px 34px" }}>
        <div
          style={{
            display: "inline-flex",
            gap: 10,
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.8)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
            marginBottom: 18,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 99, background: "#22c55e" }} />
          <span style={{ fontSize: 13, opacity: 0.75 }}>
            ARCHIMEDES Live = živý vzdělávací program pro školy a komunitu obce
          </span>
        </div>

        <h1 style={{ fontSize: 46, lineHeight: 1.08, margin: 0, letterSpacing: -0.3 }}>
          Živý program pro školy
          <br />
          a komunitu obce
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.65, opacity: 0.78, marginTop: 16, maxWidth: 820 }}>
          Každý měsíc hotový obsah: <b>živé vstupy s hosty</b>, <b>pracovní listy</b>, a{" "}
          <b>program pro komunitu</b>. Vše jednoduše v kalendáři. Produkt není technologie – je to{" "}
          <b>program</b>.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <ButtonLink href="/poptavka" label="Chci ukázkovou hodinu" variant="primary" />
          <ButtonLink href="/program" label="Prohlédnout program" variant="secondary" />
          <ButtonLink href="/cenik" label="Ceník" variant="secondary" />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <Pill text="1 třída → 1 živý vstup → 1 pracovní list" />
          <Pill text="Ředitel iniciuje • starosta často platí" />
          <Pill text="Síť učeben + online program" />
        </div>
      </div>

      {/* DŮVĚRA */}
      <Section
        id="duvera"
        eyebrow="Důvěra"
        title="Záštity, ocenění a reálné reference"
        subtitle="Krátká sekce pro starostu i ředitele: proč tomu věřit a proč to dává smysl."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 750, marginBottom: 10 }}>
                Rychlé důvody důvěry
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {trustBadges.map((t) => (
                  <Pill key={t} text={t} />
                ))}
              </div>

              <div style={{ marginTop: 14, opacity: 0.75, lineHeight: 1.6, fontSize: 15 }}>
                Záštity uvádíme přehledně a bez omáčky. Kdo chce, otevře si dokumenty přímo zde.
              </div>

              <button
                onClick={() => setEndorsementsOpen(true)}
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  padding: "12px 14px",
                  fontWeight: 850,
                  cursor: "pointer",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                }}
              >
                Zobrazit dokumenty záštit →
              </button>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 750, marginBottom: 10 }}>
                Nejrychlejší cesta k rozhodnutí
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.92)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                    }}
                  >
                    1
                  </div>
                  <div style={{ lineHeight: 1.45 }}>
                    <b>Ukázková hodina</b> (online) – uvidíte, jak to vypadá v praxi.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                    }}
                  >
                    2
                  </div>
                  <div style={{ lineHeight: 1.45 }}>
                    Vybereme variantu pro <b>školu</b> a <b>obec</b>.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: "rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                    }}
                  >
                    3
                  </div>
                  <div style={{ lineHeight: 1.45 }}>
                    Dostanete přístup do <b>kalendáře programu</b> + materiály.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <ButtonLink href="/poptavka" label="Domluvit ukázkovou hodinu" variant="primary" />
              </div>
            </Card>
          </div>
        </div>

        <EndorsementsModal
          open={endorsementsOpen}
          onClose={() => setEndorsementsOpen(false)}
          items={endorsementsDocs}
        />
      </Section>

      {/* JAK FUNGUJE HODINA */}
      <Section
        id="hodina"
        eyebrow="Jak to funguje"
        title="Jedna hodina v praxi: 1 třída → 1 živý vstup → 1 pracovní list"
        subtitle="Jednoduché. V kalendáři vyberete vstup, kliknete na odkaz, a po hodině použijete pracovní list."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 4" }}>
            <Card>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>1) Připravíte se</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                V kalendáři zvolíte událost. Učitel ví předem, o čem hodina je. Děti se naladí.
              </div>
            </Card>
          </div>
          <div style={{ gridColumn: "span 4" }}>
            <Card>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>2) Živý vstup s hostem</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                Online vstup (Google Meet). Krátké, svižné, interaktivní. Přesně pro školní prostředí.
              </div>
            </Card>
          </div>
          <div style={{ gridColumn: "span 4" }}>
            <Card>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>3) Pracovní list</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                Upevnění učiva a navazující aktivita. Materiály jsou připravené, nemusíte je složitě tvořit.
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* HOSTÉ */}
      <Section
        id="hoste"
        eyebrow="Hosté"
        title="Obsah stojí na lidech z praxe"
        subtitle="Hosté jsou to, co děti vtáhne. Škola získá kvalitní výuku a obec atraktivní komunitní program."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {guests.map((g) => (
            <div key={g.name} style={{ gridColumn: "span 4" }}>
              <Card>
                <div style={{ fontSize: 16, fontWeight: 850 }}>{g.name}</div>
                <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>{g.role}</div>
                <div style={{ marginTop: 14 }}>
                  <Pill text="krátké vstupy" />
                  <span style={{ marginLeft: 8 }} />
                  <Pill text="srozumitelné" />
                </div>
              </Card>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <ButtonLink href="/program" label="Podívat se na program" variant="secondary" />
        </div>
      </Section>

      {/* PROGRAM */}
      <Section
        id="program"
        eyebrow="Program"
        title="Kalendář jako přehled programu – ale interaktivně"
        subtitle="Program je přehledný, navazuje na školní výuku a má i komunitní rozměr."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card>
              <div style={{ fontWeight: 850, marginBottom: 10 }}>Ukázka měsíčního rytmu</div>
              <div style={{ display: "grid", gap: 10 }}>
                {sampleProgram.map((x) => (
                  <div
                    key={x.when}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "baseline",
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ width: 78, fontWeight: 850 }}>{x.when}</div>
                    <div style={{ opacity: 0.85 }}>{x.what}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontWeight: 850, marginBottom: 10 }}>Co získáte v praxi</div>
              <div style={{ display: "grid", gap: 10 }}>
                {benefits.map((b) => (
                  <div
                    key={b.t}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontWeight: 850 }}>{b.t}</div>
                    <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.55 }}>{b.d}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ButtonLink href="/program" label="Otevřít program" variant="primary" />
                <ButtonLink href="/poptavka" label="Chci ukázku" variant="secondary" />
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* ARCHIV */}
      <Section
        id="archiv"
        eyebrow="Archiv"
        title="Záznamy pro předplatitele"
        subtitle="Když se třída nemůže připojit živě, záznamy jsou k dispozici v neveřejném archivu pro registrované."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 850, marginBottom: 8 }}>Proč je archiv důležitý</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8, lineHeight: 1.75 }}>
                <li>Škola nepřijde o obsah ani při změně rozvrhu</li>
                <li>Učitel si může udělat „druhou“ hodinu podle potřeby</li>
                <li>Obec může využít vybrané komunitní záznamy</li>
              </ul>
            </Card>
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 850, marginBottom: 8 }}>Přístup</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                Archiv je součástí přístupu do portálu pro registrované. Navenek ukazujeme jen ukázku programu – záznamy
                jsou neveřejné.
              </div>
              <div style={{ marginTop: 14 }}>
                <ButtonLink href="/portal" label="Vstoupit do portálu" variant="secondary" />
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* PRACOVNÍ LISTY */}
      <Section
        id="pracovni-listy"
        eyebrow="Pracovní listy"
        title="Materiály, které učiteli šetří čas"
        subtitle="Ke vstupům dodáváme pracovní listy a navazující aktivity. Učitel má v ruce hotový scénář."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 4" }}>
            <Card>
              <div style={{ fontWeight: 850 }}>Hotové a použitelné</div>
              <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>
                Vhodné pro běžnou hodinu i suplování. Přehledné a srozumitelné.
              </div>
            </Card>
          </div>
          <div style={{ gridColumn: "span 4" }}>
            <Card>
              <div style={{ fontWeight: 850 }}>Navazuje na živý vstup</div>
              <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>
                Děti si upevní učivo a přenesou ho do praxe.
              </div>
            </Card>
          </div>
          <div style={{ gridColumn: "span 4" }}>
            <Card>
              <div style={{ fontWeight: 850 }}>Lze archivovat</div>
              <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>
                Škola si tvoří vlastní banku materiálů podle ročníků.
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* MAPA / SÍŤ UČEBEN */}
      <Section
        id="sit-uceben"
        eyebrow="Síť učeben"
        title="Mapa učeben a škol v síti ARCHIMEDES"
        subtitle="Unikátní prvek: propojení fyzických míst s online programem. Dává to důvěru i komunitní rozměr."
      >
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Síť učeben / škol</div>
              <div style={{ opacity: 0.78, marginTop: 6, lineHeight: 1.6 }}>
                V portálu už máte hotovou mapu a databázi škol. Zde na homepage ukazujeme přehled a odkaz do detailu.
              </div>
            </div>
            <ButtonLink href="/portal/skoly" label="Zobrazit mapu učeben" variant="primary" />
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 16,
              border: "1px dashed rgba(0,0,0,0.18)",
              background: "rgba(0,0,0,0.02)",
              padding: 16,
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          >
            Později sem můžeme dát i preview (např. 3 školy jako karty) nebo statický obrázek mapy.
          </div>
        </Card>
      </Section>

      {/* KOMUNITA */}
      <Section
        id="komunita"
        eyebrow="Komunita"
        title="Program není jen pro školu"
        subtitle="Obec získá obsah i pro dospělé, seniory a spolky. To je klíčový rozdíl proti čistě školním řešením."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Co může obec využít</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8, lineHeight: 1.75 }}>
                <li>komunitní online programy (např. senior / rodiče / wellbeing)</li>
                <li>propojení spolků a místních aktérů</li>
                <li>síť škol a učeben jako „dobrá praxe“</li>
              </ul>
            </Card>
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Propojení generací</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                Jedním předplatným může obec podpořit školu a zároveň nabídnout program i veřejnosti. Vzniká přirozený
                komunitní efekt – a to je pro starostu silný argument.
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* FINANCOVÁNÍ */}
      <Section
        id="financovani"
        eyebrow="Financování"
        title="Jak to obvykle školy a obce financují"
        subtitle="Jednoduchá, srozumitelná formulace. Detailní argumentaci můžeme dát na samostatnou stránku."
      >
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
            <div style={{ gridColumn: "span 7" }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Základní logika pro rozhodování</div>
              <div style={{ marginTop: 10, opacity: 0.8, lineHeight: 1.7 }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Ředitel řeší přínos pro výuku a učitele (program + materiály).</li>
                  <li>Starosta řeší přínos pro komunitu (obsah pro obec + prestiž + síť učeben).</li>
                  <li>Financování často kombinuje školní a obecní rozpočet (podle domluvy v obci).</li>
                </ul>
              </div>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Chci to vysvětlit konkrétně</div>
              <div style={{ marginTop: 10, opacity: 0.8, lineHeight: 1.7 }}>
                Připravíme vám krátký call a ukážeme nejčastější modely financování (včetně variant pro školy a obce).
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ButtonLink href="/poptavka" label="Domluvit konzultaci" variant="primary" />
                <ButtonLink href="/cenik" label="Ceník" variant="secondary" />
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* CTA – DARK */}
      <Section
        id="cta"
        tone="dark"
        eyebrow="Další krok"
        title="Chcete ukázkovou hodinu?"
        subtitle="Nejrychlejší způsob, jak to uchopit: ukážeme jednu reálnou hodinu, a hned bude jasno, jak to zapadne do školy i obce."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card tone="dark">
              <div style={{ fontWeight: 900, fontSize: 16 }}>Co vám ukážeme</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, opacity: 0.9, lineHeight: 1.75 }}>
                <li>jak vypadá živý vstup s hostem</li>
                <li>jak funguje kalendář programu</li>
                <li>jak vypadá pracovní list a návaznost</li>
                <li>jak se do toho zapojí obec a komunita</li>
              </ul>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card tone="dark">
              <div style={{ fontWeight: 900, fontSize: 16 }}>Domluvit ukázku</div>
              <div style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.7 }}>
                Stačí nám napsat. Ozveme se a nastavíme nejvhodnější variantu pro vaši školu a obec.
              </div>
              <div style={{ marginTop: 14 }}>
                <Link
                  href="/poptavka"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 14,
                    textDecoration: "none",
                    fontWeight: 750,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.10)",
                    color: "white",
                  }}
                >
                  <span>Chci ukázkovou hodinu</span>
                  <span aria-hidden>→</span>
                </Link>

                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                  Pozn.: V textu nikde nepoužíváme „televize“ – vždy „živý program / živé vstupy“.
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 26, opacity: 0.65, fontSize: 13 }}>
          © {new Date().getFullYear()} ARCHIMEDES Live
        </div>
      </Section>
    </div>
  );
}
