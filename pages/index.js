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

function LightButton({ href, children }) {
  return (
    <Link href={href} className="btnLight">
      {children}
    </Link>
  );
}

function OutlineLightButton({ href, children }) {
  return (
    <Link href={href} className="btnOutlineLight">
      {children}
    </Link>
  );
}

function getInstagramEmbedUrl(id, type) {
  if (type === "reel") return `https://www.instagram.com/reel/${id}/embed`;
  return `https://www.instagram.com/p/${id}/embed/captioned`;
}

function getInstagramPostUrl(id, type) {
  if (type === "reel") return `https://www.instagram.com/reel/${id}/`;
  return `https://www.instagram.com/p/${id}/`;
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
      <div className="instagramCardFooter">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inlineArrowLink"
        >
          Otevřít příspěvek na Instagramu →
        </a>
      </div>
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

function SectionEyebrow({ children }) {
  return <div className="sectionEyebrow">{children}</div>;
}

function HeroPill({ children }) {
  return <div className="heroPill">{children}</div>;
}

function BenefitCard({ title, text }) {
  return (
    <div className="benefitCard">
      <div className="benefitDot" />
      <div className="benefitCardTitle">{title}</div>
      <div className="benefitCardText">{text}</div>
    </div>
  );
}

function InfoCard({ number, title, text }) {
  return (
    <div className="infoCard">
      <div className="infoCardBadge">{number}</div>
      <div className="infoCardTitle">{title}</div>
      <div className="infoCardText">{text}</div>
    </div>
  );
}

function ProgramCard({ title, text, img }) {
  return (
    <div className="programCard">
      <img src={img} alt={title} className="programCardImg" />
      <div className="programCardBody">
        <div className="programCardTitle">{title}</div>
        <div className="programCardText">{text}</div>
      </div>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="statCard">
      <div className="statCardNumber">{number}</div>
      <div className="statCardLabel">{label}</div>
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

      <div className="pageShell">
        <main>
          <section className="heroSection">
            <div className="container">
              <div className="heroPanel">
                <div className="heroGrid">
                  <div className="heroContent">
                    <HeroPill>ARCHIMEDES Live • živý program pro školy a obce</HeroPill>

                    <h1 className="heroTitle">
                      Živý program do výuky,
                      <br />
                      který škole nepřidělává práci
                    </h1>

                    <p className="heroLead">
                      Škola získá hotové živé vstupy, pracovní listy a archiv
                      vysílání. Obec navíc pravidelný program pro komunitu,
                      seniory i společné akce.
                    </p>

                    <div className="heroTrustRow">
                      <span>živé vysílání a hosté z praxe</span>
                      <span>okamžitě využitelné ve škole</span>
                      <span>ověřeno v síti učeben ARCHIMEDES®</span>
                    </div>

                    <div className="heroActions">
                      <PrimaryButton href="/poptavka">
                        Chci ukázku programu
                      </PrimaryButton>
                      <SecondaryButton href="/program">
                        Prohlédnout program
                      </SecondaryButton>
                    </div>

                    <div className="heroMiniStats">
                      <div className="heroMiniStat">
                        <strong>20+</strong>
                        <span>míst v síti ARCHIMEDES</span>
                      </div>
                      <div className="heroMiniStat">
                        <strong>1 třída</strong>
                        <span>1 živý vstup 1 pracovní list</span>
                      </div>
                      <div className="heroMiniStat">
                        <strong>OBEC 2030</strong>
                        <span>ověřeno i v praxi obcí</span>
                      </div>
                    </div>
                  </div>

                  <div className="heroVisualWrap">
                    <div className="heroVisual">
                      <img
                        src={heroImg}
                        alt="Venkovní učebna ARCHIMEDES®"
                        className="heroImage"
                      />

                      <div className="heroFloatingCard heroFloatingCardTop">
                        <div className="floatingCardEyebrow">Pro ředitele školy</div>
                        <div className="floatingCardTitle">
                          Hotový program bez složité přípravy
                        </div>
                      </div>

                      <div className="heroFloatingCard heroFloatingCardBottom">
                        <div className="floatingCardEyebrow">Pro obec</div>
                        <div className="floatingCardTitle">
                          Obsah pro školu, komunitu i seniory
                        </div>
                      </div>
                    </div>

                    <div className="heroCaption">
                      Venkovní učebna ARCHIMEDES® – realizace v ZŠ Ratíškovice
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sectionPadTopSm">
            <div className="container">
              <div className="trustBar">
                <div className="trustItem">živé vstupy s inspirativními hosty</div>
                <div className="trustItem">pracovní listy pro další práci</div>
                <div className="trustItem">archiv pro opakované využití</div>
                <div className="trustItem">využití pro školu i komunitu obce</div>
              </div>
            </div>
          </section>

          <section className="sectionPad">
            <div className="container">
              <div className="sectionHeader">
                <div>
                  <SectionEyebrow>Proč to dává škole smysl</SectionEyebrow>
                  <h2 className="sectionTitle">
                    Ředitel získává program,
                    <br />
                    který je snadné zavést
                  </h2>
                  <p className="sectionLead maxW720">
                    ARCHIMEDES Live není další komplikovaný systém. Je to
                    připravený vzdělávací program, který můžete zařadit do výuky
                    i života školy bez zbytečných organizačních nároků.
                  </p>
                </div>
              </div>

              <div className="benefitsGrid">
                <BenefitCard
                  title="Šetří čas učitelům"
                  text="Škola dostává hotový obsah, který lze využít bez vymýšlení nového formátu."
                />
                <BenefitCard
                  title="Působí moderně navenek"
                  text="Žáci se potkávají s hosty z praxe, autory, vědci i inspirativními osobnostmi."
                />
                <BenefitCard
                  title="Dává hodnotu i obci"
                  text="Vedle školy může program využívat také obec, komunita a seniorní publikum."
                />
              </div>
            </div>
          </section>

          <section className="sectionPad">
            <div className="container">
              <div className="glassPanel">
                <div className="networkGrid">
                  <div>
                    <SectionEyebrow>Síť učeben ARCHIMEDES®</SectionEyebrow>

                    <h2 className="sectionTitle">
                      ARCHIMEDES už funguje
                      <br />
                      ve více než 20 obcích
                    </h2>

                    <p className="sectionLead maxW680">
                      Síť se rozšiřuje a ukazuje, že propojení školy, učebny a
                      živého programu funguje v praxi. Nejde o nápad na papíře,
                      ale o ověřené řešení.
                    </p>

                    <div className="statsGrid">
                      <StatCard number="20+" label="realizovaných míst" />
                      <StatCard number="ČR / SR" label="ověřeno v praxi" />
                      <StatCard number="síť roste" label="přibývají další lokality" />
                    </div>

                    <div className="networkFootnote">
                      Vítěz soutěže OBEC 2030 – Křenov
                    </div>

                    <div className="networkAction">
                      <PrimaryButton href="/poptavka">
                        Chci ukázku programu
                      </PrimaryButton>
                    </div>
                  </div>

                  <div>
                    <div className="networkVisual">
                      <img
                        src={networkImg}
                        alt="ARCHIMEDES oceněný v soutěži OBEC 2030"
                        className="networkImage"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sectionPad">
            <div className="container">
              <div className="sectionHeader">
                <div>
                  <SectionEyebrow>Jak vypadá jedna hodina</SectionEyebrow>
                  <h2 className="sectionTitle">
                    1 třída – 1 živý vstup – 1 pracovní list
                  </h2>
                  <p className="sectionLead maxW760">
                    Jednoduchý model, který je srozumitelný škole i zřizovateli.
                    Žáci se připojí k živému vysílání, navážou ve třídě a škola
                    má k dispozici i archiv.
                  </p>
                </div>
              </div>

              <div className="howGrid">
                <InfoCard
                  number="1"
                  title="Živý vstup s hostem"
                  text="Třída se připojí k vysílání a setká se s vědcem, autorem, odborníkem nebo inspirativní osobností."
                />
                <InfoCard
                  number="2"
                  title="Pracovní list a návaznost"
                  text="K vysílání jsou připravené materiály, díky nimž může učitel téma snadno rozvinout."
                />
                <InfoCard
                  number="3"
                  title="Archiv pro další využití"
                  text="Obsah je možné vracet do výuky i později a postupně z něj stavět vlastní rytmus práce školy."
                />
              </div>
            </div>
          </section>

          <section className="sectionPad">
            <div className="container">
              <div className="splitFeatureGrid">
                <div className="featureCard featureCardDark">
                  <div className="featureCardTextWrap">
                    <SectionEyebrow>Co škola skutečně kupuje</SectionEyebrow>
                    <h3 className="featureCardTitle featureCardTitleLight">
                      Živý program,
                      <br />
                      ne další starost navíc
                    </h3>
                    <p className="featureCardText featureCardTextLight">
                      Škola získává pravidelný obsah, který může okamžitě využít.
                      Bez složité přípravy, bez hledání hostů, bez vymýšlení celé
                      dramaturgie od nuly.
                    </p>
                    <div className="featureAction">
                      <LightButton href="/program">Zobrazit program</LightButton>
                    </div>
                  </div>
                  <img
                    src={lessonImg}
                    alt="Ukázka programu ARCHIMEDES®"
                    className="featureCardImg"
                  />
                </div>

                <div className="featureCard">
                  <img
                    src={kidsImg}
                    alt="Děti v programu ARCHIMEDES®"
                    className="featureCardImg"
                  />
                  <div className="featureCardTextWrap">
                    <SectionEyebrow>Co zažijí děti</SectionEyebrow>
                    <h3 className="featureCardTitle">
                      Setkání s lidmi,
                      <br />
                      kteří mají co předat
                    </h3>
                    <p className="featureCardText">
                      Děti se potkávají s vědci, autory, odborníky z praxe i
                      inspirativními osobnostmi. Výuka tak získává větší energii,
                      konkrétnost a přesah do reálného života.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sectionPad">
            <div className="container">
              <div className="programPanel">
                <div className="sectionHeader headerWithAction">
                  <div>
                    <SectionEyebrow>Program ARCHIMEDES Live</SectionEyebrow>
                    <h2 className="sectionTitle">Ukázka formátů programu</h2>
                    <p className="sectionLead maxW760">
                      Formáty, které dávají smysl škole, žákům i komunitě obce.
                    </p>
                  </div>

                  <PrimaryButton href="/program">Zobrazit celý program</PrimaryButton>
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

          <section className="sectionPad">
            <div className="container">
              <div className="sectionHeader">
                <div>
                  <SectionEyebrow>ARCHIMEDES Live aktuálně</SectionEyebrow>
                  <h2 className="sectionTitle">Jak to vypadá v praxi</h2>
                  <p className="sectionLead maxW760">
                    Reálné ukázky z prostředí ARCHIMEDES Live a z komunikace
                    projektu směrem ke školám a obcím.
                  </p>
                </div>
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

          <section className="sectionPad">
            <div className="container">
              <div className="mediaPanel">
                <div className="sectionHeader compactHeader">
                  <div>
                    <SectionEyebrow>ARCHIMEDES v médiích</SectionEyebrow>
                    <h2 className="sectionTitle">Důvěra, která je vidět</h2>
                  </div>
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

                <div className="mediaAction">
                  <a
                    href="https://www.archimedes-net.com/media/"
                    target="_blank"
                    rel="noreferrer"
                    className="inlineArrowLink"
                  >
                    Všechna média →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="ctaSection">
            <div className="container">
              <div className="ctaPanel">
                <div className="ctaGrid">
                  <div>
                    <SectionEyebrow>Chcete vidět, jak by to fungovalo u vás?</SectionEyebrow>
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
                    <LightButton href="/poptavka">Chci více informací</LightButton>
                    <OutlineLightButton href="/ucebna">
                      Prohlédnout učebnu
                    </OutlineLightButton>
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
          background: #f5f7fb;
          color: #0f172a;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        * {
          box-sizing: border-box;
        }

        .pageShell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.07), transparent 28%),
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.06), transparent 24%),
            linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%);
        }

        .container {
          max-width: 1220px;
          margin: 0 auto;
          padding-left: 16px;
          padding-right: 16px;
        }

        .heroSection {
          padding: 34px 0 0;
        }

        .heroPanel {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 34px;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.9), rgba(255,255,255,0.72)),
            linear-gradient(135deg, rgba(255,255,255,0.96), rgba(246,248,252,0.88));
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255,255,255,0.7);
          backdrop-filter: blur(18px);
        }

        .heroPanel::before {
          content: "";
          position: absolute;
          inset: -120px auto auto -120px;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.08);
          filter: blur(20px);
          pointer-events: none;
        }

        .heroPanel::after {
          content: "";
          position: absolute;
          inset: auto -80px -80px auto;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.08);
          filter: blur(24px);
          pointer-events: none;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
          gap: 34px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .heroContent {
          min-width: 0;
        }

        .heroPill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
          font-size: 13px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.01em;
          margin-bottom: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .heroTitle {
          margin: 0;
          font-size: 64px;
          line-height: 0.98;
          letter-spacing: -0.045em;
          font-weight: 900;
          color: #0f172a;
          max-width: 780px;
        }

        .heroLead {
          margin: 20px 0 0;
          max-width: 720px;
          font-size: 21px;
          line-height: 1.58;
          color: rgba(15, 23, 42, 0.76);
        }

        .heroTrustRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .heroTrustRow span {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: rgba(15, 23, 42, 0.84);
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }

        .heroActions,
        .ctaActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .heroActions {
          margin-top: 28px;
        }

        .btnPrimary,
        .btnSecondary,
        .btnLight,
        .btnOutlineLight {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 22px;
          border-radius: 16px;
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
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
        }

        .btnPrimary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        }

        .btnSecondary {
          background: rgba(255,255,255,0.82);
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.1);
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
        }

        .btnSecondary:hover {
          transform: translateY(-2px);
          background: #fff;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
        }

        .btnLight {
          background: #fff;
          color: #0f172a;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .btnLight:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.16);
        }

        .btnOutlineLight {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.28);
        }

        .btnOutlineLight:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.08);
        }

        .heroMiniStats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
          max-width: 760px;
        }

        .heroMiniStat {
          background: rgba(255,255,255,0.86);
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 20px;
          padding: 16px 16px 14px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
        }

        .heroMiniStat strong {
          display: block;
          font-size: 24px;
          line-height: 1.04;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .heroMiniStat span {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(15, 23, 42, 0.66);
          font-weight: 700;
        }

        .heroVisualWrap {
          min-width: 0;
        }

        .heroVisual {
          position: relative;
          border-radius: 30px;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 28px 64px rgba(15, 23, 42, 0.14);
        }

        .heroImage {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 12;
          object-fit: cover;
        }

        .heroFloatingCard {
          position: absolute;
          max-width: 240px;
          border-radius: 20px;
          padding: 14px 14px 13px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
          backdrop-filter: blur(12px);
        }

        .heroFloatingCardTop {
          top: 18px;
          left: 18px;
        }

        .heroFloatingCardBottom {
          right: 18px;
          bottom: 18px;
        }

        .floatingCardEyebrow {
          font-size: 11px;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.48);
          margin-bottom: 6px;
        }

        .floatingCardTitle {
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
          color: rgba(15, 23, 42, 0.58);
        }

        .sectionPadTopSm {
          padding-top: 14px;
        }

        .sectionPad {
          padding: 22px 0;
        }

        .trustBar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .trustItem {
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14px 16px;
          border-radius: 20px;
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(15, 23, 42, 0.07);
          color: rgba(15, 23, 42, 0.8);
          font-size: 14px;
          line-height: 1.4;
          font-weight: 800;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
        }

        .sectionHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .headerWithAction {
          margin-bottom: 18px;
        }

        .compactHeader {
          margin-bottom: 16px;
        }

        .sectionEyebrow {
          font-size: 13px;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.48);
          margin-bottom: 10px;
        }

        .sectionTitle {
          margin: 0;
          font-size: 42px;
          line-height: 1.02;
          letter-spacing: -0.03em;
          font-weight: 900;
          color: #0f172a;
        }

        .sectionLead {
          margin: 12px 0 0;
          font-size: 18px;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.7);
        }

        .maxW680 {
          max-width: 680px;
        }

        .maxW720 {
          max-width: 720px;
        }

        .maxW760 {
          max-width: 760px;
        }

        .benefitsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .benefitCard {
          position: relative;
          min-height: 220px;
          border-radius: 28px;
          padding: 24px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,250,252,0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
        }

        .benefitDot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #0f172a, #334155);
          margin-bottom: 18px;
          box-shadow: 0 0 0 8px rgba(15, 23, 42, 0.06);
        }

        .benefitCardTitle {
          font-size: 28px;
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .benefitCardText {
          margin-top: 12px;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.7);
          max-width: 360px;
        }

        .glassPanel,
        .programPanel,
        .mediaPanel {
          border-radius: 30px;
          padding: 28px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.95), rgba(249,250,252,0.96));
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .networkGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
          gap: 28px;
          align-items: center;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
          max-width: 760px;
        }

        .statCard {
          min-height: 118px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 22px;
          padding: 18px 16px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .statCardNumber {
          font-size: 28px;
          line-height: 1.04;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .statCardLabel {
          margin-top: 8px;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 700;
          color: rgba(15, 23, 42, 0.64);
        }

        .networkFootnote {
          margin-top: 18px;
          font-size: 15px;
          line-height: 1.5;
          font-weight: 800;
          color: rgba(15, 23, 42, 0.6);
        }

        .networkAction {
          margin-top: 20px;
        }

        .networkVisual {
          overflow: hidden;
          border-radius: 26px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.12);
        }

        .networkImage {
          width: 100%;
          display: block;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }

        .howGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .infoCard {
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
        }

        .infoCardBadge {
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

        .infoCardTitle {
          font-size: 24px;
          line-height: 1.1;
          letter-spacing: -0.02em;
          font-weight: 900;
          color: #0f172a;
        }

        .infoCardText {
          margin-top: 10px;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.7);
        }

        .splitFeatureGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .featureCard {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 30px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
          min-height: 100%;
        }

        .featureCardDark {
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          color: #fff;
          border-color: rgba(15, 23, 42, 0.12);
          box-shadow: 0 24px 54px rgba(15, 23, 42, 0.18);
        }

        .featureCardImg {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 10;
          object-fit: cover;
        }

        .featureCardTextWrap {
          padding: 24px 24px 26px;
        }

        .featureCardTitle {
          margin: 0;
          font-size: 34px;
          line-height: 1.04;
          letter-spacing: -0.03em;
          font-weight: 900;
          color: #0f172a;
        }

        .featureCardTitleLight {
          color: #fff;
        }

        .featureCardText {
          margin: 12px 0 0;
          font-size: 17px;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.72);
        }

        .featureCardTextLight {
          color: rgba(255, 255, 255, 0.82);
        }

        .featureAction {
          margin-top: 18px;
        }

        .programGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .programCard {
          overflow: hidden;
          border-radius: 24px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .programCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.09);
        }

        .programCardImg {
          width: 100%;
          display: block;
          aspect-ratio: 4 / 3;
          object-fit: cover;
        }

        .programCardBody {
          padding: 18px;
        }

        .programCardTitle {
          font-size: 22px;
          line-height: 1.12;
          font-weight: 900;
          color: #0f172a;
        }

        .programCardText {
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
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
        }

        .instagramCardFooter {
          padding: 12px 16px 16px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          background: #fff;
        }

        .inlineArrowLink {
          text-decoration: none;
          color: #0f172a;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 800;
        }

        .inlineArrowLink:hover {
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

        .mediaAction {
          margin-top: 16px;
        }

        .ctaSection {
          padding: 22px 0 72px;
        }

        .ctaPanel {
          border-radius: 32px;
          padding: 34px 28px;
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          color: #fff;
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
          font-size: 42px;
          line-height: 1.02;
          letter-spacing: -0.03em;
          font-weight: 900;
          color: #fff;
        }

        .ctaText {
          margin: 14px 0 0;
          max-width: 760px;
          font-size: 18px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.84);
        }

        @media (max-width: 1180px) {
          .heroTitle {
            font-size: 56px;
          }

          .mediaStrip {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1080px) {
          .heroGrid,
          .networkGrid,
          .splitFeatureGrid,
          .ctaGrid,
          .instagramGrid {
            grid-template-columns: 1fr;
          }

          .heroMiniStats,
          .statsGrid {
            grid-template-columns: 1fr;
            max-width: 100%;
          }

          .programGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .trustBar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .heroFloatingCard {
            max-width: 220px;
          }

          .ctaActions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 860px) {
          .heroPanel,
          .glassPanel,
          .programPanel,
          .mediaPanel,
          .ctaPanel {
            padding: 22px;
            border-radius: 26px;
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

          .benefitsGrid,
          .howGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .heroSection {
            padding-top: 18px;
          }

          .container {
            padding-left: 14px;
            padding-right: 14px;
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

          .heroTrustRow span {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .trustBar,
          .programGrid,
          .mediaStrip {
            grid-template-columns: 1fr;
          }

          .heroActions,
          .ctaActions {
            flex-direction: column;
            align-items: stretch;
          }

          .btnPrimary,
          .btnSecondary,
          .btnLight,
          .btnOutlineLight {
            width: 100%;
          }

          .heroFloatingCard {
            position: static;
            max-width: none;
            margin: 12px;
          }

          .heroVisual {
            display: flex;
            flex-direction: column;
          }

          .heroMiniStats {
            margin-top: 20px;
          }

          .featureCardTitle,
          .benefitCardTitle {
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
