import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const PROGRAM = [
  {
    time: "09:00",
    title: "Zahájení ARCHIMEDES DAY",
    text: "Slavnostní zahájení prvního mezinárodního dne věnovaného vzdělávání, vědě, objevování a komunitě.",
  },
  {
    time: "10:00",
    title: "Propojení se Syrakusami",
    text: "Speciální blok věnovaný odkazu Archimeda a mezinárodnímu propojení se Syrakusami.",
  },
  {
    time: "11:00",
    title: "Pokusy inspirované Archimedem",
    text: "Praktické ukázky a experimenty, které přiblíží Archimedovy myšlenky dětem, školám i veřejnosti.",
  },
  {
    time: "13:00",
    title: "Pozdravy institucí a partnerů",
    text: "Galerie zdravic a zapojených institucí z různých zemí.",
  },
];

const GREETINGS = [
  {
    country: "Česká republika",
    title: "Školy, obce a partneři",
    text: "Postupně budeme zveřejňovat zdravice institucí, škol, měst a partnerů, kteří se k ARCHIMEDES DAY připojí.",
  },
  {
    country: "Itálie",
    title: "Syrakusy",
    text: "Připravujeme symbolické propojení s místem, které je neodmyslitelně spojeno s osobností Archimeda.",
  },
  {
    country: "Mezinárodní zapojení",
    title: "Další země a instituce",
    text: "Web bude postupně doplňován o další zdravice, podporující organizace a inspirativní osobnosti.",
  },
];

