import Link from "next/link";

function PriceCard({
  title,
  badge,
  price,
  period,
  subtitle,
  items,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  highlight,
}) {
  return (
    <div className={`priceCard ${highlight ? "priceCardHighlight" : ""}`}>
      <div className="priceCardHead">
        <h3 className="priceCardTitle">{title}</h3>

        {badge ? <span className={`priceBadge ${highlight ? "priceBadgeDark" : ""}`}>{badge}</span> : null}
      </div>

      <p className="priceSubtitle">{subtitle}</p>

      <div className="priceValueWrap">
        <div className="priceValueRow">
          <span className="priceValue">{price}</span>
          <span className="pricePeriod">{period}</span>
        </div>
      </div>

      <div className="priceListWrap">
        <ul className="priceList">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="priceButtons">
        <Link href={ctaHref} className="btnPrimary">
          {ctaLabel}
        </Link>

        <Link href={secondaryHref} className="btnSecondary">
          {secondaryLabel}
        </Link>
      </div>

      <div className="priceNote">Cena bez DPH.</div>
    </div>
  );
}

export default function Cenik() {
  return (
    <div className="page">
      <main>
        <section className="section">
          <div className="intro">
            <h1>Ceník licencí ARCHIMEDES Live</h1>

            <p>
              Licence umožňuje přístup k živému programu, archivu a vzdělávacím
              materiálům programu ARCHIMEDES Live. Doporučená varianta pro obec
              spojuje školu, komunitu i seniory do jednoho smysluplného celku.
            </p>
          </div>

          <div className="heroBox">
            <div className="heroGrid">
              <div>
                <div className="heroLabel">Doporučená volba pro obec</div>

                <h2>Jedna licence pro školu, komunitu i seniory v obci</h2>

                <p className="heroText">
                  Balíček <strong>Obec</strong> spojuje program pro školu,
                  komunitu i seniory do jedné licence. Obec tak získává
                  pravidelný živý program, který může využít více generací
                  obyvatel.
                </p>
              </div>

              <div className="heroPriceCard">
                <div className="heroPriceTitle">
                  Složení doporučeného balíčku:
                </div>

                <div className="heroPriceList">
                  <div>
                    Škola: <strong>2 000 Kč</strong>
                  </div>
                  <div>
                    Komunita: <strong>500 Kč</strong>
                  </div>
                  <div>
                    Senior klub: <strong>500 Kč</strong>
                  </div>
                  <div className="heroTotal">
                    Doporučená cena pro obec:{" "}
                    <strong>2 800 Kč / měsíc</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cardsGrid">
            <PriceCard
              title="Obec"
              badge="Doporučeno"
              price="2 800 Kč"
              period="/ měsíc"
              subtitle="Jedna licence pro celou obec – školu, komunitu i seniory."
              items={[
                "přístup k měsíčnímu programu",
                "program pro školu, komunitu i seniory",
                "kalendář živých vysílání",
                "archiv a vzdělávací materiály",
                "jedna doporučená licence pro obec",
              ]}
              ctaLabel="Mám zájem o licenci"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
              highlight
            />

            <PriceCard
              title="Škola"
              badge="ZŠ / SŠ"
              price="2 000 Kč"
              period="/ měsíc"
              subtitle="Program pro školy připravený tak, aby ho učitel mohl využít bez složité přípravy."
              items={[
                "živé vstupy odborníků",
                "projektové dny a tematické bloky",
                "pracovní listy",
                "archiv vysílání",
              ]}
              ctaLabel="Mám zájem o licenci"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />

            <PriceCard
              title="Komunita"
              badge="Veřejnost"
              price="500 Kč"
              period="/ měsíc"
              subtitle="Program pro komunitu obce a veřejnost."
              items={[
                "webináře pro veřejnost",
                "čtenářský klub a kulturní formáty",
                "wellbeing programy",
                "komunitní setkání a inspirace",
              ]}
              ctaLabel="Mám zájem o program"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />

            <PriceCard
              title="Senior klub"
              badge="2× měsíčně"
              price="500 Kč"
              period="/ měsíc"
              subtitle="Program pro seniory."
              items={[
                "online Senior klub",
                "společné aktivity",
                "digitální vzdělávání",
                "komunitní setkání",
              ]}
              ctaLabel="Mám zájem o Senior klub"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />
          </div>

          <div className="infoBox">
            <h3>Jak číst tento ceník</h3>

            <p>
              Samostatné licence dávají smysl tam, kde chce organizace řešit
              pouze jednu cílovou skupinu. Doporučená varianta{" "}
              <strong>Obec</strong> je určena pro starosty a vedení obcí, kteří
              chtějí jeden srozumitelný balíček pro školu, komunitu i seniory.
            </p>
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
          padding: 56px 16px 80px;
        }

        .intro {
          max-width: 760px;
          margin-bottom: 34px;
        }

        .intro h1 {
          margin: 0 0 16px 0;
          font-size: 54px;
          line-height: 1.04;
          letter-spacing: -0.03em;
          color: #111827;
        }

        .intro p {
          margin: 0;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(17, 24, 39, 0.72);
        }

        .heroBox {
          background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
          border-radius: 24px;
          padding: 26px;
          color: white;
          margin-bottom: 34px;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 22px;
          align-items: center;
        }

        .heroLabel {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.72);
          margin-bottom: 10px;
          font-weight: 700;
        }

        .heroGrid h2 {
          margin: 0 0 10px 0;
          font-size: 34px;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .heroText {
          margin: 0;
          font-size: 17px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.82);
        }

        .heroPriceCard {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 20px;
        }

        .heroPriceTitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.76);
          margin-bottom: 10px;
        }

        .heroPriceList {
          display: grid;
          gap: 10px;
          font-size: 16px;
        }

        .heroTotal {
          margin-top: 4px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 18px;
        }

        .cardsGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .priceCard {
          background: white;
          border-radius: 18px;
          border: 1px solid rgba(17, 24, 39, 0.1);
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
          padding: 22px;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .priceCardHighlight {
          border: 2px solid rgba(17, 24, 39, 0.85);
          box-shadow: 0 18px 45px rgba(17, 24, 39, 0.1);
        }

        .priceCardHead {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .priceCardTitle {
          margin: 0;
          font-size: 22px;
          line-height: 1.2;
          color: #111827;
        }

        .priceBadge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          background: #f3f4f6;
          color: #111827;
        }

        .priceBadgeDark {
          background: #111827;
          color: white;
        }

        .priceSubtitle {
          margin: 0 0 18px 0;
          color: rgba(17, 24, 39, 0.72);
          font-size: 16px;
          line-height: 1.6;
          min-height: 52px;
        }

        .priceValueWrap {
          margin-bottom: 20px;
        }

        .priceValueRow {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .priceValue {
          font-size: 38px;
          line-height: 1;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.03em;
        }

        .pricePeriod {
          font-size: 16px;
          color: rgba(17, 24, 39, 0.7);
          font-weight: 600;
        }

        .priceListWrap {
          flex: 1;
        }

        .priceList {
          margin: 0;
          padding-left: 18px;
          color: #374151;
          line-height: 1.8;
          font-size: 16px;
        }

        .priceButtons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .btnPrimary,
        .btnSecondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 700;
          font-size: 16px;
          text-align: center;
        }

        .btnPrimary {
          background: #111827;
          color: white;
        }

        .btnSecondary {
          background: white;
          color: #111827;
          border: 1px solid rgba(17, 24, 39, 0.14);
        }

        .priceNote {
          margin-top: 14px;
          font-size: 14px;
          color: rgba(17, 24, 39, 0.45);
        }

        .infoBox {
          margin-top: 34px;
          background: white;
          border: 1px solid rgba(17, 24, 39, 0.08);
          border-radius: 20px;
          padding: 24px;
        }

        .infoBox h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          color: #111827;
        }

        .infoBox p {
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
          color: rgba(17, 24, 39, 0.72);
        }

        @media (max-width: 1120px) {
          .intro h1 {
            font-size: 44px;
          }

          .cardsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .heroGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .section {
            padding: 38px 16px 64px;
          }

          .intro {
            margin-bottom: 26px;
          }

          .intro h1 {
            font-size: 34px;
            line-height: 1.08;
          }

          .intro p {
            font-size: 16px;
            line-height: 1.65;
          }

          .heroBox {
            padding: 20px;
            border-radius: 20px;
            margin-bottom: 26px;
          }

          .heroGrid h2 {
            font-size: 28px;
          }

          .heroText {
            font-size: 16px;
          }

          .heroPriceCard {
            padding: 18px;
          }

          .cardsGrid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .priceCard {
            padding: 20px;
          }

          .priceSubtitle {
            min-height: auto;
          }

          .priceValue {
            font-size: 32px;
          }

          .priceButtons {
            flex-direction: column;
          }

          .btnPrimary,
          .btnSecondary {
            width: 100%;
            min-height: 48px;
          }

          .infoBox {
            padding: 20px;
            margin-top: 26px;
          }

          .infoBox h3 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}
