import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

export default function ONasPage() {
  return (
    <>
      <Head>
        <title>O nás | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live je program pro školy a obce, který provozuje EduVision s.r.o."
        />
      </Head>

      <main className="page">
        <div className="container">
          <div className="eyebrow">O nás</div>
          <h1>Stavíme páteř komunitního života obce</h1>
          <p className="lead">
            ARCHIMEDES Live provozuje společnost EduVision s.r.o. spolu se sítí
            odborných hostů a partnerů. Spojujeme školy, spolky, seniory, rodiče
            i národní organizace do jednoho celoročního programu — cílem je
            pomáhat obcím budovat aktivní komunitu, kde se propojují generace,
            spolky i veřejná správa.
          </p>

          <section className="block">
            <h2>Kdo jsme</h2>
            <p>
              ARCHIMEDES Live provozuje EduVision s.r.o. se sídlem v Brně.
              Program vznikl na základě zkušenosti s venkovními a živými
              výukovými programy pro školy — postupně se rozšířil o komunitní
              část pro obce, seniory a spolky.
            </p>
          </section>

          <section className="block">
            <h2>Proč to děláme</h2>
            <p>
              Živé setkávání funguje líp než další kanál navíc — proto stavíme
              na fyzických setkáních přímo v obci, doplněných živým vysíláním
              a hotovým obsahem. Cílem je usnadnit spolkům, školám a obecním
              úřadům komunikaci a dát dohromady lidi, kteří by se jinak
              nepotkali.
            </p>
          </section>

          <section className="block">
            <h2>Co už program obcím přinesl</h2>
            <p>
              V obcích, kde máme učebnu, jsme pomohli k ocenění v soutěžích
              jako Vesnice roku nebo Obec 2030 — víc o konkrétních obcích
              najdete na stránce Reference.
            </p>
            <Link href="/reference" className="inlineLink">
              Zobrazit reference obcí →
            </Link>
          </section>

          <section className="block">
            <h2>Kontakt</h2>
            <Link href="/kontakt" className="ctaBtn">
              Kontaktovat nás
            </Link>
          </section>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .page {
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 20px 80px;
        }

        .container {
          max-width: 720px;
          margin: 0 auto;
        }

        .eyebrow {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: #e7eef9;
          color: #1e3a5f;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        h1 {
          margin: 0;
          font-size: 38px;
          letter-spacing: -0.04em;
          font-weight: 950;
          color: #0f172a;
        }

        .lead {
          margin: 16px 0 0;
          font-size: 17px;
          line-height: 1.68;
          color: #475569;
        }

        .block {
          margin-top: 40px;
        }

        .block h2 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.03em;
          font-weight: 900;
          color: #0f172a;
        }

        .block p {
          margin: 14px 0 0;
          font-size: 16px;
          line-height: 1.68;
          color: #475569;
        }

        .inlineLink {
          display: inline-flex;
          margin-top: 12px;
          color: #1d4ed8;
          font-weight: 900;
          font-size: 15px;
          text-decoration: none;
        }

        .inlineLink:hover {
          color: #0f172a;
        }
      `}</style>

      <style jsx global>{`
        .ctaBtn {
          display: inline-flex;
          align-items: center;
          margin-top: 28px;
          padding: 14px 22px;
          border-radius: 999px;
          background: #1d4ed8;
          color: #ffffff;
          text-decoration: none;
          font-weight: 900;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
