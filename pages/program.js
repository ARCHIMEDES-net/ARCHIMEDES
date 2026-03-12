import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "posters";

const pillars = [
  {
    accent: "#5b8def",
    border: "rgba(91,141,239,0.24)",
    soft: "#f8fbff",
    title: "PRO ŠKOLY",
    intro:
      "Pravidelný program pro výuku, inspiraci i témata, která pomáhají škole držet krok se světem.",
    items: [
      {
        strong: "I. stupeň – Objevujeme svět:",
        text: "tvořivost, poznávání světa, spolupráce se zajímavými partnery a čtenářské formáty pro děti.",
      },
      {
        strong: "II. stupeň – Svět v souvislostech:",
        text: "aktuální témata, veřejný prostor, společnost, Evropa a inspirativní hosté z praxe.",
      },
      {
        strong: "Kariérní poradenství jinak:",
        text: "setkání s lidmi z praxe a podpora rozhodování, co dál po škole.",
      },
      {
        strong: "Wellbeing – Generace Z navigátor:",
        text: "duševní zdraví, bezpečné klima ve třídě a podpora žáků 8.–9. tříd.",
      },
      {
        strong: "Speciální formáty:",
        text: "13. komnata VIP, Voices Across Borders a další mimořádné vstupy podle sezóny a tématu.",
      },
    ],
  },
  {
    accent: "#e49b45",
    border: "rgba(228,155,69,0.24)",
    soft: "#fffaf4",
    title: "PRO SENIORY A AKTIVNÍ STÁRNUTÍ",
    intro:
      "Klidný, srozumitelný a lidský formát, který vytváří pravidelná setkání a dává obci další přirozený program.",
    items: [
      {
        strong: "Senior klub:",
        text: "kultivované diskuse, inspirativní hosté a pravidelná setkání, která propojují lidi v obci.",
      },
      {
        strong: "Čtenářský klub:",
        text: "sdílené čtení, doporučené knihy a debaty nad příběhy i tématy života.",
      },
      {
        strong: "Akademie třetího věku:",
        text: "digitální gramotnost, zdraví, orientace v současném světě a praktická témata pro každý den.",
      },
    ],
  },
  {
    accent: "#55b56f",
    border: "rgba(85,181,111,0.24)",
    soft: "#f7fcf8",
    title: "PRO KOMUNITU A ROZVOJ OBCE",
    intro:
      "Program, který propojuje školu, obec a místní komunitu a dává vedení obce konkrétní obsah pro celý rok.",
    items: [
      {
        strong: "Vzdělávání dobrovolných hasičů:",
        text: "odborné vstupy a sdílení dobré praxe pro jednotky i vedení obcí.",
      },
      {
        strong: "Smart City klub:",
        text: "program pro deváťáky a mladé lidi, kteří chtějí přemýšlet o své obci a jejím budoucím rozvoji.",
      },
      {
        strong: "Servis pro zastupitele a komunitu:",
        text: "dobrá praxe, inspirace, mezigenerační propojení a rozvoj místního života.",
      },
    ],
  },
  {
    accent: "#b36ad7",
    border: "rgba(179,106,215,0.24)",
    soft: "#fcf8ff",
    title: "LETNÍ SPECIÁL A KULTURA",
    intro:
      "Sezónní a kulturní formáty, které z programu dělají i společenskou a komunitní událost.",
    items: [
      {
        strong: "Filmový klub s Aerofilms:",
        text: "výběr filmů a moderovaných úvodů, které z učebny nebo komunitního prostoru udělají kulturní místo.",
      },
      {
        strong: "Mimořádné tematické vstupy:",
        text: "aktuální události, významná výročí, sportovní a společenské momenty nebo speciální hosté.",
      },
    ],
  },
];

