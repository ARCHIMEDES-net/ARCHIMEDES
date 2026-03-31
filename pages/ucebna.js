import Link from "next/link";

const heroImg = "/ratiskovice.webp";
const classImg = "/cejc.webp";
const techImg = "/jak-funguje-tabule.jpg";
const communityImg = "/komunita.jpg";
const mediaImg = "/otevreni.webp";
const klimaImg = "/otevrena-hero.webp";
const interierImg = "/IMG_0228_content.webp";
const auditoriumImg = "/jak-funguje-trida.jpg";
const natureImg = "/DJI_20260202_104516_998_content.webp";
const openHallImg = "/otevrena.jpg";

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

const gallery = [
  {
    src: "/DJI_20260202_100827_288_content.webp",
    alt: "Exteriér učebny ARCHIMEDES®",
  },
  { src: classImg, alt: "Výuka dětí v učebně ARCHIMEDES®" },
  { src: techImg, alt: "Technologie a interiér učebny ARCHIMEDES®" },
  { src: openHallImg, alt: "Komunitní využití učebny ARCHIMEDES®" },
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
            padding: "64px 20px 32px",
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
                ARCHIMEDES
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
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard">
            <div className="aboutGrid">
              <div>
                <SectionEyebrow>Co je ARCHIMEDES?</SectionEyebrow>
                <SectionTitle>Víc než stavba. Celý ekosystém.</SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Zapomeňte na obyčejné dřevěné altány. ARCHIMEDES je
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
                    ARCHIMEDES je navržen tak, aby fungoval přes den jako
                    moderní učebna a odpoledne nebo večer jako živé centrum
                    obce, setkávání a inspirace.
                  </p>
                </div>
              </div>

              <div className="visualTriple">
                <div className="visualCard visualCardLarge">
                  <img
                    src={heroImg}
                    alt="Detail dřevostavby učebny ARCHIMEDES®"
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
                      src={communityImg}
                      alt="Zelená stěna a přírodní prvky učebny ARCHIMEDES®"
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
                      src={classImg}
                      alt="Sdílená online výuka v učebně ARCHIMEDES®"
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
                ARCHIMEDES je navržen tak, aby dával smysl škole i obci. Přes
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
                    ARCHIMEDES nabízí bezkonkurenční zázemí pro zážitkovou výuku
                    přírodních věd i dalších předmětů.
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
                    ARCHIMEDES nežije jen dopoledne. Pro města a obce
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
                Učebna ARCHIMEDES je promyšlený ekosystém připravený na klíč.
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
                    V učebně ARCHIMEDES se žáci i učitelé cítí skvěle za každého
                    počasí. O okamžitý tepelný komfort v parném létě i mrazivé
                    zimě se starají tiché a vysoce efektivní klimatizační
                    jednotky.
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
            <div className="aboutGrid">
              <div>
                <SectionEyebrow>Proměnlivý interiér</SectionEyebrow>
                <SectionTitle>Z učebny sálem během pár minut</SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Interiér učebny ARCHIMEDES není statický. Zadní části prostoru
                  dominuje fixní pódium, pod kterým se ukrývá chytře řešený
                  výsuvný schod. Díky tomuto systému se prostor dokáže během
                  chvíle proměnit přesně podle toho, co zrovna vyučujete nebo
                  jakou akci pořádáte.
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

              <div className="visualTriple">
                <div className="visualCard visualCardLarge">
                  <img
                    src={interierImg}
                    alt="Variabilní interiér učebny ARCHIMEDES®"
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
                      src={auditoriumImg}
                      alt="Učebna ve variantě auditorium"
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
                      src={openHallImg}
                      alt="Učebna jako volná plocha a komunitní sál"
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
              <div>
                <SectionEyebrow>Špičková výbava bez rozdílu</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Všechny varianty umíme dodat na klíč
                </SectionTitle>
              </div>

              <p className="leadText" style={{ marginBottom: 0 }}>
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
                  Díky rozšiřujícím modulům se ARCHIMEDES může stát naprosto
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
          </div>
        </section>

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 24px",
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
                  src={mediaImg}
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

        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "10px 20px 80px",
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
                  Podívejte se na ARCHIMEDES® blíž
                </SectionTitle>
              </div>

              <SecondaryButton href="/media" tinted>
                Zobrazit další fotografie a média
              </SecondaryButton>
            </div>

            <div className="galleryGrid">
              {gallery.map((item) => (
                <div key={item.alt} className="galleryCard">
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "16/11",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 26,
              }}
            >
              <PrimaryButton href="/poptavka">Mám zájem o učebnu</PrimaryButton>
              <SecondaryButton href="/media">
                Otevřít stránku média
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

          .aboutGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
            gap: 28px;
            align-items: start;
          }

          .communityGrid,
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

          .modeGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .miniCard {
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 18px;
            padding: 18px;
          }

          .miniTitle {
            font-size: 18px;
            line-height: 1.2;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .miniText {
            font-size: 15px;
            line-height: 1.65;
            color: rgba(15, 23, 42, 0.72);
          }

          .communityVisual,
          .mediaVisual,
          .galleryCard {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .pillarsGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }

          .pillarCard {
            background: linear-gradient(
              180deg,
              rgba(248, 250, 252, 1) 0%,
              rgba(244, 247, 251, 1) 100%
            );
            border: 1px solid rgba(15, 23, 42, 0.07);
            border-radius: 28px;
            overflow: hidden;
          }

          .pillarImage {
            background: white;
          }

          .pillarBody {
            padding: 22px;
          }

          .pillarTitle {
            font-size: 30px;
            line-height: 1.1;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 12px;
            letter-spacing: -0.03em;
          }

          .bulletList {
            display: grid;
            gap: 10px;
            font-size: 16px;
            line-height: 1.7;
            color: rgba(15, 23, 42, 0.74);
          }

          .zigzagWrap {
            display: grid;
            gap: 26px;
          }

          .zigzagRow {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
            gap: 26px;
            align-items: center;
          }

          .zigzagRow.reverse {
            grid-template-columns: minmax(360px, 0.92fr) minmax(0, 1fr);
          }

          .zigzagText {
            padding: 6px 0;
          }

          .zigzagTitle {
            font-size: 34px;
            line-height: 1.08;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 14px;
            letter-spacing: -0.04em;
          }

          .zigzagTitle span {
            font-size: 18px;
            line-height: 1.4;
            color: rgba(15, 23, 42, 0.58);
            font-weight: 800;
            letter-spacing: 0;
          }

          .zigzagImage {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .variantGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .variantCard {
            background: rgba(255, 255, 255, 0.86);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 28px;
            padding: 24px;
            box-shadow:
              0 14px 34px rgba(15, 23, 42, 0.05),
              0 4px 14px rgba(15, 23, 42, 0.025);
          }

          .variantHead {
            display: flex;
            gap: 14px;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .variantIcon {
            font-size: 29px;
            line-height: 1;
          }

          .variantTitle {
            font-size: 24px;
            line-height: 1.12;
            font-weight: 900;
            color: #0f172a;
          }

          .variantSubtitle {
            margin-top: 6px;
            font-size: 15px;
            line-height: 1.45;
            color: rgba(15, 23, 42, 0.62);
            font-weight: 700;
          }

          .variantText {
            margin: 0 0 14px;
            font-size: 16px;
            line-height: 1.74;
            color: rgba(15, 23, 42, 0.74);
          }

          .variantBlock + .variantBlock {
            margin-top: 12px;
          }

          .variantBlockTitle {
            font-size: 14px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .variantBlockText {
            font-size: 15px;
            line-height: 1.66;
            color: rgba(15, 23, 42, 0.72);
          }

          .selectionHint {
            margin-top: 18px;
            background: rgba(255, 255, 255, 0.74);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 22px;
            padding: 18px 20px;
            font-size: 16px;
            line-height: 1.7;
            color: rgba(15, 23, 42, 0.76);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
          }

          .equipmentStripe {
            background: linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.95) 0%,
              rgba(30, 41, 59, 0.94) 100%
            );
            border-radius: 30px;
            overflow: hidden;
            box-shadow:
              0 20px 50px rgba(15, 23, 42, 0.16),
              0 6px 18px rgba(15, 23, 42, 0.08);
          }

          .equipmentStripeInner {
            padding: 34px 30px;
          }

          .equipmentStripe .leadText,
          .equipmentStripe div {
            color: white;
          }

          .equipmentStripe .leadText {
            color: rgba(255, 255, 255, 0.84);
          }

          .equipmentStripe :global(div[style*="rgba(15,23,42,0.52)"]) {
            color: rgba(255, 255, 255, 0.6) !important;
          }

          .equipGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .equipCard {
            background: linear-gradient(
              180deg,
              rgba(248, 250, 252, 1) 0%,
              rgba(244, 247, 251, 1) 100%
            );
            border: 1px solid rgba(15, 23, 42, 0.07);
            border-radius: 24px;
            padding: 24px;
          }

          .equipCardWide {
            grid-column: 1 / -1;
          }

          .equipTitle {
            font-size: 28px;
            line-height: 1.16;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 12px;
            letter-spacing: -0.03em;
          }

          .equipText {
            font-size: 16px;
            line-height: 1.72;
            color: rgba(15, 23, 42, 0.74);
            margin-bottom: 12px;
          }

          .equipList {
            display: grid;
            gap: 8px;
            font-size: 15px;
            line-height: 1.66;
            color: rgba(15, 23, 42, 0.72);
          }

          .galleryGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          @media (max-width: 1160px) {
            .heroShell,
            .aboutGrid,
            .communityGrid,
            .mediaGrid,
            .variantGrid,
            .equipGrid,
            .galleryGrid,
            .pillarsGrid,
            .zigzagRow,
            .zigzagRow.reverse,
            .doubleVisualGrid {
              grid-template-columns: 1fr;
            }

            .equipCardWide {
              grid-column: auto;
            }
          }

          @media (max-width: 760px) {
            .premiumCard {
              padding: 22px 18px;
              border-radius: 24px;
            }

            .modeGrid {
              grid-template-columns: 1fr;
            }

            h1 {
              font-size: 46px !important;
            }

            .pillarTitle,
            .zigzagTitle,
            .equipTitle {
              font-size: 24px;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
