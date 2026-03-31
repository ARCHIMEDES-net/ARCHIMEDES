import Link from "next/link";

const heroImg = "/ucebna-exterier.webp";
const classImg = "/ucebna-deti.webp";
const techImg = "/ucebna-technologie.webp";
const communityImg = "/ucebna-komunita.webp";
const mediaImg = "/ucebna-media.webp";
const mapImg = "/ucebna-mapa.webp";

const variants = [
  {
    icon: "🌿",
    title: "ARCHIMEDES® OPTIMAL",
    subtitle: "Svoboda v otevřenosti",
    text: "Celodřevěná, zateplená konstrukce vycházející z populární vzorové učebny. Je navržena pro maximální kontakt s okolím a silný zážitek z výuky venku.",
    benefitTitle: "Největší benefit",
    benefit:
      "Hliníkové posuvné dveře a okenice zajíždějí do skrytých kapes. V teplých měsících lze učebnu zcela otevřít a proměnit ji ve vzdušný altán.",
    suitable:
      "Pro školy a komunity, které plánují využití primárně od jara do podzimu. Hliníkové pojezdy nejsou plně zaizolované, což v tuhé zimě vede k tepelným únikům.",
    design:
      "Dřevěný obklad s možností výběru odstínu dle vzorníku.",
  },
  {
    icon: "❄️",
    title: "ARCHIMEDES® OPTIMAL+",
    subtitle: "Komfort za každého počasí",
    text: "Vylepšená verze modelu Optimal. Zlatá střední cesta, která klade vyšší důraz na tepelnou izolaci, ale zachovává si krásný přírodní vzhled dřeva.",
    benefitTitle: "Největší benefit",
    benefit:
      "Vynikající izolační vlastnosti díky PVC oknům, HS portálům nebo otevíravým francouzským oknům. Ideální pro plnohodnotné zimní využití s minimálními náklady na vytápění.",
    suitable:
      "Pro školy a obce, které chtějí celoroční provoz a vyšší tepelný komfort bez ztráty dřevěného charakteru stavby.",
    design:
      "Dřevěný obklad s možností výběru odstínu dle vzorníku. Okna nelze zcela skrýt do stěn, takže nedosáhnete efektu úplně otevřeného altánu.",
  },
  {
    icon: "🏢",
    title: "ARCHIMEDES® PREMIUM",
    subtitle: "Standard trvalé stavby",
    text: "Plně zateplená učebna se sendvičovou skladbou stěn, konstruovaná pro intenzivní a každodenní výuku po celý rok – bez kompromisů.",
    benefitTitle: "Největší benefit",
    benefit:
      "Maximální energetická efektivita, odolnost a stabilní vnitřní prostředí v jakémkoli počasí.",
    suitable:
      "Pro zřizovatele, kteří chtějí bezpečný a plnohodnotný vzdělávací prostor pro každodenní využití během celého roku.",
    design:
      "Exteriér tvoří moderní fasáda v barvě dle vzorníku RAL, interiér hřeje příjemným dřevem. Podlaha je z vysoce odolného PVC. Konstrukce neumožňuje plné otevření stěn.",
  },
];

const references = [
  "Ratíškovice",
  "Růžovka Frýdek-Místek",
  "Čejč",
  "Mikulov",
  "Hovorany",
  "Křenov",
];