export default function ArchimedesDayPage() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES DAY | 19. června 2026</title>
        <meta
          name="description"
          content="ARCHIMEDES DAY je mezinárodní den vzdělávání, vědy a komunity. Dne 19. června 2026 propojí školy, obce, instituce a partnery přes platformu ARCHIMEDES Live."
        />
        <meta
          name="keywords"
          content="Archimedes Day, ARCHIMEDES Live, venkovní učebna, vzdělávání, věda, komunita, školy, obce, Syracuse, Syrakusy"
        />
        <meta property="og:title" content="ARCHIMEDES DAY | 19. června 2026" />
        <meta
          property="og:description"
          content="Mezinárodní den vzdělávání, vědy a komunity propojený s platformou ARCHIMEDES Live."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://archimedeslive.com/archimedes-day" />
        <meta property="og:image" content="https://archimedeslive.com/og-archimedes-day.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="ad-page">
        <section className="ad-hero">
          <div className="ad-hero-overlay" />
          <div className="ad-shell ad-hero-inner">
            <div className="ad-badge">International initiative • ARCHIMEDES Live</div>

            <h1>
              ARCHIMEDES DAY
              <span>19. června 2026</span>
            </h1>

            <p className="ad-lead">
              Mezinárodní den vzdělávání, vědy a komunity, který propojí školy,
              obce, instituce a inspirativní osobnosti prostřednictvím platformy
              ARCHIMEDES Live.
            </p>

            <div className="ad-hero-actions">
              <a href="#program" className="ad-btn ad-btn-primary">
                Program dne
              </a>
              <a href="#greetings" className="ad-btn ad-btn-secondary">
                Zdravice ze světa
              </a>
            </div>
          </div>
        </section>

        <section className="ad-section">
          <div className="ad-shell ad-intro">
            <div className="ad-intro-text">
              <p className="ad-kicker">O projektu</p>
              <h2>Co je ARCHIMEDES DAY</h2>
              <p>
                ARCHIMEDES DAY vzniká jako nový mezinárodní formát, který
                připomíná odkaz Archimeda moderním způsobem – skrze vzdělávání,
                živé vysílání, popularizaci vědy a propojení komunity.
              </p>
              <p>
                První ročník proběhne <strong>19. června 2026</strong> a bude
                spojen s platformou ARCHIMEDES Live, se sítí venkovních učeben
                ARCHIMEDES a s mezinárodními partnery.
              </p>
            </div>

            <div className="ad-intro-cards">
              <article className="ad-card">
                <h3>Vzdělávání</h3>
                <p>
                  Program pro školy, děti, pedagogy i veřejnost, který přináší
                  inspiraci a skutečné propojení s praxí.
                </p>
              </article>

              <article className="ad-card">
                <h3>Věda</h3>
                <p>
                  Pokusy, objevy, popularizace vědy a témata, která ukazují, že
                  myšlení Archimeda má sílu i dnes.
                </p>
              </article>

              <article className="ad-card">
                <h3>Komunita</h3>
                <p>
                  Zapojení obcí, institucí, partnerů a míst, kde se vzdělávání
                  přirozeně propojuje s komunitním životem.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="ad-section ad-section-dark">
          <div className="ad-shell">
            <div className="ad-heading">
              <p className="ad-kicker">Proč právě teď</p>
              <h2>Archimedes jako symbol objevování, zvídavosti a odvahy přemýšlet</h2>
            </div>

            <div className="ad-values">
              <article className="ad-value">
                <h3>Zvídavost</h3>
                <p>Podporovat radost z objevování a přirozený zájem o svět kolem nás.</p>
              </article>
              <article className="ad-value">
                <h3>Věda v praxi</h3>
                <p>Ukázat, že věda není vzdálená, ale souvisí s každodenním životem.</p>
              </article>
              <article className="ad-value">
                <h3>Mezinárodní přesah</h3>
                <p>Propojovat školy, instituce a komunity napříč různými zeměmi.</p>
              </article>
              <article className="ad-value">
                <h3>Budoucnost obcí</h3>
                <p>Vytvářet prostor, kde se vzdělávání přirozeně potkává s komunitou.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="program" className="ad-section">
          <div className="ad-shell">
            <div className="ad-heading">
              <p className="ad-kicker">Program 2026</p>
              <h2>První rámec dne</h2>
              <p>
                Program budeme průběžně doplňovat. Už nyní ale víme, že den bude
                věnován osobnosti Archimeda, mezinárodnímu propojení a praktickým
                ukázkám pro školy i veřejnost.
              </p>
            </div>

            <div className="ad-program">
              {PROGRAM.map((item) => (
                <article className="ad-program-item" key={`${item.time}-${item.title}`}>
                  <div className="ad-program-time">{item.time}</div>
                  <div className="ad-program-content">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ad-section ad-syracuse">
          <div className="ad-shell ad-syracuse-grid">
            <div>
              <p className="ad-kicker">Speciální moment</p>
              <h2>Propojení se Syrakusami</h2>
              <p>
                Součástí prvního ročníku ARCHIMEDES DAY má být symbolické i
                obsahové propojení se Syrakusami – místem, které je s Archimedem
                neodmyslitelně spojeno.
              </p>
              <p>
                Tento blok má dodat celému dni mezinárodní rozměr, autenticitu a
                silný příběh pro školy, partnery i veřejnost.
              </p>
            </div>

            <div className="ad-syracuse-box">
              <div className="ad-syracuse-badge">Syracuse connection</div>
              <strong>Archimedes • science • education • international link</strong>
            </div>
          </div>
        </section>

        <section id="greetings" className="ad-section ad-section-dark">
          <div className="ad-shell">
            <div className="ad-heading">
              <p className="ad-kicker">Greetings from the world</p>
              <h2>Zdravice ze světa</h2>
              <p>
                Na této stránce budeme zveřejňovat zdravice institucí, partnerů,
                škol a osobností, které se rozhodnou podpořit první ARCHIMEDES DAY.
              </p>
            </div>

            <div className="ad-greetings">
              {GREETINGS.map((item) => (
                <article className="ad-greeting-card" key={`${item.country}-${item.title}`}>
                  <span className="ad-country">{item.country}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ad-section">
          <div className="ad-shell ad-link-block">
            <div>
              <p className="ad-kicker">ARCHIMEDES Live</p>
              <h2>ARCHIMEDES DAY je součástí širšího živého vzdělávacího ekosystému</h2>
              <p>
                ARCHIMEDES DAY je přirozeně propojen s platformou ARCHIMEDES Live,
                která přináší živý program pro školy, obce a komunitu, a také se
                sítí venkovních učeben ARCHIMEDES.
              </p>
            </div>

            <div className="ad-link-actions">
              <Link href="/" className="ad-btn ad-btn-primary">
                ARCHIMEDES Live
              </Link>
              <Link href="/ucebna" className="ad-btn ad-btn-secondary">
                Venkovní učebny
              </Link>
            </div>
          </div>
        </section>

        <section className="ad-section ad-final-cta">
          <div className="ad-shell ad-final-inner">
            <p className="ad-kicker">Zapojení</p>
            <h2>Chcete se připojit k prvnímu ARCHIMEDES DAY?</h2>
            <p>
              Připravujeme mezinárodní síť škol, institucí, partnerů a podporovatelů.
              Pokud chcete poslat zdravici, zapojit se do programu nebo navázat
              partnerství, ozvěte se nám.
            </p>

            <div className="ad-hero-actions">
              <Link href="/kontakt" className="ad-btn ad-btn-primary">
                Kontaktujte nás
              </Link>
              <Link href="/poptavka" className="ad-btn ad-btn-secondary">
                Mám zájem o spolupráci
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .ad-page {
          background:
            radial-gradient(circle at top, rgba(196, 154, 76, 0.18), transparent 32%),
            linear-gradient(180deg, #08111f 0%, #0d1727 35%, #f7f5ef 35%, #f7f5ef 100%);
          color: #0f172a;
        }

        .ad-shell {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .ad-hero {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 22%),
            radial-gradient(circle at 80% 30%, rgba(196, 154, 76, 0.2), transparent 20%),
            linear-gradient(135deg, #08111f 0%, #10233e 48%, #0c1522 100%);
          color: #fff;
        }

        .ad-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(8, 17, 31, 0.16), rgba(8, 17, 31, 0.4)),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 0,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 120px
            );
          pointer-events: none;
        }

        .ad-hero-inner {
          position: relative;
          z-index: 2;
          padding: 110px 0 80px;
        }

        .ad-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }

        .ad-hero h1 {
          margin: 26px 0 0;
          font-size: clamp(44px, 8vw, 108px);
          line-height: 0.96;
          letter-spacing: -0.04em;
          max-width: 900px;
        }

        .ad-hero h1 span {
          display: block;
          margin-top: 16px;
          font-size: clamp(24px, 3.4vw, 40px);
          line-height: 1.08;
          color: #d9b26c;
          letter-spacing: -0.02em;
        }

        .ad-lead {
          max-width: 760px;
          margin-top: 28px;
          font-size: clamp(18px, 2vw, 24px);
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.88);
        }

        .ad-hero-actions,
        .ad-link-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }

        .ad-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          padding: 0 22px;
          border-radius: 999px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.2s ease;
          cursor: pointer;
        }

        .ad-btn-primary {
          background: linear-gradient(135deg, #d9b26c 0%, #b98937 100%);
          color: #08111f;
          box-shadow: 0 18px 40px rgba(185, 137, 55, 0.28);
        }

        .ad-btn-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        .ad-btn-secondary {
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: rgba(255, 255, 255, 0.72);
          color: #0f172a;
        }

        .ad-hero .ad-btn-secondary {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          backdrop-filter: blur(12px);
        }

        .ad-section {
          padding: 88px 0;
        }

        .ad-section-dark {
          background: #0d1727;
          color: #fff;
        }

        .ad-kicker {
          margin: 0 0 14px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b98937;
        }

        .ad-heading {
          max-width: 820px;
          margin-bottom: 38px;
        }

        .ad-heading h2,
        .ad-intro-text h2,
        .ad-link-block h2,
        .ad-final-inner h2,
        .ad-syracuse-grid h2 {
          margin: 0 0 16px;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .ad-heading p,
        .ad-intro-text p,
        .ad-link-block p,
        .ad-final-inner p,
        .ad-syracuse-grid p {
          font-size: 18px;
          line-height: 1.75;
        }

        .ad-intro {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .ad-intro-cards,
        .ad-values,
        .ad-greetings {
          display: grid;
          gap: 18px;
        }

        .ad-intro-cards {
          grid-template-columns: 1fr;
        }

        .ad-values {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .ad-greetings {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .ad-card,
        .ad-value,
        .ad-greeting-card,
        .ad-syracuse-box {
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .ad-card,
        .ad-syracuse-box {
          background: #fff;
        }

        .ad-value,
        .ad-greeting-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .ad-card h3,
        .ad-value h3,
        .ad-greeting-card h3 {
          margin: 0 0 12px;
          font-size: 24px;
          line-height: 1.2;
        }

        .ad-card p,
        .ad-value p,
        .ad-greeting-card p {
          margin: 0;
          font-size: 16px;
          line-height: 1.7;
        }

        .ad-program {
          display: grid;
          gap: 18px;
        }

        .ad-program-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 22px;
          align-items: start;
          padding: 28px;
          border-radius: 28px;
          background: #fff;
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
        }

        .ad-program-time {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 0 18px;
          border-radius: 999px;
          background: rgba(185, 137, 55, 0.12);
          color: #8a6527;
          font-weight: 800;
        }

        .ad-program-content h3 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.2;
        }

        .ad-program-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
        }

        .ad-syracuse {
          background: linear-gradient(180deg, #f7f5ef 0%, #f0ece2 100%);
        }

        .ad-syracuse-grid,
        .ad-link-block {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
          align-items: center;
        }

        .ad-syracuse-box {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background:
            radial-gradient(circle at 20% 20%, rgba(185, 137, 55, 0.16), transparent 24%),
            linear-gradient(135deg, #fff 0%, #f7f2e6 100%);
          border: 1px solid rgba(185, 137, 55, 0.15);
        }

        .ad-syracuse-badge,
        .ad-country {
          display: inline-flex;
          align-self: flex-start;
          margin-bottom: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(185, 137, 55, 0.12);
          color: #8a6527;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ad-link-block {
          padding: 34px;
          border-radius: 32px;
          background: #fff;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .ad-final-cta {
          background:
            radial-gradient(circle at top, rgba(196, 154, 76, 0.18), transparent 36%),
            linear-gradient(180deg, #0f172a 0%, #08111f 100%);
          color: #fff;
        }

        .ad-final-inner {
          max-width: 860px;
          text-align: center;
        }

        .ad-final-inner .ad-hero-actions {
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .ad-intro,
          .ad-syracuse-grid,
          .ad-link-block {
            grid-template-columns: 1fr;
          }

          .ad-values {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ad-greetings {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .ad-shell {
            width: min(100% - 24px, 1180px);
          }

          .ad-section {
            padding: 68px 0;
          }

          .ad-program-item {
            grid-template-columns: 1fr;
          }

          .ad-values {
            grid-template-columns: 1fr;
          }

          .ad-card,
          .ad-value,
          .ad-greeting-card,
          .ad-program-item,
          .ad-syracuse-box,
          .ad-link-block {
            border-radius: 24px;
            padding: 22px;
          }

          .ad-btn {
            width: 100%;
          }

          .ad-hero-actions,
          .ad-link-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
