import Link from "next/link";

/**
 * ARCHIMEDES Live – Homepage v2 (zpřesnění flow + social proof + úpravy CTA)
 *
 * Co je jinak oproti předchozí verzi:
 * 1) Social proof (čísla + obce/školy) hned po HERO.
 * 2) Záštity/ocenění přesunuty níže (po vysvětlení produktu).
 * 3) Sekce "Proč je síť důležitá" dostává vizuál (bez další fotky u "Co tím obec získá").
 * 4) Odstraněna poznámka o dočasných fotkách (na veřejném webu ji nechceme).
 *
 * Média – předpoklad:
 * Fotky už máte v /public/media a sedí na názvy níže. Když máte jiné názvy,
 * upravte pouze konstantu MEDIA.
 */

const MEDIA = {
  hero: "/media/hero-classroom.jpg",
  onehour: "/media/lesson-closeup.webp",      // detail výuky / displej
  exterior: "/media/exterior-kids.webp",     // exteriér / vstup do učebny
  stem: "/media/stem-microscopes.webp",      // STEM detail
  seniors: "/media/community-seniors.jpg",   // komunita / senioři
  online: "/media/online-session.jpg",       // online přenos
};

const VIDEO_ID = "j2xTWMnPbiY";
const YT_EMBED = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&controls=1`;

function Chip({ children, tone = "soft" }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.10)",
    fontSize: 13,
    lineHeight: 1,
    whiteSpace: "nowrap",
    userSelect: "none",
  };

  const tones = {
    soft: { background: "rgba(255,255,255,0.9)" },
    dark: { background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.18)", color: "white" },
    solid: { background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)" },
  };

  return <span style={{ ...base, ...(tones[tone] || tones.soft) }}>{children}</span>;
}

function Button({ href, children, variant = "primary" }) {
  const styles = {
    primary: {
      background: "rgba(0,0,0,0.92)",
      color: "white",
      border: "1px solid rgba(0,0,0,0.92)",
      boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
    },
    secondary: {
      background: "rgba(255,255,255,0.14)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.30)",
    },
    light: {
      background: "white",
      color: "rgba(0,0,0,0.90)",
      border: "1px solid rgba(0,0,0,0.12)",
      boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    },
  };

  const common = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 750,
    textDecoration: "none",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  };

  return (
    <Link
      href={href}
      style={{ ...common, ...(styles[variant] || styles.primary) }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
    >
      {children}
      <span aria-hidden style={{ opacity: 0.9 }}>→</span>
    </Link>
  );
}

function Section({ id, title, kicker, children, alt = false }) {
  return (
    <section id={id} style={{ padding: "54px 16px", background: alt ? "white" : "transparent" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {(kicker || title) && (
          <div style={{ marginBottom: 18 }}>
            {kicker && (
              <div style={{ fontSize: 13, letterSpacing: 0.4, textTransform: "uppercase", opacity: 0.7, marginBottom: 8 }}>
                {kicker}
              </div>
            )}
            {title && <h2 style={{ fontSize: 30, lineHeight: 1.15, margin: 0 }}>{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MediaImage({ src, alt, radius = 18 }) {
  return (
    <div style={{ borderRadius: radius, overflow: "hidden", border: "1px solid rgba(0,0,0,0.10)", background: "rgba(0,0,0,0.03)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.10)", background: "rgba(0,0,0,0.02)" }}>
      <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const trust = [
    "Záštita: Eva Pavlová",
    "MPO",
    "MŽP",
    "MMR",
    "Finalista: E.ON Energy Globe",
    "Finalista: Creative Business Cup",
    "Vítěz: Obec 2030",
    "UNESCO: Greening Education Partnership",
  ];

  const sampleProgram = [
    { title: "Přírodověda & technologie", desc: "Živý vstup s expertem + pracovní list." },
    { title: "Wellbeing pro žáky", desc: "Krátké rutiny, psychohygiena, práce s emocemi." },
    { title: "Kariérní poradenství jinak", desc: "Inspirace, profese, dovednosti budoucnosti." },
    { title: "Čtenářský klub", desc: "Děti i dospělí – kniha měsíce + host." },
    { title: "Senior klub", desc: "Dvakrát měsíčně – prevence izolace, aktivní komunita." },
    { title: "Smart Cities (deváťáci)", desc: "Město očima mladých + práce s urbanistkou." },
  ];

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* Hlavičku řeší pages/_app.js (PublicHeader) */}

      {/* HERO */}
      <div style={{ padding: "24px 16px 10px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.10)",
              boxShadow: "0 22px 55px rgba(0,0,0,0.12)",
              background: "rgba(0,0,0,0.06)",
              minHeight: 520,
            }}
          >
            {/* Background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.hero}
              alt="Ukázka výuky v učebně ARCHIMEDES"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(1.05) contrast(1.02)",
                transform: "scale(1.03)",
              }}
            />

            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.20) 70%, rgba(0,0,0,0.12) 100%)",
              }}
            />

            {/* Content */}
            <div style={{ position: "relative", padding: "56px 22px" }}>
              <div style={{ maxWidth: 680 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                  <Chip tone="dark"><span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ecc71" }} /> Živý vzdělávací program (ne software)</Chip>
                  <Chip tone="dark">Školy + obce + komunita</Chip>
                </div>

                <h1 style={{ fontSize: 46, lineHeight: 1.08, margin: "0 0 14px", color: "white" }}>
                  Každý měsíc hotový obsah <br />
                  pro školu i komunitu obce
                </h1>

                <p style={{ fontSize: 18, lineHeight: 1.6, margin: "0 0 22px", color: "rgba(255,255,255,0.88)" }}>
                  Živé vstupy s hosty, pracovní listy, komunitní program a neveřejný archiv pro předplatitele.
                  Jednoduše: <b>1 třída → 1 vysílání → 1 pracovní list</b>.
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <Button href={`/#hodina`} variant="primary">Podívat se na ukázkovou hodinu</Button>
                  <Button href="/poptavka" variant="secondary">Domluvit ukázku</Button>
                  <Button href="/program" variant="secondary">Prohlédnout program</Button>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6, opacity: 0.92 }}>
                  <Chip tone="dark">Záštity & ocenění</Chip>
                  <Link href="#duvera" style={{ color: "white", textDecoration: "none", fontWeight: 800, opacity: 0.95 }}>
                    Detail <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Chip>Živé vstupy s hosty</Chip>
            <Chip>Pracovní listy</Chip>
            <Chip>Neveřejný archiv pro předplatitele</Chip>
            <Chip>Síť učeben ARCHIMEDES</Chip>
            <Chip>Komunitní program</Chip>
          </div>
        </div>
      </div>

      {/* SOCIAL PROOF – hned po HERO */}
      <Section id="dukaz" title="ARCHIMEDES Live už funguje v řadě škol a obcí" kicker="Důkaz důvěry" alt>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Stat value="20+" label="učeben ARCHIMEDES" />
          <Stat value="1 000+" label="zapojených žáků (orientačně)" />
          <Stat value="2×" label="měsíčně Senior klub" />
          <Stat value="Obec 2030" label="ocenění projektu" />
        </div>

        <div style={{ marginTop: 14 }}>
          <Card>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Kde to už běží</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.82 }}>
              Hodonín • Křenov • Bučovice • Frýdek‑Místek • Hradec Králové • (další lokality dle sítě)
            </div>
          </Card>
        </div>
      </Section>

      {/* JAK VYPADÁ JEDNA HODINA */}
      <Section id="hodina" title="Jak vypadá jedna hodina" kicker="Game‑changer">
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "stretch" }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: 18, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Chip tone="solid">20–40 min živě</Chip>
                <Chip tone="solid">+ pracovní list</Chip>
                <Chip tone="solid">+ navazující aktivita</Chip>
              </div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, opacity: 0.82 }}>
                Jedna jasná logika: <b>1 třída → 1 vysílání → 1 pracovní list</b>.
              </div>
            </div>

            <div style={{ position: "relative", paddingTop: "56.25%", background: "rgba(0,0,0,0.06)" }}>
              <iframe
                src={YT_EMBED}
                title="Ukázková hodina – ARCHIMEDES Live"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  ["1) Vysílání", "Živý host, interakce, otázky v chatu."],
                  ["2) Pracovní list", "Jedna stránka pro učitele i žáky."],
                  ["3) Aktivita", "Navazující práce ve třídě / v obci."],
                ].map(([t, d]) => (
                  <div key={t} style={{ borderRadius: 14, padding: 14, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{t}</div>
                    <div style={{ fontSize: 13, opacity: 0.78 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 18 }}>
            <MediaImage src={MEDIA.onehour} alt="Ukázka výuky – práce na interaktivním displeji" />
            <Card>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Pro koho to je</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82 }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li><b>Ředitel školy</b> – hotový obsah a motivace pro žáky.</li>
                  <li><b>Starosta</b> – konkrétní přínos pro obyvatele a komunitu.</li>
                  <li><b>Komunita</b> – program pro seniory, rodiče i spolky.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* PROGRAM */}
      <Section id="program" title="Program – ukázka tematických bloků" kicker="Každý měsíc hotový obsah" alt>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {sampleProgram.map((p) => (
            <Card key={p.title}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82 }}>{p.desc}</div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button href="/program" variant="light">Zobrazit celý program</Button>
          <Button href="/cenik" variant="light">Kolik to stojí</Button>
        </div>
      </Section>

      {/* ARCHIV + PRACOVNÍ LISTY */}
      <Section id="archiv" title="Archiv a pracovní listy" kicker="Pro předplatitele">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Neveřejný archiv</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82, marginBottom: 12 }}>
              Všechny záznamy přehledně na jednom místě – dostupné jen registrovaným školám/obcím.
            </div>
            <MediaImage src={MEDIA.online} alt="Online přenos ve třídě / v komunitě" radius={16} />
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Chip tone="solid">Záznamy</Chip>
              <Chip tone="solid">Filtry</Chip>
              <Chip tone="solid">Sdílení pro tým</Chip>
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Pracovní listy</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82, marginBottom: 12 }}>
              Ke každé hodině připravený pracovní list – učitel má jasný scénář a žáci konkrétní úkol.
            </div>
            <MediaImage src={MEDIA.stem} alt="Pracovní listy a návazné aktivity (STEM)" radius={16} />
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Chip tone="solid">1–2 stránky</Chip>
              <Chip tone="solid">PDF</Chip>
              <Chip tone="solid">Rychlé použití</Chip>
            </div>
          </Card>
        </div>
      </Section>

      {/* SÍŤ UČEBEN */}
      <Section id="sit" title="Síť učeben ARCHIMEDES" kicker="Mapa & inspirace" alt>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82, marginBottom: 12 }}>
              Školy a obce vidí, kde už učebny fungují – a můžou si sdílet zkušenosti. (Mapa je dostupná v portálu.)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MediaImage src={MEDIA.exterior} alt="Učebna ARCHIMEDES – exteriér" radius={16} />
              <MediaImage src={MEDIA.hero} alt="Učebna ARCHIMEDES – výuka" radius={16} />
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button href="/portal/skoly" variant="light">Zobrazit mapu učeben</Button>
              <Button href="/poptavka" variant="light">Chci ukázku / zapojení</Button>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 16 }}>
            <MediaImage src={MEDIA.online} alt="Ukázka: propojení školy a sítě" radius={18} />
            <Card>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Proč je síť důležitá</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82 }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Obce vidí „dobrou praxi“ a reálné fotky.</li>
                  <li>Školy sdílí aktivity, inspiraci a materiály.</li>
                  <li>Buduje se prestiž a dlouhodobá udržitelnost.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* KOMUNITA */}
      <Section id="komunita" title="Program pro celou obec" kicker="Dopad">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <Card>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Senior klub (2× měsíčně)</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.82, marginBottom: 12 }}>
              Smysluplný pravidelný program, prevence izolace, propojení generací a „živé dění“ v obci.
            </div>
            <MediaImage src={MEDIA.seniors} alt="Senior klub – komunitní setkání" radius={16} />
          </Card>

          <Card>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Co tím obec získá</div>
            <div style={{ fontSize: 14, lineHeight: 1.75, opacity: 0.82 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div>✅ Program pro děti i seniory v jednom</div>
                <div>✅ Viditelný přínos pro obyvatele (a voliče)</div>
                <div>✅ Propojení generací a aktivní komunita</div>
                <div>✅ Prestiž moderní obce + možnost lokálních témat/partnerství</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button href="/poptavka" variant="light">Domluvit ukázku pro obec</Button>
              <Button href="/cenik" variant="light">Ceník</Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* FINANCOVÁNÍ */}
      <Section id="financovani" title="Financování (OP JAK / šablony)" kicker="Prakticky">
        <Card>
          <div style={{ fontSize: 14, lineHeight: 1.75, opacity: 0.85 }}>
            U škol je možné řešit financování i přes dotační tituly typu OP JAK a související šablony
            (podle aktuální výzvy a pravidel školy). My dodáme <b>popis programu</b>, přínosy a podklady – tak,
            aby to bylo pro školu administrativně snadné.
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip tone="solid">Hotové texty a argumenty</Chip>
            <Chip tone="solid">Ukázková hodina</Chip>
            <Chip tone="solid">Pracovní listy jako výstup</Chip>
          </div>
        </Card>
      </Section>

      {/* ZÁŠTITY/OCENĚNÍ – až tady */}
      <Section id="duvera" title="Záštity, ocenění a partnerství" kicker="Důvěra" alt>
        <Card>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {trust.map((t) => (
              <Chip key={t} tone="solid">{t}</Chip>
            ))}
          </div>
        </Card>
      </Section>

      {/* CTA */}
      <div style={{ padding: "10px 16px 56px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div
            style={{
              borderRadius: 24,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "linear-gradient(135deg, rgba(0,0,0,0.92), rgba(0,0,0,0.78))",
              color: "white",
              padding: "26px 20px",
              boxShadow: "0 22px 55px rgba(0,0,0,0.14)",
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 13, letterSpacing: 0.4, textTransform: "uppercase", opacity: 0.75 }}>Další krok</div>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.15, marginTop: 6 }}>
                Chcete ukázku pro školu nebo obec?
              </div>
              <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, opacity: 0.88 }}>
                Zabere to pár minut – ukážeme jednu hodinu, pracovní list a jak vypadá portál.
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button href="/poptavka" variant="primary">Domluvit ukázku</Button>
              <Button href="/portal" variant="secondary">Prohlédnout portál</Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 980px) {
          #__next section > div > div[style*="grid-template-columns: 1.2fr 0.8fr"] {
            grid-template-columns: 1fr !important;
          }
          #__next section > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          #__next section > div > div[style*="repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          #__next section > div > div[style*="repeat(4, 1fr)"] {
            grid-template-columns: 1fr 1fr !important;
          }
          #__next h1 {
            font-size: 38px !important;
          }
        }
      `}</style>
    </div>
  );
}
