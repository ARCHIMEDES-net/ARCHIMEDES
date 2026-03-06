import Link from "next/link";

const trustItems = [
  { value: "20+", label: "učeben ARCHIMEDES" },
  { value: "1 000+", label: "zapojených žáků v síti" },
  { value: "2×", label: "měsíčně Senior klub" },
  { value: "Obec 2030", label: "vítěz soutěže" },
];

const marqueeRow1 = [
  "Hodonín",
  "Hovorany",
  "Moravský Krumlov",
  "Luže",
  "BVV Brno",
  "Ratíškovice",
  "Radvanice",
  "Dašice",
  "Mikulov",
];

const marqueeRow2 = [
  "Křenov",
  "Louny",
  "Čejč",
  "Hlinsko",
  "Chrudim",
  "Žabčice",
  "Bučovice",
  "Frýdek-Místek",
];

const schoolBenefits = [
  "hosté z praxe a inspirativní témata",
  "připravené podklady pro učitele a žáky",
  "archiv vysílání pro další použití",
  "jednoduché zapojení do výuky",
];

const municipalityBenefits = [
  "program pro děti i seniory",
  "smysluplný obsah pro komunitu obce",
  "propojení generací a místních aktivit",
  "viditelný přínos pro obyvatele i vedení obce",
];

const themes = [
  {
    title: "Přírodověda & technologie",
    text: "Živý vstup s expertem a pracovní list pro žáky.",
  },
  {
    title: "Wellbeing pro žáky",
    text: "Krátké rutiny, psychohygiena a práce s emocemi.",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "Inspirace, profese a dovednosti budoucnosti.",
  },
  {
    title: "Čtenářský klub",
    text: "Děti i dospělí – kniha měsíce a host programu.",
  },
  {
    title: "Senior klub",
    text: "Dvakrát měsíčně – prevence izolace a aktivní komunita.",
  },
  {
    title: "Smart Cities (deváťáci)",
    text: "Město očima mladých a práce s urbanistkou.",
  },
];

const badges = [
  "Záštita: Eva Pavlová",
  "MPO",
  "MŽP",
  "MMR",
  "UNESCO: Greening Education Partnership",
  "Finalista: E.ON Energy Globe",
  "Finalista: Creative Business Cup",
  "Vítěz: Obec 2030",
];

