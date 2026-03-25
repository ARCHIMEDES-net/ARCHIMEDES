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
          maxWidth: 1040,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.12fr 0.88fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <div className="eyebrow">Ukázkový přístup</div>

          <h1
            className="demoMainTitle"
            style={{ marginTop: 0, marginBottom: 14 }}
          >
            Podívejte se, jak vypadá ARCHIMEDES Live z pohledu školy
          </h1>

          <p
            className="demoMainLead"
            style={{
              marginTop: 0,
              marginBottom: 22,
              color: "rgba(0,0,0,0.72)",
            }}
          >
            Ukázkové prostředí vám pomůže rychle pochopit, co škola po zapojení
            získá: podobu portálu, strukturu programu, ukázky záznamů, pracovní
            listy i celkový dojem z prostředí, ve kterém bude škola fungovat.
          </p>

          <div className="benefitGrid">
            <div className="benefitItem">rychlý první přehled bez složité domluvy</div>
            <div className="benefitItem">ukázka prostředí po přihlášení</div>
            <div className="benefitItem">lepší představa o využití ve škole</div>
            <div className="benefitItem">možnost navázat objednávkou START</div>
          </div>

          <div
            style={{
              background: "#f8f9fc",
              padding: 22,
              borderRadius: 18,
              marginTop: 22,
              marginBottom: 18,
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
                paddingLeft: 0,
                color: "rgba(0,0,0,0.74)",
                listStyle: "none",
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
              marginBottom: 16,
            }}
          >
            <strong>Ukázka slouží k rychlé orientaci.</strong>
            <br />
            Uvidíte prostředí a obsah programu, ale bez možnosti správy školy,
            spouštění vysílání nebo jiných administrativních zásahů.
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
            Přístup do ukázky poskytujeme na základě krátké žádosti. Je to
            jednoduchý první krok pro školy, které si chtějí prostředí nejprve
            prohlédnout a teprve potom rozhodnout o dalším zapojení.
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            alignSelf: "start",
          }}
        >
          <div className="ctaEyebrow">Pro školy</div>

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
              marginBottom: 18,
              color: "rgba(0,0,0,0.66)",
              lineHeight: 1.7,
            }}
          >
            Vyplníte krátkou žádost a pošleme vám e-mail s dalšími kroky a
            vstupem do ukázkového prostředí.
          </p>

          <div className="ctaSummary">
            <div className="ctaSummaryTitle">Proč začít právě ukázkou</div>
            <ul className="ctaSummaryList">
              <li>rychle uvidíte, jak prostředí funguje</li>
              <li>snadno si ověříte, zda je program pro vaši školu vhodný</li>
              <li>na ukázku lze navázat objednávkou START</li>
            </ul>
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 20,
            }}
          >
            <Link href="/zadost-o-pristup?type=demo" style={buttonPrimaryStyle}>
              Požádat o ukázkový přístup
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
            <strong>Doporučený postup</strong>
            <br />
            1. odešlete krátkou žádost o ukázkový přístup
            <br />
            2. do e-mailu vám pošleme další kroky a vstup do ukázky
            <br />
            3. po prohlédnutí můžete navázat zapojením školy do programu
          </div>

          <p className="ctaFootnote">
            Ukázkový přístup slouží k orientaci v prostředí. Plné využití programu
            získá škola až po aktivaci.
          </p>
        </div>
      </div>

      <style jsx>{`
        .eyebrow,
        .ctaEyebrow {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          background: #e9eef8;
          color: #223252;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .demoMainTitle {
          font-size: 40px;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .demoMainLead {
          font-size: 18px;
          line-height: 1.7;
        }

        .benefitGrid {
          display: grid;
          gap: 10px;
          margin-bottom: 4px;
        }

        .benefitItem {
          position: relative;
          padding-left: 26px;
          font-size: 15px;
          line-height: 1.65;
          color: rgba(0, 0, 0, 0.76);
          font-weight: 600;
        }

        .benefitItem::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: #15803d;
          font-weight: 900;
        }

        .demoSectionTitle {
          font-size: 24px;
          line-height: 1.2;
        }

        .demoList {
          line-height: 1.8;
          font-size: 16px;
        }

        .demoList li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 8px;
        }

        .demoList li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #111827;
        }

        .demoFormTitle {
          font-size: 30px;
          line-height: 1.15;
        }

        .demoFormLead {
          font-size: 16px;
        }

        .ctaSummary {
          padding: 18px;
          borderRadius: 18px;
          background: #f8f9fc;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .ctaSummaryTitle {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 10px;
        }

        .ctaSummaryList {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }

        .ctaSummaryList li {
          position: relative;
          padding-left: 22px;
          color: rgba(0, 0, 0, 0.74);
          line-height: 1.65;
          font-size: 15px;
        }

        .ctaSummaryList li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #111827;
        }

        .ctaFootnote {
          margin: 18px 0 0;
          font-size: 13px;
          line-height: 1.65;
          color: rgba(0, 0, 0, 0.55);
        }

        @media (max-width: 900px) {
          .demoGrid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .demoMainTitle {
            font-size: 30px;
            line-height: 1.14;
          }

          .demoMainLead {
            font-size: 16px;
            line-height: 1.65;
          }

          .demoSectionTitle {
            font-size: 22px;
          }

          .demoFormTitle {
            font-size: 25px;
          }

          .demoFormLead {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
