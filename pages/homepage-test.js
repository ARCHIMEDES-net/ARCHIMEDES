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
                  Učitel pustí vysílání, žáci pracují s reálným tématem a škola získá moderní výuku bez složité přípravy.
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

        <section className="section sectionProgram">
          <div className="container">
            <div className="programGrid">
              <div className="programText">
                <div className="eyebrow blue">Pravidelný program každý měsíc</div>
                <h2>Každý měsíc zažijete</h2>

                <p>
                  ARCHIMEDES Live přináší škole pravidelný živý program, který lze jednoduše zařadit do výuky na 1. i 2. stupni ZŠ.
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

        <section className="section sectionHow">
          <div className="container">
            <div className="splitHeader">
              <div>
                <div className="eyebrow blue">Jak to funguje</div>
                <h2>Tři kroky, které zvládne každý učitel</h2>
              </div>

              <p>
                ARCHIMEDES Live není složitý software. Je to připravený program, který škola jednoduše pustí ve třídě.
              </p>
            </div>

            <div className="steps">
              <article className="step">
                <span className="stepNumber">1</span>
                <h3>Vyberete téma</h3>
                <p>
                  Z programu si vyberete živé vysílání nebo záznam, který se hodí do vaší výuky.
                </p>
              </article>

              <article className="step">
                <span className="stepNumber">2</span>
                <h3>Pustíte vysílání</h3>
                <p>
                  Připojíte se ve třídě a žáci sledují živý vstup s odborníkem nebo inspirativním hostem.
                </p>
              </article>

              <article className="step">
                <span className="stepNumber">3</span>
                <h3>Pracujete s tématem</h3>
                <p>
                  Využijete pracovní listy, otázky a materiály, které na vysílání navazují.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section sectionDirector">
          <div className="container">
            <div className="directorBox">
              <div className="directorIntro">
                <div className="eyebrow blue">Pro ředitele a učitele</div>
                <h2>Jasné využití ve škole bez další zátěže</h2>

                <p>
                  Školy i učitelé dnes dělají maximum. Mnoho žáků ale nevidí, k čemu je jim škola v reálném životě. ARCHIMEDES Live pomáhá výuku propojit s praxí, lidmi a tématy mimo běžnou učebnici.
                </p>
              </div>

              <div className="directorCards">
                <div className="directorCard">
                  <strong>Pro ředitele</strong>
                  <span>
                    moderní výuka, přehledná cena, jednoduchá fakturace a jasně obhajitelný přínos pro školu
                  </span>
                </div>

                <div className="directorCard">
                  <strong>Pro učitele</strong>
                  <span>
                    připravené vysílání, záznam a pracovní list bez složité přípravy
                  </span>
                </div>

                <div className="directorCard">
                  <strong>Pro žáky</strong>
                  <span>
                    reálný svět, profese, věda, kultura, příroda a živá setkání s lidmi z praxe
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionClassroom">
          <div className="container">
            <div className="classroomBox">
              <div className="classroomImage">
                <img
                  src={classroomImg}
                  alt="Venkovní učebna ARCHIMEDES pro celoroční použití"
                />
              </div>

              <div className="classroomText">
                <div className="eyebrow blue">Venkovní učebna ARCHIMEDES®</div>

                <h2>
                  Nejprodávanější venkovní učebna v Evropě pro celoroční použití
                </h2>

                <p>
                  ARCHIMEDES® je moderní venkovní učebna pro školy, která propojuje přírodu, technologie a vzdělávání. V kombinaci s živým vysíláním ARCHIMEDES Live vzniká prostředí, kde se žáci učí v souvislostech a v kontaktu s reálným světem.
                </p>

                <div className="classroomTags">
                  <span>venkovní učebna</span>
                  <span>celoroční výuka</span>
                  <span>škola a obec</span>
                  <span>živé vzdělávání</span>
                </div>

                <Link
                  href="/ucebna"
                  className="textArrow"
                  onClick={() => track("test_klik_home_ucebna")}
                >
                  Zjistit více o venkovní učebně ARCHIMEDES® →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionFinal">
          <div className="container">
            <div className="finalBox">
              <div>
                <div className="eyebrow white">Doporučený první krok</div>
                <h2>Začněte s balíčkem START</h2>

                <p>
                  Přístup pro celou školu do 31. 12. 2026. Živá vysílání, záznamy a pracovní listy na jednom místě.
                </p>
              </div>

              <div className="finalActions">
                <ButtonLink
                  href="/start"
                  variant="light"
                  eventName="test_klik_home_final_start"
                >
                  Začít s balíčkem START
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f9fc;
            color: #0f172a;
          }

          .container {
            width: min(1180px, calc(100% - 40px));
            margin: 0 auto;
          }

          .heroLight {
            padding: 56px 0 34px;
            background:
              radial-gradient(circle at 16% 14%, rgba(37, 99, 235, 0.08), transparent 26%),
              linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .heroLightGrid {
            display: grid;
            grid-template-columns: minmax(0, 0.88fr) minmax(520px, 1.12fr);
            gap: 44px;
            align-items: center;
          }

          .heroCopy {
            padding: 24px 0;
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            width: fit-content;
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 18px;
          }

          .eyebrow.blue {
            background: #eaf2ff;
            color: #0b57d0;
          }

          .eyebrow.white {
            background: rgba(255, 255, 255, 0.14);
            color: #ffffff;
          }

          h1,
          h2,
          h3,
          p {
            margin-top: 0;
          }

          h1 {
            max-width: 650px;
            margin-bottom: 20px;
            font-size: clamp(40px, 4.7vw, 64px);
            line-height: 0.99;
            letter-spacing: -0.06em;
            font-weight: 950;
            color: #07142d;
            text-wrap: balance;
          }

          h2 {
            margin-bottom: 14px;
            font-size: clamp(32px, 4vw, 48px);
            line-height: 1.04;
            letter-spacing: -0.055em;
            font-weight: 950;
            color: #07142d;
            text-wrap: balance;
          }

          h3 {
            margin-bottom: 8px;
            font-size: 22px;
            line-height: 1.15;
            letter-spacing: -0.035em;
            font-weight: 900;
            color: #07142d;
          }

          .heroLead {
            max-width: 620px;
            margin-bottom: 22px;
            font-size: 22px;
            line-height: 1.55;
            color: #435068;
          }

          .heroStartProof {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            max-width: 560px;
            margin: 0 0 26px;
            font-size: 17px;
            line-height: 1.55;
            color: #17223a;
          }

          .checkCircle {
            flex: 0 0 auto;
            width: 28px;
            height: 28px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
            border: 2px solid #16a34a;
            color: #16a34a;
            font-weight: 900;
          }

          .heroActions,
          .programActions,
          .finalActions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }

          .textArrow:hover {
            text-decoration: underline;
          }

          .heroVisual {
            display: grid;
            grid-template-columns: 300px minmax(0, 1fr);
            gap: 18px;
            align-items: center;
          }

          .heroPhoto {
            height: 410px;
            border-radius: 26px;
            overflow: hidden;
            background: #e2e8f0;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 22px 56px rgba(15, 23, 42, 0.12);
          }

          .heroPhoto img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            display: block;
          }

          .startCard {
            width: 100%;
            padding: 24px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.11);
          }

          .startCardLabel {
            margin-bottom: 18px;
            font-size: 28px;
            line-height: 1;
            font-weight: 950;
            letter-spacing: -0.045em;
            color: #16a34a;
          }

          .startCardMeta {
            display: grid;
            gap: 4px;
            margin-bottom: 18px;
            font-size: 14px;
            line-height: 1.45;
            color: #4b5563;
          }

          .startCardMeta strong {
            color: #07142d;
          }

          .startCard ul {
            list-style: none;
            margin: 0;
            padding: 0 0 18px;
            display: grid;
            gap: 10px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          }

          .startCard li {
            position: relative;
            padding-left: 26px;
            font-size: 15px;
            line-height: 1.35;
            color: #1f2937;
          }

          .startCard li::before {
            content: "✓";
            position: absolute;
            left: 0;
            top: 0;
            color: #16a34a;
            font-weight: 950;
          }

          .startCardPrice {
            padding: 18px 0;
            text-align: center;
          }

          .startCardPrice strong {
            display: block;
            font-size: 34px;
            line-height: 1;
            letter-spacing: -0.055em;
            color: #16a34a;
          }

          .startCardPrice span {
            display: block;
            margin-top: 6px;
            font-size: 14px;
            color: #64748b;
            font-weight: 800;
          }

          .startMiniNote {
            margin: 0 -24px -24px;
            padding: 18px 24px;
            background: #eaf8ef;
            border-radius: 0 0 22px 22px;
            color: #0f3d24;
            font-size: 13px;
            line-height: 1.45;
            font-weight: 800;
          }

          .proofBar {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0;
            margin-top: 30px;
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 22px;
            box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
            overflow: hidden;
          }

          .proofItem {
            display: flex;
            gap: 12px;
            padding: 22px;
            border-right: 1px solid rgba(15, 23, 42, 0.08);
          }

          .proofItem:last-child {
            border-right: 0;
          }

          .proofIcon {
            flex: 0 0 auto;
            width: 40px;
            height: 40px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #edf4ff;
            color: #0b57d0;
          }

          .proofItem strong {
            display: block;
            margin-bottom: 4px;
            font-size: 15px;
            color: #07142d;
          }

          .proofItem p {
            margin: 0;
            font-size: 14px;
            line-height: 1.45;
            color: #536179;
          }

          .section {
            padding: 70px 0;
          }

          .splitHeader {
            display: grid;
            grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.7fr);
            gap: 36px;
            align-items: end;
            margin-bottom: 28px;
          }

          .splitHeader p,
          .programText p,
          .directorIntro p,
          .classroomText p,
          .finalBox p {
            font-size: 18px;
            line-height: 1.7;
            color: #536179;
          }

          .steps {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .step,
          .directorCard {
            padding: 26px;
            border-radius: 24px;
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.045);
          }

          .stepNumber {
            width: 34px;
            height: 34px;
            margin-bottom: 18px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #0b57d0;
            color: #ffffff;
            font-weight: 950;
          }

          .step p,
          .directorCard span {
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
            color: #536179;
          }

          .sectionProgram {
            background: #ffffff;
            border-top: 1px solid rgba(15, 23, 42, 0.06);
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .programGrid {
            display: grid;
            grid-template-columns: minmax(0, 0.85fr) minmax(360px, 1.15fr);
            gap: 36px;
            align-items: center;
          }

          .programActions {
            margin-top: 24px;
          }

          .monthlyProgramCard {
            padding: 30px;
            border-radius: 24px;
            background: #ffffff;
            color: #0f172a;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
          }

          .monthlyProgramCard ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 14px;
          }

          .monthlyProgramCard li {
            position: relative;
            padding-left: 34px;
            font-size: 18px;
            line-height: 1.5;
            color: #17223a;
            font-weight: 850;
          }

          .monthlyProgramCard li::before {
            content: "✓";
            position: absolute;
            left: 0;
            top: 2px;
            width: 22px;
            height: 22px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eaf8ef;
            color: #16a34a;
            font-size: 14px;
            font-weight: 950;
          }

          .directorBox {
            display: grid;
            grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.1fr);
            gap: 34px;
            align-items: center;
          }

          .directorCards {
            display: grid;
            gap: 14px;
          }

          .directorCard strong {
            display: block;
            margin-bottom: 8px;
            font-size: 18px;
            color: #07142d;
          }

          .sectionClassroom {
            background: #ffffff;
            border-top: 1px solid rgba(15, 23, 42, 0.06);
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .classroomBox {
            display: grid;
            grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
            gap: 34px;
            align-items: center;
          }

          .classroomImage {
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 16px 42px rgba(15, 23, 42, 0.08);
          }

          .classroomImage img {
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
            display: block;
          }

          .classroomTags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0 22px;
          }

          .classroomTags span {
            display: inline-flex;
            min-height: 32px;
            align-items: center;
            padding: 0 12px;
            border-radius: 999px;
            background: #eef5ff;
            color: #0b57d0;
            font-size: 13px;
            font-weight: 900;
          }

          .textArrow {
            color: #0b57d0;
            font-weight: 950;
            text-decoration: none;
          }

          .sectionFinal {
            padding-bottom: 84px;
          }

          .finalBox {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 28px;
            align-items: center;
            padding: 34px;
            border-radius: 28px;
            background: linear-gradient(135deg, #0b57d0 0%, #123b7a 100%);
            color: #ffffff;
            box-shadow: 0 22px 54px rgba(37, 99, 235, 0.18);
          }

          .finalBox h2,
          .finalBox p {
            color: #ffffff;
          }

          .finalBox p {
            margin-bottom: 0;
            opacity: 0.88;
          }

          @media (max-width: 1120px) {
            .heroLightGrid,
            .programGrid,
            .directorBox,
            .classroomBox,
            .splitHeader,
            .finalBox {
              grid-template-columns: 1fr;
            }

            .heroVisual {
              grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
            }

            .heroPhoto {
              height: 360px;
            }

            .proofBar {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .proofItem:nth-child(2) {
              border-right: 0;
            }

            .proofItem:nth-child(1),
            .proofItem:nth-child(2) {
              border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            }

            .steps {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 760px) {
            .container {
              width: min(100% - 32px, 1180px);
            }

            .heroLight {
              padding: 38px 0 28px;
            }

            .heroVisual {
              grid-template-columns: 1fr;
            }

            .startCard {
              order: 1;
            }

            .heroPhoto {
              order: 2;
              height: 260px;
            }

            .heroLead {
              font-size: 18px;
            }

            .heroActions,
            .programActions,
            .finalActions {
              flex-direction: column;
            }

            .heroActions :global(.al-btn),
            .programActions :global(.al-btn),
            .finalActions :global(.al-btn) {
              width: 100%;
            }

            .proofBar {
              grid-template-columns: 1fr;
            }

            .proofItem {
              border-right: 0;
              border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            }

            .proofItem:last-child {
              border-bottom: 0;
            }

            .section {
              padding: 52px 0;
            }

            .finalBox {
              padding: 26px;
            }
          }
        `}</style>

        <style jsx global>{`
          .al-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 54px;
            padding: 0 24px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 950;
            font-size: 16px;
            line-height: 1.2;
            white-space: nowrap;
            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease,
              background 0.18s ease,
              border-color 0.18s ease,
              color 0.18s ease;
          }

          .al-btn:hover {
            transform: translateY(-2px);
          }

          .al-btn-green {
            background: #16a34a;
            color: #ffffff;
            border: 1px solid #16a34a;
            box-shadow: 0 12px 26px rgba(22, 163, 74, 0.22);
          }

          .al-btn-green:hover {
            background: #12813c;
            border-color: #12813c;
            color: #ffffff;
          }

          .al-btn-white {
            background: #ffffff;
            color: #0b57d0;
            border: 1px solid rgba(11, 87, 208, 0.18);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          }

          .al-btn-white:hover {
            background: #f8fbff;
            color: #0b57d0;
            border-color: rgba(11, 87, 208, 0.28);
          }

          .al-btn-light {
            background: #ffffff;
            color: #0b57d0;
            border: 1px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
          }

          .al-btn-light:hover {
            background: #ffffff;
            color: #0b57d0;
          }

          .al-btn-outlineLight {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.28);
          }

          .al-btn-outlineLight:hover {
            background: rgba(255, 255, 255, 0.14);
            color: #ffffff;
          }
        `}</style>
      </main>
    </>
  );
}
