import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/jak-funguje-trida.jpg";
const stepOnlineImg = "/jak-funguje-online.jpg";
const stepClassImg = "/ella.jpg";
const stepBoardImg = "/jak-funguje-tabule.jpg";

function ButtonLink({ href, children, variant = "primary" }) {
  return (
    <Link href={href} className={`al-btn al-btn-${variant}`}>
      <span>{children}</span>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy a obce</title>
      </Head>

      <main className="page">
        <section className="hero">
          <div className="heroMedia">
            <img src={heroImg} alt="ARCHIMEDES Live ve škole" />
            <div className="heroOverlay" />
          </div>

          <div className="heroContentWrap">
            <div className="container">
              <div className="heroContent">
                <div className="eyebrow">ARCHIMEDES Live pro školy a obce</div>

                <h1>
                  Hodina, na kterou
                  <br />
                  se nezapomíná.
                </h1>

                <p className="heroLead">
                  Děti se potkávají s lidmi, kteří to opravdu dělají. Reálný
                  svět přímo ve třídě.
                </p>

                <div className="heroActions">
                  <ButtonLink href="/program#ukazky-vysilani" variant="primary">
                    Ukázková hodina
                  </ButtonLink>
                  <ButtonLink href="/demo" variant="secondary">
                    Chci DEMO
                  </ButtonLink>
                  <ButtonLink href="/start" variant="secondary">
                    Balíček START
                  </ButtonLink>
                  <ButtonLink href="/aktualni-pozvanky" variant="ghost">
                    Aktuální pozvánky
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sectionIntro center">
              <div className="eyebrow dark">Jak to funguje</div>
              <h2>Jednoduchý model, který škola zvládne hned</h2>
              <p>
                Nejde o další složitý systém. Jde o připravený program, který se
                snadno zapojí do běžné výuky.
              </p>
            </div>

            <div className="stepsGrid">
              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepOnlineImg} alt="" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">1</div>
                  <h3>Živý host přímo ve třídě</h3>
                  <p>Skutečný člověk. Skutečný příběh.</p>
                </div>
              </article>

              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepClassImg} alt="" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">2</div>
                  <h3>Žáci sledují, reagují a vnímají</h3>
                  <p>Zapojení, které má smysl.</p>
                </div>
              </article>

              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepBoardImg} alt="" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">3</div>
                  <h3>Interaktivní práce a návaznost</h3>
                  <p>Výuka, která pokračuje dál.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            background: #f7f8fb;
          }

          .container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 20px;
          }

          h1 {
            margin: 0;
            font-size: 62px;
            line-height: 1.02;
            letter-spacing: -0.02em;
            font-weight: 800;
          }

          .heroLead {
            margin-top: 18px;
            font-size: 20px;
            line-height: 1.6;
            max-width: 560px;
            color: rgba(255, 255, 255, 0.92);
          }

          .heroActions {
            margin-top: 26px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
        `}</style>

        <style jsx global>{`
          .al-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0 18px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .al-btn-primary {
            background: #ffffff;
            color: #0f172a;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }

          .al-btn-secondary {
            background: rgba(255, 255, 255, 0.16);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .al-btn-ghost {
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .al-btn-light {
            background: white;
            color: #0f172a;
          }

          .al-btn:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </main>
    </>
  );
}
