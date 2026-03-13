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
      <main
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "42px 20px 90px",
        }}
      >
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          {/* HERO */}
          <section
            style={{
              background: "#fff",
              borderRadius: "30px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.02fr 1fr",
                alignItems: "stretch",
              }}
              className="hero-grid"
            >
              <div style={{ padding: "42px 42px 38px" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "#eef2ff",
                    color: "#1e3a8a",
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 18,
                  }}
                >
                  ARCHIMEDES Live
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(36px, 5vw, 62px)",
                    lineHeight: 1.02,
                    color: "#0f172a",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Proběhlá vysílání
                </h1>

                <p
                  style={{
                    margin: "22px 0 0",
                    fontSize: 20,
                    lineHeight: 1.75,
                    color: "#334155",
                    maxWidth: 620,
                  }}
                >
                  Podívejte se na výběr plakátů z vysílání, která už v programu
                  ARCHIMEDES Live proběhla. Stránka slouží jako veřejná ukázka
                  témat, hostů a šíře programu pro školy, obce i komunitu.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginTop: 26,
                    marginBottom: 28,
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #dbe3ef",
                      borderRadius: 20,
                      padding: "18px 20px",
                      minWidth: 170,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#64748b",
                        marginBottom: 8,
                        fontWeight: 700,
                      }}
                    >
                      Plakátů
                    </div>
                    <div
                      style={{
                        fontSize: 34,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "#0f172a",
                      }}
                    >
                      {totalCount}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #dbe3ef",
                      borderRadius: 20,
                      padding: "18px 20px",
                      minWidth: 260,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#64748b",
                        marginBottom: 8,
                        fontWeight: 700,
                      }}
                    >
                      Veřejná ukázka
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        color: "#334155",
                      }}
                    >
                      hostů, témat a programu
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/program" style={primaryButtonStyle}>
                    Zobrazit program
                  </Link>
                  <Link href="/demo" style={secondaryButtonStyle}>
                    Získat přístup
                  </Link>
                </div>
              </div>

              <div style={{ padding: "22px" }}>
                <div
                  style={{
                    borderRadius: "28px",
                    overflow: "hidden",
                    background: "#f8fafc",
                    border: "1px solid #dbe3ef",
                    boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
                    padding: "12px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      height: "100%",
                    }}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        style={{
                          borderRadius: "18px",
                          overflow: "hidden",
                          background: "#e5e7eb",
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
          </section>

          {/* GALERIE */}
          <section style={{ marginTop: 72 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "end",
                justifyContent: "space-between",
                gap: "18px",
                marginBottom: "28px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#1e3a8a",
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
                složky <strong>public</strong> nahrát soubory pojmenované{" "}
                <strong>pl1.webp</strong> až <strong>pl30.webp</strong>.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              {posters.map((poster) => (
                <button
                  key={poster.id}
                  type="button"
                  onClick={() => setActivePoster(poster)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 0,
                    border: "1px solid #e5e7eb",
                    borderRadius: "22px",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 12px 36px rgba(15, 23, 42, 0.08)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 18px 42px rgba(15, 23, 42, 0.13)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 36px rgba(15, 23, 42, 0.08)";
                  }}
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
          </section>

          {/* CTA */}
          <section style={{ marginTop: 84 }}>
            <div
              style={{
                borderRadius: "30px",
                background: "#fff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 18px 46px rgba(15, 23, 42, 0.08)",
                padding: "36px 28px",
                display: "grid",
                gridTemplateColumns: "1.15fr 0.85fr",
                gap: "24px",
                alignItems: "center",
              }}
              className="cta-grid"
            >
              <div>
                <div
                  style={{
                    color: "#1e3a8a",
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
                <Link href="/demo" style={primaryButtonStyle}>
                  Mám zájem o přístup
                </Link>
                <Link href="/ucebna" style={secondaryButtonStyle}>
                  Více o učebně
                </Link>
              </div>
            </div>
          </section>
        </div>
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
        @media (max-width: 1100px) {
          .hero-grid,
          .cta-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .hero-grid > div:first-child {
            padding: 30px 22px 26px !important;
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
  borderRadius: "14px",
  background: "#0f172a",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "16px",
  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "52px",
  padding: "0 20px",
  borderRadius: "14px",
  background: "#fff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "16px",
  border: "1px solid #cbd5e1",
};
