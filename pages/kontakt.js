import Link from "next/link";

const team = [
  {
    name: "Antonín Koplík",
    role: "Jednatel společnosti, autor projektu",
    email: "antonin.koplik@eduvision.cz",
    phone: "",
    photo: "/team/antonin-koplik.jpg",
  },
  {
    name: "Dominik Ševčík",
    role: "Ředitel realizací",
    email: "dominik.sevcik@eduvision.cz",
    phone: "+420 735 104 449",
    photo: "/team/dominik-sevcik.jpg",
  },
  {
    name: "Martina Lačňáková",
    role: "Manažerka zakázek",
    email: "martina.lacnakova@eduvision.cz",
    phone: "+420 732 827 210",
    photo: "/team/martina-lacnakova.jpg",
  },
  {
    name: "Natálie Lípová",
    role: "Manažerka programu a obsahu",
    email: "natalie.lipova@archimedeslive.com",
    phone: "+420 737 628 944",
    photo: "/team/natalie-lipova.jpg",
  },
  {
    name: "Simona Gavlíková",
    role: "Manažerka komunity a partnerství",
    email: "simona.gavlikova@archimedeslive.com",
    phone: "+420 603 467 337",
    photo: "/team/simona-gavlikova.jpg",
  },
];

function TeamPhoto({ person }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: 16,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.08), rgba(31,41,55,0.14))",
        border: "1px solid rgba(17,24,39,0.08)",
        marginBottom: 16,
        position: "relative",
      }}
    >
      <img
        src={person.photo}
        alt={person.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextSibling;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        style={{
          display: "none",
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 16,
          color: "rgba(17,24,39,0.55)",
          textAlign: "center",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "rgba(17,24,39,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 10,
          }}
        >
          👤
        </div>
        <div>Sem doplníme fotografii</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>{person.name}</div>
      </div>
    </div>
  );
}

export default function Kontakt() {
  return (
    <div
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "60px 16px 80px",
          }}
        >
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <h1
              style={{
                margin: "0 0 16px 0",
                fontSize: 52,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Kontakt
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(17,24,39,0.72)",
              }}
            >
              Máte zájem o program ARCHIMEDES Live pro školu nebo obec?
              Ozvěte se nám. Rádi představíme projekt a možnosti zapojení.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginBottom: 50,
            }}
            className="contactGrid"
          >
            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                E-mail
              </h3>
              <p style={{ color: "rgba(0,0,0,0.65)", marginTop: 0 }}>
                Kontaktní e-mail
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>
                info@eduvision.cz
              </p>
            </div>

            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                Telefon
              </h3>
              <p style={{ color: "rgba(0,0,0,0.65)", marginTop: 0 }}>
                Zavolejte nám
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>
                +420 732 827 210
              </p>
            </div>

            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                Adresa
              </h3>
              <p style={{ color: "rgba(0,0,0,0.65)", marginTop: 0 }}>
                EduVision s.r.o.
              </p>
              <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                Purkyňova 649/127
                <br />
                Medlánky
                <br />
                612 00 Brno
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 36,
                marginBottom: 24,
                color: "#111827",
              }}
            >
              Tým projektu
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 18,
              }}
              className="teamGrid"
            >
              {team.map((person) => (
                <div
                  key={person.name}
                  style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 18,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 10px 30px rgba(17,24,39,0.05)",
                  }}
                >
                  <TeamPhoto person={person} />

                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 6,
                    }}
                  >
                    {person.name}
                  </div>

                  <div
                    style={{
                      color: "rgba(0,0,0,0.65)",
                      fontSize: 15,
                      marginBottom: 14,
                      lineHeight: 1.5,
                      minHeight: 44,
                    }}
                  >
                    {person.role}
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "#374151",
                    }}
                  >
                    <div style={{ wordBreak: "break-word" }}>📧 {person.email}</div>
                    {person.phone ? <div>📞 {person.phone}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              background: "white",
              borderRadius: 20,
              padding: 30,
              border: "1px solid rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                fontSize: 26,
                color: "#111827",
              }}
            >
              Máte zájem o program ARCHIMEDES Live?
            </h3>

            <p
              style={{
                fontSize: 17,
                color: "rgba(0,0,0,0.65)",
                marginBottom: 24,
                lineHeight: 1.7,
              }}
            >
              Domluvte si krátkou ukázku programu nebo nám pošlete poptávku.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/poptavka"
                style={{
                  padding: "12px 22px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Odeslat poptávku
              </Link>

              <Link
                href="/program"
                style={{
                  padding: "12px 22px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.2)",
                  textDecoration: "none",
                  color: "#111827",
                  fontWeight: 600,
                  background: "white",
                }}
              >
                Zobrazit program
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 980px) {
          .contactGrid,
          .teamGrid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 720px) {
          .contactGrid,
          .teamGrid {
            grid-template-columns: 1fr !important;
          }

          h1 {
            font-size: 38px !important;
          }

          h2 {
            font-size: 30px !important;
          }
        }
      `}</style>
    </div>
  );
}
