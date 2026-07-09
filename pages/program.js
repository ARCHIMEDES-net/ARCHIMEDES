import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const FALLBACK_POSTER = "/ucebna-exterier.webp";
const MAY_PROGRAM_IMAGE = "/Program.jpg";

const schoolItems = [
  {
    title: "Živé vysílání pro I. stupeň ZŠ",
    text: "poznávání světa, přírody a společnosti ve spolupráci s odborníky a inspirativními partnery",
  },
  {
    title: "Živé vysílání pro II. stupeň ZŠ",
    text: "aktuální témata, rozhovory a exkurze v angličtině ze zahraničí, výuka živě z praxe",
  },
  {
    title: "Wellbeing žáků",
    text: "duševní zdraví, bezpečné klima ve třídě a témata důležitá pro dnešní žáky",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "setkání s lidmi z praxe a inspirace pro další studium i životní směřování",
  },
  {
    title: "Čtenářský klub Magnesia Litera",
    text: "společné čtení a živé debaty s autory knih a osobnostmi spojenými s literaturou",
  },
  {
    title: "Živý rozhovor s hostem v angličtině",
    text: "inspirativní vstupy ze zahraničí a přirozený kontakt s jazykem v reálném kontextu",
  },
  {
    title: "Možnost vysílání přímo z vaší školy",
    text: "škola může být aktivní součástí programu a zapojit se i jako místo živého vstupu",
  },
];

const communityItems = [
  {
    title: "Senior klub",
    text: "interaktivní rozhovory s inspirativními hosty, aktuální témata, vzdělávání, partnerství a pravidelná setkávání",
  },
  {
    title: "Čtenářský klub",
    text: "společné čtení a živé debaty s autory knih",
  },
  {
    title: "Vzdělávání dobrovolných hasičů",
    text: "praktický obsah a online vstupy využitelné pro místní jednotky i vedení obce",
  },
  {
    title: "Smart City klub",
    text: "program pro deváťáky a mladé lidi, kteří chtějí přemýšlet o budoucnosti své obce",
  },
  {
    title: "Servis pro zastupitele a komunitu",
    text: "sdílení dobré praxe, inspirace a témata pro rozvoj obce a komunitního života",
  },
  {
    title: "Letní filmový klub s Aerofilms",
    text: "výběr kvalitních filmů s úvodem hostů a možností společného zážitku v obci",
  },
];

const programBlocks = [...schoolItems, ...communityItems];

function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: center ? "0 auto 28px" : "0 0 28px",
        textAlign: center ? "center" : "left",
      }}
    >
      {eyebrow ? (
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 999,
            background: "#eef2ff",
            color: "#1e3a8a",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>
      ) : null}

      <h2
        style={{
          margin: 0,
          fontSize: "clamp(30px, 4vw, 48px)",
          lineHeight: 1.08,
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>

      {text ? (
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 18,
            lineHeight: 1.7,
            color: "#475569",
          }}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        padding: "0 22px",
        borderRadius: 14,
        background: "#0f172a",
        color: "#fff",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        boxShadow: "0 14px 34px rgba(15,23,42,0.16)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {children}
    </Link>
  );
}

function ProgramBlockCard({ title, text }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 22,
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16.5, lineHeight: 1.4 }}>
        {title}
      </div>
      <div style={{ marginTop: 8, color: "#475569", fontSize: 15, lineHeight: 1.65 }}>
        {text}
      </div>
    </div>
  );
}

function formatEventDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function getPosterUrl(event) {
  if (!event) return FALLBACK_POSTER;

  if (event.poster_url && isAbsoluteUrl(event.poster_url)) return event.poster_url;

  if (event.poster_url && typeof event.poster_url === "string") {
    const normalizedPosterUrl = event.poster_url.replace(/^\/+/, "");
    const { data } = supabase.storage.from("posters").getPublicUrl(normalizedPosterUrl);
    return data?.publicUrl || FALLBACK_POSTER;
  }

  if (event.poster_path && typeof event.poster_path === "string") {
    const normalizedPosterPath = event.poster_path.replace(/^\/+/, "");
    const { data } = supabase.storage.from("posters").getPublicUrl(normalizedPosterPath);
    return data?.publicUrl || FALLBACK_POSTER;
  }

  return FALLBACK_POSTER;
}