const teaserCards = [
  {
    title: "Ukázka vysílání pro I. stupeň",
    subtitle: "ZOO Praha – koně",
    description:
      "Krátká ukázka hravého vstupu pro děti z prvního stupně. Přesně ten typ obsahu, který učiteli pomáhá otevřít hodinu živě a srozumitelně.",
    embedUrl: "https://www.youtube.com/embed/yvelfGeL6Jg",
  },
  {
    title: "Angličtina s rodilým mluvčím",
    subtitle: "Paul Wade",
    description:
      "Ukázka formátu, kde děti i učitel vidí angličtinu v přirozené komunikaci. Vhodné jako zpestření výuky i motivace k mluvení.",
    embedUrl: "https://www.youtube.com/embed/bX2y0Uxw-Dg",
  },
  {
    title: "Senior klub",
    subtitle: "prof. Jan Pirk a spisovatel Viktor Špaček",
    description:
      "Ukázka klidného a kultivovaného formátu pro seniory. Rozhovor, který ukazuje, že program může být hodnotný, lidský a atraktivní i mimo školu.",
    embedUrl: "https://www.youtube.com/embed/-VV3PYdWPUo",
  },
];

const pricingCards = [
  {
    title: "Program pro školu a obec",
    price: "2 890 Kč",
    period: "/ měsíc",
    badge: "doporučená varianta",
    accent: "#0f172a",
    items: [
      "živá vysílání pro školu i komunitu",
      "pravidelný program během roku",
      "archiv vybraných záznamů a navazující materiály",
      "jedna přehledná nabídka pro školu, obec i komunitní život",
    ],
  },
  {
    title: "Senior klub",
    price: "1 990 Kč",
    period: "/ měsíc",
    badge: "samostatný formát",
    accent: "#7c4a14",
    items: [
      "pravidelná online setkání pro seniory",
      "kulturní a společenský program",
      "srozumitelný a bezpečný formát",
      "vhodné i pro menší obce a komunity",
    ],
  },
  {
    title: "Jednorázový vstup",
    price: "490 Kč",
    period: "/ vstup",
    badge: "pro jednotlivce",
    accent: "#475569",
    items: [
      "jednorázová účast na vybraném vysílání",
      "vhodné pro zájemce mimo zapojené školy a obce",
      "rychlá cesta, jak si program vyzkoušet",
    ],
  },
  {
    title: "Speciální kulturní formát",
    price: "490 Kč",
    period: "/ vstup",
    badge: "filmový klub a speciály",
    accent: "#7e22ce",
    items: [
      "vybrané kulturní a sezónní vstupy",
      "mimořádné programy pro veřejnost",
      "vhodné jako doplněk během roku",
    ],
  },
];

const benefits = [
  {
    title: "Živé vysílání",
    text: "Pravidelné vstupy s hosty, moderované programy a témata, která škola i obec skutečně využijí.",
  },
  {
    title: "Archiv a ukázky",
    text: "Obsah může sloužit i zpětně – jako inspirace, doplněk výuky nebo kulturní a komunitní program.",
  },
  {
    title: "Navazující materiály",
    text: "Součástí programu jsou pracovní listy a další podklady, které pomáhají učiteli i organizátorům v obci.",
  },
  {
    title: "Demo bez složitosti",
    text: "Veřejná část webu ukazuje hlavní rubriky, ukázky vysílání i orientační podobu programu. Další krok je krátká ukázka naživo.",
  },
];

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePosterPath(path) {
  if (!path) return "";
  let s = String(path).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith(`${BUCKET}/`)) s = s.slice(BUCKET.length + 1);
  if (s.startsWith("/")) s = s.slice(1);
  return s;
}

function publicUrlFromPath(path) {
  const normalized = normalizePosterPath(path);
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(normalized);
  return data?.publicUrl || "";
}

function resolvePosterUrl(row) {
  const directUrl = String(row?.poster_url || "").trim();
  if (directUrl) return directUrl;
  return publicUrlFromPath(row?.poster_path);
}

