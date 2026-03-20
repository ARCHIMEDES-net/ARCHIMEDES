import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/ceny.webp";

const team = [
  {
    name: "Antonín Koplík",
    role: "Jednatel společnosti",
    email: "antonin.koplik@eduvision.cz",
    phone: "",
    note: "Strategie, partnerství, rozvoj",
  },
  {
    name: "Roman Tuzar",
    role: "Ředitel pro strategická partnerství",
    email: "roman.tuzar@eduvision.cz",
    phone: "+420 736 457 835",
    note: "Spolupráce s institucemi, partnery a organizacemi",
  },
  {
    name: "Dominik Ševčík",
    role: "Výkonný ředitel",
    email: "dominik.sevcik@eduvision.cz",
    phone: "+420 735 104 449",
    note: "Realizace učeben, technické řešení",
  },
  {
    name: "Martina Lačňáková",
    role: "Manažerka zakázek",
    email: "martina.lacnakova@eduvision.cz",
    phone: "+420 732 827 210",
    note: "Obchodní komunikace, poptávky, zakázky",
  },
  {
    name: "Natálie Lípová",
    role: "Manažerka programu a obsahu",
    email: "natalie.lipova@archimedeslive.com",
    phone: "+420 737 628 944",
    note: "Program, vysílání, obsah platformy",
  },
  {
    name: "Simona Gavlíková",
    role: "Manažerka komunity a partnerství",
    email: "simona.gavlikova@archimedeslive.com",
    phone: "+420 603 467 337",
    note: "Komunita, spolupráce, partneři",
  },
];

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        background: "#0f172a",
        color: "#fff",
        fontWeight: 800,
        border: "1px solid #0f172a",
        boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 14px 28px rgba(15,23,42,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.14)";
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
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        border: "1px solid rgba(15,23,42,0.14)",
        background: "white",
        color: "#0f172a",
        fontWeight: 800,
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 22px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </Link>
  );
}

function ContactCard({ title, text, value, href }) {
  const body = href ? (
    <a
      href={href}
      style={{
        color: "#0f172a",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 18,
        lineHeight: 1.45,
        wordBreak: "break-word",
      }}
    >
      {value}
    </a>
  ) : (
    <div
      style={{
        color: "#0f172a",
        fontWeight: 800,
        fontSize: 18,
        lineHeight: 1.45,
      }}
    >
      {value}
    </div>
  );

  return (
    <div
      style={{
        background: "white",
        color: "#0f172a",
        borderRadius: 22,
        padding: 24,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      {text ? (
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "rgba(15,23,42,0.68)",
            marginBottom: 14,
          }}
        >
          {text}
        </div>
      ) : null}

      <div>{body}</div>
    </div>
  );
}

