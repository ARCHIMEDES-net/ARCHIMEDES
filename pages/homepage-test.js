import Head from "next/head";
import Link from "next/link";
import { track } from "@vercel/analytics";
import Footer from "../components/Footer";

const classroomLiveImg = "/jak-funguje-trida.jpg";
const classroomImg = "/ucebna-exterier.webp";

function ButtonLink({ href, children, variant = "primary", eventName, onClick }) {
  const handleClick = () => {
    if (eventName) track(eventName);
    if (onClick) onClick();
  };

  return (
    <Link href={href} className={`al-btn al-btn-${variant}`} onClick={handleClick}>
      <span>{children}</span>
    </Link>
  );
}

export default function HomeTest() {
  return (
    <>
      <Head>
        <title>TEST | ARCHIMEDES Live homepage</title>
        <meta
          name="description"
          content="Testovací verze homepage ARCHIMEDES Live pro odladění nové komunikace programu pro základní školy."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="page">
        {/* HERO */}
        <section className="heroLight">
          <div className="container">
            <div className="heroLightGrid">
              <div className="heroCopy">
                <div className="eyebrow blue">Živé vysílání pro základní školy</div>

                <h1>Hotové živé hodiny pro základní školy</h1>

                <p className="heroLead">
                  Učitel pustí vysílání, žáci pracují s reálným tématem a škola
                  získá moderní výuku bez složité přípravy.
                </p>

                <div className="heroStartProof">
                  <span className="checkCircle">✓</span>
                  <span>
                    <strong>Balíček START dá celé škole přístup do 31. 12. 2026</strong>
                    <br />
                    za 4 990 Kč bez DPH.
                  </span>
                </div>

                <div className="heroActions">
                  <ButtonLink href="/start" variant="green">
                    Začít s balíčkem START
                  </ButtonLink>

                  <ButtonLink href="/program" variant="white">
                    Zobrazit program
                  </ButtonLink>
                </div>
              </div>

              <div className="heroVisual">
                <div className="startCard">
                  <div className="startCardLabel">Balíček START</div>

                  <div className="startCardMeta">
                    <span>Přístup pro celou školu</span>
                    <strong>do 31. 12. 2026</strong>
                  </div>

                  <ul>
                    <li>Živá vysílání s odborníky</li>
                    <li>Záznamy k opakování</li>
                    <li>Pracovní listy pro žáky</li>
                    <li>Pro všechny třídy</li>
                    <li>Na každé interaktivní tabuli</li>
                    <li>Funguje na běžné technice</li>
                  </ul>

                  <div className="startCardPrice">
                    <strong>4 990 Kč</strong>
                    <span>bez DPH</span>
                  </div>

                  <div className="startMiniNote">
                    Bez instalace. Bez školení. Funguje na běžné technice školy.
                  </div>
                </div>

                <div className="heroPhoto">
                  <img src={classroomLiveImg} alt="Živé vysílání ve třídě" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAM – NOVĚ PŘED HOW */}
        <section className="section sectionProgram">
          <div className="container">
            <div className="programGrid">
              <div>
                <div className="eyebrow blue">Pravidelný program každý měsíc</div>
                <h2>Každý měsíc zažijete</h2>
                <p>
                  Pravidelný živý program pro 1. i 2. stupeň, který lze ihned
                  použít ve výuce.
                </p>
              </div>

              <ul className="programList">
                <li>živé vysílání pro I. stupeň</li>
                <li>živé vysílání pro II. stupeň</li>
                <li>wellbeing program</li>
                <li>kariérní poradenství</li>
                <li>Čtenářský klub</li>
                <li>angličtina s hosty</li>
              </ul>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="section sectionHow">
          <div className="container">
            <div className="splitHeader">
              <div>
                <div className="eyebrow blue">Jak to funguje</div>
                <h2>Tři kroky, které zvládne každý učitel</h2>
              </div>
            </div>

            <div className="steps">
              <div className="step">
                <h3>1. Vyberete téma</h3>
                <p>Z programu si vyberete vysílání.</p>
              </div>

              <div className="step">
                <h3>2. Pustíte vysílání</h3>
                <p>Žáci sledují odborníka nebo hosta.</p>
              </div>

              <div className="step">
                <h3>3. Navážete ve výuce</h3>
                <p>Pracujete s materiály a tématem.</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .container {
            width: min(1100px, 90%);
            margin: 0 auto;
          }

          .heroLightGrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .heroPhoto img {
            width: 100%;
            border-radius: 16px;
          }

          .programGrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .programList {
            list-style: none;
            padding: 0;
          }

          .steps {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .step {
            background: #fff;
            padding: 20px;
            border-radius: 12px;
          }
        `}</style>
      </main>
    </>
  );
}
