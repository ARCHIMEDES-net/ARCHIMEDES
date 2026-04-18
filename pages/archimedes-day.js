import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "../components/Footer";

const CONTENT = {
  cz: {
    metaTitle: "ARCHIMEDES DAY | 19. června 2026",
    metaDescription:
      "ARCHIMEDES DAY je mezinárodní den vzdělávání, vědy a komunity. Dne 19. června 2026 propojí školy, obce, instituce a partnery přes platformu ARCHIMEDES Live.",
    badge: "Mezinárodní iniciativa • ARCHIMEDES Live",
    heroTitle: "ARCHIMEDES DAY",
    heroDate: "19. června 2026",
    heroText:
      "Mezinárodní den, který propojí školy, obce, instituce a inspirativní osobnosti kolem vzdělávání, vědy a komunity.",
    ctaProgram: "Program dne",
    ctaGreetings: "Zdravice ze světa",

    aboutKicker: "O projektu",
    aboutTitle: "Co je ARCHIMEDES DAY",
    aboutText1:
      "ARCHIMEDES DAY vzniká jako nový mezinárodní formát, který připomíná odkaz Archimeda moderním způsobem – skrze vzdělávání, živé vysílání, popularizaci vědy a propojení komunity.",
    aboutText2:
      "První ročník proběhne 19. června 2026 a bude spojen s platformou ARCHIMEDES Live, se sítí venkovních učeben ARCHIMEDES a s mezinárodními partnery.",

    cards: [
      {
        title: "Vzdělávání",
        text: "Program pro školy, děti, pedagogy i veřejnost, který přináší inspiraci a skutečné propojení s praxí.",
      },
      {
        title: "Věda",
        text: "Pokusy, objevy, popularizace vědy a témata, která ukazují, že myšlení Archimeda má sílu i dnes.",
      },
      {
        title: "Komunita",
        text: "Zapojení obcí, institucí, partnerů a míst, kde se vzdělávání přirozeně propojuje s komunitním životem.",
      },
    ],

    whyKicker: "Proč právě teď",
    whyTitle:
      "Archimedes jako symbol objevování, zvídavosti a odvahy přemýšlet",
    whyItems: [
      {
        title: "Zvídavost",
        text: "Podporovat radost z objevování a přirozený zájem o svět kolem nás.",
      },
      {
        title: "Věda v praxi",
        text: "Ukázat, že věda není vzdálená, ale souvisí s každodenním životem.",
      },
      {
        title: "Mezinárodní přesah",
        text: "Propojovat školy, instituce a komunity napříč různými zeměmi.",
      },
      {
        title: "Budoucnost obcí",
        text: "Vytvářet prostor, kde se vzdělávání přirozeně potkává s komunitou.",
      },
    ],

    programKicker: "Program 2026",
    programTitle: "První rámec dne",
    programIntro:
      "Program budeme průběžně doplňovat. Už nyní ale víme, že den bude věnován osobnosti Archimeda, mezinárodnímu propojení a praktickým ukázkám pro školy i veřejnost.",
    programItems: [
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
    ],

    syracuseKicker: "Speciální moment",
    syracuseTitle: "Propojení se Syrakusami",
    syracuseText1:
      "Součástí prvního ročníku ARCHIMEDES DAY má být symbolické i obsahové propojení se Syrakusami – místem, které je s Archimedem neodmyslitelně spojeno.",
    syracuseText2:
      "Tento blok má dodat celému dni mezinárodní rozměr, autenticitu a silný příběh pro školy, partnery i veřejnost.",
    syracuseBadge: "Syracuse connection",
    syracuseBoxText:
      "Archimedes • science • education • international link",

    greetingsKicker: "Greetings from the world",
    greetingsTitle: "Zdravice ze světa",
    greetingsIntro:
      "Na této stránce budeme zveřejňovat zdravice institucí, partnerů, škol a osobností, které se rozhodnou podpořit první ARCHIMEDES DAY.",
    greetingsItems: [
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
    ],

    liveKicker: "ARCHIMEDES Live",
    liveTitle:
      "ARCHIMEDES DAY je součástí širšího živého vzdělávacího ekosystému",
    liveText:
      "ARCHIMEDES DAY je přirozeně propojen s platformou ARCHIMEDES Live, která přináší živý program pro školy, obce a komunitu, a také se sítí venkovních učeben ARCHIMEDES.",
    liveBtn1: "ARCHIMEDES Live",
    liveBtn2: "Venkovní učebny",

    finalKicker: "Zapojení",
    finalTitle: "Chcete se připojit k prvnímu ARCHIMEDES DAY?",
    finalText:
      "Připravujeme mezinárodní síť škol, institucí, partnerů a podporovatelů. Pokud chcete poslat zdravici, zapojit se do programu nebo navázat partnerství, ozvěte se nám.",
    finalBtn1: "Kontaktujte nás",
    finalBtn2: "Mám zájem o spolupráci",
  },

  en: {
    metaTitle: "ARCHIMEDES DAY | June 19, 2026",
    metaDescription:
      "ARCHIMEDES DAY is an international day of education, science and community. On June 19, 2026 it will connect schools, municipalities, institutions and partners through the ARCHIMEDES Live platform.",
    badge: "International initiative • ARCHIMEDES Live",
    heroTitle: "ARCHIMEDES DAY",
    heroDate: "June 19, 2026",
    heroText:
      "An international day connecting schools, municipalities, institutions and inspiring personalities through education, science and community.",
    ctaProgram: "See the program",
    ctaGreetings: "Greetings from the world",

    aboutKicker: "About",
    aboutTitle: "What is ARCHIMEDES DAY",
    aboutText1:
      "ARCHIMEDES DAY is a new international format that brings the legacy of Archimedes into the present through education, live broadcasting, science outreach and community connection.",
    aboutText2:
      "The first edition will take place on June 19, 2026 and will be connected with the ARCHIMEDES Live platform, the ARCHIMEDES outdoor classrooms network and international partners.",

    cards: [
      {
        title: "Education",
        text: "A program for schools, children, educators and the public that brings inspiration and meaningful connection with real practice.",
      },
      {
        title: "Science",
        text: "Experiments, discovery, science outreach and themes that show the power of Archimedes’ thinking today.",
      },
      {
        title: "Community",
        text: "Involvement of municipalities, institutions, partners and places where education naturally connects with community life.",
      },
    ],

    whyKicker: "Why now",
    whyTitle:
      "Archimedes as a symbol of discovery, curiosity and the courage to think",
    whyItems: [
      {
        title: "Curiosity",
        text: "To support the joy of discovering and a natural interest in the world around us.",
      },
      {
        title: "Science in practice",
        text: "To show that science is not distant, but closely connected to everyday life.",
      },
      {
        title: "International reach",
        text: "To connect schools, institutions and communities across different countries.",
      },
      {
        title: "Future of communities",
        text: "To create spaces where education naturally meets community life.",
      },
    ],

    programKicker: "Program 2026",
    programTitle: "First outline of the day",
    programIntro:
      "The program will be updated gradually. We already know the day will focus on Archimedes, international connection and practical activities for schools and the public.",
    programItems: [
      {
        time: "09:00",
        title: "Opening of ARCHIMEDES DAY",
        text: "Official opening of the first international day dedicated to education, science, discovery and community.",
      },
      {
        time: "10:00",
        title: "Connection with Syracuse",
        text: "A special segment dedicated to the legacy of Archimedes and the international connection with Syracuse.",
      },
      {
        time: "11:00",
        title: "Experiments inspired by Archimedes",
        text: "Practical demonstrations and experiments bringing Archimedes’ ideas closer to children, schools and the public.",
      },
      {
        time: "13:00",
        title: "Greetings from institutions and partners",
        text: "A gallery of greetings and participating institutions from different countries.",
      },
    ],

    syracuseKicker: "Special moment",
    syracuseTitle: "Connection with Syracuse",
    syracuseText1:
      "Part of the first ARCHIMEDES DAY will be a symbolic and content-based connection with Syracuse – a place inseparably linked with Archimedes.",
    syracuseText2:
      "This block is meant to give the whole day an international dimension, authenticity and a strong story for schools, partners and the public.",
    syracuseBadge: "Syracuse connection",
    syracuseBoxText:
      "Archimedes • science • education • international link",

    greetingsKicker: "Greetings from the world",
    greetingsTitle: "Greetings from the world",
    greetingsIntro:
      "This page will gradually feature greetings from institutions, partners, schools and personalities who decide to support the first ARCHIMEDES DAY.",
    greetingsItems: [
      {
        country: "Czech Republic",
        title: "Schools, municipalities and partners",
        text: "We will gradually publish greetings from institutions, schools, cities and partners joining ARCHIMEDES DAY.",
      },
      {
        country: "Italy",
        title: "Syracuse",
        text: "We are preparing a symbolic connection with the place inseparably linked with the figure of Archimedes.",
      },
      {
        country: "International participation",
        title: "More countries and institutions",
        text: "The website will gradually be expanded with additional greetings, supporting organizations and inspiring personalities.",
      },
    ],

    liveKicker: "ARCHIMEDES Live",
    liveTitle:
      "ARCHIMEDES DAY is part of a broader live educational ecosystem",
    liveText:
      "ARCHIMEDES DAY is naturally connected with the ARCHIMEDES Live platform, which brings a live program for schools, municipalities and communities, as well as with the ARCHIMEDES outdoor classrooms network.",
    liveBtn1: "ARCHIMEDES Live",
    liveBtn2: "Outdoor classrooms",

    finalKicker: "Join",
    finalTitle: "Would you like to join the first ARCHIMEDES DAY?",
    finalText:
      "We are preparing an international network of schools, institutions, partners and supporters. If you would like to send a greeting, join the program or discuss partnership, get in touch with us.",
    finalBtn1: "Contact us",
    finalBtn2: "I am interested in cooperation",
  },
};

