import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";

const heroImg = "/jak-funguje-trida.jpg";
const stepOnlineImg = "/jak-funguje-online.jpg";
const stepClassImg = "/ella.jpg";
const stepBoardImg = "/jak-funguje-tabule.jpg";
const POSTERS_BUCKET = "posters";

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
          content="ARCHIMEDES Live přináší školám a obcím živé vstupy s odborníky, reálná témata, pracovní listy a program, který propojuje výuku s praxí i komunitním životem."
        />
      </Head>

      <main className="page">
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
                  <div className="eyebrow">ARCHIMEDES Live pro školy a obce</div>

                  <div className="heroTopLinks">
                    <Link
                      href="/archimedes-day"
                      className="heroSignal heroSignalGold"
                      onClick={() => track("klik_home_archimedes_day")}
                    >
                      <span className="heroSignalLabel">Mezinárodní iniciativa</span>
                      <span className="heroSignalTitle">ARCHIMEDES DAY</span>
                      <span className="heroSignalArrow" aria-hidden="true">
                        →
                      </span>
                    </Link>

                    <Link
                      href="/guest"
                      className="heroSignal heroSignalGhost"
                      onClick={() => track("klik_home_guest")}
                    >
                      <span className="heroSignalLabel">International guest access</span>
                      <span className="heroSignalTitle">For invited guest speakers</span>
                      <span className="heroSignalArrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>

                  <h1>
                    Hodina, na kterou
                    <br />
                    se nezapomíná.
                  </h1>

                  <p className="heroIntro">
                    Živý program, který propojuje školy, obce a komunitní život.
                    Přináší dětem i dospělým setkání s inspirativními hosty,
                    témata z reálného světa a formát, který lze snadno zařadit do
                    běžného dne školy i obce.
                  </p>

                  <p className="heroLead">
                    Živé vysílání, tematické kluby, pracovní listy, archiv a
                    program pro různé generace na jednom místě.
                  </p>

                  <div className="heroActions">
                    <ButtonLink
                      href="/program"
                      variant="primary"
                      eventName="klik_home_program"
                    >
                      Zobrazit program
                    </ButtonLink>

                    <ButtonLink
                      href="/start"
                      variant="secondary"
                      eventName="klik_home_start"
                    >
                      Balíček START
                    </ButtonLink>

                    <ButtonLink
                      href="/demo"
                      variant="secondary"
                      eventName="klik_home_demo"
                    >
                      Ukázka platformy
                    </ButtonLink>
                  </div>

                  <div className="heroSubActions">
                    <Link
                      href="/aktualni-pozvanky"
                      className="heroMiniLink"
                      onClick={() => track("klik_home_co_se_chysta")}
                    >
                      <span>Co se chystá</span>
                      <span aria-hidden="true">→</span>
                    </Link>

                    <Link
                      href="/#ukazky-vysilani"
                      className="heroMiniLink"
                      onClick={() => track("klik_home_ukazkova_hodina")}
                    >
                      <span>Jak vypadá ukázková hodina</span>
                      <span aria-hidden="true">→</span>
                    </Link>
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
                      <div className="nextBroadcastBadge">Program</div>
                    </div>

                    {nextEventLoading ? (
                      <div className="nextBroadcastLoading">
                        Načítáme nejbližší vysílání…
                      </div>
                    ) : nextEvent ? (
                      <>
                        <div className="nextBroadcastPosterWrap">
                          {nextEvent.posterUrl ? (
                            <img
                              src={nextEvent.posterUrl}
                              alt={nextEvent.title || "Plakát vysílání"}
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

                          <div className="nextBroadcastTitle">
                            {nextEvent.title}
                          </div>

                          <div className="nextBroadcastAction">
                            <span>Zobrazit detail programu</span>
                            <span aria-hidden="true">→</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="nextBroadcastEmpty">
                        <div className="nextBroadcastEmptyTitle">
                          Program připravujeme průběžně
                        </div>
                        <div className="nextBroadcastEmptyText">
                          Otevřete si přehled programu a podívejte se na aktuální
                          i připravovaná vysílání.
                        </div>
                        <div className="nextBroadcastAction">
                          <span>Zobrazit program</span>
                          <span aria-hidden="true">→</span>
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionHow">
          <div className="container">
            <div className="sectionIntro center">
              <div className="eyebrow dark">Jak to funguje</div>
              <h2>Jednoduché zapojení do běžné výuky</h2>
              <p>
                Připravené online vstupy s hosty z praxe, které učitel snadno
                zařadí do hodiny. Žáci sledují živé vysílání, zapojují se do
                diskuze a pracují s tématy, která souvisí s výukou i životem
                kolem nich.
              </p>
            </div>

            <div className="stepsGrid">
              <article className="stepCard">
                <div className="stepImage">
                  <img src={stepOnlineImg} alt="Živý odborník na obrazovce" />
                </div>
                <div className="stepBody">
                  <div className="stepNumber">1</div>
                  <h3>Živý host přímo ve třídě</h3>
                  <p>
                    Škola se připojí k živému vstupu a děti se setkají s
                    odborníkem, autorem nebo člověkem z reálné praxe.
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
                    Výuka je aktivní. Děti se zapojují, sledují, přemýšlejí a
                    pracují s tématem přímo ve třídě.
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
                    Škola má k dispozici pracovní listy, které přímo navazují na
                    výuku, a také přístup do archivu pro opakování témat.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="ukazky-vysilani" className="section sectionShowcase">
          <div className="container">
            <div className="showcaseShell">
              <div className="sectionIntro sectionIntroShowcase">
                <div className="eyebrow dark">Ukázky vysílání</div>
                <h2>Jak vypadá jedna hodina s ARCHIMEDES Live</h2>
                <p>
                  Krátké ukázky z reálných vysílání pomáhají rychle pochopit
                  atmosféru, formát i možnosti programu.
                </p>
              </div>

              <div className="videosGrid">
                <VideoCard
                  featured
                  title="Ukázka vysílání pro školy"
                  subtitle="ZOO Praha – výukový vstup pro školní program"
                  src="https://www.youtube.com/embed/yvelfGeL6Jg"
                />
                <VideoCard
                  title="Angličtina s rodilým mluvčím"
                  subtitle="Paul Wade – ukázka živého vstupu"
                  src="https://www.youtube.com/embed/bX2y0Uxw-Dg"
                />
                <VideoCard
                  title="Senior klub"
                  subtitle="Prof. Jan Pirk a spisovatel Viktor Špaček"
                  src="https://www.youtube.com/embed/-VV3PYdWPUo"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionBenefits">
          <div className="container">
            <div className="sectionIntro sectionIntroWide">
              <div className="eyebrow dark">Co to přináší</div>
              <h2>Program, který dává přidanou hodnotu škole i obci</h2>
            </div>

            <div className="benefitsGrid">
              <div className="benefitCard benefitCardPrimary">
                <div className="benefitTag">Pro školu</div>
                <h3>Hotový formát, který lze využít bez složité přípravy</h3>
                <p>
                  Moderní výuka, inspirativní hosté a obsah, který učitelé mohou
                  snadno zařadit do běžného školního dne.
                </p>
              </div>

              <div className="benefitCard">
                <div className="benefitTag">Pro žáky</div>
                <h3>Setkání s reálným světem a větší motivace</h3>
                <p>
                  Děti vidí, že to, co se učí, souvisí s opravdovým životem,
                  praxí, profesemi i místy mimo školní lavici.
                </p>
              </div>

              <div className="benefitCard">
                <div className="benefitTag">Pro obec</div>
                <h3>Obsah, který může sloužit celé komunitě</h3>
                <p>
                  Program může využívat nejen škola, ale i obec, senioři,
                  dobrovolní hasiči a další komunitní skupiny.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionTrust">
          <div className="container">
            <div className="trustPanel">
              <div className="trustMain">
                <div className="eyebrow dark">Ověřeno v praxi</div>
                <h2>ARCHIMEDES® už funguje v desítkách škol a obcí</h2>
                <p>
                  Ve spolupráci s pedagogy a místními komunitami připravujeme
                  interaktivní programy, které srozumitelně představují
                  komplexní témata z celého světa.
                </p>

                <div className="trustInlineLinks">
                  <Link
                    href="/ucebna"
                    className="trustInlineLink"
                    onClick={() => track("klik_home_trust_ucebna")}
                  >
                    <span>Venkovní učebna ARCHIMEDES®</span>
                    <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    href="/archimedes-day"
                    className="trustInlineLink"
                    onClick={() => track("klik_home_trust_archimedes_day")}
                  >
                    <span>ARCHIMEDES DAY 2026</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="trustStats">
                <div className="trustStat">
                  <strong>25+</strong>
                  <span>venkovních učeben ARCHIMEDES®</span>
                </div>
                <div className="trustStat">
                  <strong>200+</strong>
                  <span>partnerů a hostů programu</span>
                </div>
                <div className="trustStat">
                  <strong>1000+</strong>
                  <span>žáků a účastníků programu</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ctaSection">
          <div className="container">
            <div className="ctaBox">
              <div className="ctaMain">
                <div className="eyebrow light">
                  Chcete živý program ve vlastní škole?
                </div>
                <h2>
                  Začněte ukázkou, DEMEM nebo balíčkem START a vyzkoušejte
                  ARCHIMEDES Live přímo u vás
                </h2>
                <p>
                  Jednoduchý první krok pro školu i obec. Vyberte si variantu,
                  která vám nejlépe sedí, a poznejte, jak může živý program
                  obohatit výuku i komunitní život.
                </p>
              </div>

              <div className="ctaSide">
                <div className="ctaActions">
                  <ButtonLink
                    href="/start"
                    variant="light"
                    eventName="klik_home_cta_start"
                  >
                    Balíček START
                  </ButtonLink>
                  <ButtonLink
                    href="/demo"
                    variant="light"
                    eventName="klik_home_cta_demo"
                  >
                    Chci DEMO
                  </ButtonLink>
                </div>
                <div className="ctaNote">
                  objednávka online • potvrzení e-mailem
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            background:
              radial-gradient(circle at top left, rgba(221, 231, 247, 0.55), transparent 30%),
              linear-gradient(180deg, #f8fafd 0%, #f4f7fb 100%);
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
            transform: scale(1.015);
          }

          .heroOverlay {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(
                92deg,
                rgba(7, 14, 31, 0.84) 0%,
                rgba(7, 14, 31, 0.68) 25%,
                rgba(7, 14, 31, 0.3) 56%,
                rgba(7, 14, 31, 0.08) 100%
              ),
              linear-gradient(
                180deg,
                rgba(8, 15, 34, 0.18) 0%,
                rgba(8, 15, 34, 0.02) 48%,
                rgba(8, 15, 34, 0.18) 100%
              );
          }

          .heroGlow {
            position: absolute;
            border-radius: 999px;
            filter: blur(70px);
            pointer-events: none;
            opacity: 0.34;
          }

          .heroGlowOne {
            width: 280px;
            height: 280px;
            right: 8%;
            top: 12%;
            background: rgba(78, 132, 223, 0.28);
          }

          .heroGlowTwo {
            width: 220px;
            height: 220px;
            left: 2%;
            bottom: 8%;
            background: rgba(255, 255, 255, 0.12);
          }

          .heroContentWrap {
            position: relative;
            z-index: 2;
            width: 100%;
            display: flex;
            align-items: center;
          }

          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(290px, 340px);
            gap: 28px;
            align-items: end;
          }

          .heroContent {
            max-width: 780px;
            padding: 116px 0 82px;
            color: white;
          }

          .heroAside {
            padding: 116px 0 82px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }

          .heroTopLinks {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 18px;
          }

          .heroSignal {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-height: 42px;
            padding: 0 14px;
            border-radius: 999px;
            text-decoration: none;
            transition:
              transform 0.2s ease,
              background 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;
          }

          .heroSignal:hover {
            transform: translateY(-2px);
          }

          .heroSignalLabel {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            opacity: 0.82;
          }

          .heroSignalTitle {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: -0.01em;
          }

          .heroSignalArrow {
            font-size: 14px;
            font-weight: 900;
            line-height: 1;
          }

          .heroSignalGold {
            color: #fff7e5;
            background: rgba(193, 148, 62, 0.18);
            border: 1px solid rgba(233, 191, 102, 0.38);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
          }

          .heroSignalGold:hover {
            background: rgba(193, 148, 62, 0.25);
            border-color: rgba(233, 191, 102, 0.52);
          }

          .heroSignalGhost {
            color: rgba(255, 255, 255, 0.94);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.14);
          }

          .heroSignalGhost:hover {
            background: rgba(255, 255, 255, 0.14);
            border-color: rgba(255, 255, 255, 0.24);
          }

          .nextBroadcastCard {
            display: block;
            width: 100%;
            max-width: 328px;
            color: #ffffff;
            text-decoration: none;
            border-radius: 24px;
            padding: 14px;
            background: rgba(9, 17, 34, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.14);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow:
              0 18px 40px rgba(15, 23, 42, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
            transition:
              transform 0.22s ease,
              box-shadow 0.22s ease,
              border-color 0.22s ease,
              background 0.22s ease;
          }

          .nextBroadcastCard:hover {
            transform: translateY(-4px);
            background: rgba(9, 17, 34, 0.58);
            border-color: rgba(255, 255, 255, 0.22);
            box-shadow:
              0 24px 52px rgba(15, 23, 42, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .nextBroadcastHead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 12px;
          }

          .nextBroadcastLabel {
            font-size: 12px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.82);
          }

          .nextBroadcastBadge {
            display: inline-flex;
            align-items: center;
            min-height: 26px;
            padding: 0 10px;
            border-radius: 999px;
            font-size: 11px;
            line-height: 1;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.92);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .nextBroadcastLoading,
          .nextBroadcastEmpty {
            padding: 6px 2px 2px;
          }

          .nextBroadcastLoading {
            font-size: 15px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.88);
          }

          .nextBroadcastPosterWrap {
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .nextBroadcastPoster {
            display: block;
            width: 100%;
            aspect-ratio: 16 / 11;
            object-fit: cover;
            object-position: center;
          }

          .nextBroadcastPosterPlaceholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            aspect-ratio: 16 / 11;
            padding: 16px;
            text-align: center;
            font-size: 16px;
            line-height: 1.3;
            font-weight: 900;
            letter-spacing: -0.03em;
            color: rgba(255, 255, 255, 0.92);
            background:
              radial-gradient(circle at top right, rgba(255, 255, 255, 0.12), transparent 40%),
              linear-gradient(135deg, rgba(31, 54, 99, 0.9), rgba(10, 20, 38, 0.92));
          }

          .nextBroadcastBody {
            padding: 12px 2px 2px;
          }

          .nextBroadcastDate {
            font-size: 14px;
            line-height: 1.5;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.76);
          }

          .nextBroadcastTitle {
            margin-top: 6px;
            font-size: 18px;
            line-height: 1.15;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #ffffff;
            text-wrap: balance;
          }

          .nextBroadcastEmptyTitle {
            font-size: 22px;
            line-height: 1.08;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #ffffff;
            text-wrap: balance;
          }

          .nextBroadcastEmptyText {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.8);
          }

          .nextBroadcastAction {
            margin-top: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 800;
            color: #ffffff;
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            min-height: 34px;
            padding: 0 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 16px;
          }

          .eyebrow.dark {
            background: #e9eef8;
            color: #223252;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
          }

          .eyebrow.light {
            background: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.95);
          }

          .heroContent .eyebrow {
            background: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.94);
            border: 1px solid rgba(255, 255, 255, 0.14);
            margin-bottom: 14px;
          }

          h1 {
            margin: 0;
            font-size: 68px;
            line-height: 0.97;
            letter-spacing: -0.05em;
            font-weight: 900;
            max-width: 720px;
            text-wrap: balance;
          }

          .heroIntro {
            margin: 22px 0 0;
            font-size: 24px;
            line-height: 1.4;
            color: #ffffff;
            font-weight: 800;
            max-width: 760px;
            letter-spacing: -0.02em;
            text-wrap: balance;
          }

          .heroLead {
            margin: 18px 0 0;
            font-size: 20px;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.9);
            max-width: 680px;
          }

          .heroActions,
          .ctaActions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .heroActions {
            margin-top: 30px;
          }

          .heroSubActions {
            margin-top: 18px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px 18px;
          }

          .heroMiniLink {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.88);
            text-decoration: none;
            font-size: 15px;
            line-height: 1.4;
            font-weight: 700;
            transition: color 0.18s ease, transform 0.18s ease;
          }

          .heroMiniLink:hover {
            color: #ffffff;
            transform: translateX(2px);
          }

          .section {
            padding: 76px 0;
          }

          .sectionHow {
            padding-top: 58px;
            padding-bottom: 54px;
          }

          .sectionShowcase {
            padding-top: 6px;
            padding-bottom: 36px;
          }

          .sectionBenefits {
            position: relative;
            padding-top: 54px;
            padding-bottom: 72px;
            background:
              linear-gradient(180deg, rgba(234, 239, 247, 0.86) 0%, rgba(240, 244, 250, 0.98) 100%);
            border-top: 1px solid rgba(15, 23, 42, 0.04);
            border-bottom: 1px solid rgba(15, 23, 42, 0.04);
          }

          .sectionTrust {
            padding-top: 42px;
            padding-bottom: 70px;
          }

          .sectionIntro {
            margin-bottom: 28px;
          }

          .sectionIntroWide {
            max-width: 760px;
          }

          .sectionIntro.center {
            text-align: center;
            max-width: 860px;
            margin: 0 auto 32px;
          }

          .sectionIntroShowcase {
            max-width: 720px;
            margin-bottom: 18px;
          }

          h2 {
            margin: 0;
            font-size: 48px;
            line-height: 1.01;
            letter-spacing: -0.055em;
            font-weight: 900;
            color: #0f172a;
            text-wrap: balance;
          }

          .sectionIntro p,
          .trustPanel p,
          .ctaBox p {
            margin: 14px 0 0;
            font-size: 18px;
            line-height: 1.72;
            color: #5a6474;
            max-width: 780px;
          }

          .stepsGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
          }

          .stepCard,
          .benefitCard,
          .videoCard {
            background: rgba(255, 255, 255, 0.97);
            border: 1px solid rgba(15, 23, 42, 0.07);
            border-radius: 28px;
            overflow: hidden;
            box-shadow:
              0 14px 36px rgba(15, 23, 42, 0.045),
              0 2px 8px rgba(15, 23, 42, 0.028);
          }

          .stepCard {
            transition:
              transform 0.22s ease,
              box-shadow 0.22s ease,
              border-color 0.22s ease;
          }

          .stepCard:hover {
            transform: translateY(-4px);
            box-shadow:
              0 22px 48px rgba(15, 23, 42, 0.08),
              0 4px 14px rgba(15, 23, 42, 0.05);
            border-color: rgba(37, 68, 121, 0.14);
          }

          .stepImage img {
            width: 100%;
            height: 228px;
            object-fit: cover;
            display: block;
          }

          .stepBody {
            padding: 22px 22px 24px;
          }

          .stepNumber {
            width: 36px;
            height: 36px;
            border-radius: 999px;
            background: #0f172a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 14px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
          }

          .stepBody h3,
          .benefitCard h3 {
            margin: 0;
            font-size: 24px;
            line-height: 1.1;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #0f172a;
            text-wrap: balance;
          }

          .stepBody p,
          .benefitCard p {
            margin: 11px 0 0;
            font-size: 16px;
            line-height: 1.66;
            color: #5b6676;
          }

          .showcaseShell {
            position: relative;
          }

          .videosGrid {
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 22px;
            margin-top: 20px;
            align-items: stretch;
          }

          .videoCard {
            transition:
              transform 0.22s ease,
              box-shadow 0.22s ease,
              border-color 0.22s ease;
          }

          .videoCard:hover {
            transform: translateY(-5px);
            box-shadow:
              0 24px 54px rgba(15, 23, 42, 0.1),
              0 6px 16px rgba(15, 23, 42, 0.045);
            border-color: rgba(37, 68, 121, 0.14);
          }

          .videoCardFeatured {
            position: relative;
          }

          .videoCardFeatured::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            border-radius: 28px;
            box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
          }

          .videosGrid :global(.videoCard:nth-child(1)) {
            grid-column: span 6;
          }

          .videosGrid :global(.videoCard:nth-child(2)) {
            grid-column: span 3;
          }

          .videosGrid :global(.videoCard:nth-child(3)) {
            grid-column: span 3;
          }

          .videoFrameWrap {
            aspect-ratio: 16 / 9;
            background: #e5e7eb;
          }

          .videoFrame {
            display: block;
            width: 100%;
            height: 100%;
          }

          .videoBody {
            padding: 14px 16px 12px;
          }

          .videoTitle {
            font-size: 17px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.3;
            letter-spacing: -0.02em;
            text-wrap: balance;
          }

          .videosGrid :global(.videoCard:nth-child(1) .videoTitle) {
            font-size: 19px;
          }

          .videoSubtitle {
            margin-top: 4px;
            font-size: 13px;
            line-height: 1.5;
            color: #667387;
          }

          .benefitsGrid {
            display: grid;
            grid-template-columns: 1.14fr 1fr 1fr;
            gap: 22px;
          }

          .benefitCard {
            padding: 28px 26px;
            transition:
              transform 0.22s ease,
              box-shadow 0.22s ease,
              border-color 0.22s ease;
          }

          .benefitCard:hover {
            transform: translateY(-4px);
            box-shadow:
              0 22px 48px rgba(15, 23, 42, 0.08),
              0 4px 14px rgba(15, 23, 42, 0.05);
            border-color: rgba(37, 68, 121, 0.14);
          }

          .benefitCardPrimary {
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(246, 250, 255, 0.99) 100%);
            border-color: rgba(37, 68, 121, 0.11);
            box-shadow:
              0 18px 46px rgba(24, 48, 88, 0.07),
              0 2px 8px rgba(15, 23, 42, 0.03);
          }

          .benefitTag {
            display: inline-flex;
            align-items: center;
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            background: #eef3fb;
            color: #223252;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 16px;
          }

          .trustPanel {
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
            gap: 30px;
            align-items: stretch;
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(251, 253, 255, 0.98) 100%);
            border: 1px solid rgba(15, 23, 42, 0.06);
            border-radius: 32px;
            padding: 34px;
            box-shadow:
              0 18px 44px rgba(15, 23, 42, 0.05),
              0 2px 8px rgba(15, 23, 42, 0.03);
          }

          .trustMain {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .trustInlineLinks {
            margin-top: 22px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px 18px;
          }

          .trustInlineLink {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #18315e;
            text-decoration: none;
            font-size: 15px;
            font-weight: 800;
            line-height: 1.4;
            transition: color 0.18s ease, transform 0.18s ease;
          }

          .trustInlineLink:hover {
            color: #0f172a;
            transform: translateX(2px);
          }

          .trustStats {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .trustStat {
            border-radius: 22px;
            background:
              linear-gradient(180deg, #f7f9fc 0%, #f2f6fb 100%);
            padding: 20px 20px 18px;
            border: 1px solid rgba(15, 23, 42, 0.05);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
          }

          .trustStat strong {
            display: block;
            font-size: 31px;
            line-height: 1;
            letter-spacing: -0.04em;
            font-weight: 900;
            color: #0f172a;
          }

          .trustStat span {
            display: block;
            margin-top: 9px;
            font-size: 14px;
            line-height: 1.55;
            color: #5b6472;
            font-weight: 700;
          }

          .ctaSection {
            padding: 0 0 84px;
          }

          .ctaBox {
            background:
              radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 28%),
              linear-gradient(135deg, #071225 0%, #0b1832 100%);
            color: white;
            border-radius: 34px;
            padding: 38px 34px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 26px;
            align-items: center;
            box-shadow:
              0 28px 62px rgba(15, 23, 42, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.04);
          }

          .ctaMain {
            max-width: 780px;
          }

          .ctaBox h2 {
            color: white;
          }

          .ctaBox p {
            color: rgba(255, 255, 255, 0.84);
          }

          .ctaSide {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .ctaNote {
            font-size: 14px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.72);
            font-weight: 700;
          }

          @media (max-width: 1180px) {
            .heroGrid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .heroAside {
              padding-top: 0;
              padding-bottom: 68px;
              justify-content: flex-start;
            }

            .nextBroadcastCard {
              max-width: 340px;
            }
          }

          @media (max-width: 1100px) {
            .stepsGrid,
            .benefitsGrid,
            .trustPanel,
            .ctaBox {
              grid-template-columns: 1fr;
            }

            .videosGrid {
              grid-template-columns: 1fr;
            }

            .videosGrid :global(.videoCard:nth-child(1)),
            .videosGrid :global(.videoCard:nth-child(2)),
            .videosGrid :global(.videoCard:nth-child(3)) {
              grid-column: auto;
            }

            .ctaSide {
              align-items: flex-start;
            }
          }

          @media (max-width: 900px) {
            .hero {
              min-height: 640px;
            }

            .heroContent {
              padding: 98px 0 24px;
            }

            .heroAside {
              padding: 0 0 56px;
            }

            h1 {
              font-size: 54px;
              line-height: 1;
            }

            h2 {
              font-size: 38px;
            }

            .heroIntro {
              font-size: 21px;
            }

            .heroLead {
              font-size: 18px;
            }

            .section {
              padding: 62px 0;
            }

            .sectionHow {
              padding-top: 48px;
              padding-bottom: 44px;
            }

            .sectionShowcase {
              padding-top: 0;
              padding-bottom: 28px;
            }

            .sectionTrust {
              padding-top: 30px;
              padding-bottom: 56px;
            }

            .stepImage img {
              height: 208px;
            }

            .trustPanel,
            .ctaBox {
              padding: 28px;
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
              background:
                linear-gradient(
                  180deg,
                  rgba(8, 15, 34, 0.82) 0%,
                  rgba(8, 15, 34, 0.56) 48%,
                  rgba(8, 15, 34, 0.3) 100%
                );
            }

            .heroGlowOne,
            .heroGlowTwo {
              display: none;
            }

            .heroContent {
              max-width: none;
              padding: 82px 0 18px;
            }

            .heroAside {
              padding: 0 0 44px;
            }

            .heroTopLinks {
              flex-direction: column;
              align-items: flex-start;
            }

            .heroSignal {
              width: 100%;
              min-height: 48px;
              justify-content: space-between;
            }

            .nextBroadcastCard {
              max-width: 100%;
              padding: 14px;
              border-radius: 22px;
            }

            .nextBroadcastTitle {
              font-size: 18px;
            }

            h1 {
              font-size: 40px;
              letter-spacing: -0.04em;
            }

            h2 {
              font-size: 34px;
              letter-spacing: -0.05em;
            }

            .heroIntro {
              font-size: 18px;
              line-height: 1.45;
            }

            .heroLead,
            .sectionIntro p,
            .trustPanel p,
            .ctaBox p {
              font-size: 16px;
            }

            .section {
              padding: 48px 0;
            }

            .sectionHow {
              padding-top: 38px;
              padding-bottom: 34px;
            }

            .sectionShowcase {
              padding-top: 0;
              padding-bottom: 24px;
            }

            .sectionBenefits {
              padding-top: 42px;
              padding-bottom: 54px;
            }

            .sectionTrust {
              padding-top: 18px;
              padding-bottom: 42px;
            }

            .sectionIntro {
              margin-bottom: 20px;
            }

            .sectionIntro.center {
              margin: 0 auto 22px;
            }

            .stepBody,
            .benefitCard,
            .videoBody {
              padding-left: 18px;
              padding-right: 18px;
            }

            .benefitCard {
              padding-top: 22px;
              padding-bottom: 22px;
            }

            .trustPanel,
            .ctaBox {
              padding: 22px;
              border-radius: 26px;
            }

            .heroActions,
            .ctaActions {
              flex-direction: column;
            }

            .heroActions :global(.al-btn),
            .ctaActions :global(.al-btn) {
              width: 100%;
            }

            .heroSubActions {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
          }
        `}</style>

        <style jsx global>{`
          .al-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 50px;
            padding: 0 20px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 800;
            font-size: 15px;
            line-height: 1.2;
            white-space: nowrap;
            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease,
              background 0.18s ease,
              border-color 0.18s ease,
              color 0.18s ease;
          }

          .al-btn span {
            display: inline-block;
          }

          .al-btn-primary {
            background: #ffffff;
            color: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.9);
            box-shadow:
              0 12px 28px rgba(15, 23, 42, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }

          .al-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18);
            background: #ffffff;
            color: #0f172a;
          }

          .al-btn-secondary {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          }

          .al-btn-secondary:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
          }

          .al-btn-light {
            background: #ffffff;
            color: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.92);
            box-shadow:
              0 10px 24px rgba(15, 23, 42, 0.14),
              inset 0 1px 0 rgba(255, 255, 255, 0.56);
          }

          .al-btn-light:hover {
            transform: translateY(-2px);
            background: #ffffff;
            color: #0f172a;
            box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
          }
        `}</style>
      </main>
    </>
  );
}
