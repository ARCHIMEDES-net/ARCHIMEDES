import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import { referencesSection, references } from "../content/homepage";

export default function ReferencePage() {
  const visibleReferences = references.filter((r) => r.visible);

  return (
    <>
      <Head>
        <title>Reference | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Obce, které už s ARCHIMEDES Live budují aktivní komunitní život — Čejč, Křenov, Hodonín a Provodov-Šonov."
        />
      </Head>

      <main className="page">
        <div className="container">
          <div className="eyebrow">{referencesSection.eyebrow}</div>
          <h1>{referencesSection.title}</h1>
          <p className="lead">
            Vybrané obce, kde ARCHIMEDES Live pomáhá propojit školy, spolky,
            seniory i veřejnou správu do jednoho aktivního komunitního života.
          </p>

          {visibleReferences.length ? (
            <div className="referencesGrid">
              {visibleReferences.map((r) => (
                <article key={r.id} className="refCard">
                  <div className="refPhotoWrap">
                    <PhotoWithFallback
                      src={r.photo}
                      alt={`Obec ${r.name}`}
                      fallbackLabel={r.name}
                      style={{ width: "100%", height: "100%" }}
                      imgStyle={{ objectFit: "cover" }}
                    />
                    <div className="refCrest">
                      <PhotoWithFallback
                        src={r.crest}
                        alt={`Znak obce ${r.name}`}
                        fallbackLabel={r.name}
                        style={{ width: 40, height: 40 }}
                        rounded
                      />
                    </div>
                    <div className="refBadge">{r.badge}</div>
                  </div>

                  <div className="refBody">
                    <strong>{r.name}</strong>
                    <span className="refRegion">{r.region}</span>
                    <p>&bdquo;{r.quote}&ldquo;</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="cta">
            <div>
              <strong>Chcete být další referencí?</strong>
              <span>Vyplňte krátkou žádost a ozveme se vám s dalším postupem.</span>
            </div>
            <Link href="/zadost" className="ctaBtn">
              Chci program pro naši obec
            </Link>
          </div>
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
          max-width: 1100px;
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
          font-size: 40px;
          letter-spacing: -0.04em;
          font-weight: 950;
          color: #0f172a;
          max-width: 760px;
        }

        .lead {
          margin: 16px 0 0;
          font-size: 17px;
          line-height: 1.65;
          color: #475569;
          max-width: 680px;
        }

        .referencesGrid {
          margin-top: 36px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .refCard {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 22px;
          overflow: hidden;
          background: #ffffff;
        }

        .refPhotoWrap {
          position: relative;
          aspect-ratio: 4 / 3;
          background: #eef2f8;
        }

        .refCrest {
          position: absolute;
          left: 12px;
          bottom: -20px;
          border-radius: 999px;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
          border: 3px solid #ffffff;
        }

        .refBadge {
          position: absolute;
          right: 10px;
          top: 10px;
          max-width: 120px;
          padding: 6px 10px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.82);
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 900;
          line-height: 1.3;
          text-align: center;
        }

        .refBody {
          padding: 28px 16px 20px;
        }

        .refBody strong {
          display: block;
          font-size: 16px;
          color: #0f172a;
        }

        .refRegion {
          display: block;
          margin-top: 2px;
          font-size: 12.5px;
          color: #94a3b8;
          font-weight: 700;
        }

        .refBody p {
          margin: 10px 0 0;
          font-size: 13.5px;
          line-height: 1.55;
          color: #475569;
        }

        .cta {
          margin-top: 40px;
          padding: 24px 26px;
          border-radius: 24px;
          background: #0f2344;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .cta strong {
          display: block;
          font-size: 18px;
        }

        .cta span {
          display: block;
          margin-top: 6px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.78);
        }

        @media (max-width: 1000px) {
          .referencesGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .referencesGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <style jsx global>{`
        .ctaBtn {
          display: inline-flex;
          align-items: center;
          padding: 12px 20px;
          border-radius: 999px;
          background: #ffffff;
          color: #0f172a;
          text-decoration: none;
          font-weight: 900;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
