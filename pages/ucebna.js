import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const heroImg = "/ucebna-exterier.webp";

const classImg = "/detivetride.webp";
const techImg = "/dino.jpg";
const communityImg = "/seni.webp";

const ecosystemMainImg = "/IMG_0228_content.webp";
const ecosystemNatureImg = "/zel.webp";
const ecosystemOnlineImg = "/jak-funguje-online.jpg";

const klimaImg = "/otevrena-hero.webp";
const natureImg = "/mikro.jpeg";

const salVideo = "/sal.mp4";
const salPoster = "/sal-poster.jpg";

const mediaSectionImg = "/prestrih.webp";

const awardHealthyCitiesImg = "/zdravamesta.jpg";
const awardObec2030Img = "/obec2030.jpeg";

const awards = [
  {
    label: "OBEC 2030",
    title: "Vítěz 5. ročníku",
    text: "Ocenění za inspirativní řešení pro moderní obec a komunitní rozvoj.",
    image: awardObec2030Img,
    alt: "Vítěz soutěže OBEC 2030",
  },
  {
    label: "Zdravá města ČR",
    title: "NEJpraxe 2023",
    text: "Uznání za excelentní praxi projektu Přírodní učebna ARCHIMEDES®.",
    image: awardHealthyCitiesImg,
    alt: "NEJpraxe Zdravých měst 2023",
  },
];

const variants = [
  {
    icon: "☀️",
    title: "ARCHIMEDES® OPTIMAL",
    subtitle: "Svoboda v otevřenosti",
    text: "Celodřevěná konstrukce navržená pro maximální kontakt s okolím a silný zážitek z výuky venku.",
    benefitTitle: "Největší benefit",
    benefit:
      "Jako jedinou variantu ji lze zcela otevřít. Hliníkové posuvné dveře a okenice zajíždějí do skrytých kapes, čímž se učebna v teplých měsících promění ve vzdušný altán.",
    suitable:
      "Pokud je pro vás prioritou, aby se dala učebna v létě zcela otevřít a propojit s přírodou.",
    design:
      "Dřevěný obklad s možností výběru odstínu dle vzorníku. Učebnu lze vytápět a využívat i přes zimu, je však nutné počítat s mírnými úniky tepla a o něco nižším tepelným komfortem než u vyšších modelů.",
  },
  {
    icon: "🍁",
    title: "ARCHIMEDES® OPTIMAL+",
    subtitle: "Komfort za každého počasí",
    text: "Vylepšená verze modelu Optimal. Zlatá střední cesta, která klade hlavní důraz na tepelnou izolaci, ale zachovává si krásný přírodní vzhled dřeva.",
    benefitTitle: "Největší benefit",
    benefit:
      "Vynikající izolační vlastnosti. Ideální pro plnohodnotné a každodenní využití s vysokým tepelným komfortem i v chladnějších měsících.",
    suitable:
      "Pro školy a obce, které chtějí učebnu využívat každý den celou zimu a vyžadují špičkovou tepelnou izolaci.",
    design:
      "Dřevěný obklad s možností výběru odstínu dle vzorníku. Pro dosažení špičkové izolace nelze okna skrýt do stěn a nedosáhnete efektu úplně otevřeného altánu jako u verze OPTIMAL.",
  },
  {
    icon: "❄️",
    title: "ARCHIMEDES® PREMIUM",
    subtitle: "Standard trvalé stavby",
    text: "Plně zateplená učebna se sendvičovou skladbou stěn, konstruovaná pro intenzivní výuku po celý rok – bez kompromisů v tepelném komfortu.",
    benefitTitle: "Největší benefit",
    benefit:
      "Maximální energetická efektivita, odolnost a stabilní vnitřní prostředí v jakémkoli počasí.",
    suitable:
      "Pro zřizovatele, kteří chtějí 100% bezpečný a celoročně izolovaný prostor s maximální tepelnou stabilitou i v těch největších mrazech.",
    design:
      "Exteriér tvoří moderní fasáda v barvě dle vzorníku RAL, interiér hřeje příjemným dřevem. Podlaha je z vysoce odolného PVC. Konstrukce neumožňuje plné otevření stěn.",
  },
];

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

