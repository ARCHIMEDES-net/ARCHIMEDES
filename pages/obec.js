import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const points = [
  {
    title: "Jedna komunikace pro celou obec",
    text: "Školy, spolky, senioři i rodiče najdou program, pozvánky a záznamy na jednom místě.",
  },
  {
    title: "Program bez starostí",
    text: "Živé přenosy a vzdělávací pořady připravuje ARCHIMEDES Live, obec jen zapojí zájemce.",
  },
  {
    title: "Viditelný přínos pro veřejnost",
    text: "Obec může ukázat aktivní komunitní život — akce, spolky i zapojení občany.",
  },
];

export default function ObecPage() {
  return (
    <>
      <Head>
        <title>Pro obce | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live pomáhá starostům a obcím propojit školy, spolky a občany do jednoho aktivního komunitního programu."
        />
      </Head>

      <main className="page">
        <div className="container">
          <div className="eyebrow">Pro obce</div>
          <h1>Program, který posiluje komunitní život vaší obce</h1>
          <p className="lead">
            Pro starosty a zastupitelstva, kteří chtějí propojit školy, spolky,
            seniory a národní organizace do jednoho celoročního programu — obec
            získává páteř komunitního života, která usnadňuje komunikaci a
            pomáhá budovat aktivní obec.
          </p>

          <div className="grid">
            {points.map((p) => (
              <div key={p.title} className="card">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          <div className="cta">
            <div>
              <strong>Chcete program i ve vaší obci?</strong>
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
          max-width: 980px;
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

        .grid {
          margin-top: 36px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 22px;
          padding: 22px;
        }

        .card h3 {
          margin: 0;
          font-size: 18px;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .card p {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.6;
          color: #5b6676;
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

        @media (max-width: 760px) {
          .grid {
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
