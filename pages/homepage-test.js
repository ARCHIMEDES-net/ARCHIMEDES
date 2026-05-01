
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";

// --- KONSTANTY (Cesty k obrázkům a nastavení) ---
const heroImg = "/jak-funguje-trida.jpg";
const stepOnlineImg = "/jak-funguje-online.jpg";
const stepClassImg = "/ella.jpg";
const stepBoardImg = "/jak-funguje-tabule.jpg";
const POSTERS_BUCKET = "posters";

// --- POMOCNÉ KOMPONENTY ---

function ButtonLink({
  href,
  children,
  variant = "primary",
  eventName,
  onClick,
}) {
  const handleClick = () => {
    if (eventName) track(eventName);
    if (onClick) onClick();
  };

  return (
    <Link
      href={href}
      className={`al-btn al-btn-${variant}`}
      onClick={handleClick}
    >
      <span>{children}</span>
    </Link>
  );
}

function VideoCard({ title, subtitle, src, featured = false }) {
  return (
    <div className={`videoCard${featured ? " videoCardFeatured" : ""}`}>
      <div className="videoFrameWrap">
        <iframe
          width="100%"
          height="100%"
          src={src}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="videoFrame"
        />
      </div>
      <div className="videoBody">
        <div className="videoTitle">{title}</div>
        <div className="videoSubtitle">{subtitle}</div>
      </div>
    </div>
  );
}

function formatEventDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const datePart = date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} • ${timePart}`;
}

// --- HLAVNÍ KOMPONENTA STRÁNKY ---

export default function Home() {
  const [nextEvent, setNextEvent] = useState(null);
  const [nextEventLoading, setNextEventLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNextEvent() {
      try {
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
          .from("events")
          .select("id, title, starts_at, poster_path, poster_url, category")
          .eq("is_published", true)
          .gte("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(1);

        if (error) throw error;

        const event = data?.[0] || null;

        if (!active) return;

        if (!event) {
          setNextEvent(null);
          return;
        }

        let posterUrl = event.poster_url || "";

        if (!posterUrl && event.poster_path) {
          const { data: publicUrlData } = supabase.storage
            .from(POSTERS_BUCKET)
            .getPublicUrl(event.poster_path);
          posterUrl = publicUrlData?.publicUrl || "";
        }

        setNextEvent({
          ...event,
          posterUrl,
        });
      } catch (_err) {
        if (!active) return;
        setNextEvent(null);
      } finally {
        if (active) {
          setNextEventLoading(false);
        }
      }
    }

    loadNextEvent();

    return () => {
      active = false;
    };
  }, []);

  const nextEventDate = useMemo(
    () => formatEventDate(nextEvent?.starts_at),
    [nextEvent]
  );

  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy a obce</title>
        <meta
          name="description"
          content="ARCHIMEDES Live přináší školám živé vstupy s odborníky a hotové pracovní listy. Program START: modernizace výuky bez náročné přípravy."
        />
      </Head>

      <main className="page">
        {/* --- HERO SEKCE --- */}
        <section className="hero">
          <div className="heroMedia">
            <img src={heroImg} alt="ARCHIMEDES Live ve škole" />
            <div className="heroOverlay" />
            <div className="heroGlow heroGlowOne" />
            <div className="heroGlow heroGlowTwo" />
          </div>

          <div className="heroContentWrap">
            <div className="container">
              <div className="heroGrid">
                <div className="heroContent">
                  <div className="eyebrow">Šablony OP JAK • Modernizace výuky</div>

                  <h1>
                    Hodina, na kterou
                    <br />
                    se <span>nezapomíná.</span>
                  </h1>

                  <p className="heroIntro">
                    Přiveďte do třídy živé odborníky z celého světa. 
                    S programem START získáte hotový balíček inspirace, který učitel jen zapne a učí.
                  </p>

                  <div className="heroActions">
                    <ButtonLink
                      href="/start"
                      variant="primary-highlight"
                      eventName="klik_home_start_main"
                    >
                      Objednat program START
                    </ButtonLink>

                    <ButtonLink
                      href="/demo"
                      variant="secondary"
                      eventName="klik_home_demo"
                    >
                      Vyzkoušet DEMO
                    </ButtonLink>

                    <ButtonLink
                      href="/aktualni-pozvanky"
                      variant="secondary"
                      eventName="klik_home_co_se_chysta"
                    >
                      Co se chystá
                    </ButtonLink>
                  </div>

                  <div className="trustBadge">
                    <span className="icon">✓</span> <span>Financování ze šablon a projektů digitalizace</span>
                  </div>
                </div>

                <div className="heroAside">
                  <Link
                    href="/program"
                    className="nextBroadcastCard"
                    onClick={() => track("klik_home_program_karta")}
                  >
                    <div className="nextBroadcastHead">
                      <div className="nextBroadcastLabel">Nejbližší vysílání</div>
                      <div className="nextBroadcastBadge">LIVE</div>
                    </div>

                    {nextEventLoading ? (
                      <div className="nextBroadcastLoading">Načítáme vysílání…</div>
                    ) : nextEvent ? (
                      <>
                        <div className="nextBroadcastPosterWrap">
                          {nextEvent.posterUrl ? (
                            <img
                              src={nextEvent.posterUrl}
                              alt={nextEvent.title}
                              className="nextBroadcastPoster"
                            />
                          ) : (
                            <div className="nextBroadcastPosterPlaceholder">
                              ARCHIMEDES Live
                            </div>
                          )}
                        </div>

                        <div className="nextBroadcastBody">
                          <div className="nextBroadcastDate">{nextEventDate}</div>
                          <div className="nextBroadcastTitle">{nextEvent.title}</div>
                          <div className="nextBroadcastAction">
                            <span>Detail programu</span>
                            <span aria-hidden="true">→</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="nextBroadcastEmpty">
                        <div className="nextBroadcastEmptyTitle">Program připravujeme</div>
                        <div className="nextBroadcastAction">Zobrazit kalendář →</div>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SEKCE: SEGMENTACE PRO ŘEDITELE A UČITELE --- */}
        <section className="section sectionSegment">
          <div className="container">
            <div className="segmentGrid">
              <div className="segmentCard">
                <div className="segmentIcon">🏢</div>
                <h3>Pro ředitele školy</h3>
                <ul>
                  <li>Jednoduché čerpání ze šablon OP JAK</li>
                  <li>Modernizace školy bez papírování</li>
                  <li>Zvýšení atraktivity školy pro rodiče</li>
                </ul>
              </div>
              <div className="segmentCard">
                <div className="segmentIcon">👩‍🏫</div>
                <h3>Pro učitele</h3>
                <ul>
                  <li>Nulová časová příprava na hodinu</li>
                  <li>Hotové pracovní listy a metodiky</li>
                  <li>Přístup k archivu inspirativních hostů</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- SEKCE: JAK TO FUNGUJE --- */}
        <section className="section sectionHow">
          <div className="container">
            <div className="sectionIntro center">
              <div className="eyebrow dark">Jednoduchost nadevše</div>
              <h2>3 kroky k moderní hodině</h2>
              <p>
                Zapomeňte na složité instalace. ARCHIMEDES Live funguje v prohlížeči,
                na interaktivní tabuli i na tabletech.
              </p>
            </div>

            <div className="stepsGrid">
              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepOnlineImg} alt="Živý odborník na obrazovce" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">1</div>
                  <h3>Výběr tématu</h3>
                  <p>Z kalendáře si vyberete hosta nebo téma, které zrovna probíráte.</p>
                </div>
              </article>

              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepClassImg} alt="Žáci sledují a reagují" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">2</div>
                  <h3>Živé setkání</h3>
                  <p>Děti sledují živý vstup, kladou otázky a vidí teorii v praxi.</p>
                </div>
              </article>

              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepBoardImg} alt="Interaktivní práce ve škole" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">3</div>
                  <h3>Práce s materiály</h3>
                  <p>Využijete připravené listy k upevnění znalostí přímo v hodině.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* --- SEKCE: UKÁZKY --- */}
        <section id="ukazky-vysilani" className="section sectionShowcase">
          <div className="container">
            <div className="showcaseShell">
              <div className="sectionIntro">
                <div className="eyebrow dark">Video ukázky</div>
                <h2>Jak vypadá výuka v praxi</h2>
              </div>

              <div className="videosGrid">
                <VideoCard
                  featured
                  title="Ukázka vysílání pro školy"
                  subtitle="ZOO Praha – výukový vstup"
                  src="https://www.youtube.com/embed/yvelfGeL6Jg"
                />
                <VideoCard
                  title="Angličtina s rodilým mluvčím"
                  subtitle="Paul Wade – živý vstup"
                  src="https://www.youtube.com/embed/bX2y0Uxw-Dg"
                />
                <VideoCard
                  title="Beseda s osobností"
                  subtitle="Prof. Jan Pirk"
                  src="https://www.youtube.com/embed/-VV3PYdWPUo"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- SEKCE: PŘÍNOSY (Původní benefitsGrid) --- */}
        <section className="section sectionBenefits">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow dark">Co získáte</div>
              <h2>Proč školy milují ARCHIMEDES®</h2>
            </div>

            <div className="benefitsGrid">
              <div className="benefitCard benefitCardPrimary">
                <div className="benefitTag">Balíček START</div>
                <h3>Vše v jednom pro první krok</h3>
                <p>
                  Licence pro celou školu, metodická podpora a garantovaný počet
                  živých vstupů za fixní cenu.
                </p>
              </div>

              <div className="benefitCard">
                <div className="benefitTag">Pro žáky</div>
                <h3>Motivace k učení</h3>
                <p>
                  Děti vidí smysl učiva. Setkávají se sprofesemi, o kterých jen četly
                  v učebnicích.
                </p>
              </div>

              <div className="benefitCard">
                <div className="benefitTag">Pro obec</div>
                <h3>Komunitní přesah</h3>
                <p>
                  Možnost využít archiv pro seniorské kluby nebo komunitní večery v obci.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SEKCE: DŮVĚRA A STATISTIKY --- */}
        <section className="section sectionTrust">
          <div className="container">
            <div className="trustPanel">
              <div className="trustMain">
                <div className="eyebrow dark">Ověřeno praxí</div>
                <h2>Pomáháme v desítkách škol</h2>
                <p>
                  Spolupracujeme s odborníky a pedagogy, abychom do tříd přinášeli
                  jen to nejlepší.
                </p>

                <div className="trustInlineLinks">
                  <Link href="/ucebna" className="trustInlineLink">
                    <span>Venkovní učebny</span> →
                  </Link>
                  <Link href="/archimedes-day" className="trustInlineLink">
                    <span>ARCHIMEDES DAY 2026</span> →
                  </Link>
                </div>
              </div>

              <div className="trustStats">
                <div className="trustStat">
                  <strong>25+</strong>
                  <span>instalovaných učeben</span>
                </div>
                <div className="trustStat">
                  <strong>1000+</strong>
                  <span>aktivních žáků</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINÁLNÍ CTA --- */}
        <section className="ctaSection">
          <div className="container">
            <div className="ctaBox">
              <div className="ctaMain">
                <h2>Chcete program START i u vás?</h2>
                <p>
                  Pošleme vám nezávaznou cenovou nabídku a podklady pro šablony. 
                  Stačí jeden klik.
                </p>
              </div>

              <div className="ctaSide">
                <div className="ctaActions">
                  <ButtonLink
                    href="/start"
                    variant="light"
                    eventName="klik_home_cta_start"
                  >
                    Vyžádat nabídku START
                  </ButtonLink>
                  <ButtonLink
                    href="/demo"
                    variant="light-outline"
                    eventName="klik_home_cta_demo"
                  >
                    Chci DEMO
                  </ButtonLink>
                </div>
                <div className="ctaNote">
                  Platba na fakturu • Technická podpora v ceně
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* --- STYLY (Scoped JSX) --- */}
        <style jsx>{`
          .page {
            background: linear-gradient(180deg, #f8fafd 0%, #f4f7fb 100%);
            color: #0f172a;
            font-family: sans-serif;
          }

          .container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 20px;
          }

          /* HERO */
          .hero {
            position: relative;
            min-height: 720px;
            display: flex;
            align-items: center;
            overflow: hidden;
          }

          .heroMedia { position: absolute; inset: 0; }
          .heroMedia img { width: 100%; height: 100%; object-fit: cover; }
          .heroOverlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(92deg, rgba(7, 14, 31, 0.9) 0%, rgba(7, 14, 31, 0.3) 100%);
          }

          .heroContentWrap { position: relative; z-index: 2; width: 100%; }
          .heroGrid { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }
          .heroContent { color: white; padding: 60px 0; }
          
          h1 { font-size: 72px; font-weight: 900; line-height: 0.95; margin: 0 0 20px; letter-spacing: -0.04em; }
          h1 span { color: #4e84df; }
          .heroIntro { font-size: 24px; line-height: 1.4; opacity: 0.9; margin-bottom: 30px; max-width: 600px; }
          .heroActions { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px; }
          .trustBadge { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #cbd5e1; }

          /* SEGMENTACE */
          .sectionSegment { padding: 40px 0; margin-top: -80px; position: relative; z-index: 10; }
          .segmentGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          .segmentCard {
            background: white;
            padding: 40px;
            border-radius: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
          }
          .segmentIcon { font-size: 40px; margin-bottom: 15px; }
          .segmentCard h3 { font-size: 24px; font-weight: 900; margin: 0 0 15px; }
          .segmentCard ul { padding: 0; list-style: none; }
          .segmentCard li { margin-bottom: 10px; color: #64748b; font-weight: 600; padding-left: 20px; position: relative; }
          .segmentCard li::before { content: "•"; position: absolute; left: 0; color: #4e84df; }

          /* KARTA VYSÍLÁNÍ */
          .nextBroadcastCard {
            background: rgba(9, 17, 34, 0.6);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 24px;
            padding: 20px;
            color: white;
            text-decoration: none;
            display: block;
            transition: 0.3s;
          }
          .nextBroadcastCard:hover { transform: translateY(-5px); background: rgba(9, 17, 34, 0.8); }
          .nextBroadcastHead { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .nextBroadcastBadge { color: #ef4444; font-weight: 900; font-size: 12px; }
          .nextBroadcastPoster { width: 100%; aspect-ratio: 16/10; object-fit: cover; border-radius: 12px; margin-bottom: 15px; }
          .nextBroadcastTitle { font-size: 18px; font-weight: 900; line-height: 1.2; }

          /* OBECNÉ SEKCE */
          .section { padding: 100px 0; }
          .sectionIntro { margin-bottom: 50px; }
          .center { text-align: center; }
          .eyebrow { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
          .eyebrow.dark { background: #e2e8f0; color: #1e293b; }
          h2 { font-size: 48px; font-weight: 900; letter-spacing: -0.04em; margin: 0; }

          /* KROKY */
          .stepsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
          .stepCard { background: white; border-radius: 24px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
          .stepImage img { width: 100%; height: 220px; object-fit: cover; }
          .stepBody { padding: 25px; }
          .stepNumber { width: 35px; height: 35px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 900; margin-bottom: 15px; }
          
          /* VIDEA */
          .videosGrid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
          .videosGrid :global(.videoCard:nth-child(1)) { grid-column: span 6; }
          .videosGrid :global(.videoCard:nth-child(2)) { grid-column: span 3; }
          .videosGrid :global(.videoCard:nth-child(3)) { grid-column: span 3; }
          .videoCard { background: white; border-radius: 20px; overflow: hidden; }
          .videoFrameWrap { aspect-ratio: 16/9; background: #000; }
          .videoBody { padding: 15px; }
          .videoTitle { font-weight: 800; font-size: 16px; }
          .videoSubtitle { font-size: 13px; color: #64748b; }

          /* BENEFITS */
          .benefitsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .benefitCard { padding: 30px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; }
          .benefitTag { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 800; border-radius: 10px; margin-bottom: 15px; }

          /* CTA */
          .ctaBox { background: #0f172a; color: white; padding: 60px; border-radius: 40px; display: flex; justify-content: space-between; align-items: center; gap: 40px; }
          .ctaMain h2 { color: white; margin-bottom: 15px; }
          .ctaActions { display: flex; gap: 15px; }
          .ctaNote { font-size: 13px; margin-top: 15px; opacity: 0.6; }

          /* RESPONZIVITA */
          @media (max-width: 1024px) {
            .heroGrid, .segmentGrid, .stepsGrid, .benefitsGrid, .ctaBox { grid-template-columns: 1fr; text-align: center; }
            .heroContent { text-align: center; }
            .heroActions { justify-content: center; }
            .videosGrid { grid-template-columns: 1fr; }
            .videosGrid :global(.videoCard) { grid-column: span 12 !important; }
            h1 { font-size: 48px; }
            .ctaBox { flex-direction: column; padding: 40px 20px; }
          }
        `}</style>

        <style jsx global>{`
          .al-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 56px;
            padding: 0 32px;
            border-radius: 28px;
            font-weight: 800;
            font-size: 16px;
            text-decoration: none;
            transition: 0.2s;
            cursor: pointer;
          }
          .al-btn-primary-highlight { background: #2563eb; color: white; border: none; box-shadow: 0 10px 20px rgba(37,99,235,0.3); }
          .al-btn-primary-highlight:hover { background: #1d4ed8; transform: translateY(-2px); }
          
          .al-btn-secondary { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(5px); }
          .al-btn-secondary:hover { background: rgba(255,255,255,0.25); }

          .al-btn-light { background: white; color: #0f172a; }
          .al-btn-light-outline { background: transparent; color: white; border: 2px solid white; }
        `}</style>
      </main>
    </>
  );
}