function EventCard({ event }) {
  const poster = resolvePosterUrl(event);

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
        border: "1px solid rgba(15,23,42,0.08)",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 180,
          background: poster
            ? `center / cover no-repeat url(${poster})`
            : "linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)",
          display: "flex",
          alignItems: "flex-end",
          padding: 16,
        }}
      >
        {event?.category ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "7px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.94)",
              color: "#0f172a",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {event.category}
          </span>
        ) : null}
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ fontSize: 14, color: "#475569", fontWeight: 700 }}>{formatDateTimeCS(event?.starts_at)}</div>
        <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.18, color: "#0f172a" }}>{event?.title || "Bez názvu"}</h3>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.65, fontSize: 15 }}>
          {String(event?.full_description || "").slice(0, 180) || "Podrobnosti programu budou upřesněny."}
          {String(event?.full_description || "").length > 180 ? "…" : ""}
        </p>
        <div style={{ marginTop: "auto" }}>
          <Link
            href={`/portal/udalost/${event.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "0 16px",
              borderRadius: 14,
              textDecoration: "none",
              color: "#0f172a",
              background: "#f8fafc",
              border: "1px solid rgba(15,23,42,0.10)",
              fontWeight: 700,
            }}
          >
            Zobrazit detail
          </Link>
        </div>
      </div>
    </article>
  );
}

function VideoCard({ card }) {
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 24,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#e5e7eb" }}>
        <iframe
          src={card.embedUrl}
          title={card.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: 24, lineHeight: 1.15 }}>{card.title}</h3>
        <div style={{ color: "#b91c1c", fontWeight: 800, marginBottom: 10 }}>{card.subtitle}</div>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.65 }}>{card.description}</p>
      </div>
    </article>
  );
}

export default function ProgramPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("events")
        .select("id,title,starts_at,category,full_description,poster_path,poster_url,is_published")
        .eq("is_published", true)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(3);

      if (!mounted) return;

      if (error) {
        setError(error.message || "Nepodařilo se načíst program.");
        setEvents([]);
        setLoading(false);
        return;
      }

      setEvents(data || []);
      setLoading(false);
    }

    loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const hasEvents = useMemo(() => Array.isArray(events) && events.length > 0, [events]);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f8fafc",
        color: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <main>
        <section
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "56px 16px 24px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: 32,
              padding: "40px 28px",
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
            }}
          >
            <div style={{ maxWidth: 860 }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "#eef2ff",
                  color: "#334155",
                  border: "1px solid rgba(148,163,184,0.20)",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Přehled vysílání a programové nabídky
              </div>
              <h1
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "clamp(36px, 5.4vw, 64px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.045em",
                }}
              >
                Program pro školy,
                <br />
                seniory a komunitu
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: 780,
                  fontSize: 19,
                  lineHeight: 1.72,
                  color: "#475569",
                }}
              >
                ARCHIMEDES Live propojuje živá vysílání, inspirativní hosty, pracovní listy,
                komunitní program a kulturní formáty. Veřejná část ukazuje hlavní rubriky,
                ukázky vysílání i orientační podobu zapojení do programu.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 24,
                }}
              >
                <Link
                  href="/poptavka"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    padding: "0 18px",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "#ffffff",
                    background: "#0f172a",
                    fontWeight: 800,
                  }}
                >
                  Domluvit ukázku programu
                </Link>
                <Link
                  href="#cena-programu"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    padding: "0 18px",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "#0f172a",
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.12)",
                    fontWeight: 700,
                  }}
                >
                  Kolik program stojí
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 16px 20px" }}>
          <div style={{ maxWidth: 940, marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 36, lineHeight: 1.08 }}>Hlavní rubriky a formáty</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: 17, lineHeight: 1.7 }}>
              Program je postavený tak, aby dával smysl škole, seniorům i širší komunitě.
              Není to jedna série vstupů, ale živý celek, který může obec i škola používat
              během celého roku.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 22,
              alignItems: "stretch",
            }}
          >
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                style={{
                  background: pillar.soft,
                  borderRadius: 26,
                  border: `1px solid ${pillar.border}`,
                  boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100%",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    color: pillar.accent,
                    fontSize: 22,
                    lineHeight: 1.1,
                    fontWeight: 900,
                  }}
                >
                  {pillar.title}
                </h3>

                <p style={{ margin: "0 0 18px 0", color: "#475569", lineHeight: 1.65, fontSize: 15 }}>
                  {pillar.intro}
                </p>

                <div style={{ display: "grid", gap: 16 }}>
                  {pillar.items.map((item) => (
                    <div key={`${pillar.title}-${item.strong}`} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: pillar.accent,
                          marginTop: 7,
                          flex: "0 0 12px",
                        }}
                      />
                      <div style={{ color: "#1e293b", lineHeight: 1.58, fontSize: 16 }}>
                        <strong>{item.strong}</strong> {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 16px 18px" }}>
          <div style={{ maxWidth: 940, marginBottom: 22 }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 36, lineHeight: 1.08 }}>Ukázky vysílání</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: 17, lineHeight: 1.7 }}>
              Tři reálné ukázky pomáhají rychle pochopit, jak ARCHIMEDES Live vypadá v praxi.
              Díky nim je hned vidět rozdíl mezi školním vstupem, jazykovým formátem a programem pro seniory.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 22,
            }}
          >
            {teaserCards.map((card) => (
              <VideoCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "38px 16px 10px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {benefits.map((item) => (
              <article
                key={item.title}
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: 22,
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: 22, lineHeight: 1.15 }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "42px 16px 18px" }}>
          <div style={{ maxWidth: 940, marginBottom: 22 }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 36, lineHeight: 1.08 }}>Nejbližší vysílání</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: 17, lineHeight: 1.7 }}>
              Přehled nejbližších zveřejněných vstupů. Tato část zůstává živá a automaticky se
              doplňuje podle toho, jak přibývá obsah v administraci.
            </p>
          </div>

          {loading ? (
            <div style={{ color: "#475569", padding: "10px 2px 4px" }}>Načítám program…</div>
          ) : error ? (
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fdba74",
                color: "#9a3412",
                borderRadius: 16,
                padding: 16,
              }}
            >
              {error}
            </div>
          ) : hasEvents ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 22,
              }}
            >
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: "1px solid rgba(15,23,42,0.08)",
                padding: 22,
                color: "#475569",
                boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
              }}
            >
              Zatím zde nejsou zveřejněná nejbližší vysílání. Jakmile budou nové termíny
              publikované v administraci, objeví se automaticky tady.
            </div>
          )}
        </section>

        <section id="cena-programu" style={{ maxWidth: 1240, margin: "0 auto", padding: "46px 16px 70px" }}>
          <div style={{ maxWidth: 940, marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 36, lineHeight: 1.08 }}>Kolik program stojí</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: 17, lineHeight: 1.7 }}>
              Cena je součástí programu. Nejde o technický produkt, ale o pravidelný obsah,
              vysílání a zapojení školy nebo komunity do živého celku.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 22,
            }}
          >
            {pricingCards.map((card) => (
              <article
                key={card.title}
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: 22,
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
                  minHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "#f8fafc",
                    color: card.accent,
                    border: `1px solid ${card.accent}22`,
                    fontSize: 13,
                    fontWeight: 800,
                    marginBottom: 16,
                    alignSelf: "flex-start",
                  }}
                >
                  {card.badge}
                </div>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 24, lineHeight: 1.16 }}>{card.title}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 42, lineHeight: 1, fontWeight: 900, letterSpacing: "-0.04em" }}>{card.price}</div>
                  <div style={{ color: "#475569", fontWeight: 700 }}>{card.period}</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.8, flex: 1 }}>
                  {card.items.map((item) => (
                    <li key={`${card.title}-${item}`}>{item}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 18, fontSize: 14, color: "#64748b" }}>Cena bez DPH.</div>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 14px 34px rgba(15,23,42,0.06)",
              borderRadius: 26,
              padding: 28,
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ maxWidth: 700 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 28, lineHeight: 1.08 }}>Chcete si program projít naživo?</h3>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, fontSize: 17 }}>
                Nejlepší cesta je krátká ukázka nebo demo. Během jednoho setkání je hned vidět,
                jak může ARCHIMEDES Live fungovat pro školu, vedení obce i komunitní život.
              </p>
            </div>
            <Link
              href="/poptavka"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 50,
                padding: "0 18px",
                borderRadius: 14,
                textDecoration: "none",
                color: "#ffffff",
                background: "#0f172a",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              Domluvit demo
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
