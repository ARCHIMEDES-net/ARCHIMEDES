import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const FALLBACK_POSTER = "/ucebna-exterier.webp";

const schoolItems = [
  {
    title: "I. stupeň – Objevujeme svět",
    text: "poznávání světa, přírody a společnosti ve spolupráci s odborníky a inspirativními partnery",
  },
  {
    title: "II. stupeň – Svět v souvislostech",
    text: "aktuální témata, rozhovory a exkurze v angličtině ze zahraničí, výuka živě z praxe",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "setkání s lidmi z praxe a inspirace pro další studium i životní směřování",
  },
  {
    title: "Wellbeing – Generace Z navigátor",
    text: "duševní zdraví, bezpečné klima ve třídě a témata důležitá pro dnešní žáky",
  },
];

const seniorItems = [
  {
    title: "Senior klub",
    text: "interaktivní rozhovory s inspirativními hosty, aktuální témata, vzdělávání, partnerství, setkávání s jinými seniory a krajanskými spolky",
  },
  {
    title: "Čtenářský klub",
    text: "společné čtení a živé debaty s autory knih",
  },
  {
    title: "Akademie třetího věku",
    text: "digitální gramotnost, zdraví a orientace v současném světě",
    note: "připravujeme",
  },
];

const communityItems = [
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
    text: "sdílení dobré praxe, inspirace a témata pro rozvoj obce a komunitního života, výrazná podpora živé spolupráce s partnerskými městy",
  },
];

const cultureItems = [
  {
    title: "Filmový klub s Aerofilms",
    text: "výběr kvalitních filmů s úvodem hostů a možností společného zážitku v obci",
  },
  {
    title: "Mimořádné tematické vstupy",
    text: "výročí, aktuální události, sezónní programy a speciální hosté, živé interaktivní vysílání z aktuálních akcí a další aktivity, podporující posílení komunity",
  },
];

const priceCards = [
  {
    title: "Program pro školu a obec",
    price: "2 890 Kč",
    suffix: "/ měsíc",
    badge: "doporučená varianta",
    description:
      "Nejkomplexnější varianta pro školy a obce, které chtějí během roku využívat školní program, senior klub i komunitní část.",
    items: [
      "živá vysílání pro školy",
      "program pro seniory a komunitu",
      "přístup k archivu vysílání",
    ],
  },
  {
    title: "Škola",
    price: "1 990 Kč",
    suffix: "/ měsíc",
    badge: "samostatný formát",
    description:
      "Samostatná varianta pro školy, které chtějí pravidelně využívat živé vstupy pro výuku a práci s třídou.",
    items: [
      "živá vysílání pro I. a II. stupeň",
      "vhodné i jako startovní varianta",
      "pravidelný obsah během školního roku",
    ],
  },
  {
    title: "Senior klub",
    price: "490 Kč",
    suffix: "/ měsíc",
    badge: "pro seniory",
    description:
      "Pravidelný program pro seniory s inspirativními hosty, setkáváním a tématy pro každodenní život v obci.",
    items: [
      "pravidelné setkávání během roku",
      "vhodné i pro menší obce a komunitní skupiny",
    ],
  },
  {
    title: "Komunitní program",
    price: "490 Kč",
    suffix: "/ měsíc",
    badge: "pro komunitu",
    description:
      "Program pro obec, spolky a veřejnost zaměřený na komunitní setkávání, tematické vstupy a místní život.",
    items: [
      "kulturní a komunitní rozměr",
      "mimořádné tematické vstupy a speciály",
    ],
  },
];

