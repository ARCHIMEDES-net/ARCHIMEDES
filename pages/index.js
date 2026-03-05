// pages/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const MAX_WIDTH = 1120;

function Section({ id, eyebrow, title, subtitle, children, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <section
      id={id}
      style={{
        padding: "72px 16px",
        background: isDark ? "#0b1220" : "transparent",
        color: isDark ? "white" : "inherit",
      }}
    >
      <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
        {eyebrow ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 12px",
              borderRadius: 999,
              fontSize: 13,
              letterSpacing: 0.2,
              background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)",
              border: isDark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.08)",
              marginBottom: 14,
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 99, background: "#22c55e" }} />
            <span style={{ opacity: isDark ? 0.9 : 0.8 }}>{eyebrow}</span>
          </div>
        ) : null}

        {title ? (
          <h2
            style={{
              fontSize: 36,
              lineHeight: 1.12,
              margin: 0,
              letterSpacing: -0.2,
            }}
          >
            {title}
          </h2>
        ) : null}

        {subtitle ? (
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              maxWidth: 780,
              fontSize: 17,
              lineHeight: 1.65,
              opacity: isDark ? 0.85 : 0.75,
            }}
          >
            {subtitle}
          </p>
        ) : null}

        <div style={{ marginTop: 26 }}>{children}</div>
      </div>
    </section>
  );
}

function Card({ children, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <div
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "white",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: 20,
        padding: 18,
        boxShadow: isDark ? "none" : "0 14px 40px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Pill({ text, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 13,
        border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.10)",
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        opacity: isDark ? 0.92 : 0.86,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function ButtonLink({ href, label, variant = "primary" }) {
  const primary = variant === "primary";
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        textDecoration: "none",
        padding: "12px 14px",
        borderRadius: 14,
        fontWeight: 750,
        fontSize: 15,
        border: primary ? "1px solid rgba(0,0,0,0.88)" : "1px solid rgba(0,0,0,0.12)",
        background: primary ? "rgba(0,0,0,0.94)" : "white",
        color: primary ? "white" : "rgba(0,0,0,0.9)",
        boxShadow: primary ? "0 16px 42px rgba(0,0,0,0.22)" : "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      <span>{label}</span>
      <span aria-hidden style={{ opacity: 0.9 }}>
        →
      </span>
    </Link>
  );
}

function SoftButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        fontWeight: 800,
        cursor: "pointer",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "white",
        color: "rgba(0,0,0,0.9)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      <span>{label}</span>
      <span aria-hidden>→</span>
    </button>
  );
}

function Modal({ open, title, subtitle, onClose, children }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.56)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 100%)",
          maxHeight: "86vh",
          overflow: "auto",
          background: "white",
          borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 24px 76px rgba(0,0,0,0.36)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            {subtitle ? (
              <div style={{ opacity: 0.7, marginTop: 2, fontSize: 13, lineHeight: 1.4 }}>
                {subtitle}
              </div>
            ) : null}
          </div>

          <button
            onClick={onClose}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Zavřít ✕
          </button>
        </div>

        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

