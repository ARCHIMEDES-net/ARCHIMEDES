import Link from "next/link";

export default function Ucebna() {
  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>

        {/* HERO */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "60px 16px 40px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 52,
                  lineHeight: 1.05,
                  marginBottom: 16,
                  color: "#111827",
                  letterSpacing: "-0.02em",
                }}
              >
                Venkovní učebna ARCHIMEDES®
              </h1>

              <h2
                style={{
                  fontSize: 22,
                  marginBottom: 18,
                  color: "#374151",
                  fontWeight: 600,
                }}
              >
                Škola, komunita a příroda na jednom místě
              </h2>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: "rgba(17,24,39,0.75)",
                  marginBottom: 26,
                  maxWidth: 600,
                }}
              >
                ARCHIMEDES® je moderní venkovní učebna a komunitní prostor,
                který propojuje vzdělávání, technologie a život obce.
                Slouží škole, dětem, komunitě i seniorům.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="#varianty"
                  style={{
                    background: "#111827",
                    color: "white",
                    padding: "14px 20px",
                    borderRadius: 14,
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Prohlédnout varianty učebny
                </a>

                <Link
                  href="/poptavka"
                  style={{
                    border: "1px solid rgba(0,0,0,0.18)",
                    padding: "14px 20px",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "#111827",
                    fontWeight: 700,
                    background: "white",
                  }}
                >
                  Navštívit vzorovou učebnu
                </Link>
              </div>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 14,
                  color: "rgba(17,24,39,0.6)",
                }}
              >
                Realizováno ve více než 20 obcích České republiky
              </div>
            </div>

            {/* místo pro fotografii */}
            <div
              style={{
                width: "100%",
                height: 340,
                background: "#e5e7eb",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              Fotografie učebny
            </div>
          </div>
        </section>

        {/* JAK UČEBNA FUNGUJE */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 24,
              color: "#111827",
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
            <UseBlock
              title="Dopoledne"
              text="Výuka školy, projektové dny a vzdělávací programy."
            />

            <UseBlock
              title="Odpoledne"
              text="Kroužky, polytechnika, kreativní dílny."
            />

            <UseBlock
              title="Večer"
              text="Přednášky, komunitní setkání a kulturní program."
            />

            <UseBlock
              title="Senioři"
              text="Digitální vzdělávání a komunitní aktivity."
            />
          </div>
        </section>

        {/* VARIANTY */}
        <section
          id="varianty"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 28,
              color: "#111827",
            }}
          >
            Varianty učeben ARCHIMEDES®
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
          >
            <Variant
              title="ARCHIMEDES OPTIMAL"
              subtitle="Svoboda v otevřenosti"
              text="Celodřevěná konstrukce s posuvnými stěnami, která umožňuje maximální propojení s okolní přírodou."
            />

            <Variant
              title="ARCHIMEDES OPTIMAL+"
              subtitle="Komfort za každého počasí"
              text="Vylepšená izolace a energetická efektivita při zachování přírodního vzhledu."
            />

            <Variant
              title="ARCHIMEDES PREMIUM"
              subtitle="Standard trvalé stavby"
              text="Plně zateplená konstrukce navržená pro intenzivní celoroční provoz."
            />
          </div>
        </section>

        {/* FINANCOVÁNÍ */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 20,
              color: "#111827",
            }}
          >
            Cena a financování
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              maxWidth: 700,
              color: "rgba(17,24,39,0.75)",
            }}
          >
            Cena učebny se liší podle zvolené varianty a vybavení.
            Obce nejčastěji kombinují vlastní rozpočet s dotačními
            programy nebo podporou partnerů.
          </p>
        </section>

        {/* REFERENCE */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px 80px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 20,
              color: "#111827",
            }}
          >
            Příklad realizace
          </h2>

          <div
            style={{
              background: "white",
              padding: 26,
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.08)",
              maxWidth: 700,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Obec Křenov</h3>

            <p style={{ lineHeight: 1.7 }}>
              V obci Křenov vznikla venkovní učebna ARCHIMEDES® jako nový
              prostor pro výuku i komunitní život obce. Učebna dnes slouží
              žákům základní školy, dětským aktivitám i komunitním akcím.
            </p>

            <p style={{ marginTop: 12, fontWeight: 600 }}>
              Projekt získal ocenění Obec 2030.
            </p>
          </div>

          <div style={{ marginTop: 28 }}>
            <Link
              href="/poptavka"
              style={{
                background: "#111827",
                color: "white",
                padding: "16px 22px",
                borderRadius: 14,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Nezávazně probrat projekt učebny
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

function Variant({ title, subtitle, text }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{subtitle}</div>
      <p style={{ opacity: 0.8 }}>{text}</p>
    </div>
  );
}

function UseBlock({ title, text }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 22,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ opacity: 0.8 }}>{text}</p>
    </div>
  );
}
