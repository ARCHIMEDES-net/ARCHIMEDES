
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "../components/Footer";

const LOGO_SRC = "/archimedes-day-logo.webp";
const CLASSROOM_SRC = "/archimedes-classroom.webp";

const POSTER_CZ = "/ad-cj.webp";
const POSTER_EN = "/ad-aj.webp";

const CONTENT = {
  cz: {
    metaTitle: "ARCHIMEDES DAY | 19. června 2026",
    metaDescription:
      "ARCHIMEDES DAY je mezinárodní den vzdělávání, vědy a komunity. Dne 19. června 2026 propojí školy, obce, instituce a partnery přes platformu ARCHIMEDES Live.",
    badge: "Mezinárodní iniciativa • ARCHIMEDES Live",
    heroTitle: "ARCHIMEDES DAY",
    heroDate: "19. června 2026",
    heroText:
      "Mezinárodní den, který propojí školy, obce, instituce a inspirativní osobnosti kolem vzdělávání, vědy, objevování a komunity.",
    ctaProgram: "Program dne",
    ctaLive: "Připojit se k vysílání",
    ctaGreetings: "Zdravice ze světa",

    posterKicker: "ARCHIMEDES DAY 2026",
    posterTitle: "Oficiální plakát akce",
    posterIntro:
      "První ročník ARCHIMEDES DAY proběhne 19. června 2026 živě z BVV Brno a online na ARCHIMEDES Live.",

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

    factsKicker: "Archimedes",
    factsTitle: "Proč se celý den jmenuje právě po Archimédovi",
    factsLead:
      "Archimedes patří k nejvýznamnějším osobnostem starověké vědy. Je symbolem zvídavosti, přesného myšlení, technické představivosti a schopnosti převádět myšlenky do praktických řešení.",
    facts: [
      {
        title: "Osobnost starověké vědy",
        text: "Archimedes žil ve 3. století př. n. l. a jeho jméno je dodnes spojeno s rozvojem matematiky, fyziky a technického myšlení.",
      },
      {
        title: "Matematik i vynálezce",
        text: "Byl známý nejen matematickými objevy, ale také technickými návrhy a stroji, které inspirovaly další generace.",
      },
      {
        title: "Princip vztlaku",
        text: "Jeho jméno je dodnes spojeno s Archimédovým zákonem, který vysvětluje, proč tělesa ve vodě nadnáší vztlaková síla.",
      },
      {
        title: "Archimédův šroub",
        text: "Tradice s jeho jménem spojuje i zařízení pro zvedání vody, známé jako Archimédův šroub.",
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
    programTitle: "Oficiální program ARCHIMEDES DAY 2026",
    programIntro:
      "Program prvního ročníku propojí živé vysílání z BVV Brno, wellbeing pro mladou generaci, mezinárodní vstup z Řecka, popularizaci vědy a živé experimenty pro školy.",
    programItems: [
      {
        time: "09:00",
        title: "Zahájení",
        text: "Oficiální zahájení mezinárodního ARCHIMEDES DAY.",
      },
      {
        time: "09:15",
        title: "Pevný bod – Wellbeing Gen Z",
        text: "Moderuje Kristýna Sekaninová.",
      },
      {
        time: "10:00",
        title: "ARCHIMEDES Museum Kotsanas Řecko",
        text: "Živý vstup z Řecka. Moderuje Karolína Surý.",
      },
      {
        time: "10:30",
        title: "ARCHIMEDES – největší vědec starověku",
        text: "doc. RNDr. Jindřich Bečvář, CSc., moderuje Taťána Kuchařová.",
      },
      {
        time: "11:00",
        title: "Vynálezce ARCHIMEDES – pokusy živě",
        text: "Tým Science ON.",
      },
      {
        time: "12:00",
        title: "Mezinárodní zdravice, závěr",
        text: "Pozdravy partnerů a zakončení programu.",
      },
    ],

    classroomKicker: "Síť učeben",
    classroomTitle: "ARCHIMEDES DAY je propojen i s reálnými učebnami",
    classroomText1:
      "ARCHIMEDES DAY nevzniká jako izolovaná webová událost. Navazuje na síť venkovních učeben ARCHIMEDES a na konkrétní místa, kde se vzdělávání propojuje s architekturou, technologií a komunitním životem.",
    classroomText2:
      "Díky tomu může mít mezinárodní den také velmi praktický rozměr – od živých přenosů až po lokální program pro školy, obce a veřejnost.",
    classroomCaption: "Venkovní učebna ARCHIMEDES",

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
        country: "Mezinárodní propojení",
        title: "Muzeum a zahraniční instituce",
        text: "Připravujeme mezinárodní propojení s muzeem a dalšími institucemi, které mohou podpořit vzdělávací a kulturní rozměr celého dne.",
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
    finalBtn2: "Napsat nám",
  },

  en: {
    metaTitle: "ARCHIMEDES DAY | June 19, 2026",
    metaDescription:
      "ARCHIMEDES DAY is an international day of education, science and community. On June 19, 2026 it will connect schools, municipalities, institutions and partners through the ARCHIMEDES Live platform.",
    badge: "International initiative • ARCHIMEDES Live",
    heroTitle: "ARCHIMEDES DAY",
    heroDate: "June 19, 2026",
    heroText:
      "An international day connecting schools, municipalities, institutions and inspiring personalities through education, science, discovery and community.",
    ctaProgram: "See the program",
    ctaLive: "Join the live broadcast",
    ctaGreetings: "Greetings from the world",

    posterKicker: "ARCHIMEDES DAY 2026",
    posterTitle: "Official event posters",
    posterIntro:
      "The first edition of ARCHIMEDES DAY will take place on June 19, 2026 live from BVV Brno and online on ARCHIMEDES Live.",

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

    factsKicker: "Archimedes",
    factsTitle: "Why this day is named after Archimedes",
    factsLead:
      "Archimedes is one of the most important figures of ancient science. He represents curiosity, precise thinking, technical imagination and the ability to turn ideas into practical solutions.",
    facts: [
      {
        title: "Figure of ancient science",
        text: "Archimedes lived in the 3rd century BC and his name remains strongly connected with the development of mathematics, physics and technical thought.",
      },
      {
        title: "Mathematician and inventor",
        text: "He was celebrated not only for mathematical discoveries, but also for mechanical ideas and devices that inspired later generations.",
      },
      {
        title: "Principle of buoyancy",
        text: "His name remains linked to Archimedes’ principle, explaining why bodies immersed in fluid are lifted by buoyant force.",
      },
      {
        title: "Archimedean screw",
        text: "Tradition also connects his name with the water-lifting device known as the Archimedean screw.",
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
    programTitle: "Official ARCHIMEDES DAY 2026 Program",
    programIntro:
      "The first edition will connect a live broadcast from BVV Brno, wellbeing for the young generation, an international segment from Greece, science outreach and live experiments for schools.",
    programItems: [
      {
        time: "09:00",
        title: "Start of the program",
        text: "Official opening of ARCHIMEDES DAY.",
      },
      {
        time: "09:15",
        title: "Fixed Point – Wellbeing Gen Z",
        text: "Hosted by Kristýna Sekaninová.",
      },
      {
        time: "10:00",
        title: "ARCHIMEDES Museum Kotsanas Greece",
        text: "Hosted by Karolína Surý.",
      },
      {
        time: "10:30",
        title: "ARCHIMEDES – the greatest scientist of antiquity",
        text: "doc. RNDr. Jindřich Bečvář, CSc., hosted by Taťána Kuchařová.",
      },
      {
        time: "11:00",
        title: "ARCHIMEDES the Inventor – Live Experiments",
        text: "Science ON team.",
      },
      {
        time: "12:00",
        title: "International Greetings, Conclusion",
        text: "Greetings from partners and closing remarks.",
      },
    ],

    classroomKicker: "Network of classrooms",
    classroomTitle: "ARCHIMEDES DAY is also linked to real learning spaces",
    classroomText1:
      "ARCHIMEDES DAY is not designed as an isolated web event. It builds on the ARCHIMEDES outdoor classrooms network and on real places where education meets architecture, technology and community life.",
    classroomText2:
      "This gives the international day a practical dimension as well — from live broadcasts to local programs for schools, municipalities and the public.",
    classroomCaption: "ARCHIMEDES outdoor classroom",

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
        country: "International connection",
        title: "Museum and international institutions",
        text: "We are preparing an international connection with a museum and other institutions that can support the educational and cultural dimension of the whole day.",
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
    finalBtn2: "Get in touch",
  },
};

function PosterImage({ src, fallbackSrc, alt }) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className="ad-poster-image"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

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
          content="Archimedes Day, ARCHIMEDES Live, outdoor classroom, venkovní učebna, education, science, community, schools, municipalities, museum, Archimedes"
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
          content="https://archimedeslive.com/19.6.2026_strana_1.jpeg"
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

            <div className="ad-hero-grid">
              <div className="ad-hero-copy">
                <h1>
                  {t.heroTitle}
                  <span>{t.heroDate}</span>
                </h1>

                <p className="ad-lead">{t.heroText}</p>

                <div className="ad-hero-actions">
                  <a href="#program" className="ad-btn ad-btn-primary">
                    {t.ctaProgram}
                  </a>

                  <a
                    href="https://meet.google.com/unb-vixu-vap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-btn ad-btn-live"
                  >
                    {t.ctaLive}
                  </a>

                  <a href="#greetings" className="ad-btn ad-btn-secondary">
                    {t.ctaGreetings}
                  </a>
                </div>
              </div>

              <div className="ad-hero-logo-wrap">
                <div className="ad-hero-logo-card">
                  <Image
                    src={LOGO_SRC}
                    alt="ARCHIMEDES DAY logo"
                    width={1152}
                    height={922}
                    priority
                    sizes="(max-width: 900px) 90vw, 560px"
                    className="ad-hero-logo"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ad-section ad-section-light ad-posters-section">
          <div className="ad-shell">
            <div className="ad-heading ad-heading-dark">
              <p className="ad-kicker">{t.posterKicker}</p>
              <h2>{t.posterTitle}</h2>
              <p>{t.posterIntro}</p>
            </div>

            <div className="ad-posters">
              <article className="ad-poster-card">
                <PosterImage
                  src={POSTER_EN}
                  fallbackSrc="/ad-aj-fallback.webp"
                  alt="ARCHIMEDES DAY official poster in English"
                />
              </article>

              <article className="ad-poster-card">
                <PosterImage
                  src={POSTER_CZ}
                  alt="ARCHIMEDES DAY oficiální plakát v češtině"
                />
              </article>
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
              <p className="ad-kicker">{t.factsKicker}</p>
              <h2>{t.factsTitle}</h2>
              <p>{t.factsLead}</p>
            </div>

            <div className="ad-values">
              {t.facts.map((item) => (
                <article className="ad-value" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ad-section ad-section-light">
          <div className="ad-shell">
            <div className="ad-heading ad-heading-dark">
              <p className="ad-kicker">{t.whyKicker}</p>
              <h2>{t.whyTitle}</h2>
            </div>

            <div className="ad-values ad-values-light">
              {t.whyItems.map((item) => (
                <article className="ad-value ad-value-light" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="program"
          className="ad-section ad-section-light ad-program-section"
        >
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

        <section className="ad-section ad-section-light">
          <div className="ad-shell ad-classroom-grid">
            <div className="ad-classroom-media">
              <img
                src={CLASSROOM_SRC}
                alt={t.classroomCaption}
                loading="lazy"
                className="ad-classroom-image"
              />
              <div className="ad-classroom-caption">{t.classroomCaption}</div>
            </div>

            <div className="ad-classroom-text">
              <p className="ad-kicker">{t.classroomKicker}</p>
              <h2>{t.classroomTitle}</h2>
              <p>{t.classroomText1}</p>
              <p>{t.classroomText2}</p>
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
              <Link
                href="/kontakt"
                className="ad-btn ad-btn-secondary ad-btn-light"
              >
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
          padding: 90px 0 86px;
        }

        .ad-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 28px;
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

        .ad-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
          gap: 38px;
          align-items: center;
        }

        .ad-hero-copy {
          max-width: 760px;
        }

        .ad-hero-logo-wrap {
          display: flex;
          justify-content: center;
        }

        .ad-hero-logo-card {
          width: 100%;
          max-width: 560px;
          padding: 18px;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(12px);
        }

        .ad-hero-logo {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 24px;
          background: #ffffff;
          object-fit: contain;
        }

        .ad-hero h1 {
          margin: 0;
          font-size: clamp(42px, 7vw, 92px);
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

        .ad-btn-live {
          background: #16a34a;
          color: #ffffff;
          border: 1px solid #16a34a;
          box-shadow: 0 18px 36px rgba(22, 163, 74, 0.28);
        }

        .ad-btn-live:hover {
          background: #15803d;
          color: #ffffff;
          border-color: #15803d;
          transform: translateY(-1px);
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

        .ad-posters-section {
          padding-top: 74px;
        }

        .ad-program-section {
          padding-top: 40px;
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
        .ad-classroom-text h2 {
          margin: 0 0 16px;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .ad-heading p,
        .ad-intro-text p,
        .ad-link-block p,
        .ad-final-inner p,
        .ad-classroom-text p {
          font-size: 18px;
          line-height: 1.75;
        }

        .ad-heading-dark h2,
        .ad-heading-dark p,
        .ad-intro-text h2,
        .ad-intro-text p,
        .ad-link-block h2,
        .ad-link-block p,
        .ad-classroom-text h2,
        .ad-classroom-text p {
          color: #13233b;
        }

        .ad-posters {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
          align-items: start;
        }

        .ad-poster-card {
          background: #ffffff;
          border-radius: 30px;
          padding: 14px;
          box-shadow: 0 28px 70px rgba(15, 23, 42, 0.12);
          border: 1px solid rgba(19, 35, 59, 0.08);
        }

        .ad-poster-image {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 22px;
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

        .ad-values-light {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .ad-greetings {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .ad-card,
        .ad-program-item,
        .ad-link-block,
        .ad-classroom-media {
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

        .ad-value-light {
          background: #ffffff;
          color: #13233b;
          border: 1px solid rgba(19, 35, 59, 0.08);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
          backdrop-filter: none;
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

        .ad-link-block,
        .ad-classroom-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
          align-items: center;
        }

        .ad-country,
        .ad-classroom-caption {
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

        .ad-classroom-grid {
          grid-template-columns: 1fr 1fr;
        }

        .ad-classroom-media {
          padding: 16px;
        }

        .ad-classroom-image {
          width: 100%;
          display: block;
          border-radius: 20px;
          object-fit: cover;
          min-height: 420px;
        }

        .ad-classroom-caption {
          margin-top: 14px;
          margin-bottom: 0;
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

        @media (max-width: 1120px) {
          .ad-hero-grid,
          .ad-intro,
          .ad-link-block,
          .ad-classroom-grid {
            grid-template-columns: 1fr;
          }

          .ad-values,
          .ad-values-light {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ad-greetings,
          .ad-posters {
            grid-template-columns: 1fr;
          }

          .ad-hero-logo-card {
            max-width: 620px;
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

          .ad-values,
          .ad-values-light {
            grid-template-columns: 1fr;
          }

          .ad-card,
          .ad-value,
          .ad-greeting-card,
          .ad-program-item,
          .ad-link-block,
          .ad-classroom-media,
          .ad-hero-logo-card,
          .ad-poster-card {
            border-radius: 24px;
            padding: 22px;
          }

          .ad-poster-card {
            padding: 10px;
          }

          .ad-poster-image {
            border-radius: 18px;
          }

          .ad-classroom-image {
            min-height: 260px;
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
