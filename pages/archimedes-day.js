import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "../components/Footer";

const CLASSROOM_SRC = "/archimedes-classroom.webp";
const GALLERY_PATH = "/archimedes-day-2026";

const GALLERY = [
  {
    src: "spolecna.jpg",
    cz: "Hosté prvního ročníku ARCHIMEDES DAY před učebnou na BVV Brno",
    en: "Guests of the first ARCHIMEDES DAY in front of the classroom at BVV Brno",
    landscape: true,
  },
  {
    src: "ales1.jpg",
    cz: "Science ON během živého pokusu",
    en: "Science ON during a live experiment",
  },
  {
    src: "ales2.jpg",
    cz: "Živý vědecký experiment se žákem",
    en: "A live science experiment with a student",
  },
  {
    src: "doc1.jpg",
    cz: "Docent Jindřich Bečvář během programu",
    en: "Associate Professor Jindřich Bečvář during the program",
  },
  {
    src: "doc2.jpg",
    cz: "Přednáška o Archimédovi v učebně ARCHIMEDES",
    en: "A lecture about Archimedes in the ARCHIMEDES classroom",
    landscape: true,
  },
  {
    src: "kaja1.jpg",
    cz: "Karolína Surý při moderování živého vstupu",
    en: "Karolína Surý hosting a live segment",
  },
  {
    src: "kaja2.jpg",
    cz: "Karolína Surý během ARCHIMEDES DAY",
    en: "Karolína Surý during ARCHIMEDES DAY",
  },
  {
    src: "kristy1.jpg",
    cz: "Kristýna Sekaninová při programu Pevný bod",
    en: "Kristýna Sekaninová during the Fixed Point program",
  },
  {
    src: "kristy2.jpg",
    cz: "Wellbeing program pro mladou generaci",
    en: "A wellbeing program for the young generation",
  },
  {
    src: "muz1.jpg",
    cz: "Živý vstup Museum Kotsanas z Řecka",
    en: "Live segment from Museum Kotsanas in Greece",
    landscape: true,
  },
  {
    src: "spol2.jpg",
    cz: "Společné setkání hostů ARCHIMEDES DAY",
    en: "ARCHIMEDES DAY guests together",
    landscape: true,
  },
  {
    src: "tana1.jpg",
    cz: "Taťána Kuchařová při moderování programu",
    en: "Taťána Kuchařová hosting the program",
  },
  {
    src: "tana2.jpg",
    cz: "Taťána Kuchařová během prvního ročníku",
    en: "Taťána Kuchařová during the first edition",
  },
  {
    src: "zaci1.jpg",
    cz: "Žáci zapojení do programu v učebně ARCHIMEDES",
    en: "Students taking part in the program in the ARCHIMEDES classroom",
  },
];

