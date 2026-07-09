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

          <Link href="/zadost" className="ctaBtn">
            Chci program pro naši obec
          </Link>
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
