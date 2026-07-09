import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

export default function ProOrganizacePage() {
  return (
    <>
      <Head>
        <title>Pro organizace | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live propojuje národní svazy, spolky a organizace se školami, obcemi a jejich komunitami."
        />
      </Head>

      <main className="page">
        <div className="container">
          <div className="eyebrow">Pro organizace</div>
          <h1>Partnerství pro svazy, spolky a organizace</h1>
          <p className="lead">
            Spolupracujeme s odbornými organizacemi, aby měl každý spolek přístup
            k nejlepšímu obsahu a nové cesty, jak oslovit školy, obce i veřejnost —
            od náboru nových členů po osvětu mezi mladší generací. O termínu,
            tématu a formě zapojení se domluvíme individuálně podle vašich možností.
          </p>

          <section className="block">
            <h2>Pro národní svazy a organizace</h2>
            <p>
              Pokud vedete celostátní svaz nebo organizaci, ARCHIMEDES Live vám
              otevírá cestu k lokálním pobočkám a řadovým členům v obcích,
              které vlastními kanály často nedosáhnete. Připravíme společně
              obsahový blok (živé vysílání, workshop, sérii setkání) a
              nabídneme ho obcím zapojeným do programu — setkání probíhají
              fyzicky přímo v obci, individuální připojení z domova je
              výjimka.
            </p>
            <Link href="/kontakt" className="ctaBtn">
              Chci probrat spolupráci
            </Link>
          </section>

          <section className="block">
            <h2>Pro místní spolky a organizace v obci</h2>
            <p>
              Hasiči, senioři, čtenářský klub, sportovní oddíl nebo jiný
              spolek ve vaší obci se do programu zapojí zdarma v rámci obecní
              licence. Stačí registrační číslo, které vaší obci přidělíme po
              zahájení programu — spolek se pak zaregistruje sám a získává
              pozvánky a obsah podle svého zaměření.
            </p>
            <Link href="/obec" className="ctaBtn">
              Zjistit, jestli má naše obec program
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