const CONTENT = {
  cz: {
    metaTitle: "ARCHIMEDES DAY | 19. června 2026",
    metaDescription:
      "První ARCHIMEDES DAY se uskutečnil 19. června 2026 na BVV Brno. Propojil 120 škol, hosty z Česka a živý vstup z Museum Kotsanas v Řecku.",
    badge: "První ročník • BVV Brno • ARCHIMEDES Live",
    heroTitle: "ARCHIMEDES DAY",
    heroDate: "19. června 2026",
    heroText:
      "První ročník mezinárodního dne vzdělávání, vědy a objevování propojil 120 škol, inspirativní hosty a živý vstup z Řecka.",
    ctaProgram: "Prohlédnout program",
    ctaGallery: "Fotogalerie z akce",

    aboutKicker: "První ročník",
    aboutTitle: "Co je ARCHIMEDES DAY",
    aboutText1:
      "ARCHIMEDES DAY je mezinárodní formát, který připomíná odkaz Archimeda moderním způsobem – prostřednictvím vzdělávání, živého vysílání, popularizace vědy a propojování škol i komunit.",
    aboutText2:
      "Historicky první ročník se uskutečnil 19. června 2026 v učebně ARCHIMEDES na brněnském výstavišti. Pod záštitou manželky prezidenta České republiky Evy Pavlové propojil školy z České republiky i zahraničí s osobnostmi, vědci a Museum Kotsanas v Řecku.",

    cards: [
      {
        title: "120 zapojených škol",
        text: "Školy z České republiky i zahraničí sledovaly program živě prostřednictvím ARCHIMEDES Live.",
      },
      {
        title: "Živé spojení s Řeckem",
        text: "Součástí dne byl živý vstup z Museum Kotsanas a setkání s odkazem Archimeda v jeho rodném kulturním prostředí.",
      },
      {
        title: "Nová mezinárodní tradice",
        text: "První ročník pod záštitou Evy Pavlové spojil vzdělávání, vědu, inspirativní osobnosti a komunitu.",
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
      "Program vysílaný živě z BVV Brno spojil wellbeing pro mladou generaci, Museum Kotsanas v Řecku, příběh největšího vědce starověku a pokusy týmu Science ON.",
    programItems: [
      {
        time: "09:00",
        title: "Zahájení",
        text: "Historicky prvním ARCHIMEDES DAY provázela moderátorka Karolína Kopincová.",
      },
      {
        time: "09:15",
        title: "Pevný bod – Wellbeing Gen Z",
        text: "Programem provedla Kristýna Sekaninová.",
      },
      {
        time: "10:00",
        title: "ARCHIMEDES Museum Kotsanas Řecko",
        text: "Živý vstup z Řecka moderovala Karolína Surý.",
      },
      {
        time: "10:30",
        title: "ARCHIMEDES – největší vědec starověku",
        text: "Vystoupil doc. RNDr. Jindřich Bečvář, CSc.; rozhovor moderovala Taťána Kuchařová.",
      },
      {
        time: "11:00",
        title: "Vynálezce ARCHIMEDES – pokusy živě",
        text: "Živé experimenty předvedl tým Science ON.",
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

    galleryKicker: "19. června 2026 • BVV Brno",
    galleryTitle: "Fotogalerie z prvního ročníku",
    galleryIntro:
      "Vzpomínky na živý program, hosty, vědecké pokusy a žáky, kteří byli přímo u vzniku nové mezinárodní tradice.",

    liveKicker: "ARCHIMEDES Live",
    liveTitle:
      "ARCHIMEDES DAY je součástí širšího živého vzdělávacího ekosystému",
    liveText:
      "ARCHIMEDES DAY je přirozeně propojen s platformou ARCHIMEDES Live, která přináší živý program pro školy, obce a komunitu, a také se sítí venkovních učeben ARCHIMEDES.",
    liveBtn1: "ARCHIMEDES Live",
    liveBtn2: "Venkovní učebny",

    finalKicker: "Další ročník",
    finalTitle: "Chcete být u pokračování ARCHIMEDES DAY?",
    finalText:
      "ARCHIMEDES DAY pokračuje jako mezinárodní den vzdělávání, vědy a objevování. Pro informace o dalším ročníku nebo partnerství se nám ozvěte.",
    finalBtn1: "Kontaktujte nás",
    finalBtn2: "ARCHIMEDES Live",
  },

  en: {
    metaTitle: "ARCHIMEDES DAY | June 19, 2026",
    metaDescription:
      "The first ARCHIMEDES DAY took place at BVV Brno on June 19, 2026, connecting 120 schools, Czech guests and a live segment from Museum Kotsanas in Greece.",
    badge: "First edition • BVV Brno • ARCHIMEDES Live",
    heroTitle: "ARCHIMEDES DAY",
    heroDate: "June 19, 2026",
    heroText:
      "The first edition of this international day of education, science and discovery connected 120 schools, inspiring guests and a live segment from Greece.",
    ctaProgram: "See the program",
    ctaGallery: "Event gallery",

    aboutKicker: "The first edition",
    aboutTitle: "What is ARCHIMEDES DAY",
    aboutText1:
      "ARCHIMEDES DAY is a new international format that brings the legacy of Archimedes into the present through education, live broadcasting, science outreach and community connection.",
    aboutText2:
      "The historic first edition took place in the ARCHIMEDES classroom at BVV Brno on June 19, 2026. Held under the patronage of Eva Pavlová, wife of the President of the Czech Republic, it connected schools in the Czech Republic and abroad with inspiring personalities, scientists and Museum Kotsanas in Greece.",

    cards: [
      {
        title: "120 participating schools",
        text: "Schools in the Czech Republic and abroad followed the program live through ARCHIMEDES Live.",
      },
      {
        title: "Live connection with Greece",
        text: "The day included a live segment from Museum Kotsanas and explored the legacy of Archimedes in its cultural context.",
      },
      {
        title: "A new international tradition",
        text: "The first edition, held under the patronage of Eva Pavlová, brought together education, science, inspiring personalities and community.",
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
      "Broadcast live from BVV Brno, the program combined wellbeing for the young generation, Museum Kotsanas in Greece, the story of antiquity's greatest scientist and live experiments by Science ON.",
    programItems: [
      {
        time: "09:00",
        title: "Start of the program",
        text: "The first ARCHIMEDES DAY was hosted by Karolína Kopincová.",
      },
      {
        time: "09:15",
        title: "Fixed Point – Wellbeing Gen Z",
        text: "Presented by Kristýna Sekaninová.",
      },
      {
        time: "10:00",
        title: "ARCHIMEDES Museum Kotsanas Greece",
        text: "The live segment from Greece was hosted by Karolína Surý.",
      },
      {
        time: "10:30",
        title: "ARCHIMEDES – the greatest scientist of antiquity",
        text: "Featuring doc. RNDr. Jindřich Bečvář, CSc.; the interview was hosted by Taťána Kuchařová.",
      },
      {
        time: "11:00",
        title: "ARCHIMEDES the Inventor – Live Experiments",
        text: "Live experiments were performed by the Science ON team.",
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

    galleryKicker: "June 19, 2026 • BVV Brno",
    galleryTitle: "Gallery from the first edition",
    galleryIntro:
      "Memories of the live program, guests, science experiments and students who witnessed the beginning of a new international tradition.",

    liveKicker: "ARCHIMEDES Live",
    liveTitle: "ARCHIMEDES DAY is part of a broader live educational ecosystem",
    liveText:
      "ARCHIMEDES DAY is naturally connected with the ARCHIMEDES Live platform, which brings a live program for schools, municipalities and communities, as well as with the ARCHIMEDES outdoor classrooms network.",
    liveBtn1: "ARCHIMEDES Live",
    liveBtn2: "Outdoor classrooms",

    finalKicker: "The next edition",
    finalTitle: "Would you like to join the next ARCHIMEDES DAY?",
    finalText:
      "ARCHIMEDES DAY continues as an international day of education, science and discovery. Contact us for information about the next edition or partnership.",
    finalBtn1: "Contact us",
    finalBtn2: "ARCHIMEDES Live",
  },
};

export default function ArchimedesDayPage() {
  const [lang, setLang] = useState("cz");
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
          content="https://archimedeslive.com/archimedes-day-2026/spolecna.jpg"
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

                  <a href="#gallery" className="ad-btn ad-btn-secondary">
                    {t.ctaGallery}
                  </a>
                </div>
              </div>

              <div className="ad-hero-photo-wrap">
                <div className="ad-hero-photo-card">
                  <Image
                    src={`${GALLERY_PATH}/spolecna.jpg`}
                    alt={lang === "cz" ? GALLERY[0].cz : GALLERY[0].en}
                    width={1024}
                    height={683}
                    priority
                    sizes="(max-width: 900px) 90vw, 560px"
                    className="ad-hero-photo"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="ad-section ad-section-dark">
          <div className="ad-shell">
            <div className="ad-heading">
              <p className="ad-kicker">{t.galleryKicker}</p>
              <h2>{t.galleryTitle}</h2>
              <p>{t.galleryIntro}</p>
            </div>

            <div className="ad-gallery">
              {GALLERY.map((item) => (
                <figure className="ad-gallery-item" key={item.src}>
                  <Image
                    src={`${GALLERY_PATH}/${item.src}`}
                    alt={lang === "cz" ? item.cz : item.en}
                    width={1024}
                    height={item.landscape ? 683 : 1536}
                    sizes="(max-width: 720px) 100vw, (max-width: 1120px) 50vw, 33vw"
                    className="ad-gallery-image"
                  />
                </figure>
              ))}
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
              <Link href="/" className="ad-btn ad-btn-secondary ad-btn-light">
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
            radial-gradient(
              circle at 20% 20%,
              rgba(255, 255, 255, 0.09),
              transparent 22%
            ),
            radial-gradient(
              circle at 80% 30%,
              rgba(217, 178, 108, 0.2),
              transparent 22%
            ),
            linear-gradient(135deg, #08111f 0%, #0e2140 52%, #09121f 100%);
          color: #ffffff;
        }

        .ad-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to bottom,
              rgba(8, 17, 31, 0.12),
              rgba(8, 17, 31, 0.42)
            ),
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

        .ad-hero-photo-wrap {
          display: flex;
          justify-content: center;
        }

        .ad-hero-photo-card {
          width: 100%;
          max-width: 560px;
          padding: 18px;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(12px);
        }

        .ad-hero-photo {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 24px;
          object-fit: cover;
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

        .ad-gallery {
          column-count: 3;
          column-gap: 18px;
        }

        .ad-gallery-item {
          margin: 0 0 18px;
          break-inside: avoid;
          overflow: hidden;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.2);
        }

        .ad-gallery-image {
          display: block;
          width: 100%;
          height: auto;
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
            radial-gradient(
              circle at top,
              rgba(196, 154, 76, 0.18),
              transparent 36%
            ),
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

          .ad-gallery {
            column-count: 2;
          }

          .ad-hero-photo-card {
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

          .ad-gallery {
            column-count: 1;
          }

          .ad-card,
          .ad-value,
          .ad-greeting-card,
          .ad-program-item,
          .ad-link-block,
          .ad-classroom-media,
          .ad-hero-photo-card,
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