export default function ArchimedesDayPage() {
  const [lang, setLang] = useState("en");
  const t = useMemo(() => CONTENT[lang], [lang]);

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <meta
          name="keywords"
          content="Archimedes Day, ARCHIMEDES Live, outdoor classroom, venkovní učebna, education, science, community, schools, municipalities, Syracuse"
        />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://archimedeslive.com/archimedes-day"
        />
        <meta
          property="og:image"
          content="https://archimedeslive.com/og-archimedes-day.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="ad-page">
        <section className="ad-hero">
          <div className="ad-hero-overlay" />

          <div className="ad-shell ad-hero-inner">
            <div className="ad-topbar">
              <div className="ad-badge">{t.badge}</div>

              <div className="ad-lang-switch" aria-label="Language switch">
                <button
                  type="button"
                  className={lang === "cz" ? "active" : ""}
                  onClick={() => setLang("cz")}
                >
                  CZ
                </button>
                <button
                  type="button"
                  className={lang === "en" ? "active" : ""}
                  onClick={() => setLang("en")}
                >
                  EN
                </button>
              </div>
            </div>

            <h1>
              {t.heroTitle}
              <span>{t.heroDate}</span>
            </h1>

            <p className="ad-lead">{t.heroText}</p>

            <div className="ad-hero-actions">
              <a href="#program" className="ad-btn ad-btn-primary">
                {t.ctaProgram}
              </a>
              <a href="#greetings" className="ad-btn ad-btn-secondary">
                {t.ctaGreetings}
              </a>
            </div>
          </div>
        </section>

        <section className="ad-section ad-section-light">
          <div className="ad-shell ad-intro">
            <div className="ad-intro-text">
              <p className="ad-kicker">{t.aboutKicker}</p>
              <h2>{t.aboutTitle}</h2>
              <p>{t.aboutText1}</p>
              <p>{t.aboutText2}</p>
            </div>

            <div className="ad-intro-cards">
              {t.cards.map((item) => (
                <article className="ad-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ad-section ad-section-dark">
          <div className="ad-shell">
            <div className="ad-heading">
              <p className="ad-kicker">{t.whyKicker}</p>
              <h2>{t.whyTitle}</h2>
            </div>

            <div className="ad-values">
              {t.whyItems.map((item) => (
                <article className="ad-value" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="program" className="ad-section ad-section-light">
          <div className="ad-shell">
            <div className="ad-heading ad-heading-dark">
              <p className="ad-kicker">{t.programKicker}</p>
              <h2>{t.programTitle}</h2>
              <p>{t.programIntro}</p>
            </div>

            <div className="ad-program">
              {t.programItems.map((item) => (
                <article
                  className="ad-program-item"
                  key={`${item.time}-${item.title}`}
                >
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
            <div className="ad-syracuse-text">
              <p className="ad-kicker">{t.syracuseKicker}</p>
              <h2>{t.syracuseTitle}</h2>
              <p>{t.syracuseText1}</p>
              <p>{t.syracuseText2}</p>
            </div>

            <div className="ad-syracuse-box">
              <div className="ad-syracuse-badge">{t.syracuseBadge}</div>
              <strong>{t.syracuseBoxText}</strong>
            </div>
          </div>
        </section>

        <section id="greetings" className="ad-section ad-section-dark">
          <div className="ad-shell">
            <div className="ad-heading">
              <p className="ad-kicker">{t.greetingsKicker}</p>
              <h2>{t.greetingsTitle}</h2>
              <p>{t.greetingsIntro}</p>
            </div>

            <div className="ad-greetings">
              {t.greetingsItems.map((item) => (
                <article
                  className="ad-greeting-card"
                  key={`${item.country}-${item.title}`}
                >
                  <span className="ad-country">{item.country}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ad-section ad-section-light">
          <div className="ad-shell ad-link-block">
            <div>
              <p className="ad-kicker">{t.liveKicker}</p>
              <h2>{t.liveTitle}</h2>
              <p>{t.liveText}</p>
            </div>

            <div className="ad-link-actions">
              <Link href="/" className="ad-btn ad-btn-primary">
                {t.liveBtn1}
              </Link>
              <Link href="/ucebna" className="ad-btn ad-btn-secondary">
                {t.liveBtn2}
              </Link>
            </div>
          </div>
        </section>

        <section className="ad-section ad-final-cta">
          <div className="ad-shell ad-final-inner">
            <p className="ad-kicker">{t.finalKicker}</p>
            <h2>{t.finalTitle}</h2>
            <p>{t.finalText}</p>

            <div className="ad-hero-actions ad-final-actions">
              <Link href="/kontakt" className="ad-btn ad-btn-primary">
                {t.finalBtn1}
              </Link>
              <Link href="/poptavka" className="ad-btn ad-btn-secondary ad-btn-light">
                {t.finalBtn2}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .ad-page {
          background: #f6f7fb;
          color: #13233b;
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
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.09), transparent 22%),
            radial-gradient(circle at 80% 30%, rgba(217, 178, 108, 0.2), transparent 22%),
            linear-gradient(135deg, #08111f 0%, #0e2140 52%, #09121f 100%);
          color: #ffffff;
        }

        .ad-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(8, 17, 31, 0.12), rgba(8, 17, 31, 0.42)),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035) 0,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px,
              transparent 124px
            );
          pointer-events: none;
        }

        .ad-hero-inner {
          position: relative;
          z-index: 2;
          padding: 110px 0 90px;
        }

        .ad-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 24px;
        }

        .ad-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.84);
        }

        .ad-lang-switch {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(12px);
        }

        .ad-lang-switch button {
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ad-lang-switch button.active {
          background: #d9b26c;
          color: #08111f;
        }

        .ad-hero h1 {
          margin: 0;
          font-size: clamp(44px, 8vw, 104px);
          line-height: 0.95;
          letter-spacing: -0.045em;
          max-width: 940px;
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
          line-height: 1.62;
          color: rgba(255, 255, 255, 0.9);
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
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          backdrop-filter: blur(12px);
        }

        .ad-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .ad-btn-light {
          border-color: rgba(255, 255, 255, 0.3);
          color: #ffffff;
        }

        .ad-section {
          padding: 88px 0;
        }

        .ad-section-light {
          background: #f6f7fb;
          color: #13233b;
        }

        .ad-section-dark {
          background: linear-gradient(180deg, #0d1727 0%, #12233f 100%);
          color: #ffffff;
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
          max-width: 860px;
          margin-bottom: 38px;
        }

        .ad-heading h2,
        .ad-intro-text h2,
        .ad-link-block h2,
        .ad-final-inner h2,
        .ad-syracuse-text h2 {
          margin: 0 0 16px;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .ad-heading p,
        .ad-intro-text p,
        .ad-link-block p,
        .ad-final-inner p,
        .ad-syracuse-text p {
          font-size: 18px;
          line-height: 1.75;
        }

        .ad-heading-dark h2,
        .ad-heading-dark p,
        .ad-intro-text h2,
        .ad-intro-text p,
        .ad-link-block h2,
        .ad-link-block p,
        .ad-syracuse-text h2,
        .ad-syracuse-text p {
          color: #13233b;
        }

        .ad-intro {
          display: grid;
          grid-template-columns: 1.06fr 1fr;
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
        .ad-program-item,
        .ad-syracuse-box,
        .ad-link-block {
          background: #ffffff;
          color: #13233b;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .ad-value,
        .ad-greeting-card {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 28px;
          backdrop-filter: blur(8px);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
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
          color: #13233b;
        }

        .ad-program-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
          color: #31435f;
        }

        .ad-syracuse {
          background: linear-gradient(180deg, #eef2f8 0%, #f6f7fb 100%);
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
            linear-gradient(135deg, #ffffff 0%, #f7f2e6 100%);
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

        .ad-country {
          background: rgba(255, 255, 255, 0.14);
          color: #f0d6a3;
        }

        .ad-link-block {
          padding: 34px;
        }

        .ad-link-block .ad-btn-secondary {
          border: 1px solid rgba(19, 35, 59, 0.12);
          background: #f2f5fa;
          color: #13233b;
          backdrop-filter: none;
        }

        .ad-link-block .ad-btn-secondary:hover {
          background: #e8edf6;
        }

        .ad-final-cta {
          background:
            radial-gradient(circle at top, rgba(196, 154, 76, 0.18), transparent 36%),
            linear-gradient(180deg, #0f172a 0%, #08111f 100%);
          color: #ffffff;
        }

        .ad-final-inner {
          max-width: 860px;
          text-align: center;
        }

        .ad-final-inner p {
          color: rgba(255, 255, 255, 0.9);
        }

        .ad-final-actions {
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

          .ad-topbar {
            flex-direction: column;
            align-items: flex-start;
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
          .ad-link-actions,
          .ad-final-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
