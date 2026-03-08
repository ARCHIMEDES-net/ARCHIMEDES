import Link from "next/link";

export default function Ucebna() {
  return (
    <div className="page">
      <main>
        {/* HERO */}
        <section className="section heroSection">
          <div className="heroGrid">
            <div>
              <h1>Venkovní učebna ARCHIMEDES®</h1>

              <h2>Škola, komunita a příroda na jednom místě</h2>

              <p className="heroText">
                ARCHIMEDES® je moderní venkovní učebna a komunitní prostor,
                který propojuje vzdělávání, technologie a život obce. Slouží
                škole, dětem, komunitě i seniorům.
              </p>

              <div className="heroButtons">
                <a href="#varianty" className="btnPrimary">
                  Prohlédnout varianty učebny
                </a>

                <Link href="/poptavka" className="btnSecondary">
                  Navštívit vzorovou učebnu
                </Link>
              </div>

              <div className="heroNote">
                Realizováno ve více než 20 obcích České republiky
              </div>
            </div>

            <div className="heroPhoto">Fotografie učebny</div>
          </div>
        </section>

        {/* JAK UČEBNA FUNGUJE */}
        <section className="section">
          <h2 className="sectionTitle">Jak učebna funguje během dne</h2>

          <div className="useGrid">
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
        <section id="varianty" className="section">
          <h2 className="sectionTitle">Varianty učeben ARCHIMEDES®</h2>

          <div className="variantGrid">
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
        <section className="section">
          <h2 className="sectionTitle">Cena a financování</h2>

          <p className="sectionText">
            Cena učebny se liší podle zvolené varianty a vybavení. Obce
            nejčastěji kombinují vlastní rozpočet s dotačními programy nebo
            podporou partnerů.
          </p>
        </section>

        {/* REFERENCE */}
        <section className="section lastSection">
          <h2 className="sectionTitle">Příklad realizace</h2>

          <div className="referenceCard">
            <h3>Obec Křenov</h3>

            <p>
              V obci Křenov vznikla venkovní učebna ARCHIMEDES® jako nový
              prostor pro výuku i komunitní život obce. Učebna dnes slouží
              žákům základní školy, dětským aktivitám i komunitním akcím.
            </p>

            <p className="referenceStrong">
              Projekt získal ocenění Obec 2030.
            </p>
          </div>

          <div className="referenceBtnWrap">
            <Link href="/poptavka" className="btnPrimary">
              Nezávazně probrat projekt učebny
            </Link>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          background: #f6f7fb;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 40px 16px;
        }

        .heroSection {
          padding: 60px 16px 40px;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .heroGrid h1 {
          font-size: 52px;
          line-height: 1.05;
          margin: 0 0 16px 0;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .heroGrid h2 {
          font-size: 22px;
          margin: 0 0 18px 0;
          color: #374151;
          font-weight: 600;
        }

        .heroText {
          font-size: 18px;
          line-height: 1.7;
          color: rgba(17, 24, 39, 0.75);
          margin: 0 0 26px 0;
          max-width: 600px;
        }

        .heroButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btnPrimary,
        .btnSecondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          padding: 14px 20px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 700;
          text-align: center;
        }

        .btnPrimary {
          background: #111827;
          color: white;
        }

        .btnSecondary {
          border: 1px solid rgba(0, 0, 0, 0.18);
          color: #111827;
          background: white;
        }

        .heroNote {
          margin-top: 18px;
          font-size: 14px;
          color: rgba(17, 24, 39, 0.6);
        }

        .heroPhoto {
          width: 100%;
          min-height: 340px;
          background: #e5e7eb;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-weight: 600;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .sectionTitle {
          font-size: 34px;
          margin: 0 0 24px 0;
          color: #111827;
          line-height: 1.15;
        }

        .useGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .variantGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .sectionText {
          font-size: 18px;
          line-height: 1.8;
          max-width: 700px;
          color: rgba(17, 24, 39, 0.75);
          margin: 0;
        }

        .referenceCard {
          background: white;
          padding: 26px;
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          max-width: 700px;
        }

        .referenceCard h3 {
          margin: 0 0 10px 0;
        }

        .referenceCard p {
          line-height: 1.7;
          margin: 0;
        }

        .referenceStrong {
          margin-top: 12px !important;
          font-weight: 600;
        }

        .referenceBtnWrap {
          margin-top: 28px;
        }

        .lastSection {
          padding-bottom: 80px;
        }

        @media (max-width: 1040px) {
          .heroGrid {
            grid-template-columns: 1fr;
          }

          .useGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .variantGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .section {
            padding: 32px 16px;
          }

          .heroSection {
            padding: 38px 16px 28px;
          }

          .heroGrid h1 {
            font-size: 36px;
            line-height: 1.08;
          }

          .heroGrid h2 {
            font-size: 20px;
            line-height: 1.35;
          }

          .heroText {
            font-size: 16px;
            line-height: 1.65;
            margin-bottom: 22px;
          }

          .heroButtons {
            flex-direction: column;
          }

          .btnPrimary,
          .btnSecondary {
            width: 100%;
            box-sizing: border-box;
          }

          .heroPhoto {
            min-height: 220px;
            border-radius: 18px;
          }

          .sectionTitle {
            font-size: 28px;
            margin-bottom: 18px;
          }

          .useGrid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .sectionText {
            font-size: 16px;
            line-height: 1.7;
          }

          .referenceCard {
            padding: 20px;
          }

          .referenceBtnWrap .btnPrimary {
            width: 100%;
          }

          .lastSection {
            padding-bottom: 64px;
          }
        }
      `}</style>
    </div>
  );
}

function Variant({ title, subtitle, text }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="cardSubtitle">{subtitle}</div>
      <p>{text}</p>

      <style jsx>{`
        .card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .card h3 {
          margin: 0 0 6px 0;
          color: #111827;
          line-height: 1.25;
        }

        .cardSubtitle {
          font-weight: 600;
          margin-bottom: 10px;
          color: #111827;
        }

        .card p {
          opacity: 0.8;
          line-height: 1.7;
          margin: 0;
        }

        @media (max-width: 700px) {
          .card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function UseBlock({ title, text }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{text}</p>

      <style jsx>{`
        .card {
          background: white;
          border-radius: 20px;
          padding: 22px;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .card h3 {
          margin: 0 0 8px 0;
          color: #111827;
          line-height: 1.25;
        }

        .card p {
          opacity: 0.8;
          line-height: 1.7;
          margin: 0;
        }

        @media (max-width: 700px) {
          .card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