function ProofGrid({ items }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {items.map((it) => (
        <div
          key={it.key}
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 18,
            padding: 12,
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 900 }}>{it.title}</div>
              <div style={{ opacity: 0.75, marginTop: 4, lineHeight: 1.5 }}>{it.subtitle}</div>
            </div>

            {it.href ? (
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  alignSelf: "center",
                  textDecoration: "none",
                  fontWeight: 800,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                  padding: "10px 12px",
                  color: "rgba(0,0,0,0.9)",
                }}
              >
                Otevřít →
              </a>
            ) : null}
          </div>

          {it.imgUrl ? (
            <div style={{ marginTop: 10 }}>
              <img
                src={it.imgUrl}
                alt={it.alt || it.title}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 16,
                  border: "1px solid rgba(0,0,0,0.10)",
                  background: "white",
                }}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export default function Home() {
  const [proofOpen, setProofOpen] = useState(false);
  useLockBodyScroll(proofOpen);

  const trustBadges = useMemo(
    () => [
      "Záštita Evy Pavlové",
      "Záštita MPO",
      "Záštita MŽP",
      "Záštita MMR",
      "Finalista E.ON Energy Globe",
      "Creative Business Cup – Miláček publika",
      "UNESCO – Greening Education Partnership",
      "Síť učeben v ČR",
      "Živé vstupy",
      "Pracovní listy",
      "Neveřejný archiv pro předplatitele",
    ],
    []
  );

  // Důkazy: dokumenty záštit jsou ve formě obrázků (z původního webu), ocenění/členství jako odkazy.
  // Pozn.: v textu homepage neuvádíme žádné časové období, jen fakt, že existují tyto záštity/ocenění/členství.
  const proofItems = useMemo(
    () => [
      {
        key: "zastita-eva",
        title: "Záštita – Eva Pavlová",
        subtitle: "Textové potvrzení na webu projektu.",
        href: "https://www.archimedes-net.com/zastita/",
      },
      {
        key: "zastita-mpo",
        title: "Záštita – Ministerstvo průmyslu a obchodu (MPO)",
        subtitle: "Náhled dokumentu záštity (sken).",
        imgUrl:
          "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000182-a2f4fa2f53/zastita%20MPO.jpeg?ph=fb18f7b042",
      },
      {
        key: "zastita-mzp",
        title: "Záštita – Ministerstvo životního prostředí (MŽP)",
        subtitle: "Náhled dokumentu záštity (sken).",
        imgUrl:
          "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000256-b95eab95ec/za%CC%81s%CC%8Ctita%20-%20ARCHIMEDES_Stra%CC%81nka_2.jpeg?ph=fb18f7b042",
      },
      {
        key: "zastita-mmr",
        title: "Záštita – Ministerstvo pro místní rozvoj (MMR)",
        subtitle: "Náhled dokumentu záštity (sken).",
        imgUrl:
          "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000260-cf481cf483/IMG_9784.jpeg?ph=fb18f7b042",
      },
      {
        key: "award-eon",
        title: "Finalista E.ON Energy Globe",
        subtitle: "Síť učeben Archimedes – stránka E.ON (minulé ročníky / finalista).",
        href: "https://www.eon.cz/energy-globe/minule-rocniky/sit-energeticky-sobestacnych-uceben-archimedes/",
      },
      {
        key: "award-cbc",
        title: "Creative Business Cup – Miláček publika",
        subtitle: "Zmínka v komunikaci CzechInvest k národnímu finále CBC 2023.",
        href: "https://www.facebook.com/CzechInvest/posts/601127312058741/",
      },
      {
        key: "unesco-gep",
        title: "Greening Education Partnership (UNESCO)",
        subtitle: "Iniciativa UNESCO + zmínka o členství na webu projektu.",
        href: "https://www.archimedes-net.com/",
      },
    ],
    []
  );

  const personas = useMemo(
    () => [
      {
        title: "Ředitel školy",
        badge: "Iniciátor",
        points: [
          "Hotový měsíční program do výuky (živé vstupy + materiály).",
          "Učitelé šetří čas, děti získají kontakt s praxí.",
          "Když se třída nepřipojí živě, pomůže neveřejný archiv.",
        ],
        cta: { label: "Chci ukázkovou hodinu", href: "/poptavka" },
      },
      {
        title: "Starosta / obec",
        badge: "Často plátce",
        points: [
          "Program není jen pro školu – má i komunitní rozměr.",
          "Prestiž a konkrétní přínos pro obyvatele (děti, rodiče, senioři).",
          "Síť učeben zvyšuje atraktivitu obce a podporuje spolupráci.",
        ],
        cta: { label: "Prohlédnout přínosy pro obec", href: "/program" },
      },
    ],
    []
  );

  const steps = useMemo(
    () => [
      { n: "1", t: "Vyberete událost", d: "V kalendáři programu uvidíte přehled, téma a cílovku." },
      { n: "2", t: "Živý vstup s hostem", d: "Online (Google Meet) – krátké, svižné, srozumitelné." },
      { n: "3", t: "Pracovní list", d: "Navazující aktivita a upevnění učiva – připravené materiály." },
    ],
    []
  );

  const programPreview = useMemo(
    () => [
      { when: "Týden 1", what: "Živý vstup pro 1. stupeň + pracovní list" },
      { when: "Týden 2", what: "Živý vstup pro 2. stupeň + pracovní list" },
      { when: "Týden 3", what: "Komunitní vstup (např. senior / rodiče / wellbeing)" },
      { when: "Týden 4", what: "Záznamy + inspirace + doplňkové materiály" },
    ],
    []
  );

  const benefitCards = useMemo(
    () => [
      { t: "Pro školu", d: "Kvalitní program do výuky bez složité přípravy. Živé vstupy a materiály." },
      { t: "Pro obec", d: "Smysluplný obsah i pro komunitu. Prestiž a moderní podpora vzdělávání." },
      { t: "Pro učitele", d: "Pracovní listy a scénáře. Méně stresu, více výsledků." },
      { t: "Pro děti", d: "Zážitková výuka a kontakt s reálným světem. Motivace a zvídavost." },
    ],
    []
  );

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* Hlavičku řeší pages/_app.js (PublicHeader) */}

      {/* HERO */}
      <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", padding: "78px 16px 42px" }}>
        <div
          style={{
            display: "inline-flex",
            gap: 10,
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
            marginBottom: 18,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 99, background: "#22c55e" }} />
          <span style={{ fontSize: 13, opacity: 0.78 }}>
            ARCHIMEDES Live = živý vzdělávací program (ne technologie)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 18, alignItems: "start" }}>
          <div style={{ gridColumn: "span 7" }}>
            <h1 style={{ fontSize: 50, lineHeight: 1.05, margin: 0, letterSpacing: -0.35 }}>
              Živý program pro školy
              <br />
              a komunitu obce
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, opacity: 0.8, marginTop: 16, maxWidth: 780 }}>
              Každý měsíc hotový obsah: <b>živé vstupy s hosty</b>, <b>pracovní listy</b> a{" "}
              <b>komunitní program</b>. Jednoduše v kalendáři. Když to nejde živě, pomůže{" "}
              <b>neveřejný archiv pro předplatitele</b>.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <ButtonLink href="/poptavka" label="Chci ukázkovou hodinu" variant="primary" />
              <ButtonLink href="/program" label="Prohlédnout program" variant="secondary" />
              <ButtonLink href="/cenik" label="Ceník" variant="secondary" />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <Pill text="1 třída → 1 živý vstup → 1 pracovní list" />
              <Pill text="Ředitel iniciuje • starosta často platí" />
              <Pill text="Síť učeben + online program" />
            </div>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Rychlý přehled přínosů</div>
              <div style={{ display: "grid", gap: 10 }}>
                {benefitCards.map((b) => (
                  <div
                    key={b.t}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontWeight: 850 }}>{b.t}</div>
                    <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.55 }}>{b.d}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#duvera" style={{ textDecoration: "none", fontWeight: 800, opacity: 0.85 }}>
                  Důvěra a podklady ↓
                </a>
                <span style={{ opacity: 0.35 }}>•</span>
                <a href="#hodina" style={{ textDecoration: "none", fontWeight: 800, opacity: 0.85 }}>
                  Jak vypadá hodina ↓
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* DŮVĚRA */}
      <Section
        id="duvera"
        eyebrow="Důvěra"
        title="Záštity, ocenění a členství, které zvyšují důvěryhodnost"
        subtitle="Krátké „důkazy“ pro ředitele i starostu. Na webu uvidíte jen shrnutí, detaily jsou po kliknutí."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 900 }}>Rychlé důvody důvěry</div>
                <div style={{ opacity: 0.65, fontSize: 13 }}>bez „marketingové omáčky“</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {trustBadges.map((t) => (
                  <Pill key={t} text={t} />
                ))}
              </div>

              <div style={{ marginTop: 14, opacity: 0.75, lineHeight: 1.6, fontSize: 15 }}>
                Podklady (záštity + ocenění + členství) držíme přehledně na jednom místě.
              </div>

              <div style={{ marginTop: 12 }}>
                <SoftButton onClick={() => setProofOpen(true)} label="Zobrazit podklady" />
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>Nejrychlejší cesta k rozhodnutí</div>

              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { n: "1", t: "Ukázková hodina", d: "Uvidíte reálný průběh a přínos pro školu i obec." },
                  { n: "2", t: "Volba varianty", d: "Nastavíme podle školy a obce (jednoduše)." },
                  { n: "3", t: "Přístup do programu", d: "Kalendář + materiály + neveřejný archiv pro předplatitele." },
                ].map((x) => (
                  <div key={x.n} style={{ display: "flex", gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: x.n === "1" ? "rgba(0,0,0,0.92)" : "rgba(0,0,0,0.06)",
                        color: x.n === "1" ? "white" : "rgba(0,0,0,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      {x.n}
                    </div>
                    <div style={{ lineHeight: 1.45 }}>
                      <b>{x.t}</b>
                      <div style={{ opacity: 0.75, marginTop: 2 }}>{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14 }}>
                <ButtonLink href="/poptavka" label="Domluvit ukázkovou hodinu" variant="primary" />
              </div>
            </Card>
          </div>
        </div>

        <Modal
          open={proofOpen}
          onClose={() => setProofOpen(false)}
          title="Podklady: záštity, ocenění a členství"
          subtitle="Náhledy dokumentů a odkazy na veřejné zdroje. Na homepage zůstává jen stručné shrnutí."
        >
          <ProofGrid items={proofItems} />
          <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12, lineHeight: 1.6 }}>
            Pozn.: Texty na homepage jsou záměrně stručné a věcné. Neuvádíme časové období.
          </div>
        </Modal>
      </Section>

      {/* PRO KOHO */}
      <Section
        id="pro-koho"
        eyebrow="Pro koho to je"
        title="Dává to smysl škole i obci"
        subtitle="Ředitel řeší kvalitu výuky. Starosta řeší přínos pro komunitu. ARCHIMEDES Live spojuje obojí do jednoho programu."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {personas.map((p) => (
            <div key={p.title} style={{ gridColumn: "span 6" }}>
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>{p.title}</div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.10)",
                      background: "rgba(0,0,0,0.03)",
                      opacity: 0.85,
                    }}
                  >
                    {p.badge}
                  </span>
                </div>

                <ul style={{ margin: "12px 0 0", paddingLeft: 18, lineHeight: 1.75, opacity: 0.82 }}>
                  {p.points.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>

                <div style={{ marginTop: 14 }}>
                  <ButtonLink href={p.cta.href} label={p.cta.label} variant="secondary" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      {/* JAK FUNGUJE HODINA */}
      <Section
        id="hodina"
        eyebrow="Jak to funguje"
        title="Jedna hodina v praxi"
        subtitle="Jednoduché a opakovatelné: třída → živý vstup → pracovní list. Bez složitostí."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ gridColumn: "span 4" }}>
              <Card>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.92)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 950,
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>{s.t}</div>
                </div>
                <div style={{ marginTop: 10, opacity: 0.78, lineHeight: 1.6 }}>{s.d}</div>
              </Card>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ButtonLink href="/poptavka" label="Chci ukázku" variant="primary" />
          <ButtonLink href="/program" label="Podívat se na program" variant="secondary" />
        </div>
      </Section>

      {/* HOSTÉ */}
      <Section
        id="hoste"
        eyebrow="Hosté"
        title="Obsah stojí na lidech z praxe"
        subtitle="Hosté jsou to, co děti vtáhne. Škola získá kvalitní výuku a obec atraktivní komunitní program."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {[
            { t: "Inspirativní hosté", d: "věda • kultura • řemesla • bezpečnost • wellbeing" },
            { t: "Odborníci z praxe", d: "krátké a srozumitelné vstupy do výuky" },
            { t: "Osobnosti pro komunitu", d: "program i pro dospělé a seniory v obci" },
          ].map((x) => (
            <div key={x.t} style={{ gridColumn: "span 4" }}>
              <Card>
                <div style={{ fontWeight: 950, fontSize: 16 }}>{x.t}</div>
                <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>{x.d}</div>
                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Pill text="živě" />
                  <Pill text="srozumitelně" />
                  <Pill text="do praxe" />
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, opacity: 0.75 }}>
          Tady můžeme později doplnit konkrétní jména hostů (6–12) – výrazně to zvedne konverzi.
        </div>
      </Section>

      {/* PROGRAM */}
      <Section
        id="program"
        eyebrow="Program"
        title="Kalendář programu"
        subtitle="Přehledný jako program – ale je to živé vzdělávání a komunitní obsah."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Ukázka měsíčního rytmu</div>
              <div style={{ display: "grid", gap: 10 }}>
                {programPreview.map((x) => (
                  <div
                    key={x.when}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "baseline",
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ width: 80, fontWeight: 950 }}>{x.when}</div>
                    <div style={{ opacity: 0.86 }}>{x.what}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <ButtonLink href="/program" label="Prohlédnout program" variant="primary" />
                <ButtonLink href="/cenik" label="Ceník" variant="secondary" />
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Co získáte</div>
              <div style={{ display: "grid", gap: 10 }}>
                {benefitCards.map((b) => (
                  <div key={b.t} style={{ padding: 12, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 900 }}>{b.t}</div>
                    <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.55 }}>{b.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* ARCHIV */}
      <Section
        id="archiv"
        eyebrow="Archiv"
        title="Záznamy pro předplatitele"
        subtitle="Když se třída nemůže připojit živě, obsah nezmizí – máte k dispozici neveřejný archiv."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Proč je archiv důležitý</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8, lineHeight: 1.75 }}>
                <li>Škola nepřijde o obsah při změně rozvrhu</li>
                <li>Učitel může udělat druhou hodinu podle potřeby</li>
                <li>Vybrané komunitní vstupy mohou využít i obyvatelé obce</li>
              </ul>
            </Card>
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Jak to funguje</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                Archiv je dostupný po přihlášení v portálu. Navenek ukazujeme program a princip, záznamy jsou neveřejné.
              </div>
              <div style={{ marginTop: 14 }}>
                <ButtonLink href="/portal" label="Vstoupit do portálu" variant="secondary" />
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* PRACOVNÍ LISTY */}
      <Section
        id="pracovni-listy"
        eyebrow="Pracovní listy"
        title="Materiály, které učiteli šetří čas"
        subtitle="Ke vstupům dodáváme pracovní listy a navazující aktivity. Učitel má v ruce hotový scénář."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {[
            { t: "Hotové a použitelné", d: "Vhodné pro běžnou hodinu i suplování. Přehledné a srozumitelné." },
            { t: "Navazuje na živý vstup", d: "Děti si upevní učivo a přenesou ho do praxe." },
            { t: "Lze archivovat", d: "Škola si tvoří vlastní banku materiálů podle ročníků." },
          ].map((x) => (
            <div key={x.t} style={{ gridColumn: "span 4" }}>
              <Card>
                <div style={{ fontWeight: 950 }}>{x.t}</div>
                <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>{x.d}</div>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      {/* MAPA / SÍŤ UČEBEN */}
      <Section
        id="sit-uceben"
        eyebrow="Síť učeben"
        title="Mapa učeben a škol v síti ARCHIMEDES"
        subtitle="Unikátní prvek: propojení fyzických míst s online programem. Dává to důvěru i komunitní rozměr."
      >
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Síť učeben / škol</div>
              <div style={{ opacity: 0.78, marginTop: 6, lineHeight: 1.6 }}>
                V portálu už máte mapu a databázi škol. Na homepage stačí přehled + odkaz do detailu.
              </div>
            </div>
            <ButtonLink href="/portal/skoly" label="Zobrazit mapu učeben" variant="primary" />
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 18,
              border: "1px dashed rgba(0,0,0,0.18)",
              background: "rgba(0,0,0,0.02)",
              padding: 16,
              opacity: 0.86,
              lineHeight: 1.6,
            }}
          >
            Později sem můžeme dát preview (3 školy jako karty) nebo statický náhled mapy.
          </div>
        </Card>
      </Section>

      {/* KOMUNITA */}
      <Section
        id="komunita"
        eyebrow="Komunita"
        title="Program není jen pro školu"
        subtitle="Obec získá obsah i pro dospělé, seniory a spolky. To je klíčový rozdíl proti čistě školním řešením."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Co může obec využít</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8, lineHeight: 1.75 }}>
                <li>komunitní online programy (např. senior / rodiče / wellbeing)</li>
                <li>propojení spolků a místních aktérů</li>
                <li>síť škol a učeben jako „dobrá praxe“</li>
              </ul>
            </Card>
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Propojení generací</div>
              <div style={{ opacity: 0.78, lineHeight: 1.6 }}>
                Jedním předplatným může obec podpořit školu a zároveň nabídnout program i veřejnosti. Vzniká přirozený
                komunitní efekt – a to je pro starostu silný argument.
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* FINANCOVÁNÍ */}
      <Section
        id="financovani"
        eyebrow="Financování"
        title="Jak to obvykle školy a obce financují"
        subtitle="Jednoduchá, srozumitelná formulace. Detailní argumentaci můžeme dát na samostatnou stránku."
      >
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
            <div style={{ gridColumn: "span 7" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Základní logika pro rozhodování</div>
              <div style={{ marginTop: 10, opacity: 0.8, lineHeight: 1.7 }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Ředitel řeší přínos pro výuku a učitele (program + materiály).</li>
                  <li>Starosta řeší přínos pro komunitu (obsah pro obec + prestiž + síť učeben).</li>
                  <li>Financování často kombinuje školní a obecní rozpočet (podle domluvy v obci).</li>
                </ul>
              </div>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Chci to vysvětlit konkrétně</div>
              <div style={{ marginTop: 10, opacity: 0.8, lineHeight: 1.7 }}>
                Připravíme krátký call a ukážeme nejčastější modely financování (včetně variant pro školy a obce).
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ButtonLink href="/poptavka" label="Domluvit konzultaci" variant="primary" />
                <ButtonLink href="/cenik" label="Ceník" variant="secondary" />
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* CTA – DARK */}
      <Section
        id="cta"
        tone="dark"
        eyebrow="Další krok"
        title="Chcete ukázkovou hodinu?"
        subtitle="Nejrychlejší způsob, jak to uchopit: ukážeme jednu reálnou hodinu, a hned bude jasno, jak to zapadne do školy i obce."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card tone="dark">
              <div style={{ fontWeight: 950, fontSize: 16 }}>Co vám ukážeme</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, opacity: 0.92, lineHeight: 1.8 }}>
                <li>jak vypadá živý vstup s hostem</li>
                <li>jak funguje kalendář programu</li>
                <li>jak vypadá pracovní list a návaznost</li>
                <li>jak se do toho zapojí obec a komunita</li>
              </ul>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card tone="dark">
              <div style={{ fontWeight: 950, fontSize: 16 }}>Domluvit ukázku</div>
              <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.7 }}>
                Stačí nám napsat. Ozveme se a nastavíme nejvhodnější variantu pro vaši školu a obec.
              </div>
              <div style={{ marginTop: 14 }}>
                <Link
                  href="/poptavka"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 14,
                    textDecoration: "none",
                    fontWeight: 850,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.10)",
                    color: "white",
                  }}
                >
                  <span>Chci ukázkovou hodinu</span>
                  <span aria-hidden>→</span>
                </Link>

                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                  Pozn.: V textu nepoužíváme „televize“ – vždy „živý program / živé vstupy“.
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 28, opacity: 0.65, fontSize: 13 }}>
          © {new Date().getFullYear()} ARCHIMEDES Live
        </div>
      </Section>
    </div>
  );
}
