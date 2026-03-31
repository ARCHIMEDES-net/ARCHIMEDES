import Link from "next/link";

const heroImg = "/ucebna-exterier.webp";
const classImg = "/ucebna-deti.webp";
const techImg = "/ucebna-technologie.webp";
const communityImg = "/ucebna-komunita.webp";
const mediaImg = "/ucebna-media.webp";
const mapImg = "/ucebna-mapa.webp";

const galleryItems = [
  {
    src: heroImg,
    title: "Exteriér učebny ARCHIMEDES®",
    text: "Reprezentativní venkovní učebna zasazená do přirozeného prostředí.",
    ratio: "wide",
  },
  {
    src: classImg,
    title: "Výuka v praxi",
    text: "ARCHIMEDES® jako živý prostor pro každodenní vzdělávání.",
    ratio: "standard",
  },
  {
    src: techImg,
    title: "Moderní technologie",
    text: "Interaktivní výuka, digitální vybavení a kvalitní zázemí.",
    ratio: "standard",
  },
  {
    src: communityImg,
    title: "Komunitní život",
    text: "Prostor pro akce obce, setkávání i společné zážitky.",
    ratio: "standard",
  },
  {
    src: mediaImg,
    title: "Veřejná a mediální pozornost",
    text: "Projekt, který vzbuzuje zájem odborníků i veřejnosti.",
    ratio: "standard",
  },
  {
    src: mapImg,
    title: "Síť učeben ARCHIMEDES®",
    text: "ARCHIMEDES® už funguje v reálných školách a obcích.",
    ratio: "wide",
  },
];

const mediaPoints = [
  "reálné realizace v českých školách a obcích",
  "reprezentativní prostor pro vzdělávání i komunitní život",
  "spojení kvalitní architektury, technologií a přírody",
  "silný vizuální i společenský přesah projektu",
];

const mediaLinks = [
  {
    title: "BVV / URBIS",
    text: "ARCHIMEDES® zahájil éru Living Lab na brněnském výstavišti.",
    href: "https://www.bvv.cz/urbis/aktuality/archimedes-r-zahajil-eru-living-lab-na-vystavisti",
    domain: "bvv.cz",
  },
  {
    title: "iDNES",
    text: "Moderní venkovní učebna ARCHIMEDES® jako nový směr ve vzdělávání.",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-archimedes-moderni-vyuka-antonin-koplik.A240403_092205_brno-zpravy_krut",
    domain: "idnes.cz",
  },
  {
    title: "RTVJ",
    text: "Hovorany sázejí na nejmodernější technologie ve vzdělávání.",
    href: "https://www.rtvj.cz/hovorany-sazeji-na-nejmodernejsi-technologie-ve-vzdelavani/",
    domain: "rtvj.cz",
  },
  {
    title: "Česká televize",
    text: "Zpravodajský výstup věnovaný projektu ARCHIMEDES®.",
    href: "https://www.ceskatelevize.cz/porady/10253066674-zpravy-ve-12/223411012000328/",
    domain: "ceskatelevize.cz",
  },
  {
    title: "iDNES / Hodonín",
    text: "Venkovní učebna jako nová cesta, jak učit děti jinak.",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-skola-vyuka-zaci-hodonin-archimedes-skolstvi.A230717_122219_brno-zpravy_krut",
    domain: "idnes.cz",
  },
  {
    title: "Blesk",
    text: "Reportáž o unikátním konceptu učeben ARCHIMEDES®.",
    href: "https://www.blesk.cz/clanek/regiony-brno-brno-zpravy/748154/prevrat-ve-skolstvi-v-hodonine-vymysleli-unikatni-ucebny-chteji-je-na-celem-svete.html",
    domain: "blesk.cz",
  },
  {
    title: "CzechCrunch",
    text: "Český nápad, který přináší dětem nový typ vzdělávacího prostoru.",
    href: "https://cc.cz/cech-vymyslel-specialni-ucebnu-deti-diky-ni-mohou-pozorovat-co-se-deje-v-ptaci-budce-nebo-u-pyramid/",
    domain: "cc.cz",
  },
  {
    title: "ExportMag",
    text: "Vize sítě chytrých učeben ARCHIMEDES® s českými technologiemi.",
    href: "https://www.exportmag.cz/pribery-exporteru/ve-svete-vznikne-sit-chytrych-uceben-archimedes-s-ceskymi-technologiemi/",
    domain: "exportmag.cz",
  },
  {
    title: "iBrno",
    text: "Living Lab na brněnském výstavišti a prostor pro inovace.",
    href: "https://www.ibrno.cz/business/67259-living-lab-na-brnenskem-vystavisti-nabidne-prostor-pro-inovace-a-spolupraci.html",
    domain: "ibrno.cz",
  },
  {
    title: "Mikulov",
    text: "Mikulovští žáci dostali moderní venkovní učebnu ARCHIMEDES®.",
    href: "https://www.mikulov.cz/obcan/aktuality/702-mikulovsti-zaci-dostali-moderni-venkovni-ucebnu-archimedes",
    domain: "mikulov.cz",
  },
];