function EventBadge({ children, variant = "default" }) {
  const styles = {
    default: {
      background: "#f1f5f9",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
    accent: {
      background: "#f3e8ff",
      color: "#7c3aed",
      border: "1px solid #e9d5ff",
    },
  };

  const style = styles[variant] || styles.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 28,
        padding: "0 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function UpcomingEventItem({ event, onPosterClick }) {
  const badges = Array.isArray(event.audience_groups) ? event.audience_groups : [];
  const posterUrl = getPosterUrl(event);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        gap: 14,
        alignItems: "start",
        padding: 14,
        borderRadius: 20,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 26px rgba(15,23,42,0.05)",
      }}
      className="upcoming-event-item"
    >
      <button
        type="button"
        onClick={() =>
          onPosterClick({
            src: posterUrl,
            alt: event.title || "Plakát vysílání",
          })
        }
        title="Zvětšit plakát"
        style={{
          padding: 0,
          border: 0,
          background: "transparent",
          cursor: "zoom-in",
          width: 88,
          height: 118,
          borderRadius: 14,
          overflow: "hidden",
          display: "block",
          boxShadow: "0 8px 18px rgba(15,23,42,0.10)",
        }}
      >
        <img
          src={posterUrl}
          alt={event.title || "Plakát vysílání"}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 14,
            objectFit: "cover",
            display: "block",
            background: "#e2e8f0",
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
      </button>

      <div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
          {formatEventDate(event.starts_at)}
        </div>

        <div style={{ fontSize: 19, lineHeight: 1.32, color: "#0f172a", fontWeight: 800, letterSpacing: "-0.02em" }}>
          {event.title}
        </div>

        {event.category ? (
          <div style={{ marginTop: 10 }}>
            <EventBadge>{event.category}</EventBadge>
          </div>
        ) : null}

        {badges.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {badges.slice(0, 4).map((badge, i) => (
              <EventBadge key={`${badge}-${i}`} variant={badge === "Komunita" ? "accent" : "default"}>
                {badge}
              </EventBadge>
            ))}
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <Link
            href="/start"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 40,
              padding: "0 14px",
              borderRadius: 12,
              background: "#0f172a",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 800,
              boxShadow: "0 10px 22px rgba(15,23,42,0.16)",
            }}
          >
            Odkaz na vysílání
          </Link>
        </div>
      </div>
    </div>
  );
}

function CurrentProgramCard({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid #dbeafe",
        borderRadius: 24,
        padding: 16,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(37,99,235,0.12)",
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "118px 1fr",
        gap: 16,
        alignItems: "center",
      }}
      className="current-program-card"
    >
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
        }}
      >
        <img
          src={MAY_PROGRAM_IMAGE}
          alt="Aktuální program květen 2026"
          style={{
            width: "100%",
            height: 150,
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.58) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            background: "#ef4444",
            color: "#fff",
            borderRadius: 999,
            padding: "5px 9px",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          live
        </div>
      </div>

      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "7px 11px",
            borderRadius: 999,
            background: "#dbeafe",
            color: "#1d4ed8",
            fontSize: 13,
            fontWeight: 900,
            marginBottom: 10,
          }}
        >
          Aktuálně
        </div>

        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "clamp(24px, 3vw, 34px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}
        >
          Aktuální program
          <br />
          KVĚTEN 2026
        </h2>

        <p style={{ margin: "10px 0 0", color: "#475569", fontSize: 16, lineHeight: 1.55 }}>
          Kliknutím zobrazíte celý měsíční přehled akcí ve větším náhledu.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginTop: 14,
            minHeight: 42,
            padding: "0 15px",
            borderRadius: 12,
            background: "#0f172a",
            color: "#fff",
            fontSize: 14,
            fontWeight: 900,
            boxShadow: "0 10px 22px rgba(15,23,42,0.16)",
          }}
        >
          Zvětšit program →
        </div>
      </div>
    </button>
  );
}

function ImageModal({ image, onClose }) {
  useEffect(() => {
    if (!image) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.84)",
        padding: "22px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(920px, 96vw)",
          maxHeight: "94vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít náhled"
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            zIndex: 2,
            width: 44,
            height: 44,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.30)",
            background: "#0f172a",
            color: "#fff",
            fontSize: 24,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
          }}
        >
          ×
        </button>

        <img
          src={image.src}
          alt={image.alt || "Zvětšený náhled"}
          style={{
            maxWidth: "100%",
            maxHeight: "94vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
            borderRadius: 18,
            background: "#fff",
            boxShadow: "0 30px 90px rgba(0,0,0,0.42)",
          }}
        />
      </div>
    </div>
  );
}

