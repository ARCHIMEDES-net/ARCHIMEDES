import { useMemo, useState } from "react";
import Link from "next/link";

const posters = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  src: `/pl${i + 1}.webp`,
  alt: `Plakát ARCHIMEDES Live ${i + 1}`,
  label: `Plakát ${i + 1}`,
}));

export default function ProbehlaVysilaniPage() {
  const [activePoster, setActivePoster] = useState(null);
  const totalCount = useMemo(() => posters.length, []);

  return (
    <>
      <main style={{ background: "#f7f8fb", minHeight: "100vh" }}>
        <section
          style={{
            background:
              "linear-gradient(135deg, #173b77 0%, #214a8c 45%, #102c58 100%)",
            color: "#fff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "72px 24px 64px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                marginBottom: "18px",
              }}
            >
              ARCHIMEDES Live
            </div>

            <div className="hero-grid">
              <div>
                <h1
                  style={{
                    margin: "0 0 18px",
                    fontSize: "clamp(36px, 5vw, 60px)",
                    lineHeight: 1.05,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Proběhlá vysílání
                </h1>

                <p
                  style={{
                    margin: "0 0 22px",
                    fontSize: "clamp(18px, 2vw, 22px)",
                    lineHeight: 1.55,
                    maxWidth: "760px",
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  Podívejte se na výběr plakátů z vysílání, která už v programu
                  ARCHIMEDES Live proběhla. Stránka slouží jako veřejná ukázka
                  témat, hostů a šíře programu pro školy, obce i komunitu.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "14px",
                    marginBottom: "26px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: "18px",
                      padding: "16px 18px",
                      minWidth: "180px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.72)",
                        marginBottom: "6px",
                      }}
                    >
                      Plakátů
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: 800 }}>
                      {totalCount}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: "18px",
                      padding: "16px 18px",
                      minWidth: "220px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.72)",
                        marginBottom: "6px",
                      }}
                    >
                      Veřejná ukázka
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>
                      hostů, témat a programu
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <Link href="/program" style={primaryButtonStyle}>
                    Zobrazit program
                  </Link>
                  <Link href="/poptavka" style={secondaryButtonStyle}>
                    Získat přístup
                  </Link>
                </div>
              </div>

              <div>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "28px",
                    overflow: "hidden",
                    boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.08)",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        style={{
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.06)",
                          aspectRatio: "3 / 4",
                        }}
                      >
                        <img
                          src={`/pl${n}.webp`}
                          alt={`Ukázkový plakát ${n}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "40px 24px 24px",
            }}
          >
            <div className="section-head">
              <div>
                <div
                  style={{
                    color: "#173b77",
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Galerie plakátů
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(28px, 4vw, 42px)",
                    lineHeight: 1.1,
                    color: "#0f172a",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Přehled proběhlých vysílání
                </h2>
              </div>

              <p
                style={{
                  margin: 0,
                  maxWidth: "560px",
                  fontSize: "17px",
                  lineHeight: 1.65,
                  color: "#475569",
                }}
              >
                Kliknutím na libovolný plakát otevřete větší náhled. Stačí do
                složky <strong>public</strong> nahrát soubory pojmenované
                <strong> pl1.webp</strong> až <strong>pl30.webp</strong>.
              </p>
            </div>

            <div className="poster-grid">
              {posters.map((poster) => (
                <button
                  key={poster.id}
                  type="button"
                  onClick={() => setActivePoster(poster)}
                  className="poster-card"
                >
                  <div
                    style={{
                      background: "#eef2ff",
                      aspectRatio: "3 / 4",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={poster.src}
                      alt={poster.alt}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div style={{ padding: "14px 16px 16px" }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#0f172a",
                        fontSize: "16px",
                        marginBottom: "6px",
                      }}
                    >
                      {poster.label}
                    </div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      Otevřít větší náhled
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "56px 24px 80px",
            }}
          >
            <div className="cta-box">
              <div>
                <div
                  style={{
                    color: "#173b77",
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Chcete vidět víc?
                </div>

                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: "clamp(26px, 3vw, 36px)",
                    lineHeight: 1.12,
                    color: "#0f172a",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Kompletní archiv je určen pro zapojené školy a obce
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    lineHeight: 1.7,
                    color: "#475569",
                    maxWidth: "720px",
                  }}
                >
                  Tato stránka ukazuje veřejný výběr proběhlých vysílání.
                  Kompletní záznamy, navazující obsah a přístup do portálu jsou
                  součástí programu ARCHIMEDES Live pro školy, obce a další
                  partnery.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/poptavka" style={primaryButtonStyle}>
                  Mám zájem o přístup
                </Link>
                <Link href="/ucebna" style={ghostButtonStyle}>
                  Více o učebně
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {activePoster && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePoster(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(92vw, 860px)",
              maxHeight: "90vh",
              borderRadius: "24px",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 30px 100px rgba(0,0,0,0.35)",
            }}
          >
            <button
              type="button"
              onClick={() => setActivePoster(null)}
              aria-label="Zavřít"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                zIndex: 2,
                border: "none",
                width: "44px",
                height: "44px",
                borderRadius: "999px",
                background: "rgba(15, 23, 42, 0.72)",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div style={{ background: "#f8fafc" }}>
              <img
                src={activePoster.src}
                alt={activePoster.alt}
                style={{
                  display: "block",
                  width: "100%",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  background: "#f8fafc",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 36px;
          align-items: center;
        }

        .section-head {
          display: flex;
          flex-wrap: wrap;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 28px;
        }

        .poster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .poster-card {
          display: block;
          width: 100%;
          padding: 0;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
          cursor: pointer;
          text-align: left;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .poster-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 42px rgba(15, 23, 42, 0.13);
        }

        .cta-box {
          border-radius: 30px;
          background: linear-gradient(135deg, #ffffff 0%, #eef4ff 50%, #f5f8ff 100%);
          border: 1px solid #dbe5f3;
          box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
          padding: 36px 28px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
          align-items: center;
        }

        @media (max-width: 920px) {
          .hero-grid,
          .cta-box {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "52px",
  padding: "0 20px",
  borderRadius: "999px",
  background: "#ef4444",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "16px",
  boxShadow: "0 14px 28px rgba(239, 68, 68, 0.22)",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "52px",
  padding: "0 20px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "16px",
  border: "1px solid rgba(255,255,255,0.18)",
};

const ghostButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "52px",
  padding: "0 20px",
  borderRadius: "999px",
  background: "#fff",
  color: "#173b77",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "16px",
  border: "1px solid #cfd9ea",
};