function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div
      style={{
        maxWidth: 840,
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

function SecondaryButton({ href, children }) {
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
        background: "#fff",
        color: "#0f172a",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        border: "1px solid #cbd5e1",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {children}
    </Link>
  );
}

function ProgramCard({ color, title, intro, items }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${color}33`,
        borderRadius: 24,
        padding: 28,
        boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          marginBottom: 14,
        }}
      >
        {title}
      </div>

      <p
        style={{
          margin: "0 0 18px",
          fontSize: 17,
          lineHeight: 1.65,
          color: "#334155",
        }}
      >
        {intro}
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {items.map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: color,
                marginTop: 9,
                flex: "0 0 auto",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                  fontSize: 16,
                  lineHeight: 1.45,
                }}
              >
                {item.title}
                {item.note ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontWeight: 700,
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    ({item.note})
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  marginTop: 2,
                  color: "#475569",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceCard({
  title,
  price,
  suffix,
  badge,
  description,
  items,
  featured,
  href = "/poptavka",
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        height: "100%",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 28,
          border: featured ? "2px solid #2563eb" : "1px solid #e2e8f0",
          boxShadow: featured
            ? "0 18px 46px rgba(37,99,235,0.12)"
            : "0 14px 36px rgba(15,23,42,0.06)",
          minHeight: "100%",
          cursor: "pointer",
          transition:
            "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = featured
            ? "0 24px 56px rgba(37,99,235,0.16)"
            : "0 18px 40px rgba(15,23,42,0.10)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = featured
            ? "0 18px 46px rgba(37,99,235,0.12)"
            : "0 14px 36px rgba(15,23,42,0.06)";
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 34,
            padding: "0 14px",
            borderRadius: 999,
            background: featured ? "#2563eb" : "#f1f5f9",
            color: featured ? "#fff" : "#334155",
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 18,
          }}
        >
          {badge}
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: 21,
            lineHeight: 1.25,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.03em",
            }}
          >
            {price}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#475569",
              marginBottom: 3,
            }}
          >
            {suffix}
          </div>
        </div>

        <p
          style={{
            margin: "16px 0 0",
            color: "#475569",
            fontSize: 16,
            lineHeight: 1.65,
          }}
        >
          {description}
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {items.map((item) => (
            <div key={item} style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#2563eb",
                  marginTop: 8,
                  flex: "0 0 auto",
                }}
              />
              <div
                style={{
                  color: "#334155",
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                {item}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 46,
            padding: "0 16px",
            borderRadius: 12,
            background: featured ? "#2563eb" : "#f8fafc",
            color: featured ? "#ffffff" : "#0f172a",
            border: featured ? "1px solid #2563eb" : "1px solid #cbd5e1",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          Mám zájem o tuto variantu →
        </div>
      </div>
    </Link>
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

  if (event.poster_url && isAbsoluteUrl(event.poster_url)) {
    return event.poster_url;
  }

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

function UpcomingEventItem({ event }) {
  const badges = Array.isArray(event.audience_groups) ? event.audience_groups : [];

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
    >
      <img
        src={getPosterUrl(event)}
        alt={event.title || "Plakát vysílání"}
        style={{
          width: 88,
          height: 118,
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

      <div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: "#64748b",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {formatEventDate(event.starts_at)}
        </div>

        <div
          style={{
            fontSize: 19,
            lineHeight: 1.32,
            color: "#0f172a",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {event.title}
        </div>

        {event.category ? (
          <div style={{ marginTop: 10 }}>
            <EventBadge>{event.category}</EventBadge>
          </div>
        ) : null}

        {badges.length ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 10,
            }}
          >
            {badges.slice(0, 4).map((badge, i) => (
              <EventBadge
                key={`${badge}-${i}`}
                variant={badge === "Komunita" ? "accent" : "default"}
              >
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

export default function ProgramPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUpcomingEvents() {
      setEventsLoading(true);

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, starts_at, poster_url, poster_path, audience_groups, category, is_published"
        )
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
                  Živý program pro školu a obec
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
                  Živý program pro školu,
                  <br />
                  seniory a komunitu obce
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
                  ARCHIMEDES Live přináší během roku živá interaktivní vysílání, inspirativní
                  hosty a pravidelný obsah pro výuku, seniory i komunitní život obce.
                </p>

                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 18,
                    lineHeight: 1.72,
                    color: "#475569",
                    maxWidth: 620,
                  }}
                >
                  Jednoduchý způsob, jak dát škole i obci smysluplný program, který běží
                  pravidelně a je snadné ho využívat.
                </p>

                <p
                  style={{
                    margin: "18px 0 0",
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "#64748b",
                    maxWidth: 620,
                  }}
                >
                  Program vzniká ve spolupráci se školami, obcemi a partnery zapojenými do
                  sítě ARCHIMEDES.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(220px, max-content))",
                    gap: 14,
                    marginTop: 30,
                    alignItems: "stretch",
                  }}
                  className="hero-cta-grid"
                >
                  <PrimaryButton href="/aktualni-pozvanky">Aktuální pozvánky</PrimaryButton>
                  <SecondaryButton href="/demo">Mám zájem o demo</SecondaryButton>
                  <SecondaryButton href="#zapojeni">Ceník programů</SecondaryButton>
                  <SecondaryButton href="/financovani-skoly">
                    Pro školy – financování z OP JAK
                  </SecondaryButton>
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
                    maxHeight: 640,
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
                      <UpcomingEventItem key={event.id} event={event} />
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

          <section style={{ marginTop: 72 }}>
            <SectionTitle
              title="Hlavní rubriky programu"
              text="Součástí ARCHIMEDES Live jsou živé vstupy pro výuku, program pro seniory i komunitní formáty, které může škola a obec využívat během celého roku."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 22,
                marginTop: 24,
              }}
              className="program-grid"
            >
              <ProgramCard
                color="#3b82f6"
                title="Pro školy"
                intro="Pravidelný program pro výuku, který přináší inspirativní témata a hosty z praxe."
                items={schoolItems}
              />
              <ProgramCard
                color="#f59e0b"
                title="Pro seniory a aktivní stárnutí"
                intro="Klidný, srozumitelný a lidský formát, který vytváří pravidelná setkávání a dává obci další přirozený program."
                items={seniorItems}
              />
              <ProgramCard
                color="#22c55e"
                title="Pro komunitu a rozvoj obce"
                intro="Program, který propojuje školu, obec a místní komunitu a dává vedení obce konkrétní obsah pro celý rok."
                items={communityItems}
              />
              <ProgramCard
                color="#a855f7"
                title="Letní speciál a kultura"
                intro="Kulturní a sezónní formáty, které z programu dělají i společenskou a komunitní událost."
                items={cultureItems}
              />
            </div>
          </section>

          <section id="zapojeni" style={{ marginTop: 84 }}>
            <SectionTitle
              eyebrow="Zapojení do programu"
              title="Jakou variantu programu můžete využít"
              text="Nejčastěji školy a obce volí společnou variantu, která propojuje školní program, senior klub i komunitní část. Menší formáty lze využít i samostatně."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 22,
                marginTop: 24,
              }}
              className="price-grid"
            >
              {priceCards.map((card, idx) => {
                let href = "/poptavka";

                if (card.title === "Program pro školu a obec") {
                  href = "/poptavka?interest=program-obec";
                } else if (card.title === "Škola") {
                  href = "/poptavka?interest=skola";
                } else if (card.title === "Senior klub") {
                  href = "/poptavka?interest=senior";
                } else if (card.title === "Komunitní program") {
                  href = "/poptavka?interest=komunita";
                }

                return (
                  <PriceCard
                    key={card.title}
                    {...card}
                    featured={idx === 0}
                    href={href}
                  />
                );
              })}
            </div>

            <div
              style={{
                marginTop: 26,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 22,
                padding: "24px 22px",
                boxShadow: "0 14px 36px rgba(15,23,42,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <div style={{ maxWidth: 720 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.3,
                  }}
                >
                  Nejste si jistí, která varianta je pro vás vhodná?
                </div>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "#475569",
                  }}
                >
                  Nejrychlejší je vidět program naživo nebo se krátce poradit podle toho,
                  zda řešíte školu, obec, seniory nebo kombinaci více formátů.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <PrimaryButton href="/demo">Chci vidět demo</PrimaryButton>
                <SecondaryButton href="/poptavka">
                  Chci doporučit vhodnou variantu
                </SecondaryButton>
              </div>
            </div>
          </section>

          <section
            style={{
              marginTop: 86,
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 28,
              padding: "34px 30px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              boxShadow: "0 24px 60px rgba(15,23,42,0.20)",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                Nejlepší způsob, jak program poznat, je vidět ho naživo
              </h2>
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 18,
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Během pár minut se sami přesvědčíte, jak ARCHIMEDES Live dokáže oživit
                výuku ve škole i společenské dění v obci.
              </p>
            </div>

            <PrimaryButton href="/demo">Mám zájem o demo</PrimaryButton>
          </section>
        </div>
      </main>

      <style jsx>{`
        .hero-cta-grid :global(a) {
          width: 100%;
        }

        .hero-cta-grid :global(a:hover) {
          transform: translateY(-1px);
        }

        .upcoming-events-list::-webkit-scrollbar {
          width: 8px;
        }

        .upcoming-events-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        @media (max-width: 1100px) {
          .program-grid,
          .price-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .hero-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-cta-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .upcoming-events-list {
            max-height: none !important;
          }
        }

        @media (max-width: 760px) {
          .program-grid,
          .price-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-grid > div:first-child {
            padding: 30px 22px 26px !important;
          }

          .hero-cta-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 560px) {
          .upcoming-events-list :global(img) {
            width: 76px !important;
            height: 104px !important;
          }
        }
      `}</style>
    </>
  );
}