export default function ProgramPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadUpcomingEvents() {
      setEventsLoading(true);

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, poster_url, poster_path, audience_groups, category, is_published")
        .eq("is_published", true)
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(5);

      if (!mounted) return;

      if (error) {
        console.error("Nepodařilo se načíst nadcházející vysílání:", error);
        setUpcomingEvents([]);
        setEventsLoading(false);
        return;
      }

      setUpcomingEvents(data || []);
      setEventsLoading(false);
    }

    loadUpcomingEvents();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <main
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "42px 20px 90px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <section
            style={{
              background: "#fff",
              borderRadius: 30,
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
              overflow: "hidden",
              padding: 0,
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
                  Živý program pro školu a komunitu
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
                  Co je v programu ARCHIMEDES Live
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
                  Pravidelná živá vysílání a hotový obsah pro školu, seniory,
                  spolky i celou obec — v jedné licenci, po celý rok.
                </p>

                <div
                  style={{
                    display: "flex",
                    marginTop: 30,
                  }}
                  className="hero-cta-grid"
                >
                  <PrimaryButton href="/zadost">
                    Chci program pro naši obec
                  </PrimaryButton>
                </div>

                <div style={{ marginTop: 28 }}>
                  <CurrentProgramCard
                    onOpen={() =>
                      setModalImage({
                        src: MAY_PROGRAM_IMAGE,
                        alt: "Aktuální program květen 2026",
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%)",
                  borderLeft: "1px solid #e2e8f0",
                  padding: "22px 20px 22px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "rgba(15, 23, 42, 0.82)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 16,
                    boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
                  }}
                >
                  Nadcházející vysílání
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 14,
                    maxHeight: 760,
                    overflow: "auto",
                    paddingRight: 4,
                  }}
                  className="upcoming-events-list"
                >
                  {eventsLoading ? (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 20,
                        padding: 18,
                        color: "#64748b",
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      Načítám nadcházející vysílání…
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <UpcomingEventItem
                        key={event.id}
                        event={event}
                        onPosterClick={setModalImage}
                      />
                    ))
                  ) : (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 20,
                        padding: 18,
                        color: "#64748b",
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                    >
                      Aktuálně zde nejsou zveřejněna žádná nadcházející vysílání.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="varianty" style={{ marginTop: 84 }}>
            <SectionTitle
              title="Dvanáct programových bloků pod jednou licencí obce"
              text="Každý blok připravuje ARCHIMEDES Live ve spolupráci s odborníky a partnery — obec jen zapojí zájemce."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
              className="price-grid"
            >
              {programBlocks.map((block) => (
                <ProgramBlockCard key={block.title} {...block} />
              ))}
            </div>
          </section>

          <section id="cena" style={{ marginTop: 64 }}>
            <div
              style={{
                background: "#0f2344",
                borderRadius: 28,
                padding: "40px 36px",
                color: "#ffffff",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(26px, 3.4vw, 36px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                }}
              >
                Jedna licence, jedna cena pro celou obec
              </h2>

              <p
                style={{
                  margin: "18px 0 0",
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.82)",
                  maxWidth: 680,
                }}
              >
                Všech dvanáct bloků je součástí jedné obecní licence za 1 990
                Kč/měsíc — bez příplatků za jednotlivé spolky nebo organizace.
                Podrobnosti a přihlášku najdete na stránce Pro obce.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 26,
                }}
              >
                <Link
                  href="/obec"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    padding: "0 22px",
                    borderRadius: 14,
                    background: "#ffffff",
                    color: "#0f172a",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: 15.5,
                  }}
                >
                  Podrobnosti a ceník
                </Link>

                <Link
                  href="/zadost"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    padding: "0 22px",
                    borderRadius: 14,
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: 15.5,
                  }}
                >
                  Chci program pro naši obec
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ImageModal image={modalImage} onClose={() => setModalImage(null)} />

      <style jsx>{`
        .hero-cta-grid :global(a:hover) {
          transform: translateY(-1px);
        }

        .current-program-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 48px rgba(37, 99, 235, 0.16) !important;
        }

        .upcoming-event-item button:hover img {
          transform: scale(1.04);
        }

        .upcoming-event-item button img {
          transition: transform 0.18s ease;
        }

        .upcoming-events-list::-webkit-scrollbar {
          width: 8px;
        }

        .upcoming-events-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        @media (max-width: 1100px) {
          .price-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            max-width: none !important;
          }

          .hero-grid {
            grid-template-columns: 1fr !important;
          }

          .upcoming-events-list {
            max-height: none !important;
          }
        }

        @media (max-width: 760px) {
          .price-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-grid > div:first-child {
            padding: 30px 22px 26px !important;
          }

          .current-program-card {
            grid-template-columns: 1fr !important;
          }

          .upcoming-event-item {
            grid-template-columns: 78px 1fr !important;
          }

          .upcoming-event-item button {
            width: 78px !important;
            height: 106px !important;
          }
        }
      `}</style>
    </>
  );
}