function getFavicon(domain) {
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
}

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 15,
        background: "#0f172a",
        color: "white",
        fontWeight: 800,
        border: "1px solid #0f172a",
        boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 18px 36px rgba(15,23,42,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 14px 30px rgba(15,23,42,0.14)";
      }}
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children, tinted = false }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 15,
        border: tinted
          ? "1px solid rgba(15,23,42,0.10)"
          : "1px solid rgba(15,23,42,0.16)",
        background: tinted ? "rgba(255,255,255,0.72)" : "white",
        color: "#0f172a",
        fontWeight: 800,
        boxShadow: tinted ? "0 10px 24px rgba(15,23,42,0.05)" : "none",
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 26px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = tinted
          ? "0 10px 24px rgba(15,23,42,0.05)"
          : "none";
      }}
    >
      {children}
    </Link>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: "rgba(15,23,42,0.52)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, style = {} }) {
  return (
    <div
      style={{
        fontSize: 46,
        lineHeight: 1.02,
        fontWeight: 900,
        color: "#0f172a",
        letterSpacing: "-0.04em",
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SafeImage({ src, alt, style, className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const parent = e.currentTarget.parentElement;
        if (parent && !parent.querySelector(".img-fallback")) {
          const fallback = document.createElement("div");
          fallback.className = "img-fallback";
          fallback.innerText = alt;
          parent.appendChild(fallback);
        }
      }}
    />
  );
}

export default function MediaPage() {
  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background:
          "linear-gradient(180deg, #f6f7fb 0%, #f7f8fb 28%, #f3f5f9 100%)",
        minHeight: "100vh",
      }}
    >
      <main>
        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "64px 20px 26px",
          }}
        >
          <div className="heroShell">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 15px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.06)",
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 20,
                }}
              >
                ARCHIMEDES® • média a fotogalerie
              </div>

              <h1
                style={{
                  fontSize: 62,
                  lineHeight: 0.98,
                  letterSpacing: "-0.05em",
                  color: "#0f172a",
                  margin: "0 0 18px",
                }}
              >
                Média a galerie
                <br />
                ARCHIMEDES®
              </h1>

              <h2
                style={{
                  fontSize: 28,
                  lineHeight: 1.22,
                  color: "#334155",
                  margin: "0 0 18px",
                  fontWeight: 800,
                  maxWidth: 720,
                }}
              >
                Podívejte se na projekt, který spojuje vzdělávání, architekturu a komunitní život.
              </h2>

              <p
                style={{
                  fontSize: 20,
                  lineHeight: 1.64,
                  color: "rgba(15,23,42,0.74)",
                  maxWidth: 760,
                  margin: 0,
                }}
              >
                ARCHIMEDES® je víc než stavba. Je to prostředí, které pomáhá školám
                i obcím vytvářet silnější vztah ke vzdělávání, místu a společnému
                prožívání. Na této stránce najdete výběr fotografií i mediálních
                výstupů, které ukazují jeho reálné využití a veřejný přesah.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 30,
                }}
              >
                <PrimaryButton href="/ucebna">Zpět na stránku učebny</PrimaryButton>
                <SecondaryButton href="/poptavka">
                  Mám zájem o učebnu
                </SecondaryButton>
              </div>
            </div>

            <div className="heroImageCard">
              <SafeImage
                src={heroImg}
                alt="Venkovní učebna ARCHIMEDES®"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "16/10",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "8px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div className="infoGrid">
              <div>
                <SectionEyebrow>O projektu</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Co dělá ARCHIMEDES® výjimečným
                </SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  ARCHIMEDES® vznikl jako odpověď na potřebu moderního,
                  reprezentativního a přitom lidského prostoru pro školy a obce.
                  Nejde jen o technické řešení. Jde o místo, které má atmosféru,
                  charakter a přirozeně zve děti i dospělé dovnitř.
                </p>

                <div className="bulletList">
                  {mediaPoints.map((item) => (
                    <div key={item}>• {item}</div>
                  ))}
                </div>
              </div>

              <div className="sideCard">
                <SafeImage
                  src={classImg}
                  alt="Výuka v učebně ARCHIMEDES®"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16/11",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "8px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div>
                <SectionEyebrow>Fotogalerie</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Výběr z realizací a využití
                </SectionTitle>
              </div>

              <SecondaryButton href="/kontakt" tinted>
                Chci si domluvit návštěvu
              </SecondaryButton>
            </div>

            <div className="galleryGrid">
              {galleryItems.map((item) => (
                <div
                  key={item.title}
                  className={`galleryCard ${
                    item.ratio === "wide" ? "galleryCardWide" : ""
                  }`}
                >
                  <div className="galleryImageWrap">
                    <SafeImage
                      src={item.src}
                      alt={item.title}
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: item.ratio === "wide" ? "16/9" : "16/11",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div className="galleryContent">
                    <div className="galleryTitle">{item.title}</div>
                    <div className="galleryText">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "8px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div className="mediaGrid">
              <div>
                <SectionEyebrow>Mediální přesah</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Projekt, který je vidět
                </SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  ARCHIMEDES® zaujme nejen svým vzhledem, ale především tím,
                  jak přirozeně propojuje vzdělávání, veřejný prostor a komunitní
                  využití. Díky tomu budí pozornost partnerů, návštěvníků i médií.
                </p>

                <p className="leadText" style={{ marginBottom: 0 }}>
                  Každá realizace posiluje důvěru v to, že kvalitní prostředí má
                  ve vzdělávání i v životě obcí skutečný význam.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginTop: 26,
                  }}
                >
                  <PrimaryButton href="/poptavka">
                    Chci navrhnout řešení
                  </PrimaryButton>
                  <SecondaryButton href="/ucebna" tinted>
                    Zobrazit technické varianty
                  </SecondaryButton>
                </div>
              </div>

              <div className="sideCard">
                <SafeImage
                  src={mediaImg}
                  alt="Mediální pozornost projektu ARCHIMEDES®"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16/11",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "8px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div>
                <SectionEyebrow>ARCHIMEDES® v médiích</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Výběr článků a reportáží
                </SectionTitle>
              </div>

              <a
                href="https://www.archimedesoec.com/media/"
                target="_blank"
                rel="noreferrer"
                className="externalGhostBtn"
              >
                Původní přehled médií ↗
              </a>
            </div>

            <div className="linksGrid">
              {mediaLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mediaLinkCard"
                >
                  <div className="mediaLogoWrap">
                    <img
                      src={getFavicon(item.domain)}
                      alt={item.title}
                      className="mediaLogo"
                    />
                  </div>

                  <div className="mediaLinkTitle">{item.title}</div>
                  <div className="mediaLinkText">{item.text}</div>
                  <div className="mediaLinkArrow">Otevřít článek ↗</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "8px 20px 84px",
          }}
        >
          <div className="ctaCard">
            <SectionEyebrow>Další krok</SectionEyebrow>
            <SectionTitle style={{ fontSize: 44 }}>
              Chcete vidět, jak by ARCHIMEDES® fungoval u vás?
            </SectionTitle>

            <p
              style={{
                fontSize: 19,
                lineHeight: 1.72,
                color: "rgba(15,23,42,0.74)",
                maxWidth: 840,
                margin: "0 auto 26px",
              }}
            >
              Rádi vám představíme vhodnou variantu, možnosti využití pro školu
              i obec a navrhneme řešení, které bude odpovídat vašemu prostoru,
              provozu i ambicím.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <PrimaryButton href="/poptavka">Mám zájem o řešení</PrimaryButton>
              <SecondaryButton href="/kontakt">
                Domluvit osobní konzultaci
              </SecondaryButton>
            </div>
          </div>
        </section>

        <style jsx global>{`
          .heroShell {
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(420px, 0.98fr);
            gap: 42px;
            align-items: center;
          }

          .heroImageCard {
            background: rgba(255, 255, 255, 0.8);
            border-radius: 34px;
            overflow: hidden;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow:
              0 28px 80px rgba(15, 23, 42, 0.12),
              0 8px 24px rgba(15, 23, 42, 0.05);
            backdrop-filter: blur(8px);
          }

          .premiumCard {
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 32px;
            padding: 30px 28px;
            box-shadow:
              0 18px 44px rgba(15, 23, 42, 0.06),
              0 6px 18px rgba(15, 23, 42, 0.03);
            backdrop-filter: blur(6px);
          }

          .ctaCard {
            background: linear-gradient(
              180deg,
              rgba(255,255,255,0.92) 0%,
              rgba(248,250,252,0.96) 100%
            );
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 34px;
            padding: 42px 28px;
            box-shadow:
              0 18px 44px rgba(15, 23, 42, 0.06),
              0 6px 18px rgba(15, 23, 42, 0.03);
            text-align: center;
          }

          .infoGrid,
          .mediaGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(340px, 0.92fr);
            gap: 28px;
            align-items: center;
          }

          .leadText {
            font-size: 18px;
            line-height: 1.78;
            color: rgba(15, 23, 42, 0.74);
            margin: 0;
          }

          .bulletList {
            display: grid;
            gap: 10px;
            font-size: 16px;
            line-height: 1.7;
            color: rgba(15, 23, 42, 0.74);
          }

          .sideCard,
          .galleryCard {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
          }

          .galleryGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .galleryCardWide {
            grid-column: 1 / -1;
          }

          .galleryImageWrap {
            overflow: hidden;
            position: relative;
            background: #eef2f7;
          }

          .galleryContent {
            padding: 18px 18px 20px;
          }

          .galleryTitle {
            font-size: 22px;
            line-height: 1.15;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          }

          .galleryText {
            font-size: 15px;
            line-height: 1.66;
            color: rgba(15, 23, 42, 0.72);
          }

          .linksGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .mediaLinkCard {
            display: block;
            text-decoration: none;
            background: linear-gradient(
              180deg,
              rgba(255,255,255,0.98) 0%,
              rgba(247,249,252,0.98) 100%
            );
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 24px;
            padding: 22px 20px 18px;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }

          .mediaLinkCard:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
          }

          .mediaLogoWrap {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: #fff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
          }

          .mediaLogo {
            width: 30px;
            height: 30px;
            object-fit: contain;
            display: block;
          }

          .mediaLinkTitle {
            font-size: 23px;
            line-height: 1.14;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 10px;
            letter-spacing: -0.02em;
          }

          .mediaLinkText {
            font-size: 15px;
            line-height: 1.68;
            color: rgba(15, 23, 42, 0.72);
          }

          .mediaLinkArrow {
            margin-top: 14px;
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }

          .externalGhostBtn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 52px;
            padding: 0 22px;
            border-radius: 15px;
            border: 1px solid rgba(15,23,42,0.10);
            background: rgba(255,255,255,0.72);
            color: #0f172a;
            font-weight: 800;
            text-decoration: none;
            box-shadow: 0 10px 24px rgba(15,23,42,0.05);
          }

          .img-fallback {
            min-height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            text-align: center;
            font-size: 15px;
            line-height: 1.5;
            color: rgba(15, 23, 42, 0.58);
            background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          }

          @media (max-width: 1160px) {
            .heroShell,
            .infoGrid,
            .mediaGrid,
            .galleryGrid,
            .linksGrid {
              grid-template-columns: 1fr;
            }

            .galleryCardWide {
              grid-column: auto;
            }
          }

          @media (max-width: 760px) {
            .premiumCard,
            .ctaCard {
              padding: 22px 18px;
              border-radius: 24px;
            }

            h1 {
              font-size: 46px !important;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
