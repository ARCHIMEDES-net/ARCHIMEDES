import Head from "next/head";
import Link from "next/link";

const fitAreas = [
  {
    title: "Inovativní vzdělávání žáků",
    text:
      "Živé vstupy, tematické programy, práce s třídou a pracovní listy přinášejí do výuky nový a přirozeně použitelný formát.",
  },
  {
    title: "Spolupráce s odborníky z praxe",
    text:
      "Do programu vstupují autoři, vědci, osobnosti veřejného života i lidé z praxe. Škola tak získává obsah, který by sama jen těžko zajišťovala.",
  },
  {
    title: "Motivace a rozvoj kompetencí",
    text:
      "Program podporuje zájem o svět kolem nás, komunikaci, kritické myšlení, orientaci v profesích i chuť zapojit se do výuky aktivněji.",
  },
];

const steps = [
  {
    number: "1",
    title: "Ředitel nebo koordinátor ověří možnosti školy",
    text:
      "Škola si jednoduše zkontroluje, zda může program zařadit mezi aktivity realizované v rámci svého projektu OP JAK.",
  },
  {
    number: "2",
    title: "ARCHIMEDES Live se zařadí do školních aktivit",
    text:
      "Program lze využít jako součást vzdělávacích vstupů, práce s třídou nebo spolupráce s odborníky z praxe.",
  },
  {
    number: "3",
    title: "Výuka proběhne bez zbytečné zátěže",
    text:
      "Učitel pustí vysílání, žáci sledují hosta a pracují s připraveným pracovním listem. Vše je navržené tak, aby to bylo snadno použitelné.",
  },
];

const reasons = [
  "Stačí interaktivní panel, počítač nebo projekce ve třídě.",
  "Učitel nemusí nic technicky složitě nastavovat.",
  "Žáci sledují živý vstup a navazují pracovním listem.",
  "Škola získá program připravený pro reálné použití v hodině.",
  "V případě potřeby připravíme škole stručné podklady k zařazení programu.",
  "Ředitel hned vidí, jak program funguje v praxi, ne jen v prezentaci.",
];



const schoolPhotos = [
  {
    src: "/sab1.webp",
    alt: "Děti sledují vysílání ARCHIMEDES Live ve třídě.",
    caption: "Reálné zapojení třídy během vysílání.",
  },
  {
    src: "/sab2.webp",
    alt: "Výuka ve třídě ARCHIMEDES s obrazovkou a digitálním obsahem.",
    caption: "Stačí panel nebo projekce a učitel může začít.",
  },
  {
    src: "/sab3.webp",
    alt: "Žáci sedí v učebně ARCHIMEDES a sledují společný program.",
    caption: "Ředitel vidí skutečnou praxi, ne jen sliby.",
  },
];

const faq = [
  {
    q: "Je to pro školu administrativně složité?",
    a:
      "Ne. Cílem je, aby škola měla jednoduchý model využití. V praxi jde hlavně o zařazení programu do aktivit školy a běžné využití ve výuce.",
  },
  {
    q: "Musí kvůli tomu učitelé umět něco speciálního?",
    a:
      "Nemusí. Program je připravený tak, aby učitel pustil vysílání a pracoval s třídou podobně jako při jiné projektové nebo tematické hodině.",
  },
  {
    q: "Můžeme psát, že program je hrazen z OP JAK?",
    a:
      "Doporučená formulace je opatrnější: program může být využit v aktivitách financovaných z OP JAK. Konkrétní zařazení vždy posuzuje škola podle svého projektu a podmínek výzvy.",
  },
  {
    q: "Pomůžete škole s vysvětlením, jak to uchopit?",
    a:
      "Ano. Můžeme dodat stručný popis programu, jeho přínos pro výuku a rámcové podklady, aby ředitel nebo koordinátor viděl, že využití dává smysl a je praktické.",
  },
];

function PrimaryButton({ href, children }) {
  return (
    <Link href={href} className="primaryBtn">
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link href={href} className="secondaryBtn">
      {children}
    </Link>
  );
}

function CheckItem({ children }) {
  return (
    <div className="checkItem">
      <span className="checkIcon">✓</span>
      <span>{children}</span>
    </div>
  );
}

