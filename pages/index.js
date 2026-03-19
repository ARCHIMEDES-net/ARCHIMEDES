import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/hero-vyuka.jpg";
const stepOnlineImg = "/jak-funguje-online.jpg";
const stepClassImg = "/jak-funguje-trida.jpg";
const stepBoardImg = "/jak-funguje-tabule.jpg";

export default function Home() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy a obce</title>
        <meta
          name="description"
          content="ARCHIMEDES Live přináší školám živé vstupy s odborníky, interaktivní výuku a program, který dává smysl škole i obci."
        />
      </Head>

      <main className="page">
        {/* HERO */}
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
                  Přinášíme
                  <br />
                  život do výuky
                </h1>

                <p className="heroLead">
                  Živé vstupy s odborníky, interaktivní práce ve třídě a program,
                  který dává smysl škole i obci.
                </p>

                <div className="heroActions">
                  <Link href="/poptavka" className="btn btnPrimary">
                    Chci ukázkovou hodinu
                  </Link>
                  <Link href="/program" className="btn btnSecondary">
                    Prohlédnout program
                  </Link>
                </div>

                <div className="heroMeta">
                  <span>živé vstupy</span>
                  <span>reálné školy</span>
                  <span>ověřeno v praxi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JAK TO FUNGUJE */}
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
                  <img src={stepOnlineImg} alt="Živý odborník na obrazovce" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">1</div>
                  <h3>Živý odborník přímo ve třídě</h3>
                  <p>
                    Škola se připojí k živému vstupu a děti se setkají s hostem z
                    praxe, autorem nebo odborníkem.
                  </p>
                </div>
              </article>

              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepClassImg} alt="Žáci sledují a reagují" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">2</div>
                  <h3>Žáci sledují, reagují a vnímají</h3>
                  <p>
                    Výuka není pasivní. Děti se zapojují, sledují, přemýšlejí a
                    pracují s tématem ve třídě.
                  </p>
                </div>
              </article>

              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepBoardImg} alt="Interaktivní práce ve škole" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">3</div>
                  <h3>Interaktivní práce a návaznost</h3>
                  <p>
                    Škola má k dispozici pracovní listy, návaznost do výuky i
                    možnost vracet se k tématům v archivu.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* PRINOSY */}
        <section className="section sectionSoft">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow dark">Co to přináší</div>
              <h2>Program, který dává hodnotu škole i obci</h2>
            </div>

            <div className="benefitsGrid">
              <div className="benefitCard">
                <h3>Pro školu</h3>
                <p>
                  Moderní výuka, inspirativní hosté a obsah, který učitelé mohou
                  využít bez složité přípravy.
                </p>
              </div>

              <div className="benefitCard">
                <h3>Pro žáky</h3>
                <p>
                  Setkání s reálným světem, větší motivace a témata, která
                  přesahují běžnou učebnici.
                </p>
              </div>

              <div className="benefitCard">
                <h3>Pro obec</h3>
                <p>
                  Program může sloužit nejen škole, ale i komunitě, seniorům a
                  společným aktivitám v obci.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DUVĚRA */}
        <section className="section">
          <div className="container">
            <div className="trustPanel">
              <div>
                <div className="eyebrow dark">Ověřeno v praxi</div>
                <h2>ARCHIMEDES už funguje v reálných školách a obcích</h2>
                <p>
                  Nejde o teorii. Jde o model, který je možné ukázat v provozu a
                  který už má za sebou konkrétní zkušenosti z terénu.
                </p>
              </div>

              <div className="trustStats">
                <div className="trustStat">
                  <strong>20+</strong>
                  <span>míst v síti ARCHIMEDES</span>
                </div>
                <div className="trustStat">
                  <strong>živě</strong>
                  <span>pro školy i komunitu</span>
                </div>
                <div className="trustStat">
                  <strong>reálně</strong>
                  <span>ověřeno ve výuce</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="ctaSection">
          <div className="container">
            <div className="ctaBox">
              <div>
                <div className="eyebrow light">Chcete to vidět ve vlastní škole?</div>
                <h2>Ukážeme vám ARCHIMEDES Live v praxi</h2>
                <p>
                  Domluvíme ukázkovou hodinu a společně se podíváme, jak může
                  program fungovat právě u vás.
                </p>
              </div>

              <div className="ctaActions">
                <Link href="/poptavka" className="btn btnLight">
                  Domluvit ukázku
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            background: #f7f8fb;
            color: #0f172a;
          }

          .container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .hero {
            position: relative;
            min-height: 720px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
          }

          .heroMedia {
            position: absolute;
            inset: 0;
          }

          .heroMedia img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
          }

          .heroOverlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              rgba(8, 15, 34, 0.78) 0%,
              rgba(8, 15, 34, 0.55) 30%,
              rgba(8, 15, 34, 0.18) 55%,
              rgba(8, 15, 34, 0.05) 100%
            );
          }

          .heroContentWrap {
            position: relative;
            z-index: 2;
            width: 100%;
            display: flex;
            align-items: center;
          }

          .heroContent {
            max-width: 620px;
            padding: 92px 0 86px;
            color: white;
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
          }

          .eyebrow.dark {
            background: #e9eef8;
            color: #223252;
          }

          .eyebrow.light {
            background: rgba(255, 255, 255, 0.14);
            color: rgba(255, 255, 255, 0.92);
          }

          .heroContent .eyebrow {
            background: rgba(255, 255, 255, 0.14);
            color: rgba(255, 255, 255, 0.94);
          }

          h1 {
            margin: 0;
            font-size: 72px;
            line-height: 0.96;
            letter-spacing: -0.05em;
            font-weight: 900;
          }

          .heroLead {
            margin: 22px 0 0;
            font-size: 22px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
            max-width: 580px;
          }

          .heroActions,
          .ctaActions {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
          }

          .heroActions {
            margin-top: 30px;
          }

          .heroMeta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 24px;
          }

          .heroMeta span {
            display: inline-flex;
            align-items: center;
            min-height: 36px;
            padding: 0 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.92);
            font-size: 14px;
            font-weight: 700;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 52px;
            padding: 0 22px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 800;
            transition: 0.18s ease;
          }

          .btnPrimary {
            background: white;
            color: #0f172a;
          }

          .btnPrimary:hover {
            transform: translateY(-2px);
            background: #f3f4f6;
          }

          .btnSecondary {
            border: 1px solid rgba(255, 255, 255, 0.26);
            color: white;
            background: rgba(255, 255, 255, 0.08);
          }

          .btnSecondary:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.14);
          }

          .btnLight {
            background: white;
            color: #0f172a;
          }

          .btnLight:hover {
            transform: translateY(-2px);
            background: #f3f4f6;
          }

          .section {
            padding: 86px 0;
          }

          .sectionSoft {
            background: #eef2f7;
          }

          .sectionIntro {
            margin-bottom: 28px;
          }

          .sectionIntro.center {
            text-align: center;
            max-width: 820px;
            margin: 0 auto 34px;
          }

          h2 {
            margin: 0;
            font-size: 44px;
            line-height: 1.04;
            letter-spacing: -0.04em;
            font-weight: 900;
            color: #0f172a;
          }

          .sectionIntro p,
          .trustPanel p,
          .ctaBox p {
            margin: 14px 0 0;
            font-size: 18px;
            line-height: 1.7;
            color: #4b5563;
            max-width: 760px;
          }

          .stepsGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }

          .stepCard,
          .benefitCard {
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.04);
          }

          .stepImage img {
            width: 100%;
            height: 260px;
            object-fit: cover;
            display: block;
          }

          .stepBody {
            padding: 22px;
          }

          .stepNumber {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            background: #0f172a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 14px;
          }

          .stepBody h3,
          .benefitCard h3 {
            margin: 0;
            font-size: 24px;
            line-height: 1.15;
            font-weight: 900;
            color: #0f172a;
          }

          .stepBody p,
          .benefitCard p {
            margin: 10px 0 0;
            font-size: 16px;
            line-height: 1.65;
            color: #556070;
          }

          .benefitsGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }

          .benefitCard {
            padding: 26px;
          }

          .trustPanel {
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
            gap: 28px;
            align-items: start;
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 28px;
            padding: 30px;
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.04);
          }

          .trustStats {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .trustStat {
            border-radius: 20px;
            background: #f6f8fb;
            padding: 18px 18px 16px;
            border: 1px solid rgba(15, 23, 42, 0.06);
          }

          .trustStat strong {
            display: block;
            font-size: 28px;
            line-height: 1;
            font-weight: 900;
            color: #0f172a;
          }

          .trustStat span {
            display: block;
            margin-top: 8px;
            font-size: 14px;
            line-height: 1.5;
            color: #5b6472;
            font-weight: 700;
          }

          .ctaSection {
            padding: 0 0 90px;
          }

          .ctaBox {
            background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
            color: white;
            border-radius: 30px;
            padding: 36px 30px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 20px;
            align-items: center;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
          }

          .ctaBox h2 {
            color: white;
          }

          .ctaBox p {
            color: rgba(255, 255, 255, 0.82);
          }

          @media (max-width: 1100px) {
            .stepsGrid,
            .benefitsGrid,
            .trustPanel,
            .ctaBox {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 900px) {
            .hero {
              min-height: 640px;
            }

            h1 {
              font-size: 52px;
              line-height: 1;
            }

            h2 {
              font-size: 34px;
            }

            .heroLead {
              font-size: 18px;
            }

            .stepImage img {
              height: 220px;
            }
          }

          @media (max-width: 640px) {
            .container {
              padding: 0 16px;
            }

            .hero {
              min-height: 560px;
            }

            .heroOverlay {
              background: linear-gradient(
                180deg,
                rgba(8, 15, 34, 0.68) 0%,
                rgba(8, 15, 34, 0.42) 45%,
                rgba(8, 15, 34, 0.3) 100%
              );
            }

            .heroContent {
              max-width: none;
              padding: 82px 0 56px;
            }

            h1 {
              font-size: 42px;
              letter-spacing: -0.04em;
            }

            .heroLead,
            .sectionIntro p,
            .trustPanel p,
            .ctaBox p {
              font-size: 16px;
            }

            .btn,
            .heroActions a,
            .ctaActions a {
              width: 100%;
            }

            .heroActions,
            .ctaActions {
              flex-direction: column;
            }
          }
        `}</style>
      </main>
    </>
  );
}
