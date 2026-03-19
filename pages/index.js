import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/ucebna.jpg";
const lessonImg = "/vyuka.jpeg";
const guestImg = "/ctenarsky.jpg";
const communityImg = "/smart.jpg";
const kidsImg = "/praxe.webp";
const networkImg = "/variant1_clean.jpg";

const fallbackPosts = [
  { type: "p", id: "DVyqPmiiLKF" },
  { type: "p", id: "DVvUBXDCMYC" },
  { type: "p", id: "DVqEttcjpu0" },
];

const mediaLinks = [
  {
    label: "BVV / URBIS",
    domain: "bvv.cz",
    href: "https://www.bvv.cz/urbis/aktuality/archimedes-r-zahajil-eru-living-lab-na-vystavisti",
  },
  {
    label: "iDNES",
    domain: "idnes.cz",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-archimedes-moderni-vyuka-antonin-koplik.A240403_092205_brno-zpravy_krut",
  },
  {
    label: "RTVJ",
    domain: "rtvj.cz",
    href: "https://www.rtvj.cz/hovorany-sazeji-na-nejmodernejsi-technologie-ve-vzdelavani/",
  },
  {
    label: "Česká televize",
    domain: "ceskatelevize.cz",
    href: "https://www.ceskatelevize.cz/porady/10253066674-zpravy-ve-12/223411012000328/",
  },
  {
    label: "iDNES 2",
    domain: "idnes.cz",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-skola-vyuka-zaci-hodonin-archimedes-skolstvi.A230717_122219_brno-zpravy_krut",
  },
  {
    label: "Blesk",
    domain: "blesk.cz",
    href: "https://www.blesk.cz/clanek/regiony-brno-brno-zpravy/748154/prevrat-ve-skolstvi-v-hodonine-vymysleli-unikatni-ucebny-chteji-je-na-celem-svete.html",
  },
  {
    label: "CzechCrunch",
    domain: "cc.cz",
    href: "https://cc.cz/cech-vymyslel-specialni-ucebnu-deti-diky-ni-mohou-pozorovat-co-se-deje-v-ptaci-budce-nebo-u-pyramid/",
  },
  {
    label: "ExportMag",
    domain: "exportmag.cz",
    href: "https://www.exportmag.cz/pribery-exporteru/ve-svete-vznikne-sit-chytrych-uceben-archimedes-s-ceskymi-technologiemi/",
  },
  {
    label: "iBrno",
    domain: "ibrno.cz",
    href: "https://www.ibrno.cz/business/67259-living-lab-na-brnenskem-vystavisti-nabidne-prostor-pro-inovace-a-spolupraci.html",
  },
  {
    label: "Mikulov",
    domain: "mikulov.cz",
    href: "https://www.mikulov.cz/obcan/aktuality/702-mikulovsti-zaci-dostali-moderni-venkovni-venkovni-ucebnu-archimedes",
  },
];

function getInstagramEmbedUrl(id, type) {
  if (type === "reel") return `https://www.instagram.com/reel/${id}/embed`;
  return `https://www.instagram.com/p/${id}/embed/captioned`;
}

function getInstagramPostUrl(id, type) {
  if (type === "reel") return `https://www.instagram.com/reel/${id}/`;
  return `https://www.instagram.com/p/${id}/`;
}

function PrimaryButton({ href, children }) {
  return (
    <Link href={href} className="btnPrimary">
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link href={href} className="btnSecondary">
      {children}
    </Link>
  );
}

function SectionKicker({ children }) {
  return <div className="sectionKicker">{children}</div>;
}

function MetricCard({ value, label }) {
  return (
    <div className="metricCard">
      <div className="metricValue">{value}</div>
      <div className="metricLabel">{label}</div>
    </div>
  );
}

function EditorialCard({ title, text, dark = false }) {
  return (
    <div className={`editorialCard ${dark ? "editorialCardDark" : ""}`}>
      <div className="editorialCardInner">
        <div className="editorialCardTitle">{title}</div>
        <div className="editorialCardText">{text}</div>
      </div>
    </div>
  );
}

