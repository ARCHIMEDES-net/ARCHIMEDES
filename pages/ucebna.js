import Link from "next/link";

const heroImg = "/otevrena.jpg";
const natureImg = "/ucebnavprirode.webp";
const classImg = "/detivetride.webp";
const guestsImg = "/hoste.jpg";

const variants = [
  {
    icon: "🌿",
    title: "ARCHIMEDES OPTIMAL",
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
    title: "ARCHIMEDES OPTIMAL+",
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
    title: "ARCHIMEDES PREMIUM",
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

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
        padding: "0 22px",
        borderRadius: 14,
        background: "#0f172a",
        color: "white",
        fontWeight: 800,
        border: "1px solid #0f172a",
        boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 14px 28px rgba(15,23,42,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.14)";
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
        minHeight: 50,
        padding: "0 22px",
        borderRadius: 14,
        border: tinted
          ? "1px solid rgba(15,23,42,0.12)"
          : "1px solid rgba(15,23,42,0.18)",
        background: tinted ? "rgba(15,23,42,0.04)" : "white",
        color: "#0f172a",
        fontWeight: 800,
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 22px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </Link>
  );
}

export default function Ucebna() {
  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 16px 30px" }}>
          <div className="heroGrid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.06)",
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                ARCHIMEDES® • venkovní učebna pro školy a obce
              </div>

              <h1
                style={{
                  fontSize: 56,
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                  color: "#0f172a",
                  margin: "0 0 16px",
                }}
              >
                Venkovní učebna
                <br />
                ARCHIMEDES®
              </h1>

              <h2
                style={{
                  fontSize: 26,
                  lineHeight: 1.25,
                  color: "#334155",
                  margin: "0 0 18px",
                  fontWeight: 700,
                }}
              >
                Budoucnost vzdělávání v souladu s přírodou.
              </h2>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.55,
                  color: "rgba(15,23,42,0.76)",
                  maxWidth: 700,
                  margin: 0,
                }}
              >
                Inovativní prostor, který dokonale propojuje moderní technologie
                s přirozeným venkovním prostředím. Učte se a tvořte na čerstvém
                vzduchu.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 28,
                }}
              >
                <PrimaryButton href="#varianty">Vybrat variantu</PrimaryButton>
                <SecondaryButton href="/kontakt">
                  Prohlédnout vzorovou učebnu
                </SecondaryButton>
              </div>
            </div>

            <div>
              <div
                style={{
                  borderRadius: 26,
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
                  background: "white",
                }}
              >
                <img
                  src={heroImg}
                  alt="Venkovní učebna ARCHIMEDES® v krajině"
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

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "10px 16px 18px" }}>
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "28px 24px",
              boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            }}
          >
            <div className="sectionGrid">
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "rgba(15,23,42,0.56)",
                    marginBottom: 8,
                  }}
                >
                  O projektu
                </div>
                <div
                  style={{
                    fontSize: 36,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                    marginBottom: 16,
                  }}
                >
                  Prostor, který inspiruje
                </div>

                <p
                  style={{
                    fontSize: 18,
                    lineHeight: 1.75,
                    color: "rgba(15,23,42,0.74)",
                    margin: 0,
                  }}
                >
                  Přeneste výuku ven, aniž byste slevili z komfortu a
                  technologických možností klasické třídy. ARCHIMEDES® je
                  certifikovaný systém venkovních učeben o rozměru 6,5 × 10 m,
                  navržený pro potřeby moderního školství i komunitního života.
                </p>

                <div
                  style={{
                    marginTop: 24,
                    padding: 22,
                    borderRadius: 22,
                    background: "#f8fafc",
                    border: "1px solid rgba(15,23,42,0.07)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: "#0f172a",
                      marginBottom: 12,
                    }}
                  >
                    Unikátní variabilita interiéru
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: "rgba(15,23,42,0.72)",
                    }}
                  >
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
                <div className="visualCard">
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
                    src={natureImg}
                    alt="Učebna ARCHIMEDES® v přírodě"
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
          id="varianty"
          style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 18px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                Produkty
              </div>
              <div
                style={{
                  fontSize: 36,
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Vyberte si svou variantu
              </div>
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

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 70px" }}>
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "28px 24px",
              boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "rgba(15,23,42,0.56)",
                marginBottom: 8,
              }}
            >
              Moduly a vybavení
            </div>

            <div
              style={{
                fontSize: 36,
                lineHeight: 1.08,
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                marginBottom: 18,
              }}
            >
              Přizpůsobte si učebnu na míru
            </div>

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

            <div className="bottomVisual" style={{ marginTop: 24 }}>
              <img
                src={guestsImg}
                alt="Hosté a komunitní využití učebny ARCHIMEDES®"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "16/8",
                  objectFit: "cover",
                  borderRadius: 22,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <PrimaryButton href="/poptavka">Chci navrhnout řešení</PrimaryButton>
              <SecondaryButton href="/kontakt" tinted>
                Domluvit návštěvu učebny
              </SecondaryButton>
            </div>
          </div>
        </section>

        <style jsx global>{`
          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
            gap: 36px;
            align-items: center;
          }

          .sectionGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
            gap: 26px;
            align-items: start;
          }

          .visualStack {
            display: grid;
            gap: 16px;
          }

          .visualCard {
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 34px rgba(15,23,42,0.06);
            border: 1px solid rgba(15,23,42,0.08);
          }

          .modeGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .miniCard {
            background: white;
            border: 1px solid rgba(15,23,42,0.08);
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
            color: rgba(15,23,42,0.72);
          }

          .variantGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .variantCard {
            background: white;
            border: 1px solid rgba(15,23,42,0.08);
            border-radius: 26px;
            padding: 22px;
            box-shadow: 0 10px 30px rgba(15,23,42,0.05);
          }

          .variantHead {
            display: flex;
            gap: 14px;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .variantIcon {
            font-size: 28px;
            line-height: 1;
          }

          .variantTitle {
            font-size: 24px;
            line-height: 1.15;
            font-weight: 900;
            color: #0f172a;
          }

          .variantSubtitle {
            margin-top: 6px;
            font-size: 15px;
            line-height: 1.45;
            color: rgba(15,23,42,0.62);
            font-weight: 700;
          }

          .variantText {
            margin: 0 0 14px;
            font-size: 16px;
            line-height: 1.7;
            color: rgba(15,23,42,0.74);
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
            line-height: 1.65;
            color: rgba(15,23,42,0.72);
          }

          .equipGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .equipCard {
            background: #f8fafc;
            border: 1px solid rgba(15,23,42,0.07);
            border-radius: 22px;
            padding: 22px;
          }

          .equipCardWide {
            grid-column: 1 / -1;
          }

          .equipTitle {
            font-size: 24px;
            line-height: 1.2;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 10px;
          }

          .equipText {
            font-size: 16px;
            line-height: 1.7;
            color: rgba(15,23,42,0.74);
            margin-bottom: 12px;
          }

          .equipList {
            display: grid;
            gap: 8px;
            font-size: 15px;
            line-height: 1.65;
            color: rgba(15,23,42,0.72);
          }

          @media (max-width: 1100px) {
            .heroGrid,
            .sectionGrid,
            .variantGrid,
            .equipGrid {
              grid-template-columns: 1fr;
            }

            .equipCardWide {
              grid-column: auto;
            }
          }

          @media (max-width: 760px) {
            .modeGrid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
