import Head from "next/head";
import Link from "next/link";
import Footer from "./Footer";

export default function LegalPageLayout({
  title,
  description,
  eyebrow = "Právní informace",
  updatedAt = "Aktualizováno: březen 2026",
  children,
}) {
  return (
    <>
      <Head>
        <title>{title} | ARCHIMEDES Live</title>
        <meta name="description" content={description} />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="container">
            <div className="heroCard">
              <div className="eyebrow">{eyebrow}</div>
              <h1>{title}</h1>
              <p className="lead">{description}</p>

              <div className="metaRow">
                <span>{updatedAt}</span>
                <Link href="/start">Zpět na objednávku START</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="contentSection">
          <div className="container">
            <article className="contentCard">{children}</article>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            background: #f7f8fb;
            color: #0f172a;
            min-height: 100vh;
          }

          .container {
            max-width: 980px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .hero {
            padding: 38px 0 16px;
          }

          .heroCard {
            background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 28px;
            padding: 32px 30px;
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            min-height: 36px;
            padding: 0 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.02em;
            margin-bottom: 18px;
            background: #e9eef8;
            color: #223252;
          }

          h1 {
            margin: 0;
            font-size: 46px;
            line-height: 1.02;
            letter-spacing: -0.04em;
            font-weight: 900;
            color: #0f172a;
          }

          .lead {
            margin: 16px 0 0;
            font-size: 18px;
            line-height: 1.72;
            color: #4b5563;
            max-width: 760px;
          }

          .metaRow {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 18px;
            align-items: center;
            margin-top: 18px;
            font-size: 14px;
            line-height: 1.6;
            color: #667085;
            font-weight: 700;
          }

          .metaRow a {
            color: #1d4ed8;
            text-decoration: none;
            font-weight: 800;
          }

          .metaRow a:hover {
            text-decoration: underline;
          }

          .contentSection {
            padding: 10px 0 84px;
          }

          .contentCard {
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 28px;
            padding: 34px 30px;
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
          }

          .contentCard :global(h2) {
            margin: 0 0 16px;
            font-size: 28px;
            line-height: 1.1;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #0f172a;
          }

          .contentCard :global(h3) {
            margin: 28px 0 10px;
            font-size: 20px;
            line-height: 1.2;
            font-weight: 900;
            color: #0f172a;
          }

          .contentCard :global(p) {
            margin: 0 0 14px;
            font-size: 16px;
            line-height: 1.75;
            color: #334155;
          }

          .contentCard :global(ul) {
            margin: 0 0 16px;
            padding-left: 20px;
          }

          .contentCard :global(li) {
            margin-bottom: 8px;
            font-size: 16px;
            line-height: 1.7;
            color: #334155;
          }

          .contentCard :global(.noteBox) {
            margin: 18px 0 22px;
            padding: 16px 18px;
            border-radius: 16px;
            background: #eef3fb;
            border: 1px solid rgba(30, 64, 175, 0.08);
            color: #223252;
          }

          .contentCard :global(.muted) {
            color: #667085;
            font-size: 14px;
          }

          @media (max-width: 640px) {
            .container {
              padding: 0 16px;
            }

            .hero {
              padding: 28px 0 14px;
            }

            .heroCard,
            .contentCard {
              padding: 24px 20px;
              border-radius: 22px;
            }

            h1 {
              font-size: 34px;
            }

            .lead {
              font-size: 16px;
            }

            .contentCard :global(h2) {
              font-size: 24px;
            }

            .contentCard :global(h3) {
              font-size: 18px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
