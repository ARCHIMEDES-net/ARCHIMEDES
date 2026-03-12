import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "posters";

const pillars = [
  {
    color: "#3b82f6",
    shadow: "rgba(59,130,246,0.20)",
    title: "PRO ŠKOLY",
    items: [
      {
        strong: "I. stupeň – Objevujeme svět:",
        text: "tvořivost, objevování světa, spolupráce se zajímavými partnery a čtenářské formáty pro děti.",
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
    ],
    footer:
      "Speciální formáty: 13. komnata VIP, mezinárodní inspirace a další mimořádné vstupy podle sezóny.",
  },
  {
    color: "#f59e0b",
    shadow: "rgba(245,158,11,0.20)",
    title: "PRO SENIORY A AKTIVNÍ STÁRNUTÍ",
    items: [
      {
        strong: "Senior klub:",
        text: "kultivované diskuse, zajímaví hosté a pravidelná setkání, která propojují lidi v obci.",
      },
      {
        strong: "Čtenářský klub:",
        text: "sdílené čtení, doporučené knihy a inspirativní debaty nad příběhy i tématy života.",
      },
      {
        strong: "Akademie třetího věku:",
        text: "digitální gramotnost, zdraví, orientace v současném světě a praktická témata pro každodenní život.",
      },
    ],
  },
  {
    color: "#22c55e",
    shadow: "rgba(34,197,94,0.18)",
    title: "PRO KOMUNITU A ROZVOJ OBCE",
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
    color: "#a855f7",
    shadow: "rgba(168,85,247,0.18)",
    title: "LETNÍ SPECIÁL A KULTURA",
    items: [
      {
        strong: "Filmový klub:",
        text: "výběr filmů a moderovaných úvodů, které dokážou z učebny nebo komunitního prostoru udělat kulturní místo.",
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
    subtitle: "ZOO Praha / koně",
    note: "Sem přijde krátký sestřih vysílání pro děti.",
  },
  {
    title: "Angličtina s hostem",
    subtitle: "Paul Wade",
    note: "Sem přijde krátká ukázka anglického vstupu.",
  },
  {
    title: "Senior klub",
    subtitle: "pravidelný komunitní formát",
    note: "Sem přijde 20s upoutávka na Senior klub.",
  },
];

const pricingCards = [
  {
    title: "Program pro školu a obec",
    price: "2 890 Kč",
    period: "/ měsíc",
    badge: "doporučená varianta",
    items: [
      "živá vysílání pro školu a komunitu",
      "pravidelný program během roku",
      "přístup do archivu a k materiálům",
      "zapojení školy i komunitního života obce",
    ],
  },
  {
    title: "Senior klub",
    price: "1 990 Kč",
    period: "/ měsíc",
    badge: "samostatný formát",
    items: [
      "pravidelná online setkání pro seniory",
      "kulturní a společenský program",
      "bezpečný a srozumitelný formát",
      "vhodné i pro menší obce a komunity",
    ],
  },
  {
    title: "Jednorázový vstup",
    price: "490 Kč",
    period: "/ vstup",
    badge: "pro jednotlivce",
    items: [
      "jednorázová účast na vybraném vysílání",
      "vhodné pro hosty mimo zapojené školy a obce",
      "rychlá cesta, jak si program vyzkoušet",
    ],
  },
  {
    title: "Speciální kulturní formát",
    price: "490 Kč",
    period: "/ vstup",
    badge: "filmový klub a speciály",
    items: [
      "vybrané kulturní a sezónní vstupy",
      "mimořádné programy pro veřejnost",
      "vhodné jako doplněk programu během roku",
    ],
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
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
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
            padding: "56px 16px 30px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #2563eb 100%)",
              borderRadius: 32,
              padding: "44px 28px",
              color: "#fff",
              boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -60,
                top: -60,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div style={{ position: "relative", maxWidth: 820 }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Přehled vysílání a programové nabídky
              </div>
              <h1
                style={{
                  margin: "0 0 18px 0",
                  fontSize: "clamp(38px, 6vw, 68px)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.04em",
                }}
              >
                Program pro školy,
                <br />
                seniory i komunitu
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: 760,
                  fontSize: 19,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                ARCHIMEDES Live přináší živá vysílání, inspirativní hosty, pracovní listy,
                komunitní program a kulturní formáty. Stránka ukazuje, co program obsahuje,
                jaké má hlavní rubriky a jak se lze do programu zapojit.
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
                    color: "#0f172a",
                    background: "#ffffff",
                    fontWeight: 800,
                    boxShadow: "0 12px 30px rgba(15,23,42,0.15)",
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
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.20)",
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
              Nejde o jednu sérii vstupů, ale o živý celek, který může obec používat během
              celého roku.
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
                  background: "#fff",
                  borderRadius: 26,
                  border: `2px solid ${pillar.color}33`,
                  boxShadow: `0 18px 38px ${pillar.shadow}`,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100%",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: pillar.color,
                    fontSize: 22,
                    lineHeight: 1.1,
                    fontWeight: 900,
                  }}
                >
                  {pillar.title}
                </h3>

                <div style={{ display: "grid", gap: 16 }}>
                  {pillar.items.map((item) => (
                    <div key={`${pillar.title}-${item.strong}`} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: pillar.color,
                          marginTop: 6,
                          flex: "0 0 14px",
                        }}
                      />
                      <div style={{ color: "#1e293b", lineHeight: 1.55, fontSize: 16 }}>
                        <strong>{item.strong}</strong> {item.text}
                      </div>
                    </div>
                  ))}
                </div>

                {pillar.footer ? (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 16,
                      borderRadius: 18,
                      background: pillar.color,
                      color: "#fff",
                      lineHeight: 1.55,
                      fontWeight: 700,
                    }}
                  >
                    {pillar.footer}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 16px 18px" }}>
          <div style={{ maxWidth: 940, marginBottom: 22 }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: 36, lineHeight: 1.08 }}>Ukázky vysílání</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: 17, lineHeight: 1.7 }}>
              Tři okna níže jsou připravená pro krátké sestřihy. Rozměr je nastavený tak, aby
              po doplnění videí působila sekce čistě a přehledně.
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
              <article
                key={card.title}
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 14px 34px rgba(15,23,42,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16 / 9",
                    background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(15,23,42,0.72)",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    fontSize: 15,
                    textTransform: "uppercase",
                  }}
                >
                  místo pro video ukázku
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: 24, lineHeight: 1.15 }}>{card.title}</h3>
                  <div style={{ color: "#2563eb", fontWeight: 800, marginBottom: 8 }}>{card.subtitle}</div>
                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.65 }}>{card.note}</p>
                </div>
              </article>
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
            {[
              {
                title: "Živé vysílání",
                text: "Pravidelné vstupy s hosty, moderované programy a témata, která škola i obec skutečně využijí.",
              },
              {
                title: "Archiv a záznamy",
                text: "Obsah může sloužit i zpětně – jako inspirace, doplněk výuky nebo komunitní program.",
              },
              {
                title: "Pracovní listy a návaznost",
                text: "Součástí programu jsou materiály, které pomáhají učiteli i organizátorům programu v obci.",
              },
              {
                title: "Jedna značka, více cílových skupin",
                text: "Škola, senioři, komunita i kultura jsou přehledně pod jedním programem a jednou logikou webu.",
              },
            ].map((item) => (
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
              Přehled nejbližších zveřejněných vstupů. Tato část zůstává živá a může se dále
              rozšiřovat podle toho, jak bude přibývat obsah v administraci.
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
            {pricingCards.map((card, index) => (
              <article
                key={card.title}
                style={{
                  background: index === 0 ? "linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)" : "#fff",
                  borderRadius: 24,
                  padding: 22,
                  border: index === 0 ? "2px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                  boxShadow: index === 0 ? "0 20px 44px rgba(37,99,235,0.12)" : "0 14px 34px rgba(15,23,42,0.06)",
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
                    background: index === 0 ? "#2563eb" : "#f1f5f9",
                    color: index === 0 ? "#fff" : "#0f172a",
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
              background: "#0f172a",
              color: "#fff",
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
              <h3 style={{ margin: "0 0 8px 0", fontSize: 28, lineHeight: 1.08 }}>Chcete stránku otestovat naživo?</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, fontSize: 17 }}>
                Nejlepší cesta je ukázka programu. Během krátkého setkání je hned vidět, jak
                může ARCHIMEDES Live fungovat pro školu, vedení obce i komunitní život.
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
                color: "#0f172a",
                background: "#ffffff",
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              Poslat poptávku
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
