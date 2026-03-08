import Link from "next/link";

export default function Ucebna() {
  return (
    <div
      style={{
        fontFamily: "system-ui",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "60px 16px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 44,
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Venkovní učebna
              <br />
              ARCHIMEDES®
            </h1>

            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 16,
                color: "#334155",
              }}
            >
              Škola, komunita a příroda na jednom místě
            </h3>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                marginBottom: 24,
                color: "#475569",
              }}
            >
              ARCHIMEDES® je moderní venkovní učebna a komunitní prostor,
              který propojuje vzdělávání, technologie a život obce.
              Slouží škole, dětem, komunitě i seniorům.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <Link
                href="/poptavka"
                style={{
                  padding: "12px 18px",
                  background: "#111827",
                  color: "white",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Prohlédnout varianty učebny
              </Link>

              <Link
                href="/kontakt"
                style={{
                  padding: "12px 18px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Navštívit vzorovou učebnu
              </Link>
            </div>

            <p
              style={{
                fontSize: 14,
                color: "#64748b",
              }}
            >
              Realizováno ve více než 20 obcích České republiky
            </p>
          </div>

          <div>
            <img
              src="/ucebna2.webp"
              alt="Venkovní učebna ARCHIMEDES"
              style={{
                width: "100%",
                height: 420,
                objectFit: "cover",
                borderRadius: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 60 }}>
          <h2
            style={{
              fontSize: 34,
              marginBottom: 30,
            }}
          >
            Jak učebna funguje během dne
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 16,
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h4>Dopoledne</h4>
              <p>Výuka školy, projektové dny a experimenty.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 16,
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h4>Odpoledne</h4>
              <p>Kroužky, polytechnika a zájmové aktivity.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 16,
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h4>Večer</h4>
              <p>Přednášky, komunitní setkání a program pro veřejnost.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: 24,
                borderRadius: 16,
                boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h4>Senioři</h4>
              <p>Digitální vzdělávání a komunitní aktivity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