function ProgramCard({ title, text, img }) {
  return (
    <div className="programCard">
      <div className="programMediaWrap">
        <img src={img} alt={title} className="programMedia" />
      </div>
      <div className="programBody">
        <div className="programTitle">{title}</div>
        <div className="programText">{text}</div>
      </div>
    </div>
  );
}

function StepCard({ step, title, text }) {
  return (
    <div className="stepCard">
      <div className="stepBadge">{step}</div>
      <div className="stepTitle">{title}</div>
      <div className="stepText">{text}</div>
    </div>
  );
}

function MediaLogoButton({ label, domain, href }) {
  const logoSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mediaLink"
      aria-label={label}
      title={label}
    >
      <span className="mediaLogoCard">
        <img
          src={logoSrc}
          alt={label}
          className="mediaLogoImg"
          loading="lazy"
        />
        <span className="mediaLogoText">{label}</span>
      </span>
    </a>
  );
}

function InstagramEmbed({ id, type }) {
  const src = getInstagramEmbedUrl(id, type);
  const href = getInstagramPostUrl(id, type);

  return (
    <div className="instagramCard">
      <iframe
        src={src}
        title={`Instagram ${id}`}
        width="100%"
        height="470"
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ display: "block", width: "100%", background: "#fff" }}
      />
      <div className="instagramFooter">
        <a href={href} target="_blank" rel="noreferrer" className="inlineLink">
          Otevřít příspěvek na Instagramu →
        </a>
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [instagramReady, setInstagramReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInstagram() {
      try {
        const res = await fetch(`/api/instagram?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Instagram API failed");

        const data = await res.json();

        if (!cancelled && Array.isArray(data) && data.length) {
          setPosts(data.slice(0, 3));
          setInstagramReady(true);
          return;
        }

        if (!cancelled) {
          setPosts(fallbackPosts);
          setInstagramReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setPosts(fallbackPosts);
          setInstagramReady(true);
        }
      }
    }

    loadInstagram();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderedPosts = useMemo(() => {
    if (posts.length >= 3) return posts.slice(0, 3);
    return fallbackPosts;
  }, [posts]);

  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy a obce</title>
        <meta
          name="description"
          content="ARCHIMEDES Live přináší školám živé vstupy, pracovní listy, archiv a inspirativní hosty bez složité přípravy. Program pro výuku i komunitu obce."
        />
      </Head>

      <div className="page">
        <main>
          <section className="heroSection">
            <div className="container">
              <div className="heroShell">
                <div className="heroGrid">
                  <div className="heroLeft">
                    <div className="heroTopline">
                      <span className="heroToplineDot" />
                      ARCHIMEDES Live • živý program pro školy a obce
                    </div>

                    <h1 className="heroTitle">
                      Výuka, která působí
                      <br />
                      současně. Bez toho,
                      <br />
                      aby škole přidělávala práci.
                    </h1>

                    <p className="heroLead">
                      Škola získá hotové živé vstupy, pracovní listy a archiv.
                      Obec navíc program pro komunitu, seniory i společné akce.
                    </p>

                    <div className="heroActions">
                      <PrimaryButton href="/poptavka">
                        Chci ukázku programu
                      </PrimaryButton>
                      <SecondaryButton href="/program">
                        Prohlédnout program
                      </SecondaryButton>
                    </div>

                    <div className="heroMicroProof">
                      <span>živé vstupy s hosty z praxe</span>
                      <span>okamžitě využitelné ve škole</span>
                      <span>ověřeno v síti ARCHIMEDES®</span>
                    </div>
                  </div>

                  <div className="heroRight">
                    <div className="heroImageCard">
                      <img
                        src={heroImg}
                        alt="Venkovní učebna ARCHIMEDES®"
                        className="heroImage"
                      />

                      <div className="floatingPanel floatingPanelA">
                        <div className="floatingLabel">Pro ředitele školy</div>
                        <div className="floatingTitle">
                          Hotový program bez složité přípravy
                        </div>
                      </div>

                      <div className="floatingPanel floatingPanelB">
                        <div className="floatingLabel">Pro obec</div>
                        <div className="floatingTitle">
                          Obsah pro školu, komunitu i seniory
                        </div>
                      </div>
                    </div>

                    <div className="heroCaption">
                      Venkovní učebna ARCHIMEDES® – realizace v ZŠ Ratíškovice
                    </div>
                  </div>
                </div>

                <div className="heroMetrics">
                  <MetricCard value="20+" label="míst v síti ARCHIMEDES®" />
                  <MetricCard value="1 třída" label="1 živý vstup + 1 pracovní list" />
                  <MetricCard value="OBEC 2030" label="ověřeno v praxi obcí" />
                  <MetricCard value="škola + obec" label="jeden program, více využití" />
                </div>
              </div>
            </div>
          </section>

          <section className="section sectionTight">
            <div className="container">
              <div className="bentoIntro">
                <div className="bentoHeadline">
                  <SectionKicker>Proč to dává smysl</SectionKicker>
                  <h2 className="sectionTitle">
                    Méně složitosti.
                    <br />
                    Víc skutečného využití.
                  </h2>
                </div>

                <div className="bentoGrid">
                  <div className="bentoLarge bentoDark">
                    <div className="bentoContent">
                      <div className="bentoTitle">
                        Škola nekupuje další systém.
                        <br />
                        Kupuje hotový program.
                      </div>
                      <div className="bentoText">
                        ARCHIMEDES Live není další komplikovaná platforma. Je to
                        připravený vzdělávací obsah, který lze snadno zařadit do
                        výuky i života školy.
                      </div>
                    </div>
                  </div>

                  <EditorialCard
                    title="Šetří čas učitelům"
                    text="Škola dostává připravený obsah, hosty i návazné materiály."
                  />
                  <EditorialCard
                    title="Působí moderně navenek"
                    text="Žáci se setkávají s lidmi z praxe, autory i inspirativními osobnostmi."
                  />
                  <EditorialCard
                    title="Dává hodnotu i obci"
                    text="Vedle školy může program využívat také obec, komunita a senioři."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="networkLayout">
                <div className="networkCopy">
                  <SectionKicker>Síť učeben ARCHIMEDES®</SectionKicker>
                  <h2 className="sectionTitle">
                    ARCHIMEDES už funguje
                    <br />
                    ve více než 20 obcích
                  </h2>
                  <p className="sectionLead">
                    Nejde o koncept na papíře. Síť učeben a partnerů ukazuje, že
                    propojení školy, živého programu a života obce funguje v
                    praxi.
                  </p>

                  <div className="networkStats">
                    <MetricCard value="20+" label="realizovaných míst" />
                    <MetricCard value="ČR / SR" label="ověřeno v praxi" />
                    <MetricCard value="síť roste" label="přibývají další lokality" />
                  </div>

                  <div className="networkNote">
                    Vítěz soutěže OBEC 2030 – Křenov
                  </div>

                  <div className="networkAction">
                    <PrimaryButton href="/poptavka">
                      Chci ukázku programu
                    </PrimaryButton>
                  </div>
                </div>

                <div className="networkVisualCard">
                  <img
                    src={networkImg}
                    alt="ARCHIMEDES oceněný v soutěži OBEC 2030"
                    className="networkVisualImg"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="processHeader">
                <SectionKicker>Jak vypadá jedna hodina</SectionKicker>
                <h2 className="sectionTitle">
                  1 třída – 1 živý vstup – 1 pracovní list
                </h2>
                <p className="sectionLead processLead">
                  Jednoduchý model, kterému rozumí ředitel, učitel i zřizovatel.
                  Jasná logika. Žádná zbytečná složitost.
                </p>
              </div>

              <div className="stepsGrid">
                <StepCard
                  step="1"
                  title="Živý vstup s hostem"
                  text="Třída se připojí k vysílání a setká se s odborníkem, autorem nebo inspirativní osobností."
                />
                <StepCard
                  step="2"
                  title="Pracovní list a návaznost"
                  text="K vysílání jsou připravené materiály, díky nimž může učitel téma snadno rozvinout."
                />
                <StepCard
                  step="3"
                  title="Archiv pro další využití"
                  text="Obsah se dá vracet do výuky i později a škola si z něj může budovat vlastní rytmus práce."
                />
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="editorialSplit">
                <div className="editorialVisualCard editorialVisualDark">
                  <div className="editorialVisualText">
                    <SectionKicker>Co škola skutečně získává</SectionKicker>
                    <h3 className="editorialVisualTitle">
                      Živý program,
                      <br />
                      ne další starost navíc
                    </h3>
                    <p className="editorialVisualLead">
                      Škola získává pravidelný obsah, který může okamžitě využít.
                      Bez vymýšlení dramaturgie od nuly, bez složité přípravy.
                    </p>
                    <div className="editorialVisualAction">
                      <SecondaryButton href="/program">
                        Zobrazit program
                      </SecondaryButton>
                    </div>
                  </div>

                  <img
                    src={lessonImg}
                    alt="Ukázka programu ARCHIMEDES®"
                    className="editorialVisualImage"
                  />
                </div>

                <div className="editorialVisualCard">
                  <img
                    src={kidsImg}
                    alt="Děti v programu ARCHIMEDES®"
                    className="editorialVisualImage"
                  />
                  <div className="editorialVisualText">
                    <SectionKicker>Co zažijí děti</SectionKicker>
                    <h3 className="editorialVisualTitle">
                      Setkání s lidmi,
                      <br />
                      kteří mají co předat
                    </h3>
                    <p className="editorialVisualLead">
                      Děti se setkávají s vědci, autory, odborníky z praxe i
                      osobnostmi veřejného života. Výuka tak získává větší energii
                      i přesah do reálného světa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="programShell">
                <div className="programHeader">
                  <div>
                    <SectionKicker>Program ARCHIMEDES Live</SectionKicker>
                    <h2 className="sectionTitle">Ukázka formátů programu</h2>
                    <p className="sectionLead">
                      Formáty, které dávají smysl škole, žákům i komunitě obce.
                    </p>
                  </div>

                  <div className="programHeaderAction">
                    <PrimaryButton href="/program">Zobrazit celý program</PrimaryButton>
                  </div>
                </div>

                <div className="programGrid">
                  <ProgramCard
                    title="Science ON"
                    text="Živá věda, pokusy a hosté z odborné praxe."
                    img="/media/stem-microscopes.webp"
                  />
                  <ProgramCard
                    title="Smart City klub"
                    text="Jak přemýšlet o městě, obci a prostoru kolem nás."
                    img={communityImg}
                  />
                  <ProgramCard
                    title="Čtenářský klub"
                    text="Autoři, knihy a společné čtenářské zážitky."
                    img={guestImg}
                  />
                  <ProgramCard
                    title="Senior klub"
                    text="Pravidelný program pro starší generaci a komunitní propojení."
                    img="/senior.jpg"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="socialHeader">
                <SectionKicker>ARCHIMEDES Live aktuálně</SectionKicker>
                <h2 className="sectionTitle">Jak to vypadá v praxi</h2>
                <p className="sectionLead processLead">
                  Reálné ukázky komunikace a života projektu.
                </p>
              </div>

              <div className="instagramGrid">
                {(instagramReady ? renderedPosts : fallbackPosts).map((post, index) => (
                  <InstagramEmbed
                    key={`${post.type}-${post.id}-${index}`}
                    id={post.id}
                    type={post.type}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="mediaShell">
                <div className="mediaHeader">
                  <SectionKicker>ARCHIMEDES v médiích</SectionKicker>
                  <h2 className="sectionTitle">Důvěra, která je vidět</h2>
                </div>

                <div className="mediaStrip">
                  {mediaLinks.map((item) => (
                    <MediaLogoButton
                      key={`${item.label}-${item.href}`}
                      label={item.label}
                      domain={item.domain}
                      href={item.href}
                    />
                  ))}
                </div>

                <div className="mediaMore">
                  <a
                    href="https://www.archimedes-net.com/media/"
                    target="_blank"
                    rel="noreferrer"
                    className="inlineLink"
                  >
                    Všechna média →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="section ctaSection">
            <div className="container">
              <div className="ctaShell">
                <div className="ctaGrid">
                  <div>
                    <SectionKicker>Chcete vidět, jak by to fungovalo u vás?</SectionKicker>
                    <h2 className="ctaTitle">
                      Ukážeme vám program
                      <br />
                      i venkovní učebnu v praxi
                    </h2>
                    <p className="ctaText">
                      ARCHIMEDES® nabízí licenci programu i realizaci venkovní
                      učebny. Společně vybereme model, který bude dávat smysl
                      právě vaší škole nebo obci.
                    </p>
                  </div>

                  <div className="ctaActions">
                    <PrimaryButton href="/poptavka">
                      Chci více informací
                    </PrimaryButton>
                    <SecondaryButton href="/ucebna">
                      Prohlédnout učebnu
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f3f5f9;
          color: #0f172a;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(96, 165, 250, 0.09), transparent 24%),
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent 22%),
            linear-gradient(180deg, #f7f9fc 0%, #f3f5f9 100%);
        }

        .container {
          max-width: 1240px;
          margin: 0 auto;
          padding-left: 18px;
          padding-right: 18px;
        }

        .section {
          padding: 22px 0;
        }

        .sectionTight {
          padding-top: 12px;
          padding-bottom: 22px;
        }

        .heroSection {
          padding: 28px 0 18px;
        }

        .heroShell {
          position: relative;
          overflow: hidden;
          border-radius: 36px;
          padding: 34px;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.96), rgba(247,249,252,0.92));
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow:
            0 24px 70px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(16px);
        }

        .heroShell::before {
          content: "";
          position: absolute;
          top: -120px;
          left: -120px;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.08);
          filter: blur(30px);
          pointer-events: none;
        }

        .heroShell::after {
          content: "";
          position: absolute;
          right: -100px;
          bottom: -120px;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.08);
          filter: blur(32px);
          pointer-events: none;
        }

        .heroGrid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(380px, 0.98fr);
          gap: 34px;
          align-items: center;
        }

        .heroTopline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.05);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.01em;
          margin-bottom: 18px;
        }

        .heroToplineDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f172a, #334155);
        }

        .heroTitle {
          margin: 0;
          font-size: 72px;
          line-height: 0.95;
          letter-spacing: -0.055em;
          font-weight: 900;
          max-width: 820px;
          color: #0f172a;
        }

        .heroLead {
          margin: 22px 0 0;
          max-width: 670px;
          font-size: 21px;
          line-height: 1.58;
          color: rgba(15, 23, 42, 0.72);
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .btnPrimary,
        .btnSecondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 22px;
          border-radius: 16px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease,
            border-color 0.16s ease,
            color 0.16s ease;
          will-change: transform;
        }

        .btnPrimary {
          background: #0f172a;
          color: #fff;
          border: 1px solid #0f172a;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
        }

        .btnPrimary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.22);
        }

        .btnSecondary {
          background: rgba(255, 255, 255, 0.82);
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.12);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        }

        .btnSecondary:hover {
          transform: translateY(-2px);
          background: #fff;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
        }

        .heroMicroProof {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .heroMicroProof span {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: rgba(15, 23, 42, 0.82);
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
        }

        .heroImageCard {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 26px 60px rgba(15, 23, 42, 0.14);
        }

        .heroImage {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 12;
          object-fit: cover;
        }

        .floatingPanel {
          position: absolute;
          max-width: 236px;
          border-radius: 22px;
          padding: 14px 14px 13px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
          backdrop-filter: blur(12px);
        }

        .floatingPanelA {
          top: 18px;
          left: 18px;
        }

        .floatingPanelB {
          right: 18px;
          bottom: 18px;
        }

        .floatingLabel {
          font-size: 11px;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.46);
          margin-bottom: 6px;
        }

        .floatingTitle {
          font-size: 15px;
          line-height: 1.3;
          font-weight: 900;
          color: #0f172a;
        }

        .heroCaption {
          margin-top: 12px;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 700;
          color: rgba(15, 23, 42, 0.56);
        }

        .heroMetrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
          position: relative;
          z-index: 1;
        }

        .metricCard {
          min-height: 118px;
          border-radius: 24px;
          padding: 18px 16px;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .metricValue {
          font-size: 28px;
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .metricLabel {
          margin-top: 8px;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 700;
          color: rgba(15, 23, 42, 0.62);
        }

        .sectionKicker {
          font-size: 13px;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.46);
          margin-bottom: 10px;
        }

        .sectionTitle {
          margin: 0;
          font-size: 46px;
          line-height: 1.01;
          letter-spacing: -0.04em;
          font-weight: 900;
          color: #0f172a;
        }

        .sectionLead {
          margin: 14px 0 0;
          max-width: 760px;
          font-size: 18px;
          line-height: 1.68;
          color: rgba(15, 23, 42, 0.7);
        }

        .bentoIntro {
          display: grid;
          gap: 18px;
        }

        .bentoHeadline {
          max-width: 740px;
        }

        .bentoGrid {
          display: grid;
          grid-template-columns: 1.25fr repeat(3, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }

        .bentoLarge {
          min-height: 100%;
          border-radius: 30px;
          padding: 26px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          position: relative;
        }

        .bentoDark {
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          color: white;
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.16);
        }

        .bentoDark::before {
          content: "";
          position: absolute;
          inset: auto -60px -80px auto;
          width: 180px;
          height: 180px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.07);
          filter: blur(10px);
        }

        .bentoContent {
          position: relative;
          z-index: 1;
          max-width: 430px;
        }

        .bentoTitle {
          font-size: 34px;
          line-height: 1.04;
          letter-spacing: -0.03em;
          font-weight: 900;
        }

        .bentoText {
          margin-top: 12px;
          font-size: 17px;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.82);
        }

        .editorialCard {
          min-height: 220px;
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98));
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
        }

        .editorialCardDark {
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          color: white;
        }

        .editorialCardInner {
          padding: 24px;
        }

        .editorialCardTitle {
          font-size: 28px;
          line-height: 1.08;
          letter-spacing: -0.02em;
          font-weight: 900;
          color: inherit;
        }

        .editorialCardText {
          margin-top: 12px;
          font-size: 16px;
          line-height: 1.66;
          color: rgba(15, 23, 42, 0.68);
        }

        .editorialCardDark .editorialCardText {
          color: rgba(255, 255, 255, 0.8);
        }

        .networkLayout {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(340px, 0.98fr);
          gap: 28px;
          align-items: center;
        }

        .networkStats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .networkVisualCard {
          overflow: hidden;
          border-radius: 30px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 26px 60px rgba(15, 23, 42, 0.12);
        }

        .networkVisualImg {
          width: 100%;
          display: block;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }

        .networkNote {
          margin-top: 18px;
          font-size: 15px;
          line-height: 1.45;
          font-weight: 800;
          color: rgba(15, 23, 42, 0.58);
        }

        .networkAction {
          margin-top: 22px;
        }

        .processHeader,
        .socialHeader,
        .mediaHeader {
          max-width: 760px;
          margin-bottom: 18px;
        }

        .processLead {
          max-width: 680px;
        }

        .stepsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .stepCard {
          min-height: 230px;
          border-radius: 28px;
          padding: 24px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
        }

        .stepBadge {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          color: #fff;
          font-size: 16px;
          line-height: 1;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .stepTitle {
          font-size: 24px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .stepText {
          margin-top: 10px;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.7);
        }

        .editorialSplit {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .editorialVisualCard {
          overflow: hidden;
          border-radius: 30px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .editorialVisualDark {
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          color: white;
          border-color: rgba(15, 23, 42, 0.14);
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.16);
        }

        .editorialVisualImage {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 10;
          object-fit: cover;
        }

        .editorialVisualText {
          padding: 24px;
        }

        .editorialVisualTitle {
          margin: 0;
          font-size: 36px;
          line-height: 1.03;
          letter-spacing: -0.03em;
          font-weight: 900;
          color: inherit;
        }

        .editorialVisualLead {
          margin: 12px 0 0;
          font-size: 17px;
          line-height: 1.68;
          color: rgba(15, 23, 42, 0.7);
        }

        .editorialVisualDark .editorialVisualLead {
          color: rgba(255, 255, 255, 0.82);
        }

        .editorialVisualAction {
          margin-top: 18px;
        }

        .programShell,
        .mediaShell {
          border-radius: 32px;
          padding: 28px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98));
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .programHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .programGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .programCard {
          overflow: hidden;
          border-radius: 26px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .programCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
        }

        .programMediaWrap {
          overflow: hidden;
        }

        .programMedia {
          width: 100%;
          display: block;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }

        .programBody {
          padding: 18px;
        }

        .programTitle {
          font-size: 22px;
          line-height: 1.12;
          font-weight: 900;
          color: #0f172a;
        }

        .programText {
          margin-top: 8px;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(15, 23, 42, 0.7);
        }

        .instagramGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .instagramCard {
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
        }

        .instagramFooter {
          padding: 12px 16px 16px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
        }

        .inlineLink {
          text-decoration: none;
          color: #0f172a;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 800;
        }

        .inlineLink:hover {
          text-decoration: underline;
        }

        .mediaStrip {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .mediaLink {
          text-decoration: none;
        }

        .mediaLogoCard {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 60px;
          width: 100%;
          padding: 0 16px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease;
        }

        .mediaLogoCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
          background: #fff;
        }

        .mediaLogoImg {
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          border-radius: 6px;
          background: #fff;
        }

        .mediaLogoText {
          font-size: 15px;
          line-height: 1.1;
          font-weight: 800;
        }

        .mediaMore {
          margin-top: 16px;
        }

        .ctaSection {
          padding-bottom: 72px;
        }

        .ctaShell {
          border-radius: 34px;
          padding: 34px 28px;
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          color: white;
          box-shadow: 0 28px 64px rgba(15, 23, 42, 0.2);
        }

        .ctaGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 22px;
          align-items: center;
        }

        .ctaTitle {
          margin: 0;
          font-size: 46px;
          line-height: 1.01;
          letter-spacing: -0.04em;
          font-weight: 900;
          color: white;
        }

        .ctaText {
          margin: 14px 0 0;
          max-width: 740px;
          font-size: 18px;
          line-height: 1.68;
          color: rgba(255, 255, 255, 0.84);
        }

        .ctaActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 1180px) {
          .heroTitle {
            font-size: 62px;
          }

          .bentoGrid {
            grid-template-columns: 1fr 1fr;
          }

          .bentoLarge {
            grid-column: 1 / -1;
          }

          .programGrid,
          .mediaStrip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .heroMetrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .heroGrid,
          .networkLayout,
          .editorialSplit,
          .ctaGrid,
          .instagramGrid {
            grid-template-columns: 1fr;
          }

          .networkStats,
          .stepsGrid {
            grid-template-columns: 1fr;
          }

          .ctaActions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 820px) {
          .heroShell,
          .programShell,
          .mediaShell,
          .ctaShell {
            padding: 22px;
            border-radius: 28px;
          }

          .heroTitle,
          .sectionTitle,
          .ctaTitle {
            font-size: 40px;
            line-height: 1.03;
          }

          .heroLead,
          .sectionLead,
          .ctaText {
            font-size: 17px;
          }

          .programGrid,
          .mediaStrip,
          .heroMetrics {
            grid-template-columns: 1fr;
          }

          .programHeader {
            align-items: flex-start;
          }

          .floatingPanel {
            max-width: 220px;
          }
        }

        @media (max-width: 640px) {
          .container {
            padding-left: 14px;
            padding-right: 14px;
          }

          .heroSection {
            padding-top: 18px;
          }

          .heroTitle,
          .sectionTitle,
          .ctaTitle {
            font-size: 34px;
            line-height: 1.04;
          }

          .heroLead {
            font-size: 18px;
          }

          .heroActions,
          .ctaActions {
            flex-direction: column;
            align-items: stretch;
          }

          .btnPrimary,
          .btnSecondary {
            width: 100%;
          }

          .heroMicroProof span {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .bentoGrid {
            grid-template-columns: 1fr;
          }

          .floatingPanel {
            position: static;
            max-width: none;
            margin: 12px;
          }

          .heroImageCard {
            display: flex;
            flex-direction: column;
          }

          .editorialVisualTitle,
          .bentoTitle,
          .editorialCardTitle {
            font-size: 28px;
          }

          .mediaLogoCard {
            min-height: 56px;
          }
        }
      `}</style>
    </>
  );
}
