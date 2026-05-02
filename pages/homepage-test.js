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
        <section className="heroLight">
          <div className="container">
            <div className="heroLightGrid">
              <div className="heroCopy">
                <div className="eyebrow blue">
                  Živé vysílání pro základní školy
                </div>

                <h1>Hotové živé hodiny pro základní školy</h1>

                <p className="heroLead">
                  Učitel pustí vysílání, žáci pracují s reálným tématem a škola
                  získá moderní výuku bez složité přípravy.
                </p>

                <div className="heroStartProof">
                  <span className="checkCircle">✓</span>
                  <span>
                    <strong>
                      Balíček START dá celé škole přístup do 31. 12. 2026
                    </strong>
                    <br />
                    za 4 990 Kč bez DPH.
                  </span>
                </div>

                <div className="heroActions">
                  <ButtonLink
                    href="/start"
                    variant="green"
                    eventName="test_klik_home_start_primary"
                  >
                    Začít s balíčkem START
                  </ButtonLink>

                  <ButtonLink
                    href="/program"
                    variant="white"
                    eventName="test_klik_home_program"
                  >
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
                  <img
                    src={classroomLiveImg}
                    alt="Živé vysílání ARCHIMEDES Live ve třídě"
                  />
                </div>
              </div>
            </div>

            <div className="proofBar">
              <div className="proofItem">
                <span className="proofIcon">⏱</span>
                <div>
                  <strong>Šetří čas učitelům</strong>
                  <p>Hotové hodiny připravené k okamžitému použití.</p>
                </div>
              </div>

              <div className="proofItem">
                <span className="proofIcon">👥</span>
                <div>
                  <strong>Motivuje žáky</strong>
                  <p>Skutečné příběhy, profese a témata z praxe.</p>
                </div>
              </div>

              <div className="proofItem">
                <span className="proofIcon">📘</span>
                <div>
                  <strong>Navazuje na výuku</strong>
                  <p>Pracovní listy a materiály pro snadné začlenění.</p>
                </div>
              </div>

              <div className="proofItem">
                <span className="proofIcon">✅</span>
                <div>
                  <strong>V souladu s RVP</strong>
                  <p>Témata podporují cíle základního vzdělávání.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ NOVĚ: PROGRAM JE DŘÍV */}
        <section className="section sectionProgram">
          <div className="container">
            <div className="programGrid">
              <div className="programText">
                <div className="eyebrow blue">Pravidelný program každý měsíc</div>
                <h2>Každý měsíc zažijete</h2>
                <p>
                  ARCHIMEDES Live přináší škole pravidelný živý program, který
                  lze jednoduše zařadit do výuky na 1. i 2. stupni ZŠ.
                </p>

                <div className="programActions">
                  <ButtonLink
                    href="/program"
                    variant="green"
                    eventName="test_klik_home_program_section"
                  >
                    Zobrazit celý program
                  </ButtonLink>
                </div>
              </div>

              <div className="monthlyProgramCard">
                <ul>
                  <li>živé online vysílání pro I. stupeň ZŠ</li>
                  <li>živé online vysílání pro II. stupeň ZŠ</li>
                  <li>program zaměřený na wellbeing žáků</li>
                  <li>program zaměřený na kariérové poradenství</li>
                  <li>Čtenářský klub Magnesia Litera</li>
                  <li>živý rozhovor s hostem v angličtině</li>
                  <li>možnost vysílání přímo z vaší školy</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ POSUNUTO AŽ ZA PROGRAM */}
        <section className="section sectionHow">
          <div className="container">
            <div className="splitHeader">
              <div>
                <div className="eyebrow blue">Jak to funguje</div>
                <h2>Tři kroky, které zvládne každý učitel</h2>
              </div>
              <p>
                ARCHIMEDES Live není složitý software. Je to připravený program,
                který škola jednoduše pustí ve třídě.
              </p>
            </div>

            <div className="steps">
              <article className="step">
                <span className="stepNumber">1</span>
                <h3>Vyberete téma</h3>
                <p>
                  Z programu si vyberete živé vysílání nebo záznam, který se
                  hodí do vaší výuky.
                </p>
              </article>

              <article className="step">
                <span className="stepNumber">2</span>
                <h3>Pustíte vysílání</h3>
                <p>
                  Připojíte se ve třídě a žáci sledují živý vstup s odborníkem
                  nebo inspirativním hostem.
                </p>
              </article>

              <article className="step">
                <span className="stepNumber">3</span>
                <h3>Pracujete s tématem</h3>
                <p>
                  Využijete pracovní listy, otázky a materiály, které na
                  vysílání navazují.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ZBYTEK ZŮSTÁVÁ BEZE ZMĚNY */}
        <section className="section sectionDirector">
          ...
        </section>

        <Footer />
      </main>
    </>
  );
}