function TeamCard({ person }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 22,
        padding: 24,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 18px 34px rgba(15,23,42,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(15,23,42,0.06)";
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
          border: "1px solid rgba(15,23,42,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          marginBottom: 18,
        }}
      >
        👤
      </div>

      <div
        style={{
          fontSize: 22,
          lineHeight: 1.2,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 8,
        }}
      >
        {person.name}
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          color: "#334155",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {person.role}
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: "rgba(15,23,42,0.68)",
          marginBottom: 18,
          minHeight: 48,
        }}
      >
        {person.note}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <a
          href={`mailto:${person.email}`}
          style={{
            textDecoration: "none",
            color: "#173b77",
            fontWeight: 800,
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {person.email}
        </a>

        {person.phone ? (
          <a
            href={`tel:${person.phone.replace(/\s+/g, "")}`}
            style={{
              textDecoration: "none",
              color: "#0f172a",
              fontWeight: 800,
              lineHeight: 1.5,
            }}
          >
            {person.phone}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function KontaktPage() {
  return (
    <>
      <Head>
        <title>Kontakt | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Kontakt na tým projektu ARCHIMEDES Live. Ozvěte se nám kvůli programu pro školy, obce, komunitní spolupráci nebo vzorové učebně."
        />
      </Head>

      <main
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: "#f6f7fb",
          minHeight: "100vh",
          color: "#0f172a",
        }}
      >
        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 16px 32px" }}
        >
          <div className="heroGrid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.06)",
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                ARCHIMEDES Live • kontakt
              </div>

              <h1
                style={{
                  fontSize: 56,
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                  color: "#0f172a",
                  margin: "0 0 18px",
                }}
              >
                Spojte se s týmem
                <br />
                ARCHIMEDES Live
              </h1>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.6,
                  color: "rgba(15,23,42,0.76)",
                  maxWidth: 700,
                  margin: "0 0 24px",
                }}
              >
                Rádi vám představíme program pro školy, obce a komunitu,
                možnosti zapojení i vzorovou učebnu ARCHIMEDES®.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginBottom: 26,
                }}
              >
                <PrimaryButton href="/poptavka">Poslat poptávku</PrimaryButton>
                <SecondaryButton href="/program">Zobrazit program</SecondaryButton>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  maxWidth: 640,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 34,
                      padding: "0 12px",
                      borderRadius: 999,
                      background: "#e8f1ff",
                      color: "#173b77",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    1. místo • OBEC 2030
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 34,
                      padding: "0 12px",
                      borderRadius: 999,
                      background: "#eef2f7",
                      color: "#334155",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    Finalista • E.ON Energy Globe
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.68)",
                  }}
                >
                  ARCHIMEDES Live je postaven na reálných realizacích,
                  zkušenostech z obcí a živém programu pro vzdělávání i komunitní
                  život.
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  position: "relative",
                  borderRadius: 28,
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <img
                  src={heroImg}
                  alt="Ocenění projektu ARCHIMEDES"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16 / 11",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 18,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      width: "fit-content",
                      padding: "9px 14px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.94)",
                      color: "#0f172a",
                      fontSize: 13,
                      fontWeight: 900,
                      boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
                    }}
                  >
                    Oceněný projekt pro školy a obce
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 16px 18px" }}
        >
          <div className="contactGrid">
            <ContactCard
              title="E-mail"
              text="Napište nám kvůli programu, učebně nebo spolupráci."
              value="info@eduvision.cz"
              href="mailto:info@eduvision.cz"
            />
            <ContactCard
              title="Telefon"
              text="Nejrychlejší cesta pro domluvu schůzky nebo ukázky."
              value="+420 732 827 210"
              href="tel:+420732827210"
            />
            <ContactCard
              title="Provozovatel"
              text=""
              value={
                <>
                  EduVision s.r.o.
                  <br />
                  Purkyňova 649/127
                  <br />
                  Medlánky
                  <br />
                  612 00 Brno
                </>
              }
            />
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 12px" }}
        >
          <div style={{ maxWidth: 760, marginBottom: 26 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 12,
              }}
            >
              Tým projektu
            </div>

            <h2
              style={{
                fontSize: 40,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                margin: "0 0 14px",
                color: "#0f172a",
              }}
            >
              Lidé, kteří vám pomohou
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(15,23,42,0.72)",
              }}
            >
              Potřebujete řešit obchod, program, partnerství nebo realizaci
              učebny? Ozvěte se přímo správnému člověku.
            </p>
          </div>

          <div className="teamGrid">
            {team.map((person) => (
              <TeamCard key={person.email} person={person} />
            ))}
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 16px 10px" }}
        >
          <div
            style={{
              borderRadius: 30,
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #173b77 0%, #0f172a 60%, #081120 100%)",
              color: "#fff",
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
            }}
          >
            <div className="ctaGrid" style={{ padding: "34px 30px" }}>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: 34,
                    padding: "0 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 800,
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  Další krok
                </div>

                <h3
                  style={{
                    fontSize: 34,
                    lineHeight: 1.12,
                    letterSpacing: "-0.02em",
                    margin: "0 0 12px",
                    color: "#fff",
                  }}
                >
                  Chcete si domluvit ukázku programu?
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.78)",
                    maxWidth: 700,
                  }}
                >
                  Pošlete poptávku a ozveme se vám s dalším postupem, možností
                  online schůzky nebo návštěvy vzorové učebny.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Link
                  href="/poptavka"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 52,
                    padding: "0 22px",
                    borderRadius: 14,
                    background: "#fff",
                    color: "#0f172a",
                    fontWeight: 900,
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  Odeslat poptávku
                </Link>

                <Link
                  href="/ucebna"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 52,
                    padding: "0 22px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.26)",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  Zobrazit učebnu
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
            gap: 28px;
            align-items: center;
          }

          .contactGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .teamGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .ctaGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 22px;
            align-items: center;
          }

          @media (max-width: 1100px) {
            .heroGrid,
            .ctaGrid {
              grid-template-columns: 1fr;
            }

            .teamGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 860px) {
            .contactGrid,
            .teamGrid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 720px) {
            h1 {
              font-size: 40px !important;
            }

            h2 {
              font-size: 30px !important;
            }

            h3 {
              font-size: 28px !important;
            }

            main :global(section) {
              padding-left: 14px !important;
              padding-right: 14px !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}
