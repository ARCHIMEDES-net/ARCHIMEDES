import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SchoolsMap = dynamic(() => import("../components/SchoolsMap"), {
  ssr: false,
});

const partnerNames = [
  "CzechTrade",
  "ZOO Praha",
  "Magnesia Litera",
  "Akademie věd ČR",
  "Policie ČR",
  "Hasiči ČR",
  "Svaz místních samospráv",
];

const mediaNames = [
  "Česká televize",
  "CzechCrunch",
  "iDNES.cz",
  "Blesk",
];

// Obrázky stejně jako v původní homepage ze ZIPu
const heroImg = "/ucebna.jpg";
const lessonImg = "/vyuka.jpeg";
const guestImg = "/ctenarsky.jpg";
const communityImg = "/smart.jpg";
const kidsImg = "/praxe.webp";

// fallback pouze pro případ, že by API dočasně nevrátilo data
const fallbackPosts = [
  { type: "p", id: "DVqEttcjpu0" },
  { type: "p", id: "DVbsiplCOJ_" },
  { type: "reel", id: "DVvUBXDCMYC" },
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

function WhiteButton({ href, children }) {
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
        background: "white",
        color: "#0f172a",
        fontWeight: 900,
        border: "1px solid rgba(255,255,255,0.2)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 26px rgba(0,0,0,0.16)";
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

function OutlineLightButton({ href, children }) {
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
        border: "1px solid rgba(255,255,255,0.3)",
        color: "white",
        fontWeight: 800,
        background: "transparent",
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

function InstagramEmbed({ id, type }) {
  const src =
    type === "p"
      ? `https://www.instagram.com/p/${id}/embed`
      : `https://www.instagram.com/reel/${id}/embed`;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 26,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <iframe
        src={src}
        width="100%"
        height="470"
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
        style={{ display: "block", width: "100%", background: "white" }}
      />
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
        const res = await fetch("/api/instagram");
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
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 16px 32px" }}>
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
                ARCHIMEDES Live • program + učebna + komunita
              </div>

              <h1
                style={{
                  fontSize: 56,
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                  color: "#0f172a",
                  margin: "0 0 18px",
                }}
              >
                Program, který propojuje
                <br />
                školu a život obce
              </h1>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.55,
                  color: "rgba(15,23,42,0.76)",
                  maxWidth: 700,
                  margin: 0,
                }}
              >
                ARCHIMEDES® propojuje učebnu, živé hosty a program pro děti,
                učitele, seniory i komunitu obce. Škola získává inspirativní výuku,
                obec živý program pro své obyvatele.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 22,
                  maxWidth: 640,
                  color: "#0f172a",
                  fontSize: 17,
                  lineHeight: 1.5,
                }}
              >
                <div>• hosté z Akademie věd, kultury, odborné praxe i ze zahraničí</div>
                <div>• využití pro školu, komunitu obce i společné akce</div>
                <div>• síť reálných učeben ARCHIMEDES® po celé republice</div>
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
                  alt="Venkovní učebna ARCHIMEDES®"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16/10",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: "rgba(15,23,42,0.62)",
                  fontWeight: 700,
                }}
              >
                Venkovní učebna ARCHIMEDES® – reálná realizace v síti projektu
              </div>
            </div>
          </div>
        </section>

        {/* ZDE JSOU MÍSTO TLAČÍTEK A BÍLÝCH BOXŮ 3 POSLEDNÍ INSTAGRAM PŘÍSPĚVKY */}
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px 24px" }}>
          <div
            style={{
              background: "transparent",
              borderRadius: 28,
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                ARCHIMEDES Live v praxi
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Poslední 3 příspěvky z Instagramu
              </div>
            </div>

            <div className="instagramGrid">
              {instagramReady
                ? renderedPosts.map((post, index) => (
                    <InstagramEmbed
                      key={`${post.type}-${post.id}-${index}`}
                      id={post.id}
                      type={post.type}
                    />
                  ))
                : fallbackPosts.map((post, index) => (
                    <InstagramEmbed
                      key={`${post.type}-${post.id}-${index}`}
                      id={post.id}
                      type={post.type}
                    />
                  ))}
            </div>
          </div>
        </section>

        {/* ZDE JE MÍSTO DVOU BĚŽÍCÍCH LIŠT MAPA */}
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "6px 16px 22px" }}>
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "28px 24px",
              boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                Síť učeben ARCHIMEDES®
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Učebny už fungují v konkrétních městech a obcích
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                overflow: "hidden",
                minHeight: 440,
              }}
            >
              <SchoolsMap />
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 18px" }}>
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
                Jak vypadá jedna hodina
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
                1 třída – 1 živý vstup – 1 pracovní list
              </div>
            </div>
          </div>

          <div className="howGrid">
            <InfoCard
              number="1"
              title="Živý vstup s hostem"
              text="Děti se připojí do programu a setkají se s odborníkem, autorem nebo inspirativní osobností."
            />
            <InfoCard
              number="2"
              title="Pracovní list a navázání ve třídě"
              text="Škola dostává materiály, které může využít okamžitě ve výuce nebo při navazující aktivitě."
            />
            <InfoCard
              number="3"
              title="Přínos i pro obec"
              text="Stejná platforma může nabízet program také seniorům, komunitě a veřejným akcím v obci."
            />
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 16px 18px" }}>
          <div className="dualGrid">
            <div
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
              }}
            >
              <img
                src={lessonImg}
                alt="Ukázka programu ARCHIMEDES®"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "16/10",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Program, který lze využít okamžitě
                </div>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.72)",
                  }}
                >
                  Škola i obec získávají pravidelný program bez složité přípravy.
                  Stačí se připojit a využít připravený obsah.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
              }}
            >
              <img
                src={kidsImg}
                alt="Hosté v programu ARCHIMEDES®"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "16/10",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Děti se setkávají s lidmi z praxe
                </div>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.72)",
                  }}
                >
                  V programu se propojuje škola s vědou, kulturou, veřejným životem
                  i odbornými partnery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 16px 20px" }}>
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "26px 24px",
              boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>
                  Program ARCHIMEDES Live
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 16,
                    color: "rgba(15,23,42,0.68)",
                  }}
                >
                  Ukázka formátů, které dávají smysl škole i komunitě obce.
                </div>
              </div>
              <PrimaryButton href="/program">Zobrazit program</PrimaryButton>
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
        </section>

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 16px 12px" }}>
          <div className="miniTrust">
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                Partneři projektu
              </div>
              <div className="chipRow">
                {partnerNames.map((name) => (
                  <span key={name} className="chip">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                Média
              </div>
              <div className="chipRow">
                {mediaNames.map((name) => (
                  <span key={name} className="chip">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 16px 70px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
              color: "white",
              borderRadius: 30,
              padding: "34px 28px",
              boxShadow: "0 26px 60px rgba(15,23,42,0.18)",
            }}
          >
            <div className="ctaGrid">
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    opacity: 0.78,
                    marginBottom: 10,
                  }}
                >
                  Chcete ukázku pro školu nebo obec?
                </div>
                <div
                  style={{
                    fontSize: 38,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ukážeme vám program i učebnu
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 18,
                    lineHeight: 1.6,
                    opacity: 0.9,
                    maxWidth: 740,
                  }}
                >
                  ARCHIMEDES® prodává licenci programu i samotnou stavbu učebny.
                  Pomůžeme vám vybrat model, který bude dávat smysl právě pro vaši
                  školu nebo obec.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <WhiteButton href="/poptavka">Chci více informací</WhiteButton>
                <OutlineLightButton href="/ucebna">Prohlédnout učebnu</OutlineLightButton>
              </div>
            </div>
          </div>
        </section>

        <style jsx global>{`
          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
            gap: 36px;
            align-items: center;
          }

          .instagramGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .howGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .dualGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .programGrid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }

          .miniTrust {
            display: grid;
            grid-template-columns: 1.3fr 1fr;
            gap: 16px;
            align-items: start;
          }

          .chipRow {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 14px;
            border-radius: 999px;
            background: white;
            border: 1px solid rgba(15,23,42,0.08);
            color: #334155;
            font-weight: 700;
            box-shadow: 0 6px 18px rgba(15,23,42,0.04);
          }

          .ctaGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 20px;
            align-items: center;
          }

          @media (max-width: 1100px) {
            .heroGrid,
            .dualGrid,
            .miniTrust,
            .ctaGrid,
            .instagramGrid {
              grid-template-columns: 1fr;
            }

            .programGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 760px) {
            .howGrid,
            .programGrid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </div>
  );
}

function InfoCard({ number, title, text }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 26,
        padding: 22,
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "#0f172a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          marginBottom: 16,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 22,
          lineHeight: 1.15,
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 16,
          lineHeight: 1.6,
          color: "rgba(15,23,42,0.72)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function ProgramCard({ title, text, img }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: "100%",
          display: "block",
          aspectRatio: "4/3",
          objectFit: "cover",
        }}
      />
      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 21,
            lineHeight: 1.15,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 15,
            lineHeight: 1.55,
            color: "rgba(15,23,42,0.7)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
