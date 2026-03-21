import Link from "next/link";

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f7fb",
  padding: "40px 16px",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 24,
  padding: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.08)",
};

const buttonPrimaryStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 18px",
  borderRadius: 12,
  background: "#111827",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  textAlign: "center",
  minHeight: 52,
};

const buttonSecondaryStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 18px",
  borderRadius: 12,
  background: "#fff",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid rgba(0,0,0,0.12)",
  textAlign: "center",
  minHeight: 52,
};

export default function DemoPage() {
  return (
    <div style={pageStyle}>
      <div
        className="demoGrid"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <h1
            className="demoMainTitle"
            style={{ marginTop: 0, marginBottom: 14 }}
          >
            Prohlédněte si, jak vypadá ARCHIMEDES Live po přihlášení
          </h1>

          <p
            className="demoMainLead"
            style={{
              marginTop: 0,
              marginBottom: 22,
              color: "rgba(0,0,0,0.72)",
            }}
          >
            ARCHIMEDES Live je živý vzdělávací program pro školy a komunitu obce.
            Ukázkový přístup slouží k tomu, aby si ředitel, učitel nebo zájemce
            mohl předem prohlédnout prostředí portálu a získat jasnou představu o
            tom, co škola po aktivaci uvidí.
          </p>

          <div
            style={{
              background: "#f8f9fc",
              padding: 22,
              borderRadius: 18,
              marginBottom: 22,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <h2
              className="demoSectionTitle"
              style={{ marginTop: 0, marginBottom: 14 }}
            >
              Co v ukázce uvidíte
            </h2>

            <ul
              className="demoList"
              style={{
                margin: 0,
                paddingLeft: 20,
                color: "rgba(0,0,0,0.74)",
              }}
            >
              <li>podobu portálu po přihlášení z pohledu školy</li>
              <li>ukázku programu a struktury vysílání</li>
              <li>ukázkové záznamy a návaznost do výuky</li>
              <li>pracovní listy a materiály pro učitele</li>
              <li>celkový dojem z prostředí, které škola po aktivaci získá</li>
            </ul>
          </div>

          <div
            style={{
              background: "#eefaf0",
              padding: 18,
              borderRadius: 18,
              border: "1px solid #cfe8d3",
              color: "#166534",
              lineHeight: 1.7,
              marginBottom: 18,
            }}
          >
            Ukázkový přístup je pouze pro prohlížení. Neumožňuje správu školy,
            spouštění vysílání ani jiné administrativní zásahy.
          </div>

          <div
            style={{
              background: "#fff8e8",
              padding: 18,
              borderRadius: 18,
              border: "1px solid #f1dfac",
              color: "#7a5a00",
              lineHeight: 1.7,
            }}
          >
            Přístup do ukázky poskytujeme na základě krátké žádosti. Díky tomu
            máme přehled o zájmu škol a můžeme navázat vhodným dalším krokem —
            například ukázkovou hodinou nebo konkrétní nabídkou pro školu.
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            alignSelf: "start",
          }}
        >
          <h2
            className="demoFormTitle"
            style={{ marginTop: 0, marginBottom: 12 }}
          >
            Získat ukázkový přístup
          </h2>

          <p
            className="demoFormLead"
            style={{
              marginTop: 0,
              marginBottom: 20,
              color: "rgba(0,0,0,0.66)",
              lineHeight: 1.7,
            }}
          >
            Pošlete nám krátkou žádost o přístup do ukázkového prostředí.
            Následně vám zašleme další informace a přístup do dema.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <Link href="/zadost-o-pristup?type=demo" style={buttonPrimaryStyle}>
              Požádat o ukázkový přístup
            </Link>

            <Link href="/ukazka" style={buttonSecondaryStyle}>
              Nejprve si domluvit ukázku
            </Link>

            <Link href="/" style={buttonSecondaryStyle}>
              Zpět na hlavní stránku
            </Link>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 16,
              background: "#f8f9fc",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.72)",
              lineHeight: 1.7,
            }}
          >
            Doporučený postup:
            <br />
            1. požádáte o ukázkový přístup
            <br />
            2. získáte vstup do demo prostředí
            <br />
            3. po prohlédnutí navážeme konkrétním řešením pro vaši školu
          </div>
        </div>
      </div>

      <style jsx>{`
        .demoMainTitle {
          font-size: 38px;
          line-height: 1.12;
        }

        .demoMainLead {
          font-size: 18px;
          line-height: 1.7;
        }

        .demoSectionTitle {
          font-size: 24px;
        }

        .demoList {
          line-height: 1.9;
          font-size: 16px;
        }

        .demoFormTitle {
          font-size: 28px;
        }

        .demoFormLead {
          font-size: 16px;
        }

        @media (max-width: 900px) {
          .demoGrid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .demoMainTitle {
            font-size: 28px;
            line-height: 1.16;
          }

          .demoMainLead {
            font-size: 16px;
            line-height: 1.65;
          }

          .demoSectionTitle {
            font-size: 22px;
          }

          .demoFormTitle {
            font-size: 24px;
          }

          .demoFormLead {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