export default function Ucebna() {
  const salVideoRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const video = salVideoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        await video.play();
      } catch (err) {
        // Pokud prohlížeč autoplay zablokuje, zůstane zobrazen poster.
      }
    };

    tryPlay();
  }, []);

  useEffect(() => {
    if (!lightboxImage) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImage(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
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
            padding: "64px 20px 24px",
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
                ARCHIMEDES® • venkovní učebna pro školy a obce
              </div>

              <h1
                style={{
                  fontSize: 64,
                  lineHeight: 0.98,
                  letterSpacing: "-0.05em",
                  color: "#0f172a",
                  margin: "0 0 18px",
                }}
              >
                Venkovní učebna
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
                  maxWidth: 760,
                }}
              >
                Unikátní prostor, kde se příroda potkává s nejmodernějšími
                technologiemi.
                <br />
                Revoluce ve výuce i komunitním životě.
              </h2>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.62,
                  color: "rgba(15,23,42,0.74)",
                  maxWidth: 720,
                  margin: 0,
                }}
              >
                Prosvětlený, reprezentativní a promyšlený prostor pro školy,
                obce i komunity. Místo, které propojuje kvalitní architekturu,
                přírodní materiály a digitální technologie nové generace.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 30,
                }}
              >
                <PrimaryButton href="/media">
                  Prohlédnout reference
                </PrimaryButton>
                <SecondaryButton href="/poptavka">
                  Chci nezávaznou nabídku
                </SecondaryButton>
              </div>
            </div>

            <div>
              <div className="heroImageCard">
                <img
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
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 20px 24px",
          }}
        >
          <div className="awardsBand">
            <div className="awardsBandTop">
              <div>
                <div className="awardsBandEyebrow">Ocenění projektu</div>
                <div className="awardsBandTitle">
                  Uznání, která potvrzují reálný přínos učebny ARCHIMEDES®
                </div>
              </div>
              <div className="awardsBandText">
                Dvě významná ocenění z oblasti rozvoje obcí a dobré praxe.
              </div>
            </div>

            <div className="awardsTiles">
              {awards.map((award) => (
                <button
                  key={award.title}
                  type="button"
                  className="awardTile"
                  onClick={() => setLightboxImage(award)}
                  aria-label={`Zvětšit ocenění: ${award.title}`}
                >
                  <div className="awardTileMeta">
                    <div className="awardTileLabel">{award.label}</div>
                    <div className="awardTileTitle">{award.title}</div>
                    <div className="awardTileText">{award.text}</div>
                  </div>

                  <div className="awardTileImageWrap">
                    <img
                      src={award.image}
                      alt={award.alt}
                      className="awardTileImage"
                    />
                    <span className="awardTileZoom">Kliknutím zvětšíte</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div className="aboutGrid">
              <div>
                <SectionEyebrow>Co je ARCHIMEDES®?</SectionEyebrow>
                <SectionTitle>Víc než stavba. Celý ekosystém.</SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Zapomeňte na obyčejné dřevěné altány. ARCHIMEDES® je
                  celosvětová síť high-tech venkovních učeben a edukativních
                  center. Stavíme z udržitelných přírodních materiálů a vracíme
                  děti i dospělé zpět k přírodě.
                </p>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Zároveň však učebny vybavujeme špičkovými technologiemi.
                  Nejde jen o stavbu, jde o komplexní prostředí – všechny naše
                  učebny jsou propojeny unikátním portálem Archimedes Live,
                  který umožňuje globální sdílení projektů, online vstupy
                  odborníků a spolupráci napříč kontinenty.
                </p>

                <div className="softPanel">
                  <div
                    style={{
                      fontSize: 28,
                      lineHeight: 1.12,
                      fontWeight: 900,
                      color: "#0f172a",
                      marginBottom: 14,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Příroda, technologie a komunita v jednom prostoru
                  </div>

                  <p className="softPanelText">
                    ARCHIMEDES® je navržen tak, aby fungoval přes den jako
                    moderní učebna a odpoledne nebo večer jako živé centrum
                    obce, setkávání a inspirace.
                  </p>
                </div>
              </div>

              <div className="visualTriple">
                <div className="visualCard visualCardLarge">
                  <img
                    src={ecosystemMainImg}
                    alt="Detail učebny ARCHIMEDES®"
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="doubleVisualGrid">
                  <div className="visualCard">
                    <img
                      src={ecosystemNatureImg}
                      alt="Otevřený prostor učebny ARCHIMEDES®"
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: "16/10",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div className="visualCard">
                    <img
                      src={ecosystemOnlineImg}
                      alt="Online propojení a technologie učebny ARCHIMEDES®"
                      style={{
                        width: "100%",
                        display: "block",
                        aspectRatio: "16/10",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <SectionEyebrow>Možnosti využití</SectionEyebrow>
              <SectionTitle style={{ marginBottom: 12 }}>
                Dva silné pilíře využití
              </SectionTitle>
              <p
                className="leadText"
                style={{ maxWidth: 900, margin: "0 auto" }}
              >
                ARCHIMEDES® je navržen tak, aby dával smysl škole i obci. Přes
                den podporuje moderní vzdělávání, odpoledne a večer přirozeně
                oživuje komunitní život.
              </p>
            </div>

            <div className="pillarsGrid">
              <div className="pillarCard">
                <div className="pillarImage">
                  <img
                    src={classImg}
                    alt="Učitel a žáci pracující s panelem uvnitř učebny"
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="pillarBody">
                  <div className="pillarTitle">Pro školy a školky</div>
                  <p className="leadText" style={{ marginBottom: 16 }}>
                    Přeneste výuku ze čtyř stěn na čerstvý vzduch. Učebna
                    ARCHIMEDES® nabízí bezkonkurenční zázemí pro zážitkovou
                    výuku přírodních věd i dalších předmětů.
                  </p>

                  <div className="bulletList">
                    <div>
                      • <strong>Zážitková pedagogika:</strong> Děti se učí přímo
                      v kontaktu s přírodou a reálnými ekosystémy.
                    </div>
                    <div>
                      • <strong>Globální propojení:</strong> Sdílení hodin
                      (co-teaching) se školami na druhém konci světa.
                    </div>
                    <div>
                      • <strong>Moderní nástroje:</strong> Využití edukačního 3D
                      softwaru, vizualizérů a interaktivních panelů.
                    </div>
                    <div>
                      • <strong>Zdravé prostředí:</strong> Speciální
                      plnospektrální osvětlení podporuje soustředění a vitalitu
                      žáků.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pillarCard">
                <div className="pillarImage">
                  <img
                    src={communityImg}
                    alt="Učebna jako letní kino nebo komunitní setkání"
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="pillarBody">
                  <div className="pillarTitle">Pro obce a komunity</div>
                  <p className="leadText" style={{ marginBottom: 16 }}>
                    ARCHIMEDES® nežije jen dopoledne. Pro města a obce
                    představuje multifunkční prostor, který oživí veřejný život
                    a stane se srdcem komunity.
                  </p>

                  <div className="bulletList">
                    <div>
                      • <strong>Společenské akce:</strong> Perfektní zázemí pro
                      letní kino nebo sousedská setkání.
                    </div>
                    <div>
                      • <strong>Mimoškolní aktivity:</strong> Ideální prostor
                      pro odpolední kroužky a příměstské tábory.
                    </div>
                    <div>
                      • <strong>Vzdělávání a reprezentace:</strong> Zázemí pro
                      odborné semináře, přednášky a vzdělávání dospělých.
                    </div>
                    <div>
                      • <strong>Zasedání:</strong> Reprezentativní a netradiční
                      místo pro zasedání zastupitelstva.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <SecondaryButton href="/media" tinted>
                Zobrazit reference a média
              </SecondaryButton>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <SectionEyebrow>Unikátní vybavení učebny</SectionEyebrow>
              <SectionTitle style={{ marginBottom: 12 }}>
                Synergie přírody a technologií
              </SectionTitle>
              <p
                className="leadText"
                style={{ maxWidth: 930, margin: "0 auto" }}
              >
                Učebna ARCHIMEDES® je promyšlený ekosystém připravený na klíč.
                Propojujeme to nejlepší z obou světů – od chytrých technologií
                přes ideální klima až po badatelské prvky.
              </p>
            </div>

            <div className="zigzagWrap">
              <div className="zigzagRow">
                <div className="zigzagText">
                  <div className="zigzagTitle">
                    Špičkové IT a audiovize
                    <br />
                    <span>(Spojení s celým světem)</span>
                  </div>

                  <p className="leadText" style={{ marginBottom: 0 }}>
                    Učebna bourá hranice běžné výuky a funguje jako plně
                    zasíťovaný multimediální hub s vysokorychlostní Wi-Fi.
                    Srdcem prostoru je interaktivní panel doplněný o
                    vizualizér, díky kterým ožije každý výklad.
                  </p>

                  <p
                    className="leadText"
                    style={{ marginTop: 14, marginBottom: 0 }}
                  >
                    Pro dokonalé spojení v rámci globální sítě Archimedes Live
                    je prostor osazen profesionální zvukotechnikou a speciálním
                    videobarem – chytrou konferenční kamerou s audiotrackingem,
                    která automaticky rozpozná a plynule sleduje mluvčího.
                    Během dne navíc učitelé ocení integrovaný projektor s
                    plátnem pro velkoformátové prezentace, zatímco večer se díky
                    němu prostor snadno promění v oblíbené letní kino pro celou
                    komunitu.
                  </p>
                </div>

                <div className="zigzagImage">
                  <img
                    src={techImg}
                    alt="Žáci pracující u interaktivního panelu"
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              <div className="zigzagRow reverse">
                <div className="zigzagImage">
                  <img
                    src={klimaImg}
                    alt="Otevřená učebna ARCHIMEDES®"
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="zigzagText">
                  <div className="zigzagTitle">
                    Ideální klima a prokognitivní osvětlení
                    <br />
                    <span>(Prostředí pro mysl i tělo)</span>
                  </div>

                  <p className="leadText" style={{ marginBottom: 0 }}>
                    V učebně ARCHIMEDES® se žáci i učitelé cítí skvěle za
                    každého počasí. O okamžitý tepelný komfort v parném létě i
                    mrazivé zimě se starají tiché a vysoce efektivní
                    klimatizační jednotky.
                  </p>

                  <p
                    className="leadText"
                    style={{ marginTop: 14, marginBottom: 0 }}
                  >
                    Naprostou revolucí pro zdraví je pak systém
                    plnospektrálního osvětlení. Tato chytrá svítidla do detailu
                    simulují přirozené sluneční záření, čímž prokazatelně
                    snižují únavu očí, brání útlumu a přirozeně stimulují
                    soustředění a vitalitu během celého dne.
                  </p>
                </div>
              </div>

              <div className="zigzagRow">
                <div className="zigzagText">
                  <div className="zigzagTitle">
                    Živá laboratoř v přímém přenosu
                    <br />
                    <span>(Příroda a badatelství)</span>
                  </div>

                  <p className="leadText" style={{ marginBottom: 0 }}>
                    Učebna funguje jako interaktivní badatelský ekosystém.
                    Vlastní meteostanice umožňuje žákům analyzovat vývoj počasí.
                    O udržitelné hospodaření s vodou se stará retenční nádrž na
                    dešťovku, která přímo slouží k zavlažování vyvýšených záhonů
                    a zelených pěstebních stěn.
                  </p>

                  <p
                    className="leadText"
                    style={{ marginTop: 14, marginBottom: 0 }}
                  >
                    Koloběh živin v přírodě si děti osahají v praxi díky
                    vermikompostéru s kalifornskými žížalami a hmyzímu hotelu.
                    Naprostým unikátem je pak šetrné propojení fauny s
                    technologiemi – ptačí budky a krmítko jsou osazeny skrytým
                    kamerovým systémem, který přenáší živý obraz z hnízdění
                    přímo na velký panel v učebně, aniž by byla zvířata
                    jakkoliv rušena.
                  </p>
                </div>

                <div className="zigzagImage">
                  <img
                    src={natureImg}
                    alt="Badatelské a přírodní prvky učebny"
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/10",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div className="aboutGrid aboutGridVideoOnly">
              <div>
                <SectionEyebrow>Proměnlivý interiér</SectionEyebrow>
                <SectionTitle>Z učebny sálem během pár minut</SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Interiér učebny ARCHIMEDES® není statický. Zadní části
                  prostoru dominuje fixní pódium, pod kterým se ukrývá chytře
                  řešený výsuvný schod. Díky tomuto systému se prostor dokáže
                  během chvíle proměnit přesně podle toho, co zrovna vyučujete
                  nebo jakou akci pořádáte.
                </p>

                <div className="softPanel">
                  <div className="modeGrid">
                    <div className="miniCard">
                      <div className="miniTitle">
                        Stupňovité auditorium pro přednášky
                      </div>
                      <div className="miniText">
                        Schod se vysune a vznikne kaskádovité sezení. Na podlaze
                        je jedna až dvě řady lavic, další řada se umístí přímo
                        na výsuvný schod a poslední řada sedí na vyvýšeném
                        pódiu.
                      </div>
                    </div>

                    <div className="miniCard">
                      <div className="miniTitle">
                        Volná plocha a samostatné pódium
                      </div>
                      <div className="miniText">
                        Potřebujete prostor pro pohybové aktivity nebo chcete
                        spojit stoly pro skupinovou práci? Schod jednoduše
                        zasunete pod pódium a získáte velkou volnou plochu.
                      </div>
                    </div>

                    <div className="miniCard">
                      <div className="miniTitle">
                        Skupinová výuka a flexibilní sezení
                      </div>
                      <div className="miniText">
                        Všechny stoly a lavice jsou skládací, takže je lze
                        snadno přesouvat, kombinovat nebo uschovat podle typu
                        programu.
                      </div>
                    </div>

                    <div className="miniCard">
                      <div className="miniTitle">
                        Pódium pro vystoupení a moderování
                      </div>
                      <div className="miniText">
                        Vyvýšená část prostoru je ideální pro prezentace,
                        besedy, moderování, letní kino i malé komunitní akce.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="videoStage">
                <div className="videoCardPortraitLarge videoCardAligned">
                  <video
                    ref={salVideoRef}
                    poster={salPoster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    controls
                    className="croppedVideo cinematicVideo"
                  >
                    <source src={salVideo} type="video/mp4" />
                    Váš prohlížeč nepodporuje přehrávání videa.
                  </video>
                  <div className="videoOverlayGlow" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="varianty"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "16px 20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 18,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <SectionEyebrow>Varianty učebny</SectionEyebrow>
              <SectionTitle style={{ fontSize: 48, marginBottom: 0 }}>
                Přizpůsobí se vašim potřebám
              </SectionTitle>
            </div>

            <PrimaryButton href="/poptavka">
              Chci nezávaznou nabídku
            </PrimaryButton>
          </div>

          <div className="variantGrid">
            {variants.map((item) => (
              <div key={item.title} className="variantCard">
                <div className="variantHead">
                  <div className="variantIcon">{item.icon}</div>
                  <div>
                    <div className="variantTitle">{item.title}</div>
                    <div className="variantSubtitle">{item.subtitle}</div>
                  </div>
                </div>

                <p className="variantText">{item.text}</p>

                <div className="variantBlock">
                  <div className="variantBlockTitle">{item.benefitTitle}</div>
                  <div className="variantBlockText">{item.benefit}</div>
                </div>

                <div className="variantBlock">
                  <div className="variantBlockTitle">Pro koho je vhodná</div>
                  <div className="variantBlockText">{item.suitable}</div>
                </div>

                <div className="variantBlock">
                  <div className="variantBlockTitle">Design / specifikum</div>
                  <div className="variantBlockText">{item.design}</div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <PrimaryButton href="/poptavka">
                    Chci nezávaznou nabídku
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>

          <div className="selectionHint">
            <strong>Jak vybrat tu správnou?</strong> Pokud je pro vás prioritou,
            aby se dala učebna v létě zcela otevřít a propojit s přírodou,
            zvolte OPTIMAL. Pokud plánujete učebnu využívat každý den celou
            zimu a vyžadujete špičkovou tepelnou izolaci, doporučujeme
            OPTIMAL+ nebo PREMIUM.
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
          }}
        >
          <div className="equipmentStripe">
            <div className="equipmentStripeInner">
              <div style={{ marginBottom: 14 }}>
                <div className="equipmentEyebrow">
                  Špičková výbava bez rozdílu
                </div>
                <div className="equipmentTitle">
                  Všechny varianty umíme dodat na klíč
                </div>
              </div>

              <p className="equipmentText">
                Ať už si vyberete vzdušnou variantu OPTIMAL, nebo plně
                izolovanou PREMIUM, o moderní technologie ani komfort
                nepřijdete. Do každého modelu lze bez omezení integrovat chytré
                IT panely a kamery, plnospektrální osvětlení, klimatizaci,
                flexibilní nábytek i veškeré přírodní badatelské prvky. Záleží
                jen na vašich potřebách – vnitřní vybavení vás při výběru
                samotné stavby nijak nelimituje.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <SectionEyebrow>Možnosti rozšíření</SectionEyebrow>
            <SectionTitle style={{ fontSize: 48 }}>
              Zázemí pro naprostou nezávislost
            </SectionTitle>

            <div className="equipGrid">
              <div className="equipCard">
                <div className="equipTitle">🚻 Sociální zázemí</div>
                <div className="equipText">
                  Ke všem variantám nabízíme možnost elegantně integrovat
                  plnohodnotné sociální zázemí přímo do stavby.
                </div>
                <div className="equipList">
                  <div>• samostatné WC pro žáky a návštěvníky</div>
                  <div>• možnost bezbariérového řešení</div>
                  <div>• vizuální sladění s hlavní stavbou</div>
                </div>
              </div>

              <div className="equipCard">
                <div className="equipTitle">🧥 Šatna a sklad</div>
                <div className="equipText">
                  Učebnu lze doplnit o praktickou šatnu pro žáky nebo
                  uzamykatelný sklad / kabinet na pomůcky a složený nábytek.
                </div>
                <div className="equipList">
                  <div>• šatní zázemí pro každodenní provoz</div>
                  <div>• sklad učebních pomůcek a techniky</div>
                  <div>• kabinet pro učitele nebo správce prostoru</div>
                </div>
              </div>

              <div className="equipCard equipCardWide">
                <div className="equipTitle">🏫 Nezávislá jednotka</div>
                <div className="equipText">
                  Díky rozšiřujícím modulům se ARCHIMEDES® může stát naprosto
                  nezávislým prostorem bez nutnosti využívat hlavní budovu školy
                  nebo obecního úřadu.
                </div>
                <div className="equipList">
                  <div>• plnohodnotný provoz mimo hlavní budovu</div>
                  <div>• vyšší komfort pro školní i komunitní akce</div>
                  <div>
                    • ideální řešení pro obce, které chtějí maximálně využitelný
                    samostatný objekt
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <PrimaryButton href="/poptavka?typ=navsteva-vzorove-ucebny">
                Navštívit vzorovou učebnu BVV Brno
              </PrimaryButton>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 80px",
          }}
        >
          <div className="premiumCard mediaSection">
            <div className="mediaGrid">
              <div>
                <SectionEyebrow>Média a důvěryhodnost</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  ARCHIMEDES® přitahuje pozornost veřejnosti
                </SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Projekt ARCHIMEDES® ukazuje, že vzdělávací prostor může být
                  současně moderní, přirozený i inspirativní. Právě proto budí
                  zájem škol, obcí, partnerů i širší veřejnosti.
                </p>

                <p className="leadText" style={{ marginBottom: 0 }}>
                  Silné realizace, reálné využití a jasná vize dělají z
                  ARCHIMEDES® produktu, který je vidět — a o kterém se mluví.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginTop: 26,
                  }}
                >
                  <PrimaryButton href="/media">Zobrazit média</PrimaryButton>
                  <SecondaryButton href="/kontakt" tinted>
                    Chci více informací
                  </SecondaryButton>
                </div>
              </div>

              <div className="mediaVisual">
                <img
                  src={mediaSectionImg}
                  alt="Mediální a veřejná pozornost projektu ARCHIMEDES®"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16/10",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {lightboxImage && (
          <div
            className="lightboxOverlay"
            onClick={() => setLightboxImage(null)}
            role="button"
            tabIndex={0}
          >
            <button
              type="button"
              className="lightboxClose"
              onClick={() => setLightboxImage(null)}
              aria-label="Zavřít náhled"
            >
              ×
            </button>

            <div
              className="lightboxDialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightboxMeta">
                <div className="lightboxKicker">{lightboxImage.label}</div>
                <div className="lightboxTitle">{lightboxImage.title}</div>
                <div className="lightboxDescription">{lightboxImage.text}</div>
              </div>
              <img
                src={lightboxImage.image}
                alt={lightboxImage.alt}
                className="lightboxImg"
              />
            </div>
          </div>
        )}

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

          .awardsBand {
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 30px;
            padding: 24px;
            box-shadow:
              0 18px 44px rgba(15, 23, 42, 0.05),
              0 6px 18px rgba(15, 23, 42, 0.025);
            backdrop-filter: blur(8px);
          }

          .awardsBandTop {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 18px;
            flex-wrap: wrap;
            margin-bottom: 18px;
          }

          .awardsBandEyebrow {
            font-size: 12px;
            line-height: 1.3;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(15, 23, 42, 0.42);
            margin-bottom: 8px;
          }

          .awardsBandTitle {
            font-size: 30px;
            line-height: 1.08;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.035em;
            max-width: 720px;
          }

          .awardsBandText {
            font-size: 15px;
            line-height: 1.6;
            color: rgba(15, 23, 42, 0.62);
            max-width: 360px;
          }

          .awardsTiles {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .awardTile {
            text-align: left;
            border: 1px solid rgba(15, 23, 42, 0.08);
            background: rgba(255, 255, 255, 0.9);
            border-radius: 24px;
            padding: 16px;
            cursor: pointer;
            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease,
              border-color 0.18s ease;
            box-shadow:
              0 14px 30px rgba(15, 23, 42, 0.04),
              0 4px 14px rgba(15, 23, 42, 0.02);
          }

          .awardTile:hover {
            transform: translateY(-3px);
            box-shadow:
              0 20px 38px rgba(15, 23, 42, 0.08),
              0 6px 18px rgba(15, 23, 42, 0.03);
            border-color: rgba(15, 23, 42, 0.12);
          }

          .awardTileMeta {
            margin-bottom: 14px;
          }

          .awardTileLabel {
            font-size: 12px;
            line-height: 1.3;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(15, 23, 42, 0.42);
            margin-bottom: 6px;
          }

          .awardTileTitle {
            font-size: 24px;
            line-height: 1.1;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.03em;
            margin-bottom: 8px;
          }

          .awardTileText {
            font-size: 15px;
            line-height: 1.62;
            color: rgba(15, 23, 42, 0.68);
            max-width: 480px;
          }

          .awardTileImageWrap {
            position: relative;
            overflow: hidden;
            border-radius: 18px;
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .awardTileImage {
            width: 100%;
            display: block;
            aspect-ratio: 16 / 9;
            object-fit: cover;
          }

          .awardTileZoom {
            position: absolute;
            right: 12px;
            bottom: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 32px;
            padding: 0 12px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.78);
            color: white;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.02em;
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

          .aboutGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
            gap: 28px;
            align-items: start;
          }

          .aboutGridVideoOnly {
            grid-template-columns: minmax(0, 1fr) minmax(320px, 430px);
            align-items: start;
          }

          .mediaGrid {
            display: grid;
            grid-template-columns: minmax(0, 0.98fr) minmax(360px, 1.02fr);
            gap: 28px;
            align-items: center;
          }

          .leadText {
            font-size: 18px;
            line-height: 1.78;
            color: rgba(15, 23, 42, 0.74);
            margin: 0;
          }

          .softPanel {
            margin-top: 24px;
            padding: 24px;
            border-radius: 26px;
            background: linear-gradient(
              180deg,
              rgba(248, 250, 252, 0.98) 0%,
              rgba(244, 247, 251, 0.98) 100%
            );
            border: 1px solid rgba(15, 23, 42, 0.07);
          }

          .softPanelText {
            margin: 0;
            font-size: 16px;
            line-height: 1.72;
            color: rgba(15, 23, 42, 0.72);
          }

          .visualTriple {
            display: grid;
            gap: 18px;
          }

          .doubleVisualGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .visualCard {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 16px 38px rgba(15, 23, 42, 0.07);
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .visualCardLarge {
            box-shadow: 0 20px 46px rgba(15, 23, 42, 0.08);
          }

          .videoStage {
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          .videoCardPortraitLarge {
            width: 100%;
            max-width: 430px;
            height: 560px;
            background: #0f172a;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 18px 44px rgba(15, 23, 42, 0.09);
            border: 1px solid rgba(15, 23, 42, 0.08);
            position: relative;
            isolation: isolate;
          }

          .videoCardAligned {
            margin-top: 42px;
          }

          .croppedVideo {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 
