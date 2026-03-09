import Link from "next/link";

const heroImg = "/media/otevrena.webp";
const natureImg = "/media/ucebnavprirode.webp";
const classImg = "/media/detivetride.webp";
const guestsImg = "/media/hoste.jpg";

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        padding: "0 20px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        background: "#111827",
        color: "white",
        border: "1px solid #111827",
        transition: "all .15s ease",
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
        minHeight: 48,
        padding: "0 20px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        background: "white",
        color: "#111827",
        border: "1px solid rgba(17,24,39,0.15)",
      }}
    >
      {children}
    </Link>
  );
}

export default function Ucebna() {
  return (
    <div
      style={{
        fontFamily: "system-ui",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>

        {/* HERO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 40,
            alignItems: "center",
            marginBottom: 60,
          }}
        >
          <div>
            <h1 style={{ fontSize: 46, lineHeight: 1.2, marginBottom: 16 }}>
              Venkovní učebna
              <br />
              ARCHIMEDES®
            </h1>

            <h2
              style={{
                fontSize: 22,
                color: "#334155",
                marginBottom: 16,
              }}
            >
              Budoucnost vzdělávání v souladu s přírodou.
            </h2>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: "#475569",
                marginBottom: 24,
              }}
            >
              Inovativní prostor, který propojuje moderní technologie
              s přirozeným venkovním prostředím. Učte se a tvořte
              na čerstvém vzduchu.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <PrimaryButton href="#varianty">
                Vybrat variantu
              </PrimaryButton>

              <SecondaryButton href="/kontakt">
                Prohlédnout vzorovou učebnu
              </SecondaryButton>
            </div>
          </div>

          <img
            src={heroImg}
            alt="Učebna ARCHIMEDES"
            style={{
              width: "100%",
              borderRadius: 20,
              objectFit: "cover",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          />
        </div>

        {/* O PROJEKTU */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
            alignItems: "center",
            marginBottom: 60,
          }}
        >
          <div>
            <h2 style={{ fontSize: 34, marginBottom: 16 }}>
              Prostor, který inspiruje
            </h2>

            <p style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 16 }}>
              Přeneste výuku ven, aniž byste slevili z komfortu
              a technologických možností klasické třídy.
            </p>

            <p style={{ fontSize: 17, lineHeight: 1.7 }}>
              Archimedes je certifikovaný systém venkovních učeben
              (6,5 × 10 m), který jsme navrhli pro potřeby moderního
              školství i komunitního života.
            </p>
          </div>

          <img
            src={classImg}
            alt="Výuka v učebně"
            style={{
              width: "100%",
              borderRadius: 20,
              objectFit: "cover",
            }}
          />
        </div>

        {/* VARIABILITA */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
            marginBottom: 70,
          }}
        >
          <img
            src={natureImg}
            alt="Učebna v přírodě"
            style={{
              width: "100%",
              borderRadius: 20,
              objectFit: "cover",
            }}
          />

          <div>
            <h2 style={{ fontSize: 30, marginBottom: 16 }}>
              Unikátní variabilita interiéru
            </h2>

            <p style={{ marginBottom: 14 }}>
              Srdcem každé učebny je chytré pódium se zajížděcím schodem.
            </p>

            <p style={{ marginBottom: 10 }}>
              <strong>Režim Auditorium:</strong> kaskádovité sezení
              pro přednášky a promítání.
            </p>

            <p>
              <strong>Režim Volná plocha:</strong> otevřený prostor
              pro pohybové aktivity nebo workshopy.
            </p>
          </div>
        </div>

        {/* VARIANTY */}
        <div id="varianty" style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 34, marginBottom: 30 }}>
            Vyberte si svou variantu
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
          >
            <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
              <h3>🌿 ARCHIMEDES OPTIMAL</h3>
              <p>Svoboda v otevřenosti.</p>
              <p>
                Posuvné dveře umožňují zcela otevřít učebnu
                a vytvořit vzdušný altán.
              </p>
            </div>

            <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
              <h3>❄️ ARCHIMEDES OPTIMAL+</h3>
              <p>Komfort za každého počasí.</p>
              <p>
                PVC okna a HS portály umožňují celoroční provoz
                s výbornou izolací.
              </p>
            </div>

            <div style={{ background: "white", padding: 24, borderRadius: 16 }}>
              <h3>🏢 ARCHIMEDES PREMIUM</h3>
              <p>Standard trvalé stavby.</p>
              <p>
                Plně zateplená konstrukce pro intenzivní
                každodenní výuku po celý rok.
              </p>
            </div>
          </div>
        </div>

        {/* MODULY */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 34, marginBottom: 24 }}>
            Moduly a vybavení
          </h2>

          <img
            src={guestsImg}
            alt="Program a hosté"
            style={{
              width: "100%",
              borderRadius: 20,
              marginBottom: 24,
            }}
          />

          <p style={{ fontSize: 17, lineHeight: 1.7 }}>
            Učebny ARCHIMEDES lze rozšířit o modul WC,
            digitální technologie, zelenou infrastrukturu
            a další prvky podporující moderní vzdělávání
            i komunitní život.
          </p>
        </div>

        <PrimaryButton href="/poptavka">
          Potřebuji poradit s výběrem
        </PrimaryButton>

      </main>
    </div>
  );
}