export default function FinancovaniSkolyPage() {
  return (
    <>
      <Head>
        <title>Financování pro školy | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Jak může škola využít ARCHIMEDES Live v aktivitách financovaných z programu Šablony OP JAK. Jednoduché vysvětlení pro ředitele školy."
        />
      </Head>

      <main className="page">
        <section className="heroWrap">
          <div className="container heroGrid">
            <div className="heroTextCard">
              <div className="eyebrow">Pro ředitele školy</div>
              <h1>
                Ano, jde to reálně a <br />
                může to být velmi jednoduché.
              </h1>
              <p className="lead">
                ARCHIMEDES Live může škola využívat jako součást aktivit,
                které realizuje v rámci programu <strong>Šablony OP JAK</strong>.
                Smyslem této stránky je ukázat řediteli školy, že program není
                složitý na administraci ani na používání ve výuce.
              </p>

              <div className="heroPoints">
                <CheckItem>Program je připravený pro skutečné použití ve třídě.</CheckItem>
                <CheckItem>Učitel pustí vysílání a pracuje s připraveným pracovním listem.</CheckItem>
                <CheckItem>V případě potřeby dodáme škole podklady k zařazení programu.</CheckItem>
              </div>

              <div className="buttonRow">
                <PrimaryButton href="/demo">Mám zájem o demo</PrimaryButton>
                <SecondaryButton href="/kontakt">Chci konzultaci pro školu</SecondaryButton>
              </div>
            </div>

            <div className="heroVisualCard">
              <div className="heroBadge">Škola • OP JAK • praxe</div>
              <div className="heroPoster">
                <img src="/sab1.webp" alt="Děti sledují vysílání ARCHIMEDES Live ve třídě" />
              </div>
              <div className="heroMiniGrid">
                <div className="miniStat">
                  <strong>1 třída</strong>
                  <span>stačí pro první zapojení</span>
                </div>
                <div className="miniStat">
                  <strong>1 vysílání</strong>
                  <span>+ pracovní list</span>
                </div>
                <div className="miniStat">
                  <strong>1 učitel</strong>
                  <span>bez složité techniky</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container topInfoGrid">
          <div className="infoCard highlight">
            <div className="infoLabel">Co je důležité</div>
            <h2>Ředitel nepotřebuje další složitý systém.</h2>
            <p>
              Potřebuje vidět, že program dává smysl pro výuku, je snadno
              použitelný a škola ho může zařadit do aktivit, které už stejně
              plánuje realizovat.
            </p>
          </div>

          <div className="infoCard">
            <div className="infoLabel">Bezpečná formulace</div>
            <p>
              Na webu i v materiálech doporučujeme používat větu:
            </p>
            <blockquote>
              Program ARCHIMEDES Live může škola využívat v aktivitách
              financovaných z programu Šablony OP JAK.
            </blockquote>
          </div>
        </section>

        <section className="container section">
          <div className="sectionHead">
            <div className="eyebrow">Kde to dává smysl</div>
            <h2>Do jakých typů aktivit program přirozeně zapadá</h2>
            <p>
              Nejde o komplikované obcházení pravidel. Jde o srozumitelné
              zařazení programu do oblastí, kde škola běžně hledá inspirativní
              obsah, odborníky z praxe a nové formy práce se žáky.
            </p>
          </div>

          <div className="cardsGrid three">
            {fitAreas.map((item) => (
              <article key={item.title} className="card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container section simpleSection">
          <div className="sectionHead narrow">
            <div className="eyebrow">Jednoduchost v praxi</div>
            <h2>Jak to vypadá krok za krokem</h2>
          </div>

          <div className="stepsGrid">
            {steps.map((step) => (
              <article key={step.number} className="stepCard">
                <div className="stepNumber">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container section splitSection">
          <div className="splitCard soft">
            <div className="eyebrow">Co ředitel potřebuje slyšet</div>
            <h2>Program je připravený tak, aby ho škola skutečně použila.</h2>
            <div className="checksGrid">
              {reasons.map((reason) => (
                <CheckItem key={reason}>{reason}</CheckItem>
              ))}
            </div>
          </div>

          <div className="splitCard posterCard">
            <img src="/sab2.webp" alt="Výuka s obrazovkou v učebně ARCHIMEDES Live" />
            <div className="posterText">
              <strong>Ne prezentace o programu.</strong>
              <span>
                Skutečné vysílání, skuteční hosté, skutečná práce s třídou.
              </span>
            </div>
          </div>
        </section>

        <section className="container section photoSection">
          <div className="sectionHead narrow">
            <div className="eyebrow">Reálná praxe ve škole</div>
            <h2>Takto ARCHIMEDES Live ve škole skutečně vypadá</h2>
            <p>
              Právě tohle chtějí ředitelé vidět: běžná třída, běžný učitel, děti u výuky
              a program, který se dá opravdu použít. Žádná složitá technika navíc, ale
              jasný model, který funguje v praxi.
            </p>
          </div>

          <div className="photoGrid">
            {schoolPhotos.map((photo) => (
              <figure key={photo.src} className="photoCard">
                <img src={photo.src} alt={photo.alt} />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="container section faqSection">
          <div className="sectionHead narrow">
            <div className="eyebrow">Časté otázky</div>
            <h2>Na co se ředitelé škol ptají nejčastěji</h2>
          </div>

          <div className="faqList">
            {faq.map((item) => (
              <article key={item.q} className="faqItem">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container ctaWrap">
          <div className="ctaCard">
            <div>
              <div className="eyebrow dark">Další krok pro školu</div>
              <h2>Nejlepší je vidět program naživo nebo si krátce zavolat.</h2>
              <p>
                Během několika minut ředitel školy pochopí, jak může ARCHIMEDES
                Live využít ve výuce a proč to nemusí znamenat žádnou složitost
                navíc.
              </p>
            </div>

            <div className="buttonRow ctaButtons">
              <PrimaryButton href="/demo">Domluvit ukázkovou hodinu</PrimaryButton>
              <SecondaryButton href="/kontakt">Chci vysvětlení pro ředitele</SecondaryButton>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 24%, #f8fafc 100%);
          color: #0f172a;
          padding: 34px 0 96px;
        }

        .container {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .heroWrap {
          padding-top: 18px;
        }

        .heroGrid,
        .topInfoGrid,
        .splitSection {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
          align-items: stretch;
        }

        .heroTextCard,
        .heroVisualCard,
        .infoCard,
        .card,
        .stepCard,
        .splitCard,
        .faqItem,
        .ctaCard {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
        }

        .heroTextCard {
          padding: 34px 34px 30px;
        }

        .heroVisualCard {
          padding: 22px;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: #eef2ff;
          color: #1e3a8a;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.01em;
          margin-bottom: 16px;
        }

        .eyebrow.dark {
          background: rgba(255, 255, 255, 0.14);
          color: #dbeafe;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 5vw, 66px);
          line-height: 0.98;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        h2 {
          margin: 0;
          font-size: clamp(28px, 3.5vw, 44px);
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        h3 {
          margin: 0 0 12px;
          font-size: 22px;
          line-height: 1.18;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .lead,
        .sectionHead p,
        .card p,
        .stepCard p,
        .splitCard p,
        .faqItem p,
        .ctaCard p,
        .infoCard p {
          margin: 0;
          font-size: 18px;
          line-height: 1.75;
          color: #475569;
        }

        .lead {
          margin-top: 18px;
          max-width: 760px;
        }

        .heroPoints {
          display: grid;
          gap: 12px;
          margin-top: 24px;
        }

        .checkItem {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #0f172a;
          font-size: 17px;
          line-height: 1.65;
        }

        .checkIcon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 900;
          margin-top: 1px;
        }

        .buttonRow {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .primaryBtn,
        .secondaryBtn {
          min-height: 54px;
          padding: 0 22px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 800;
          font-size: 16px;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease,
            background 0.18s ease;
        }

        .primaryBtn {
          background: #0f2f78;
          color: white;
          box-shadow: 0 16px 34px rgba(15, 47, 120, 0.24);
        }

        .secondaryBtn {
          background: white;
          color: #0f172a;
          border: 1px solid #cbd5e1;
        }

        .primaryBtn:hover,
        .secondaryBtn:hover {
          transform: translateY(-1px);
        }

        .heroBadge {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          background: #fff;
          color: #0f2f78;
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 14px;
          border: 1px solid #dbeafe;
        }

        .heroPoster {
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid #dbeafe;
          background: #fff;
        }

        .heroPoster img,
        .posterCard img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .heroPoster img {
          aspect-ratio: 4 / 3;
        }

        .heroMiniGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .miniStat {
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid #dbeafe;
          border-radius: 18px;
          padding: 14px 12px;
          display: grid;
          gap: 4px;
        }

        .miniStat strong {
          font-size: 20px;
          color: #0f172a;
          line-height: 1.05;
        }

        .miniStat span {
          font-size: 14px;
          line-height: 1.45;
          color: #475569;
        }

        .topInfoGrid {
          margin-top: 24px;
        }

        .infoCard {
          padding: 28px;
        }

        .infoCard.highlight {
          background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
        }

        .infoLabel {
          margin-bottom: 12px;
          color: #1d4ed8;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        blockquote {
          margin: 14px 0 0;
          padding: 18px 20px;
          background: #f8fafc;
          border-left: 4px solid #1d4ed8;
          border-radius: 16px;
          font-size: 18px;
          line-height: 1.7;
          color: #0f172a;
          font-weight: 600;
        }

        .section {
          margin-top: 86px;
        }

        .sectionHead {
          max-width: 900px;
          margin-bottom: 28px;
        }

        .sectionHead.narrow {
          max-width: 760px;
        }

        .sectionHead p {
          margin-top: 14px;
        }

        .cardsGrid.three,
        .stepsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .card,
        .stepCard {
          padding: 28px;
        }

        .simpleSection {
          margin-top: 70px;
        }

        .stepNumber {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
          margin-bottom: 18px;
        }

        .splitSection {
          align-items: stretch;
        }

        .splitCard {
          padding: 30px;
          min-height: 100%;
        }

        .splitCard.soft {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }

        .checksGrid {
          display: grid;
          gap: 14px;
          margin-top: 22px;
        }

        .posterCard {
          padding: 18px;
          overflow: hidden;
        }

        .posterCard img {
          border-radius: 20px;
          aspect-ratio: 4 / 3;
        }

        .posterText {
          display: grid;
          gap: 6px;
          margin-top: 14px;
        }

        .posterText strong {
          font-size: 22px;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .posterText span {
          font-size: 17px;
          line-height: 1.65;
          color: #475569;
        }


        .photoGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .photoCard {
          margin: 0;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }

        .photoCard img {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }

        .photoCard figcaption {
          padding: 16px 18px 18px;
          font-size: 16px;
          line-height: 1.6;
          color: #475569;
          font-weight: 600;
        }

        .faqList {
          display: grid;
          gap: 16px;
        }

        .faqItem {
          padding: 26px 28px;
        }

        .faqItem p {
          margin-top: 8px;
        }

        .ctaWrap {
          margin-top: 84px;
        }

        .ctaCard {
          padding: 34px 32px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-color: rgba(255, 255, 255, 0.08);
          color: white;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: center;
        }

        .ctaCard h2,
        .ctaCard p {
          color: white;
        }

        .ctaCard p {
          opacity: 0.84;
          margin-top: 14px;
          max-width: 780px;
        }

        .ctaButtons {
          margin-top: 0;
          justify-content: flex-end;
        }

        @media (max-width: 1100px) {
          .heroGrid,
          .topInfoGrid,
          .splitSection,
          .ctaCard,
          .cardsGrid.three,
          .stepsGrid,
          .photoGrid {
            grid-template-columns: 1fr 1fr;
          }

          .ctaCard {
            align-items: start;
          }
        }

        @media (max-width: 820px) {
          .page {
            padding-top: 16px;
            padding-bottom: 70px;
          }

          .heroGrid,
          .topInfoGrid,
          .splitSection,
          .ctaCard,
          .cardsGrid.three,
          .stepsGrid,
          .heroMiniGrid,
          .photoGrid {
            grid-template-columns: 1fr;
          }

          .heroTextCard,
          .heroVisualCard,
          .infoCard,
          .card,
          .stepCard,
          .splitCard,
          .faqItem,
          .ctaCard {
            border-radius: 24px;
          }

          .heroTextCard {
            padding: 28px 22px 24px;
          }

          .heroVisualCard,
          .infoCard,
          .card,
          .stepCard,
          .splitCard,
          .faqItem,
          .ctaCard {
            padding: 22px;
          }

          h1 {
            font-size: clamp(34px, 10vw, 48px);
            line-height: 1.02;
          }

          h2 {
            font-size: clamp(26px, 8vw, 38px);
          }

          .lead,
          .sectionHead p,
          .card p,
          .stepCard p,
          .splitCard p,
          .faqItem p,
          .ctaCard p,
          .infoCard p,
          blockquote {
            font-size: 17px;
          }

          .buttonRow,
          .ctaButtons {
            display: grid;
            grid-template-columns: 1fr;
          }

          .primaryBtn,
          .secondaryBtn {
            width: 100%;
          }

          .section {
            margin-top: 64px;
          }

          .ctaWrap {
            margin-top: 64px;
          }
        }
      `}</style>
    </>
  );
}
