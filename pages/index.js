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
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });


  useEffect(() => {
    const target = new Date("2026-06-19T09:00:00+02:00").getTime();

    function updateCountdown() {
      const now = Date.now();
      const distance = Math.max(0, target - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    }

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, []);

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
          <div className="container">
            <div className="heroGrid">
              <div className="heroContent">
                <div className="eyebrow">ARCHIMEDES Live pro školy a obce</div>

              <h1>
  „Proč se to učíme?“
</h1>

<p className="heroIntro">
  Dnešní děti chtějí chápat, jak škola souvisí s reálným životem.
</p>

<p className="heroLead">
  ARCHIMEDES Live pomáhá školám přinášet do výuky <strong>reálný svět</strong>,
  inspirativní hosty a zkušenosti z praxe. Děti díky tomu lépe chápou
  souvislosti, více rozumí tomu, <strong>proč se učí</strong>, a učitelé získávají
  nový způsob, jak dnešní generaci zaujmout.
</p>

              

                <div className="archimedesCountdown">
                  <div className="countdownTitle">
                    <span className="countdownIcon">🚀</span>
                    <strong>
                      První mezinárodní ročník oslavy Archimeda se blíží!
                    </strong>
                  </div>

                  <div className="countdownNumbers">
                    <div className="countItem">
                      <strong>{timeLeft.days}</strong>
                      <span>DNY</span>
                    </div>

                    <div className="countItem">
                      <strong>{timeLeft.hours}</strong>
                      <span>HODIN</span>
                    </div>

                    <div className="countItem">
                      <strong>{timeLeft.minutes}</strong>
                      <span>MINUT</span>
                    </div>

                    <div className="countItem">
                      <strong>{timeLeft.seconds}</strong>
                      <span>SEKUND</span>
                    </div>
                  </div>

                  <ButtonLink
                    href="https://meet.google.com/uvp-zqde-xhs"
                    variant="start"
                    eventName="klik_home_archimedesday_meet"
                  >
                    Připojit se k vysílání
                  </ButtonLink>
                </div>

                <div className="heroActions">
                  <ButtonLink
                    href="/start"
                    variant="start"
                    eventName="klik_home_start_hero"
                  >
                    Chci vyzkoušet
                  </ButtonLink>

                  <ButtonLink
                    href="/program"
                    variant="secondary"
                    eventName="klik_home_program"
                  >
                    Zobrazit program
                  </ButtonLink>

                  <ButtonLink
                    href="/#ukazky-vysilani"
                    variant="secondary"
                    eventName="klik_home_ukazkova_hodina"
                  >
                    Ukázková hodina
                  </ButtonLink>

                  <ButtonLink
                    href="/demo"
                    variant="secondary"
                    eventName="klik_home_demo"
                  >
                    Ukázka platformy
                  </ButtonLink>

                </div>

                <div className="municipalityProof">
                  <div className="municipalityIntro">
                    Důvěřují nám starostové. Společně budujeme aktivní obec, nejen školu. Přidejte svou obec!
                  </div>

                  <div className="municipalityGrid">
                    <div className="municipalityCard">
                      <img src="/krenov.jpg" alt="Křenov" />
                      <div>
                        <strong>Křenov</strong>
                        <span>Obec 2030 ČR</span>
                      </div>
                    </div>

                    <div className="municipalityCard">
                      <img src="/cejc.jpg" alt="Čejč" />
                      <div>
                        <strong>Čejč</strong>
                        <span>Vesnice roku JMK 2026</span>
                      </div>
                    </div>

                    <div className="municipalityCard">
                      <img src="/hodonin erb.jpg" alt="Hodonín" />
                      <div>
                        <strong>Hodonín</strong>
                        <span>Zdravé město ČR</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="heroGuestWrap">
                  <Link
                    href="/guest"
                    className="heroGuestLink"
                    onClick={() => track("klik_home_guest")}
                  >
                    <span>Welcome guests</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="heroAside">
                <Link
                  href="/archimedes-day"
                  className="nextBroadcastCard"
                  onClick={() => track("klik_home_archimedes_day_karta")}
                >
                  <div className="nextBroadcastHead">
                    <div className="nextBroadcastLabel">Nejbližší vysílání</div>
                    <div className="nextBroadcastBadge">
                      LIVE • 19. 6. 2026
                    </div>
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
                          <span>Připojit se k ARCHIMEDES DAY</span>
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
                        <span>ARCHIMEDES DAY 2026</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  )}
                </Link>
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

        <section id="faq" className="section sectionFaq">
          <div className="container">
            <div className="sectionIntro center">
              <div className="eyebrow dark">FAQ</div>
              <h2>Často kladené otázky</h2>
              <p>
                Nejčastější otázky ředitelů, učitelů a zřizovatelů k programu
                ARCHIMEDES Live i k venkovní učebně ARCHIMEDES®.
              </p>
            </div>

            <div className="faqGrid">
              <article className="faqItem faqItemWide">
                <h3>Jak funguje zapojení školy?</h3>
                <p>
                  Škola si objedná Balíček START nebo plný program ARCHIMEDES
                  Live. Následně obdrží e-mail s jednoduchými pokyny pro
                  registraci učitelů k jejich organizaci a spuštění.
                </p>
                <p>
                  Po registraci si učitelé vyplní profily a vyberou skupiny
                  vysílání, které je zajímají — například I. stupeň, II.
                  stupeň, wellbeing, kariérní poradenství nebo komunitní
                  programy.
                </p>
                <p>
                  Po přihlášení najdou učitelé v portálu aktuální program
                  vysílání, archiv záznamů, pracovní listy, komunitu, soutěže a
                  další vzdělávací rubriky. Do vysílání se připojí jednoduše
                  jedním kliknutím přímo z portálu.
                </p>
              </article>

              <article className="faqItem faqItemWide faqItemFinance">
                <h3>Lze ARCHIMEDES Live financovat ze šablon OP JAK?</h3>
                <p>
                  Ano. Školy mohou ARCHIMEDES Live využít v rámci šablon OP JAK,
                  zejména u aktivit zaměřených na inovativní vzdělávání, moderní
                  formy výuky, wellbeing, podporu motivace žáků a propojení
                  výuky s praxí.
                </p>
                <p>
                  Program je připravený tak, aby jej učitelé mohli jednoduše
                  zařadit do výuky jako smysluplnou rozvojovou aktivitu pro žáky.
                  Rádi škole pomůžeme s orientací, jak ARCHIMEDES Live vhodně
                  zařadit do jejího konkrétního plánu čerpání.
                </p>
              </article>

              <article className="faqItem">
                <h3>Mohou program využívat všichni učitelé školy?</h3>
                <p>
                  Ano. ARCHIMEDES Live je určen pro celou školu. K programu se
                  může připojit kterýkoliv učitel z organizace — na jakékoliv
                  interaktivní tabuli, počítači nebo dalším zařízení ve škole.
                </p>
              </article>

              <article className="faqItem">
                <h3>Musí se učitel na vysílání připravovat?</h3>
                <p>
                  Ne. Program je připravený tak, aby jej bylo možné jednoduše
                  pustit během běžné výuky. Součástí jsou i návazné pracovní
                  listy a materiály.
                </p>
              </article>

              <article className="faqItem">
                <h3>Co když škola nestihne živé vysílání?</h3>
                <p>
                  Součástí programu je archiv záznamů, takže se škola může k
                  tématům vrátit kdykoliv později.
                </p>
              </article>

              <article className="faqItem">
                <h3>Funguje ARCHIMEDES Live na běžné interaktivní tabuli?</h3>
                <p>
                  Ano. Program funguje na běžném školním vybavení bez složité
                  instalace.
                </p>
              </article>

              <article className="faqItem">
                <h3>Jak rychle můžeme začít?</h3>
                <p>
                  Po aktivaci přístupu může škola program využívat prakticky
                  ihned.
                </p>
              </article>

              <article className="faqItem">
                <h3>Je program vhodný i pro menší školy?</h3>
                <p>
                  Ano. ARCHIMEDES Live je navržený tak, aby byl jednoduše
                  využitelný pro malé i větší školy.
                </p>
              </article>

              <article className="faqItem faqItemWide">
                <h3>Nabízíte také venkovní učebnu ARCHIMEDES®?</h3>
                <p>
                  Ano. Součástí projektu je také celoroční venkovní učebna
                  ARCHIMEDES®, kterou dodáváme školám a obcím na klíč včetně
                  návrhu, výroby a realizace.
                </p>
                <p>
                  Celá realizace obvykle trvá přibližně 3–4 měsíce podle
                  rozsahu projektu a připravenosti místa. Školy a obce často
                  využívají dotační programy jako IROP, MAS, krajské dotační
                  tituly nebo další regionální výzvy. Rádi doporučíme vhodný
                  postup a pomůžeme s přípravou projektu.
                </p>
              </article>

              <article className="faqItem">
                <h3>Pro koho je venkovní učebna vhodná?</h3>
                <p>
                  ARCHIMEDES® využívají základní školy, obce, komunitní centra
                  i organizace, které chtějí vytvořit moderní prostor pro výuku,
                  komunitní aktivity a práci s dětmi i veřejností.
                </p>
              </article>
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
                  Začněte ukázkou, DEMO přístupem nebo balíčkem START a
                  vyzkoušejte ARCHIMEDES Live přímo u vás
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
              radial-gradient(circle at top left, rgba(214, 226, 245, 0.8), transparent 32%),
              linear-gradient(180deg, #f8fbff 0%, #f3f7fc 48%, #f7f9fc 100%);
            color: #0f172a;
          }

          .container {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .hero {
            position: relative;
            padding: 48px 0 46px;
            overflow: hidden;
          }

          .hero::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(90deg, rgba(248, 251, 255, 0.98) 0%, rgba(248, 251, 255, 0.92) 48%, rgba(248, 251, 255, 0.68) 100%),
              url(${heroImg});
            background-size: cover;
            background-position: center;
            opacity: 1;
            z-index: 0;
          }

          .hero::after {
            content: "";
            position: absolute;
            width: 520px;
            height: 520px;
            right: -190px;
            top: -180px;
            background: rgba(59, 130, 246, 0.13);
            filter: blur(20px);
            border-radius: 999px;
            z-index: 0;
          }

          .heroGrid {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(300px, 350px);
            gap: 28px;
            align-items: center;
          }

          .heroContent {
            max-width: 780px;
            padding: 24px 0;
          }

          .heroAside {
            display: flex;
            justify-content: flex-end;
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            min-height: 32px;
            padding: 0 13px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 14px;
          }

          .heroContent .eyebrow,
          .eyebrow.dark {
            background: #e7eef9;
            color: #1e3a5f;
            border: 1px solid rgba(30, 58, 95, 0.08);
          }

          .eyebrow.light {
            background: rgba(255, 255, 255, 0.16);
            color: rgba(255, 255, 255, 0.96);
          }

          h1 {
            margin: 0;
            font-size: 64px;
            line-height: 0.98;
            letter-spacing: -0.055em;
            font-weight: 950;
            max-width: 720px;
            color: #0f172a;
            text-wrap: balance;
          }

          .heroIntro {
            margin: 18px 0 0;
            font-size: 22px;
            line-height: 1.42;
            color: #172033;
            font-weight: 800;
            max-width: 760px;
            letter-spacing: -0.02em;
            text-wrap: balance;
          }

          .heroLead {
            margin: 14px 0 0;
            font-size: 18px;
            line-height: 1.58;
            color: #4d5a6d;
            max-width: 680px;
          }

          .archimedesCountdown {
            margin-top: 24px;
            max-width: 760px;
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(320px, 1fr) auto;
            align-items: center;
            gap: 18px;
            padding: 18px 20px;
            border-radius: 24px;
            background:
              linear-gradient(135deg, #ffffff 0%, #f3f8ff 100%);
            border: 1px solid rgba(37, 99, 235, 0.16);
            box-shadow:
              0 16px 42px rgba(37, 99, 235, 0.09),
              0 2px 8px rgba(15, 23, 42, 0.035);
          }

          .countdownTitle {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 18px;
            line-height: 1.28;
            font-weight: 950;
            color: #0f172a;
            letter-spacing: -0.02em;
            text-wrap: balance;
          }

          .countdownIcon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            flex: 0 0 42px;
            border-radius: 14px;
            background: #eaf1ff;
            font-size: 22px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
          }

          .countdownNumbers {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }

          .countItem {
            min-height: 66px;
            border-radius: 16px;
            padding: 10px 8px;
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.07);
            text-align: center;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.035);
          }

          .countItem strong {
            display: block;
            font-size: 24px;
            line-height: 1.05;
            font-weight: 950;
            color: #0f172a;
            letter-spacing: -0.03em;
          }

          .countItem span {
            display: block;
            margin-top: 7px;
            font-size: 10px;
            line-height: 1.2;
            font-weight: 900;
            color: #64748b;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .municipalityProof {
            margin-top: 20px;
            max-width: 920px;
          }

          .municipalityIntro {
            margin-bottom: 12px;
            font-size: 16px;
            line-height: 1.35;
            font-weight: 950;
            color: #0f172a;
            letter-spacing: -0.02em;
            text-wrap: balance;
          }

          .municipalityGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }

          .municipalityCard {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 82px;
            padding: 12px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.94);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow:
              0 10px 24px rgba(15, 23, 42, 0.045),
              0 2px 8px rgba(15, 23, 42, 0.02);
          }

          .municipalityCard img {
            width: 54px;
            height: 54px;
            flex: 0 0 54px;
            object-fit: contain;
            display: block;
          }

          .municipalityCard strong {
            display: block;
            font-size: 17px;
            line-height: 1.2;
            font-weight: 950;
            color: #0f172a;
            letter-spacing: -0.02em;
          }

          .municipalityCard span {
            display: block;
            margin-top: 4px;
            font-size: 13px;
            line-height: 1.35;
            font-weight: 850;
            color: #16a34a;
          }

          .startHighlight {
            margin-top: 24px;
            max-width: 760px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            padding: 16px;
            border-radius: 24px;
            background:
              linear-gradient(135deg, #ffffff 0%, #f3f8ff 100%);
            border: 1px solid rgba(37, 99, 235, 0.16);
            box-shadow:
              0 16px 42px rgba(37, 99, 235, 0.09),
              0 2px 8px rgba(15, 23, 42, 0.035);
          }

          .startHighlight strong {
            display: block;
            font-size: 18px;
            line-height: 1.25;
            color: #0f172a;
            letter-spacing: -0.02em;
          }

          .startHighlight span {
            display: block;
            margin-top: 4px;
            font-size: 14px;
            line-height: 1.45;
            color: #536174;
            font-weight: 700;
          }

          .heroActions,
          .ctaActions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .heroActions {
            margin-top: 18px;
            max-width: 920px;
          }

          .heroGuestWrap {
            margin-top: 14px;
          }

          .heroGuestLink {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #40516a;
            text-decoration: none;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 800;
            transition: color 0.18s ease, transform 0.18s ease;
          }

          .heroGuestLink:hover {
            color: #0f172a;
            transform: translateX(2px);
          }

          .nextBroadcastCard {
            display: block;
            width: 100%;
            max-width: 340px;
            color: #0f172a;
            text-decoration: none;
            border-radius: 26px;
            padding: 14px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow:
              0 18px 45px rgba(15, 23, 42, 0.08),
              0 2px 8px rgba(15, 23, 42, 0.03);
            transition:
              transform 0.22s ease,
              box-shadow 0.22s ease,
              border-color 0.22s ease;
          }

          .nextBroadcastCard:hover {
            transform: translateY(-4px);
            border-color: rgba(37, 99, 235, 0.22);
            box-shadow:
              0 24px 56px rgba(15, 23, 42, 0.12),
              0 4px 14px rgba(15, 23, 42, 0.05);
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
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #23324a;
          }

          .nextBroadcastBadge {
            display: inline-flex;
            align-items: center;
            min-height: 26px;
            padding: 0 10px;
            border-radius: 999px;
            font-size: 11px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #ffffff;
            background: #dc2626;
            border: 1px solid #dc2626;
          }

          .nextBroadcastLoading,
          .nextBroadcastEmpty {
            padding: 6px 2px 2px;
          }

          .nextBroadcastLoading {
            font-size: 15px;
            line-height: 1.6;
            color: #566274;
          }

          .nextBroadcastPosterWrap {
            border-radius: 20px;
            overflow: hidden;
            background: #edf2f8;
            border: 1px solid rgba(15, 23, 42, 0.06);
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
            color: #1f3153;
            background:
              radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 42%),
              linear-gradient(135deg, #eef4ff, #f8fbff);
          }

          .nextBroadcastBody {
            padding: 12px 2px 2px;
          }

          .nextBroadcastDate {
            font-size: 14px;
            line-height: 1.5;
            font-weight: 900;
            color: #526074;
          }

          .nextBroadcastTitle {
            margin-top: 6px;
            font-size: 18px;
            line-height: 1.16;
            letter-spacing: -0.03em;
            font-weight: 950;
            color: #0f172a;
            text-wrap: balance;
          }

          .nextBroadcastEmptyTitle {
            font-size: 21px;
            line-height: 1.1;
            letter-spacing: -0.03em;
            font-weight: 950;
            color: #0f172a;
            text-wrap: balance;
          }

          .nextBroadcastEmptyText {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.55;
            color: #5d6878;
          }

          .nextBroadcastAction {
            margin-top: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 900;
            color: #1d4ed8;
          }

          .section {
            padding: 50px 0;
          }

          .sectionHow {
            padding-top: 44px;
            padding-bottom: 40px;
          }

          .sectionShowcase {
            padding-top: 18px;
            padding-bottom: 42px;
          }

          .sectionBenefits {
            position: relative;
            padding-top: 46px;
            padding-bottom: 52px;
            background:
              linear-gradient(180deg, rgba(237, 243, 251, 0.88) 0%, rgba(246, 249, 253, 0.98) 100%);
            border-top: 1px solid rgba(15, 23, 42, 0.04);
            border-bottom: 1px solid rgba(15, 23, 42, 0.04);
          }

          .sectionTrust {
            padding-top: 42px;
            padding-bottom: 52px;
          }

          .sectionFaq {
            scroll-margin-top: 96px;
            padding-top: 50px;
            padding-bottom: 58px;
            background:
              radial-gradient(circle at top left, rgba(37, 99, 235, 0.06), transparent 34%),
              linear-gradient(180deg, rgba(246, 249, 253, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
            border-top: 1px solid rgba(15, 23, 42, 0.04);
          }

          .sectionIntro {
            margin-bottom: 24px;
          }

          .sectionIntroWide {
            max-width: 760px;
          }

          .sectionIntro.center {
            text-align: center;
            max-width: 860px;
            margin: 0 auto 28px;
          }

          .sectionIntroShowcase {
            max-width: 720px;
            margin-bottom: 18px;
          }

          h2 {
            margin: 0;
            font-size: 44px;
            line-height: 1.03;
            letter-spacing: -0.055em;
            font-weight: 950;
            color: #0f172a;
            text-wrap: balance;
          }

          .sectionIntro p,
          .trustPanel p,
          .faqItem p,
          .ctaBox p {
            margin: 12px 0 0;
            font-size: 17px;
            line-height: 1.68;
            color: #5a6474;
            max-width: 780px;
          }

          .stepsGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .stepCard,
          .benefitCard,
          .videoCard {
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(15, 23, 42, 0.07);
            border-radius: 24px;
            overflow: hidden;
            box-shadow:
              0 12px 30px rgba(15, 23, 42, 0.045),
              0 2px 8px rgba(15, 23, 42, 0.025);
          }

          .stepCard,
          .benefitCard,
          .videoCard {
            transition:
              transform 0.22s ease,
              box-shadow 0.22s ease,
              border-color 0.22s ease;
          }

          .stepCard:hover,
          .benefitCard:hover,
          .videoCard:hover {
            transform: translateY(-4px);
            box-shadow:
              0 20px 42px rgba(15, 23, 42, 0.075),
              0 4px 14px rgba(15, 23, 42, 0.045);
            border-color: rgba(37, 99, 235, 0.14);
          }

          .stepImage img {
            width: 100%;
            height: 205px;
            object-fit: cover;
            display: block;
          }

          .stepBody {
            padding: 20px 20px 22px;
          }

          .stepNumber {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            background: #1d4ed8;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 950;
            margin-bottom: 12px;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
          }

          .stepBody h3,
          .benefitCard h3 {
            margin: 0;
            font-size: 23px;
            line-height: 1.12;
            letter-spacing: -0.03em;
            font-weight: 950;
            color: #0f172a;
            text-wrap: balance;
          }

          .stepBody p,
          .benefitCard p {
            margin: 10px 0 0;
            font-size: 15.5px;
            line-height: 1.62;
            color: #5b6676;
          }

          .videosGrid {
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 18px;
            margin-top: 18px;
            align-items: stretch;
          }

          .videoCardFeatured {
            position: relative;
          }

          .videoCardFeatured::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            border-radius: 24px;
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
            padding: 14px 16px 13px;
          }

          .videoTitle {
            font-size: 17px;
            font-weight: 900;
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

          .faqGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            align-items: stretch;
          }

          .faqItem {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            min-height: 166px;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(15, 23, 42, 0.07);
            border-radius: 26px;
            padding: 24px 26px;
            box-shadow:
              0 14px 34px rgba(15, 23, 42, 0.045),
              0 2px 8px rgba(15, 23, 42, 0.02);
          }

          .faqItemWide {
            grid-column: 1 / -1;
            min-height: auto;
            padding: 28px 30px;
            background:
              linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            border-color: rgba(37, 99, 235, 0.13);
          }

          .faqItemFinance {
            background:
              radial-gradient(circle at top right, rgba(245, 158, 11, 0.08), transparent 34%),
              linear-gradient(180deg, #ffffff 0%, #fffaf0 100%);
            border-color: rgba(245, 158, 11, 0.18);
          }

          .faqItem h3 {
            margin: 0;
            max-width: 760px;
            font-size: 21px;
            line-height: 1.18;
            letter-spacing: -0.03em;
            font-weight: 950;
            color: #0f172a;
            text-wrap: balance;
          }

          .faqItem p {
            margin-top: 10px;
            max-width: 980px;
            font-size: 15.5px;
            line-height: 1.62;
            color: #5b6676;
          }

          .benefitsGrid {
            display: grid;
            grid-template-columns: 1.14fr 1fr 1fr;
            gap: 18px;
          }

          .benefitCard {
            padding: 26px 24px;
          }

          .benefitCardPrimary {
            background:
              linear-gradient(180deg, #ffffff 0%, #f3f8ff 100%);
            border-color: rgba(37, 99, 235, 0.18);
            box-shadow:
              0 18px 44px rgba(37, 99, 235, 0.08),
              0 2px 8px rgba(15, 23, 42, 0.03);
          }

          .benefitTag {
            display: inline-flex;
            align-items: center;
            min-height: 31px;
            padding: 0 12px;
            border-radius: 999px;
            background: #eaf1ff;
            color: #1d4ed8;
            font-size: 13px;
            font-weight: 900;
            margin-bottom: 15px;
          }

          .trustPanel {
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
            gap: 26px;
            align-items: stretch;
            background:
              linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            border: 1px solid rgba(15, 23, 42, 0.06);
            border-radius: 30px;
            padding: 32px;
            box-shadow:
              0 16px 40px rgba(15, 23, 42, 0.05),
              0 2px 8px rgba(15, 23, 42, 0.025);
          }

          .trustMain {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .trustInlineLinks {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px 18px;
          }

          .trustInlineLink {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #1d4ed8;
            text-decoration: none;
            font-size: 15px;
            font-weight: 900;
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
            gap: 12px;
          }

          .trustStat {
            border-radius: 20px;
            background:
              linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
            padding: 18px 20px;
            border: 1px solid rgba(15, 23, 42, 0.05);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
          }

          .trustStat strong {
            display: block;
            font-size: 31px;
            line-height: 1;
            letter-spacing: -0.04em;
            font-weight: 950;
            color: #0f172a;
          }

          .trustStat span {
            display: block;
            margin-top: 8px;
            font-size: 14px;
            line-height: 1.5;
            color: #5b6472;
            font-weight: 800;
          }

          .ctaSection {
            padding: 0 0 64px;
          }

          .ctaBox {
            background:
              radial-gradient(circle at top right, rgba(96, 165, 250, 0.18), transparent 30%),
              linear-gradient(135deg, #0f2344 0%, #0b1832 100%);
            color: white;
            border-radius: 32px;
            padding: 34px 32px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 24px;
            align-items: center;
            box-shadow:
              0 24px 58px rgba(15, 23, 42, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
            font-weight: 800;
          }

          @media (max-width: 1100px) {
            .heroGrid,
            .stepsGrid,
            .benefitsGrid,
            .trustPanel,
            .ctaBox {
              grid-template-columns: 1fr;
            }

            .heroAside {
              justify-content: flex-start;
            }

            .nextBroadcastCard {
              max-width: 380px;
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
              padding: 36px 0 34px;
            }

            .heroContent {
              padding: 16px 0 0;
            }

            h1 {
              font-size: 52px;
              line-height: 1;
            }

            h2 {
              font-size: 37px;
            }

            .heroIntro {
              font-size: 20px;
            }

            .heroLead {
              font-size: 17px;
            }

            .section {
              padding: 42px 0;
            }

            .sectionHow {
              padding-top: 36px;
              padding-bottom: 34px;
            }

            .sectionShowcase {
              padding-top: 8px;
              padding-bottom: 34px;
            }

            .sectionBenefits {
              padding-top: 40px;
              padding-bottom: 44px;
            }

            .sectionTrust {
              padding-top: 34px;
              padding-bottom: 44px;
            }

            .sectionFaq {
              padding-top: 40px;
              padding-bottom: 46px;
            }

            .stepImage img {
              height: 198px;
            }

            .trustPanel,
            .ctaBox {
              padding: 26px;
            }
          }

          @media (max-width: 640px) {
            .container {
              padding: 0 16px;
            }

            .hero {
              padding: 28px 0 30px;
            }

            .hero::before {
              background:
                linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(248, 251, 255, 0.94) 58%, rgba(248, 251, 255, 0.88) 100%),
                url(${heroImg});
              background-size: cover;
              background-position: center;
            }

            h1 {
              font-size: 40px;
              letter-spacing: -0.045em;
            }

            h2 {
              font-size: 32px;
              letter-spacing: -0.05em;
            }

            .heroIntro {
              font-size: 18px;
              line-height: 1.44;
            }

            .heroLead,
            .sectionIntro p,
            .trustPanel p,
            .ctaBox p {
              font-size: 16px;
            }

            .archimedesCountdown {
              grid-template-columns: 1fr;
              padding: 15px;
              border-radius: 22px;
            }

            .countdownTitle {
              align-items: flex-start;
              font-size: 16px;
            }

            .countdownNumbers {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .municipalityGrid {
              grid-template-columns: 1fr;
            }

            .municipalityCard {
              min-height: 74px;
            }

            .startHighlight {
              flex-direction: column;
              align-items: stretch;
              padding: 15px;
              border-radius: 22px;
            }

            .section {
              padding: 36px 0;
            }

            .sectionHow {
              padding-top: 32px;
              padding-bottom: 30px;
            }

            .sectionShowcase {
              padding-top: 4px;
              padding-bottom: 28px;
            }

            .sectionBenefits {
              padding-top: 34px;
              padding-bottom: 38px;
            }

            .sectionTrust {
              padding-top: 26px;
              padding-bottom: 36px;
            }

            .sectionFaq {
              scroll-margin-top: 88px;
              padding-top: 32px;
              padding-bottom: 38px;
            }

            .faqGrid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .faqItem,
            .faqItemWide {
              grid-column: auto;
              min-height: auto;
              padding: 20px 18px;
              border-radius: 22px;
            }

            .faqItem h3 {
              font-size: 19px;
            }

            .faqItem p {
              font-size: 15px;
              line-height: 1.58;
            }

            .sectionIntro {
              margin-bottom: 18px;
            }

            .sectionIntro.center {
              margin: 0 auto 20px;
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
            .ctaActions :global(.al-btn),
            .startHighlight :global(.al-btn),
            .archimedesCountdown :global(.al-btn) {
              width: 100%;
            }

            .nextBroadcastCard {
              max-width: 100%;
              border-radius: 22px;
            }
          }
        `}</style>

        <style jsx global>{`
          .al-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0 19px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 900;
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
            background: #0f172a;
            color: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.92);
            box-shadow:
              0 12px 28px rgba(15, 23, 42, 0.14),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }

          .al-btn-primary:hover {
            transform: translateY(-2px);
            background: #111c33;
            color: #ffffff;
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18);
          }

          .al-btn-secondary {
            background: #ffffff;
            color: #172033;
            border: 1px solid rgba(15, 23, 42, 0.1);
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.045);
          }

          .al-btn-secondary:hover {
            transform: translateY(-2px);
            background: #f8fbff;
            color: #0f172a;
            border-color: rgba(37, 99, 235, 0.2);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
          }

          .al-btn-start {
            background: #f59e0b;
            color: #111827;
            border: 1px solid rgba(245, 158, 11, 0.7);
            box-shadow:
              0 12px 28px rgba(245, 158, 11, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }

          .al-btn-start:hover {
            transform: translateY(-2px);
            background: #fbbf24;
            color: #111827;
            box-shadow: 0 18px 38px rgba(245, 158, 11, 0.28);
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
