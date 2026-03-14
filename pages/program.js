import Link from "next/link";
import { useEffect, useState } from "react";

const PROGRAM_POSTERS = Array.from({ length: 30 }, (_, i) => `/pl${i + 1}.webp`);

const schoolItems = [
  {
    title: "I. stupeň – Objevujeme svět",
    text: "poznávání světa, přírody a společnosti ve spolupráci s odborníky a inspirativními partnery",
  },
  {
    title: "II. stupeň – Svět v souvislostech",
    text: "aktuální témata společnosti, veřejného prostoru, Evropy a života kolem nás",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "setkání s lidmi z praxe a inspirace pro další studium i životní směřování",
  },
  {
    title: "Wellbeing – Generace Z navigátor",
    text: "duševní zdraví, bezpečné klima ve třídě a témata důležitá pro dnešní žáky",
  },
];

const seniorItems = [
  {
    title: "Senior klub",
    text: "setkání a rozhovory s inspirativními hosty, například prof. Janem Pirkem nebo Viktorem Špačkem",
  },
  {
    title: "Čtenářský klub",
    text: "společné čtení a živé debaty s autory knih",
  },
  {
    title: "Akademie třetího věku",
    text: "digitální gramotnost, zdraví a orientace v současném světě",
    note: "připravujeme",
  },
];

const communityItems = [
  {
    title: "Vzdělávání dobrovolných hasičů",
    text: "praktický obsah a online vstupy využitelné pro místní jednotky i vedení obce",
  },
  {
    title: "Smart City klub",
    text: "program pro deváťáky a mladé lidi, kteří chtějí přemýšlet o budoucnosti své obce",
  },
  {
    title: "Servis pro zastupitele a komunitu",
    text: "sdílení dobré praxe, inspirace a témata pro rozvoj obce a komunitního života",
  },
];

const cultureItems = [
  {
    title: "Filmový klub s Aerofilms",
    text: "výběr kvalitních filmů s úvodem hostů a možností společného zážitku v obci",
  },
  {
    title: "Mimořádné tematické vstupy",
    text: "výročí, aktuální události, sezónní programy a speciální hosté",
  },
];

const priceCards = [
  {
    title: "Program pro školu a obec",
    price: "2 890 Kč",
    suffix: "/ měsíc",
    badge: "doporučená varianta",
    description:
      "Pravidelný vzdělávací a komunitní program pro školu i obec během celého roku.",
    items: [
      "živá vysílání pro školy",
      "program pro seniory a komunitu",
      "přístup k archivu vysílání",
    ],
  },
  {
    title: "Škola",
    price: "1 990 Kč",
    suffix: "/ měsíc",
    badge: "samostatný formát",
    description:
      "Samostatný vzdělávací formát pro školu se zaměřením na živé vstupy a práci s třídou.",
    items: [
      "živá vysílání pro I. a II. stupeň",
      "vhodné i jako startovní varianta",
      "pravidelný obsah během školního roku",
    ],
  },
  {
    title: "Senior klub",
    price: "490 Kč",
    suffix: "/ vstup",
    badge: "pro seniory",
    description:
      "Jednorázový vstup do Senior klubu s inspirativním hostem a společným setkáním.",
    items: [
      "rychlá cesta, jak si formát vyzkoušet",
      "vhodné i pro menší obce a komunitní skupiny",
    ],
  },
  {
    title: "Komunitní program",
    price: "490 Kč",
    suffix: "/ vstup",
    badge: "pro komunitu",
    description:
      "Jednorázový komunitní nebo tematický program pro veřejnost, spolky a místní setkávání.",
    items: [
      "kulturní a komunitní rozměr",
      "mimořádné tematické vstupy a speciály",
    ],
  },
];

function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div
      style={{
        maxWidth: 840,
        margin: center ? "0 auto 28px" : "0 0 28px",
        textAlign: center ? "center" : "left",
      }}
    >
      {eyebrow ? (
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 999,
            background: "#eef2ff",
            color: "#1e3a8a",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>
      ) : null}

      <h2
        style={{
          margin: 0,
          fontSize: "clamp(30px, 4vw, 48px)",
          lineHeight: 1.08,
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>

      {text ? (
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 18,
            lineHeight: 1.7,
            color: "#475569",
          }}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        background: "#0f172a",
        color: "#fff",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        boxShadow: "0 14px 34px rgba(15,23,42,0.16)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        background: "#fff",
        color: "#0f172a",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        border: "1px solid #cbd5e1",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {children}
    </Link>
  );
}

function TertiaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        background: "#eef2ff",
        color: "#1e3a8a",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 16,
        border: "1px solid #c7d2fe",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {children}
    </Link>
  );
}

function SeniorButton({ href, children }) {
  return (
    <Link
      href={href}
      className="senior-cta"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
        color: "#9a3412",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 16,
        border: "1px solid #fdba74",
        boxShadow: "0 10px 24px rgba(154,52,18,0.08)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
      }}
    >
      {children}
    </Link>
  );
}

function ProgramCard({ color, title, intro, items }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${color}33`,
        borderRadius: 24,
        padding: 28,
        boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          marginBottom: 14,
        }}
      >
        {title}
      </div>

      <p
        style={{
          margin: "0 0 18px",
          fontSize: 17,
          lineHeight: 1.65,
          color: "#334155",
        }}
      >
        {intro}
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {items.map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: color,
                marginTop: 9,
                flex: "0 0 auto",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                  fontSize: 16,
                  lineHeight: 1.45,
                }}
              >
                {item.title}
                {item.note ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontWeight: 700,
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    ({item.note})
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  marginTop: 2,
                  color: "#475569",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ image, title, text, reverse = false }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 28,
        alignItems: "center",
        marginTop: 34,
      }}
      className={reverse ? "feature-row reverse" : "feature-row"}
    >
      <div style={{ order: reverse ? 2 : 1 }}>
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            display: "block",
            borderRadius: 24,
            objectFit: "cover",
            boxShadow: "0 18px 44px rgba(15,23,42,0.10)",
          }}
        />
      </div>

      <div style={{ order: reverse ? 1 : 2 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.15,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 18,
            lineHeight: 1.75,
            color: "#475569",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function VideoCard({ title, subtitle, src }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 14px 36px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ aspectRatio: "16 / 9", background: "#e5e7eb" }}>
        <iframe
          width="100%"
          height="100%"
          src={src}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.35,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 15,
            lineHeight: 1.6,
            color: "#64748b",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function PriceCard({ title, price, suffix, badge, description, items, featured }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: 28,
        border: featured ? "2px solid #2563eb" : "1px solid #e2e8f0",
        boxShadow: featured
          ? "0 18px 46px rgba(37,99,235,0.12)"
          : "0 14px 36px rgba(15,23,42,0.06)",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: 34,
          padding: "0 14px",
          borderRadius: 999,
          background: featured ? "#2563eb" : "#f1f5f9",
          color: featured ? "#fff" : "#334155",
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 18,
        }}
      >
        {badge}
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: 21,
          lineHeight: 1.25,
          color: "#0f172a",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 32,
            lineHeight: 1,
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "-0.03em",
          }}
        >
          {price}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 3,
          }}
        >
          {suffix}
        </div>
      </div>

      <p
        style={{
          margin: "16px 0 0",
          color: "#475569",
          fontSize: 16,
          lineHeight: 1.65,
        }}
      >
        {description}
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {items.map((item) => (
          <div key={item} style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#2563eb",
                marginTop: 8,
                flex: "0 0 auto",
              }}
            />
            <div
              style={{
                color: "#334155",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProgramPage() {
  const [activePoster, setActivePoster] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isPaused) return undefined;

    const interval = setInterval(() => {
      setIsVisible(false);

      const timeout = setTimeout(() => {
        setActivePoster((prev) => (prev + 1) % PROGRAM_POSTERS.length);
        setIsVisible(true);
      }, 350);

      return () => clearTimeout(timeout);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <>
      <main
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "42px 20px 90px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <section
            style={{
              background: "#fff",
              borderRadius: 30,
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
              overflow: "hidden",
              padding: 0,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.02fr 1fr",
                alignItems: "stretch",
              }}
              className="hero-grid"
            >
              <div style={{ padding: "42px 42px 38px" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "#eef2ff",
                    color: "#1e3a8a",
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 18,
                  }}
                >
                  Živý program pro školy a obce
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(36px, 5vw, 62px)",
                    lineHeight: 1.02,
                    color: "#0f172a",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Program pro školy,
                  <br />
                  seniory a komunitu obce
                </h1>

                <p
                  style={{
                    margin: "22px 0 0",
                    fontSize: 20,
                    lineHeight: 1.75,
                    color: "#334155",
                    maxWidth: 620,
                  }}
                >
                  ARCHIMEDES Live propojuje školu, seniory a komunitní život obce.
                  Během roku přináší živá vysílání, inspirativní hosty a tematické
                  programy pro různé generace.
                </p>

                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 18,
                    lineHeight: 1.72,
                    color: "#475569",
                    maxWidth: 620,
                  }}
                >
                  Jednoduchý způsob, jak dát obci pravidelný vzdělávací a komunitní
                  program.
                </p>

                <p
                  style={{
                    margin: "18px 0 0",
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "#64748b",
                    maxWidth: 620,
                  }}
                >
                  Program vzniká ve spolupráci se školami, obcemi a partnery
                  zapojenými do sítě ARCHIMEDES.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(220px, max-content))",
                    gap: 14,
                    marginTop: 30,
                    alignItems: "stretch",
                  }}
                  className="hero-cta-grid"
                >
                  <PrimaryButton href="/demo">Mám zájem o demo</PrimaryButton>

                  <SecondaryButton href="#zapojeni">Jak se zapojit</SecondaryButton>

                  <TertiaryButton href="/financovani-skoly">
                    Pro školy – financování z OP JAK
                  </TertiaryButton>

                  <SeniorButton href="/poptavka">
                    Senior klub - registrace
                  </SeniorButton>
                </div>
              </div>

              <div
                style={{
                  minHeight: 420,
                  background: "#e2e8f0",
                }}
              >
                <Link
                  href="/vysilani"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  className="program-poster-hero"
                  style={{
                    position: "relative",
                    display: "block",
                    width: "100%",
                    height: "100%",
                    minHeight: 420,
                    overflow: "hidden",
                    textDecoration: "none",
                    background: "#dbe4f0",
                  }}
                >
                  <img
                    src={PROGRAM_POSTERS[activePoster]}
                    alt={`Ukázka programu ARCHIMEDES Live ${activePoster + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                      opacity: isVisible ? 1 : 0.12,
                      transition: "opacity 0.55s ease",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      left: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(15, 23, 42, 0.72)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 800,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Ukázky z programu
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      left: 18,
                      bottom: 18,
                      right: 18,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.90)",
                        color: "#0f172a",
                        fontSize: 14,
                        fontWeight: 800,
                        boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
                      }}
                    >
                      Proběhlá vysílání
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 14px",
                        borderRadius: 999,
                        background: "rgba(23, 59, 119, 0.88)",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 800,
                        boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
                      }}
                    >
                      Zobrazit galerii
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <section style={{ marginTop: 72 }}>
            <SectionTitle
              title="Hlavní rubriky programu"
              text="Program ARCHIMEDES Live propojuje školu, seniory i komunitní život obce. Během roku přináší živá vysílání, inspirativní hosty a tematické formáty, které mohou školy i obce pravidelně využívat."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 22,
                marginTop: 24,
              }}
              className="program-grid"
            >
              <ProgramCard
                color="#3b82f6"
                title="Pro školy"
                intro="Pravidelný program pro výuku, který přináší inspirativní témata a hosty z praxe."
                items={schoolItems}
              />
              <ProgramCard
                color="#f59e0b"
                title="Pro seniory a aktivní stárnutí"
                intro="Klidný, srozumitelný a lidský formát, který vytváří pravidelná setkávání a dává obci další přirozený program."
                items={seniorItems}
              />
              <ProgramCard
                color="#22c55e"
                title="Pro komunitu a rozvoj obce"
                intro="Program, který propojuje školu, obec a místní komunitu a dává vedení obce konkrétní obsah pro celý rok."
                items={communityItems}
              />
              <ProgramCard
                color="#a855f7"
                title="Letní speciál a kultura"
                intro="Kulturní a sezónní formáty, které z programu dělají i společenskou a komunitní událost."
                items={cultureItems}
              />
            </div>
          </section>

          <section style={{ marginTop: 78 }}>
            <SectionTitle
              eyebrow="Interaktivní ARCHIMEDES Live v praxi"
              title="Živý program, který baví"
              text="ARCHIMEDES Live je pravidelný program, který přináší do školy i obce energii, témata a posiluje komunitu."
            />

            <FeatureRow
              image="/komunita.jpg"
              title="Pro školy, které chtějí děti opravdu vtáhnout do dění"
              text="Program pro školy staví na tématech, která žáky baví a pomáhají jim vnímat svět v souvislostech. Díky živým vstupům, hostům z praxe a aktuálním tématům získává výuka větší energii, přirozenou pozornost i prostor pro otázky."
            />

            <FeatureRow
              image="/program-seniori.jpg"
              title="Pro seniory, kteří chtějí zůstat v kontaktu, aktivní a spolu"
              text="Senior klub a navazující formáty dávají obci pravidelný program pro starší generaci. Vzniká prostor pro setkávání, rozhovory, inspiraci i sdílení témat, která mají smysl pro každodenní život."
              reverse
            />

            <FeatureRow
              image="/program-vysilani.webp"
              title="Jedno místo, odkud program běží do školy i celé komunity"
              text="Program může obec využívat jako živé vysílání, společné promítání i navazující komunitní setkání. Díky tomu vzniká jednoduchý a přehledný model, který je srozumitelný pro školu, obec i veřejnost."
            />
          </section>

          <section style={{ marginTop: 84 }}>
            <SectionTitle
              eyebrow="Ukázky vysílání"
              title="Jak vypadá ARCHIMEDES Live naživo"
              text="Krátké ukázky z reálných vysílání pomáhají rychle pochopit atmosféru, formát i možnosti programu."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 22,
                marginTop: 24,
              }}
              className="video-grid"
            >
              <VideoCard
                title="Ukázka vysílání pro školy"
                subtitle="ZOO Praha – výukový vstup pro školní program"
                src="https://www.youtube.com/embed/yvelfGeL6Jg"
              />
              <VideoCard
                title="Angličtina s rodilým mluvčím"
                subtitle="Paul Wade – ukázka živého vstupu"
                src="https://www.youtube.com/embed/bX2y0Uxw-Dg"
              />
              <VideoCard
                title="Senior klub"
                subtitle="Prof. Jan Pirk a spisovatel Viktor Špaček"
                src="https://www.youtube.com/embed/-VV3PYdWPUo"
              />
            </div>
          </section>

          <section id="zapojeni" style={{ marginTop: 84 }}>
            <SectionTitle
              eyebrow="Zapojení do programu"
              title="Jak se škola nebo obec může zapojit"
              text="Cena je součástí programu. Smyslem je, aby škola i obec rychle pochopily, jaké formáty mohou využívat a co v programu získají."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 22,
                marginTop: 24,
              }}
              className="price-grid"
            >
              {priceCards.map((card, idx) => (
                <PriceCard key={card.title} {...card} featured={idx === 0} />
              ))}
            </div>
          </section>

          <section
            style={{
              marginTop: 86,
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 28,
              padding: "34px 30px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              boxShadow: "0 24px 60px rgba(15,23,42,0.20)",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                Nejlepší způsob, jak program poznat, je vidět ho naživo
              </h2>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 18,
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Krátká ukázka během několika minut ukáže, jak může ARCHIMEDES Live
                obohatit školu i komunitní život obce.
              </p>
            </div>

            <PrimaryButton href="/demo">Mám zájem o demo</PrimaryButton>
          </section>
        </div>
      </main>

      <style jsx>{`
        .hero-cta-grid :global(a) {
          width: 100%;
        }

        .hero-cta-grid :global(a:hover) {
          transform: translateY(-1px);
        }

        .hero-cta-grid :global(.senior-cta:hover) {
          box-shadow: 0 16px 30px rgba(154, 52, 18, 0.14);
          background: linear-gradient(135deg, #fff1e6 0%, #fed7aa 100%);
        }

        @media (max-width: 1100px) {
          .program-grid,
          .price-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .video-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-grid,
          .feature-row {
            grid-template-columns: 1fr !important;
          }

          .feature-row.reverse > div {
            order: initial !important;
          }

          .program-poster-hero {
            min-height: 380px !important;
          }

          .hero-cta-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 760px) {
          .program-grid,
          .price-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-grid > div:first-child {
            padding: 30px 22px 26px !important;
          }

          .program-poster-hero {
            min-height: 320px !important;
          }

          .hero-cta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