const gallery = [
  {
    src: heroImg,
    alt: "Exteriér učebny ARCHIMEDES®",
  },
  {
    src: classImg,
    alt: "Výuka dětí v učebně ARCHIMEDES®",
  },
  {
    src: techImg,
    alt: "Technologie a interiér učebny ARCHIMEDES®",
  },
  {
    src: communityImg,
    alt: "Komunitní využití učebny ARCHIMEDES®",
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
                Reprezentativní prostor pro výuku, komunitu i život obce.
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
                ARCHIMEDES® propojuje kvalitní architekturu, moderní technologie
                a přirozené venkovní prostředí. Vzniká tak místo, které škola i
                obec skutečně využijí — pro vzdělávání, setkávání i inspiraci.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 30,
                }}
              >
                <PrimaryButton href="#varianty">Vybrat variantu</PrimaryButton>
                <SecondaryButton href="/kontakt">
                  Domluvit návštěvu učebny
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
                <SectionEyebrow>O projektu</SectionEyebrow>
                <SectionTitle>Prostor, který inspiruje</SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  Přeneste výuku ven, aniž byste slevili z komfortu a
                  technologických možností klasické třídy. ARCHIMEDES® je
                  certifikovaný systém venkovních učeben o rozměru 6,5 × 10 m,
                  navržený pro potřeby moderního školství i komunitního života.
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
                    Unikátní variabilita interiéru
                  </div>

                  <p className="softPanelText">
                    Srdcem každé učebny je chytré pódium se zajížděcím schodem,
                    které mění prostor podle vašich potřeb.
                  </p>

                  <div className="modeGrid" style={{ marginTop: 18 }}>
                    <div className="miniCard">
                      <div className="miniTitle">Režim Auditorium</div>
                      <div className="miniText">
                        Vysunutím schodu vytvoříte kaskádovité sezení – ideální
                        pro přednášky, promítání nebo debaty.
                      </div>
                    </div>

                    <div className="miniCard">
                      <div className="miniTitle">Režim Volná plocha</div>
                      <div className="miniText">
                        Zasunete schod pod pódium a získáte otevřený prostor pro
                        pohybové aktivity, dílny nebo tvoření.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="visualStack">
                <div className="visualCard visualCardLarge">
                  <img
                    src={classImg}
                    alt="Výuka v učebně ARCHIMEDES®"
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
                    src={techImg}
                    alt="Moderní technologie v učebně ARCHIMEDES®"
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
            <div className="networkGrid">
              <div>
                <SectionEyebrow>Reference</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Síť učeben ARCHIMEDES®
                </SectionTitle>

                <p className="leadText" style={{ marginBottom: 20 }}>
                  ARCHIMEDES® dnes není prototyp. Je to ověřené řešení, které už
                  funguje v reálných školách a obcích. Každá další realizace
                  potvrzuje, že kvalitní vzdělávací prostor může být zároveň
                  krásný, funkční i komunitní.
                </p>

                <div className="referenceGrid">
                  {references.map((item) => (
                    <div key={item} className="referenceCard">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mapCard">
                <img
                  src={mapImg}
                  alt="Mapa sítě učeben ARCHIMEDES®"
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
            padding: "10px 20px 24px",
          }}
        >
          <div className="premiumCard communitySection">
            <div className="communityGrid">
              <div className="communityVisual">
                <img
                  src={communityImg}
                  alt="Komunitní využití učebny ARCHIMEDES®"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16/10",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div>
                <SectionEyebrow>Využití</SectionEyebrow>
                <SectionTitle style={{ fontSize: 42 }}>
                  Jedna stavba. Mnoho možností.
                </SectionTitle>

                <p className="leadText" style={{ marginBottom: 18 }}>
                  ARCHIMEDES® není jen venkovní třída. Je to reprezentativní
                  prostor, který může během týdne sloužit škole a o víkendu nebo
                  odpoledne celé obci.
                </p>

                <div className="bulletList">
                  <div>• pravidelná výuka a projektové dny</div>
                  <div>• workshopy, besedy a setkání s hosty</div>
                  <div>• komunitní akce, slavnosti a letní program</div>
                  <div>• příměstské tábory, tvořivé dílny a prezentace</div>
                </div>

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
                  <SecondaryButton href="/kontakt" tinted>
                    Mám zájem o konzultaci
                  </SecondaryButton>
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
              <SectionEyebrow>Produkty</SectionEyebrow>
              <SectionTitle style={{ fontSize: 48, marginBottom: 0 }}>
                Vyberte si svou variantu
              </SectionTitle>
            </div>

            <PrimaryButton href="/poptavka">
              Potřebuji poradit s výběrem
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
              </div>
            ))}
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
            <SectionEyebrow>Moduly a vybavení</SectionEyebrow>
            <SectionTitle style={{ fontSize: 48 }}>
              Přizpůsobte si učebnu na míru
            </SectionTitle>

            <div className="equipGrid">
              <div className="equipCard">
                <div className="equipTitle">🚻 Nezávislost a hygiena: Modul WC</div>
                <div className="equipText">
                  Každou variantu učebny lze rozšířit o modul sociálního zázemí,
                  který vizuálně dokonale ladí s hlavní stavbou.
                </div>
                <div className="equipList">
                  <div>• Varianta A: 2× WC + technický sklad</div>
                  <div>• Varianta B: 2× WC, z toho jedno plně bezbariérové</div>
                  <div>
                    • Vstup lze řešit vnitřním průchodem z učebny nebo
                    samostatnými dveřmi zvenčí
                  </div>
                </div>
              </div>

              <div className="equipCard">
                <div className="equipTitle">💻 Digitální srdce výuky</div>
                <div className="equipText">
                  Příroda nevylučuje moderní technologie. Učebny ARCHIMEDES® jsou
                  plně vybaveny pro 21. století.
                </div>
                <div className="equipList">
                  <div>• Interaktivní 86&quot; panel pro multidotykovou výuku</div>
                  <div>• Profesionální videobar, projektor, plátno a reproduktory</div>
                  <div>• Kompletní Wi-Fi konektivita</div>
                  <div>
                    • Plnospektrální svítidla věrně simulující denní světlo
                  </div>
                  <div>
                    • Kamerový systém ukrytý v ptačích budkách pro živé
                    pozorování přírody
                  </div>
                </div>
              </div>

              <div className="equipCard equipCardWide">
                <div className="equipTitle">♻️ Udržitelný ekosystém</div>
                <div className="equipText">
                  Prostor, který učí už tím, jak funguje.
                </div>
                <div className="equipList">
                  <div>
                    • Exteriér: zelená stěna, vyvýšené záhony, retenční nádrž
                    pro hospodaření s dešťovou vodou
                  </div>
                  <div>
                    • Příroda zblízka: ptačí krmítka, budky a zázemí pro tříděný
                    odpad
                  </div>
                  <div>
                    • Mobiliář: praktické skládací stoly a lavice pro rychlou
                    změnu uspořádání třídy
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

          .networkGrid,
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

          .visualStack {
            display: grid;
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

          .referenceGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .referenceCard {
            padding: 14px 16px;
            border-radius: 16px;
            background: linear-gradient(
              180deg,
              rgba(248, 250, 252, 1) 0%,
              rgba(242, 246, 250, 1) 100%
            );
            border: 1px solid rgba(15, 23, 42, 0.08);
            font-weight: 800;
            color: #0f172a;
            font-size: 15px;
          }

          .mapCard,
          .communityVisual,
          .mediaVisual,
          .galleryCard {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .bulletList {
            display: grid;
            gap: 10px;
            font-size: 16px;
            line-height: 1.7;
            color: rgba(15, 23, 42, 0.74);
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
            .networkGrid,
            .communityGrid,
            .mediaGrid,
            .variantGrid,
            .equipGrid,
            .galleryGrid {
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

            .modeGrid,
            .referenceGrid {
              grid-template-columns: 1fr;
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