export default function Home() {
  return (
    <div className="page">
      <main>
        <section className="container hero">
          <div className="heroCard">
            <div className="heroContent">
              <div className="chipRow">
                <span className="chip chipDark">Živý vzdělávací program</span>
                <span className="chip">Školy + obce + komunita</span>
              </div>

              <h1>Každý měsíc nový program pro školu i komunitu obce</h1>

              <p className="heroLead">
                Živé vstupy s hosty, pracovní listy pro žáky a program pro komunitu obce.
                <br />
                Každý měsíc nový obsah, který může škola i obec hned využít.
              </p>

              <div className="heroCtas">
                <Link href="/ukazka" className="btn btnPrimary">
                  Domluvit ukázku programu
                </Link>
                <Link href="/program" className="btn btnGhostLight">
                  Prohlédnout program
                </Link>
                <Link href="/cenik" className="btn btnGhostLight">
                  Ceník a financování
                </Link>
              </div>

              <div className="microTrust">
                <span>20+ učeben</span>
                <span>1 000+ žáků v síti</span>
                <span>Vítěz soutěže Obec 2030</span>
              </div>
            </div>

            <div className="heroVisual">
              <div className="heroPhoto heroPhotoMain">
                <div className="visualLabel">Ukázka živé hodiny</div>
              </div>
              <div className="heroPhotoGrid">
                <div className="heroPhoto heroPhotoSmall">
                  <div className="visualLabel">Pracovní listy</div>
                </div>
                <div className="heroPhoto heroPhotoSmall alt">
                  <div className="visualLabel">Program pro obec</div>
                </div>
              </div>
            </div>
          </div>

          <div className="anchorChips">
            <a href="#duvera" className="anchorChip">Důvěra</a>
            <a href="#hodina" className="anchorChip">Jak funguje hodina</a>
            <a href="#skola" className="anchorChip">Pro školu</a>
            <a href="#obec" className="anchorChip">Pro obec</a>
            <a href="#program" className="anchorChip">Program</a>
            <a href="#sit" className="anchorChip">Síť učeben</a>
            <a href="#financovani" className="anchorChip">Financování</a>
          </div>
        </section>

        <section id="duvera" className="section sectionAlt">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow">Důkaz důvěry</div>
              <h2>ARCHIMEDES Live už funguje v řadě škol a obcí</h2>
            </div>

            <div className="trustGrid">
              {trustItems.map((item) => (
                <div key={item.label} className="trustCard">
                  <div className="trustValue">{item.value}</div>
                  <div className="trustLabel">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="marqueeBlock">
              <div className="marqueeTitle">Síť učeben ARCHIMEDES</div>

              <div className="marqueeWrap">
                <div className="marqueeTrack">
                  {[...marqueeRow1, ...marqueeRow1].map((place, i) => (
                    <span key={`row1-${place}-${i}`} className="marqueeItem">
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              <div className="marqueeWrap reverse">
                <div className="marqueeTrack marqueeTrackReverse">
                  {[...marqueeRow2, ...marqueeRow2].map((place, i) => (
                    <span key={`row2-${place}-${i}`} className="marqueeItem">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="hodina" className="section">
          <div className="container splitSection">
            <div className="splitText">
              <div className="eyebrow">Jak to funguje</div>
              <h2>Jedna hodina. Jasná struktura. Reálný výstup.</h2>

              <div className="stepList">
                <div className="stepCard">
                  <div className="stepNo">1</div>
                  <div>
                    <h3>Živý vstup s hostem</h3>
                    <p>
                      20–40 minut živého programu. Odborník z praxe, konkrétní téma,
                      možnost zapojení a dotazů.
                    </p>
                  </div>
                </div>

                <div className="stepCard">
                  <div className="stepNo">2</div>
                  <div>
                    <h3>Připravené podklady pro učitele a žáky</h3>
                    <p>
                      Materiály k tématu, které mohou učitelé okamžitě použít ve výuce.
                    </p>
                  </div>
                </div>

                <div className="stepCard">
                  <div className="stepNo">3</div>
                  <div>
                    <h3>Navazující aktivita</h3>
                    <p>
                      Krátká práce ve třídě nebo v komunitě. Program nekončí videem,
                      ale pokračuje v reálné činnosti.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="splitVisual">
              <div className="bigVisualCard">
                <div className="bigVisualTop">Ukázka živé hodiny</div>
                <div className="bigVisualBody">
                  <div className="visualPill">20–40 min živě</div>
                  <div className="visualPill">podklady pro výuku</div>
                  <div className="visualPill">navazující aktivita</div>
                </div>
                <div className="bigVisualBottom">
                  Učitel nezíská další složitý systém. Získá hotový program,
                  který může hned použít.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="skola" className="section sectionAlt">
          <div className="container twoCards">
            <div className="benefitCard">
              <div className="eyebrow">Pro školu</div>
              <h2>Program pro moderní výuku</h2>
              <p className="sectionLead">
                Každý měsíc nový obsah, který pomáhá učitelům a dává žákům
                kontakt s reálným světem.
              </p>
              <ul className="checkList">
                {schoolBenefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/ukazka" className="btn btnPrimary">
                Domluvit ukázku pro školu
              </Link>
            </div>

            <div id="obec" className="benefitCard">
              <div className="eyebrow">Pro obec</div>
              <h2>Program pro celou komunitu obce</h2>
              <p className="sectionLead">
                ARCHIMEDES Live není jen pro školu. Přináší také pravidelný obsah
                pro seniory, komunitu a společné aktivity v obci.
              </p>
              <ul className="checkList">
                {municipalityBenefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/ukazka" className="btn btnPrimary">
                Domluvit ukázku pro obec
              </Link>
            </div>
          </div>
        </section>

        <section id="program" className="section">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow">Každý měsíc hotový obsah</div>
              <h2>Ukázka tematických bloků programu</h2>
            </div>

            <div className="themeGrid">
              {themes.map((item) => (
                <div key={item.title} className="themeCard">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="inlineCtas centerCtas">
              <Link href="/program" className="btn btnPrimary">
                Zobrazit celý program
              </Link>
              <Link href="/ukazka" className="btn btnGhost">
                Domluvit ukázku programu
              </Link>
            </div>
          </div>
        </section>

        <section id="sit" className="section sectionAlt">
          <div className="container networkSection">
            <div className="networkText">
              <div className="eyebrow">Síť učeben ARCHIMEDES</div>
              <h2>Program je napojený na reálná místa a skutečné školy</h2>
              <p className="sectionLead">
                ARCHIMEDES Live stojí na fyzické síti učeben a zkušenostech škol
                a obcí, které už program využívají.
              </p>

              <div className="inlineCtas">
                <Link href="/ukazka" className="btn btnGhost">
                  Chci ukázku / zapojení
                </Link>
              </div>
            </div>

            <div className="networkPhotos">
              <div className="networkPhoto left">
                <span>Učebna ARCHIMEDES</span>
              </div>
              <div className="networkPhoto right">
                <span>Živý program</span>
              </div>
            </div>
          </div>
        </section>

        <section id="financovani" className="section">
          <div className="container">
            <div className="financingCard">
              <div>
                <div className="eyebrow">Prakticky</div>
                <h2>Financování programu pro školy i obce</h2>
                <p className="sectionLead">
                  U škol je možné řešit financování i přes dotační tituly typu OP JAK
                  a související šablony. Připravíme popis programu, přínosy a podklady,
                  aby bylo řešení administrativně co nejjednodušší.
                </p>

                <div className="miniInfoRow">
                  <span className="infoPill">hotové texty a argumenty</span>
                  <span className="infoPill">ukázková hodina</span>
                  <span className="infoPill">pracovní listy jako výstup</span>
                </div>
              </div>

              <div className="financingCtas">
                <Link href="/cenik" className="btn btnPrimary">
                  Ceník a financování
                </Link>
                <Link href="/ukazka" className="btn btnGhost">
                  Domluvit ukázku
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionAlt">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow">Důvěra</div>
              <h2>Záštity, ocenění a partnerství</h2>
            </div>

            <div className="badgeRow">
              {badges.map((badge) => (
                <span key={badge} className="badge">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="container finalCtaWrap">
          <div className="finalCta">
            <div>
              <div className="eyebrow eyebrowLight">Další krok</div>
              <h2>Chcete ukázku pro školu nebo obec?</h2>
              <p>
                Během krátké online schůzky ukážeme jednu hodinu programu,
                podklady pro výuku a prostředí portálu.
              </p>
            </div>

            <div className="finalCtaButtons">
              <Link href="/ukazka" className="btn btnWhite">
                Domluvit ukázku programu
              </Link>
              <Link href="/program" className="btn btnOutlineLight">
                Prohlédnout program
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page {
          background: #f6f7fb;
          color: #111827;
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding-left: 16px;
          padding-right: 16px;
        }

        .section {
          padding: 84px 0;
        }

        .sectionAlt {
          background: #eef1f7;
        }

        .hero {
          padding-top: 34px;
          padding-bottom: 34px;
        }

        .heroCard {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 22px;
          align-items: stretch;
          background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
          border-radius: 28px;
          overflow: hidden;
          min-height: 560px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
        }

        .heroContent {
          padding: 36px 34px 34px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .chipRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          padding: 9px 14px;
          border-radius: 999px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.95);
        }

        .chipDark {
          background: rgba(16, 185, 129, 0.18);
          border-color: rgba(16, 185, 129, 0.32);
        }

        h1 {
          font-size: 56px;
          line-height: 1.05;
          margin: 0 0 18px;
          letter-spacing: -0.03em;
        }

        .heroLead {
          font-size: 20px;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.92);
          max-width: 650px;
          margin: 0 0 26px;
        }

        .heroCtas,
        .inlineCtas,
        .financingCtas,
        .finalCtaButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .microTrust {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 24px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.78);
        }

        .heroVisual {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .heroPhotoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
        }

        .heroPhoto {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background-size: cover;
          background-position: center;
          min-height: 180px;
        }

        .heroPhotoMain {
          min-height: 320px;
          background:
            linear-gradient(rgba(0,0,0,0.24), rgba(0,0,0,0.28)),
            url("/media/hero-classroom.jpg"),
            linear-gradient(135deg, #334155 0%, #0f172a 100%);
          background-size: cover;
          background-position: center;
        }

        .heroPhotoSmall {
          background:
            linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.22)),
            url("/media/lesson-closeup.webp"),
            linear-gradient(135deg, #475569 0%, #111827 100%);
          background-size: cover;
          background-position: center;
        }

        .heroPhotoSmall.alt {
          background:
            linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.22)),
            url("/media/community-seniors.jpg"),
            linear-gradient(135deg, #475569 0%, #111827 100%);
          background-size: cover;
          background-position: center;
        }

        .visualLabel {
          position: absolute;
          left: 14px;
          bottom: 14px;
          display: inline-flex;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.72);
          color: white;
          border-radius: 999px;
          font-size: 13px;
          backdrop-filter: blur(6px);
        }

        .anchorChips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .anchorChip {
          padding: 10px 14px;
          border-radius: 999px;
          background: white;
          color: #374151;
          text-decoration: none;
          font-size: 14px;
          border: 1px solid rgba(17, 24, 39, 0.08);
        }

        .sectionIntro {
          margin-bottom: 30px;
        }

        .eyebrow {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .eyebrowLight {
          color: rgba(255, 255, 255, 0.72);
        }

        h2 {
          font-size: 42px;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .trustGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 22px;
        }

        .trustCard,
        .themeCard,
        .benefitCard,
        .bigVisualCard,
        .financingCard,
        .stepCard {
          background: white;
          border: 1px solid rgba(17, 24, 39, 0.08);
          border-radius: 22px;
        }

        .trustCard {
          padding: 22px;
        }

        .trustValue {
          font-size: 42px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 8px;
        }

        .trustLabel {
          font-size: 16px;
          color: #4b5563;
        }

        .marqueeBlock {
          background: white;
          border: 1px solid rgba(17, 24, 39, 0.08);
          border-radius: 22px;
          padding: 22px;
        }

        .marqueeTitle {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 14px;
          color: #111827;
        }

        .splitSection {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 26px;
          align-items: start;
        }

        .splitText {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .splitVisual {
          display: flex;
        }

        .stepList {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .stepCard {
          padding: 20px;
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 16px;
        }

        .stepNo {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.2;
        }

        p {
          margin: 0;
          font-size: 17px;
          line-height: 1.7;
          color: #4b5563;
        }

        .sectionLead {
          font-size: 19px;
          line-height: 1.75;
          color: #4b5563;
        }

        .bigVisualCard {
          width: 100%;
          padding: 26px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }

        .bigVisualTop {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b7280;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .bigVisualBody {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .visualPill,
        .infoPill {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #111827;
          font-size: 14px;
        }

        .bigVisualBottom {
          font-size: 18px;
          line-height: 1.7;
          color: #374151;
          margin-top: 12px;
        }

        .twoCards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .benefitCard {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .checkList {
          list-style: none;
          padding: 0;
          margin: 0 0 10px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkList li {
          position: relative;
          padding-left: 28px;
          font-size: 17px;
          color: #374151;
          line-height: 1.6;
        }

        .checkList li:before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: #10b981;
          font-weight: 700;
        }

        .themeGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .themeCard {
          padding: 24px;
        }

        .themeCard p {
          font-size: 16px;
        }

        .centerCtas {
          justify-content: center;
          margin-top: 28px;
        }

        .miniInfoRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .marqueeWrap {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid rgba(17, 24, 39, 0.06);
        }

        .marqueeWrap.reverse {
          margin-top: 14px;
        }

        .marqueeWrap:before,
        .marqueeWrap:after {
          content: "";
          position: absolute;
          top: 0;
          width: 72px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .marqueeWrap:before {
          left: 0;
          background: linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0) 100%);
        }

        .marqueeWrap:after {
          right: 0;
          background: linear-gradient(to left, #ffffff 0%, rgba(255,255,255,0) 100%);
        }

        .marqueeTrack {
          display: flex;
          align-items: center;
          gap: 14px;
          width: max-content;
          padding: 18px 0;
          animation: marqueeMove 34s linear infinite;
        }

        .marqueeTrackReverse {
          animation: marqueeMoveReverse 36s linear infinite;
        }

        .marqueeWrap:hover .marqueeTrack,
        .marqueeWrap:hover .marqueeTrackReverse {
          animation-play-state: paused;
        }

        .marqueeItem {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 999px;
          background: #eef1f7;
          color: #111827;
          font-size: 15px;
          white-space: nowrap;
        }

        .networkSection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 26px;
          align-items: center;
        }

        .networkText {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .networkPhotos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .networkPhoto {
          min-height: 340px;
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: end;
          padding: 16px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          background-size: cover;
          background-position: center;
        }

        .networkPhoto.left {
          background:
            linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.3)),
            url("/media/exterior-kids.webp"),
            linear-gradient(135deg, #475569 0%, #111827 100%);
          background-size: cover;
          background-position: center;
        }

        .networkPhoto.right {
          background:
            linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.3)),
            url("/media/online-session.jpg"),
            linear-gradient(135deg, #475569 0%, #111827 100%);
          background-size: cover;
          background-position: center;
        }

        .networkPhoto span {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.68);
        }

        .financingCard {
          padding: 28px;
          display: grid;
          grid-template-columns: 1.2fr auto;
          gap: 20px;
          align-items: center;
          background: white;
          border: 1px solid rgba(17, 24, 39, 0.08);
          border-radius: 22px;
        }

        .badgeRow {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f3f4f6;
          border: 1px solid rgba(17, 24, 39, 0.08);
          font-size: 14px;
          color: #374151;
        }

        .finalCtaWrap {
          padding-top: 0;
          padding-bottom: 96px;
        }

        .finalCta {
          background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
          border-radius: 28px;
          padding: 36px;
          color: white;
          display: grid;
          grid-template-columns: 1.1fr auto;
          gap: 20px;
          align-items: center;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
        }

        .finalCta p {
          color: rgba(255, 255, 255, 0.82);
          margin-top: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 14px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btnPrimary {
          background: #111827;
          color: white;
          box-shadow: 0 10px 24px rgba(17, 24, 39, 0.16);
        }

        .btnGhost {
          background: white;
          color: #111827;
          border: 1px solid rgba(17, 24, 39, 0.12);
        }

        .btnGhostLight {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.16);
        }

        .btnWhite {
          background: white;
          color: #111827;
        }

        .btnOutlineLight {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.26);
        }

        @keyframes marqueeMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marqueeMoveReverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @media (max-width: 1080px) {
          h1 {
            font-size: 46px;
          }

          h2 {
            font-size: 36px;
          }

          .heroCard,
          .splitSection,
          .twoCards,
          .financingCard,
          .finalCta,
          .networkSection {
            grid-template-columns: 1fr;
          }

          .trustGrid,
          .themeGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .hero {
            padding-top: 20px;
          }

          .heroCard {
            min-height: auto;
          }

          .heroContent,
          .heroVisual,
          .trustCard,
          .themeCard,
          .benefitCard,
          .bigVisualCard,
          .financingCard,
          .stepCard,
          .finalCta,
          .marqueeBlock {
            padding-left: 20px;
            padding-right: 20px;
          }

          h1 {
            font-size: 36px;
          }

          h2 {
            font-size: 30px;
          }

          .heroLead,
          .sectionLead,
          p {
            font-size: 16px;
          }

          .trustGrid,
          .themeGrid,
          .heroPhotoGrid,
          .networkPhotos {
            grid-template-columns: 1fr;
          }

          .heroPhotoMain {
            min-height: 220px;
          }

          .heroPhotoSmall,
          .networkPhoto {
            min-height: 180px;
          }

          .stepCard {
            grid-template-columns: 1fr;
          }

          .stepNo {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .section {
            padding: 64px 0;
          }

          .finalCtaWrap {
            padding-bottom: 72px;
          }
        }
      `}</style>
    </div>
  );
}
