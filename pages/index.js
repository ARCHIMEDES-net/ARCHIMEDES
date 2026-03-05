// pages/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const MAX_WIDTH = 1120;

// ---------------- small utilities ----------------
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

function scrollToId(id) {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Pill({ children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 13,
        border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.10)",
        background: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)",
        opacity: dark ? 0.92 : 0.86,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div
      style={{
        background: dark ? "rgba(255,255,255,0.06)" : "white",
        border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: 18,
        padding: 18,
        boxShadow: dark ? "none" : "0 14px 40px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Section({ id, title, subtitle, children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <section
      id={id}
      style={{
        padding: "72px 16px",
        background: dark ? "#0b1220" : "transparent",
        color: dark ? "white" : "inherit",
      }}
    >
      <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
        {title ? (
          <h2 style={{ margin: 0, fontSize: 34, letterSpacing: -0.2, lineHeight: 1.15 }}>{title}</h2>
        ) : null}
        {subtitle ? (
          <p style={{ margin: "12px 0 0", maxWidth: 900, opacity: dark ? 0.86 : 0.76, lineHeight: 1.65 }}>
            {subtitle}
          </p>
        ) : null}
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>
    </section>
  );
}

function PrimaryLink({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 950,
        border: "1px solid rgba(0,0,0,0.9)",
        background: "rgba(0,0,0,0.94)",
        color: "white",
        boxShadow: "0 16px 42px rgba(0,0,0,0.22)",
      }}
    >
      <span>{children}</span>
      <span aria-hidden style={{ opacity: 0.9 }}>
        →
      </span>
    </Link>
  );
}

function SecondaryLink({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 950,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "white",
        color: "rgba(0,0,0,0.9)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      <span>{children}</span>
      <span aria-hidden style={{ opacity: 0.9 }}>
        →
      </span>
    </Link>
  );
}

function SoftButton({ onClick, children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 14,
        fontWeight: 950,
        cursor: "pointer",
        border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.12)",
        background: dark ? "rgba(255,255,255,0.10)" : "white",
        color: dark ? "white" : "rgba(0,0,0,0.92)",
        boxShadow: dark ? "none" : "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      <span>{children}</span>
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
        zIndex: 9999,
        padding: 16,
        background: "rgba(0,0,0,0.56)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(980px, 100%)",
          maxHeight: "86vh",
          overflow: "auto",
          background: "white",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 24px 76px rgba(0,0,0,0.36)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "white",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
            {subtitle ? (
              <div style={{ marginTop: 2, opacity: 0.7, fontSize: 13, lineHeight: 1.4 }}>{subtitle}</div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 950,
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

function ProofItem({ title, subtitle, imgUrl, href }) {
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: 12, background: "rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 950 }}>{title}</div>
          <div style={{ marginTop: 4, opacity: 0.76, lineHeight: 1.55 }}>{subtitle}</div>
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              alignSelf: "center",
              textDecoration: "none",
              fontWeight: 950,
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
      {imgUrl ? (
        <div style={{ marginTop: 10 }}>
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            style={{ width: "100%", height: "auto", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "white" }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Aspect16x9({ children }) {
  return (
    <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
      <div style={{ position: "relative", paddingTop: "56.25%", background: "rgba(0,0,0,0.04)" }}>{children}</div>
    </div>
  );
}

function VideoFrame({ embedUrl }) {
  return (
    <iframe
      title="Ukázková hodina ARCHIMEDES Live"
      src={embedUrl}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}

function MiniStat({ title, text }) {
  return (
    <div style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
      <div style={{ fontWeight: 950 }}>{title}</div>
      <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

function GalleryTile({ src, alt }) {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(0,0,0,0.02)",
        boxShadow: "0 12px 34px rgba(0,0,0,0.06)",
      }}
    >
      <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// ---------------- page ----------------
export default function Home() {
  const [proofOpen, setProofOpen] = useState(false);
  useLockBodyScroll(proofOpen);

  // Video: https://www.youtube.com/watch?v=j2xTWMnPbiY
  const DEMO_VIDEO_EMBED = "https://www.youtube.com/embed/j2xTWMnPbiY";

  /**
   * Fotky (dočasně jako realistický vizuál).
   * Galerie na archimedesoec.com je renderovaná skriptem + cookie banner, takže se z ní nedají spolehlivě vytáhnout přímé odkazy.
   * Tady jsou “nejlepší typy záběrů” jako placeholdery – pak vyměníme za vaše reálné fotky.
   */
  const HERO_IMAGE =
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2600&q=80";

  const GALLERY = useMemo(
    () => [
      { src: "https://images.unsplash.com/photo-1588072432836-7fb78b4a0b1f?auto=format&fit=crop&w=1800&q=80", alt: "Učebna – prostředí výuky" },
      { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1800&q=80", alt: "Žáci a práce ve skupině" },
      { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1800&q=80", alt: "Praktická výuka a aktivita" },
      { src: "https://images.unsplash.com/photo-1587614382346-acf8254d5a9f?auto=format&fit=crop&w=1800&q=80", alt: "Technologie ve výuce" },
      { src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1800&q=80", alt: "Učení v komunitě" },
    ],
    []
  );

  const trustTop3 = useMemo(() => ["Záštity", "Ocenění", "UNESCO partnerství"], []);

  const valuePills = useMemo(
    () => [
      "Živý program (ne software)",
      "Živé vstupy s hosty",
      "Pracovní listy",
      "Neveřejný archiv pro předplatitele",
      "Síť učeben ARCHIMEDES",
      "Program pro školu i komunitu obce",
    ],
    []
  );

  const proofItems = useMemo(
    () => [
      { key: "zastita-web", title: "Záštity – přehled", subtitle: "Veřejná stránka s přehledem záštit.", href: "https://www.archimedes-net.com/zastita/" },
      { key: "eva", title: "Záštita – Eva Pavlová", subtitle: "Náhled dokumentu (sken).", imgUrl: "https://www.archimedesoec.com/onewebmedia/zastita%20Evy%20Pavlove.jpeg" },
      { key: "mpo", title: "Záštita – MPO", subtitle: "Náhled dokumentu (sken).", imgUrl: "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000182-a2f4fa2f53/zastita%20MPO.jpeg?ph=fb18f7b042" },
      { key: "mzp", title: "Záštita – MŽP", subtitle: "Náhled dokumentu (sken).", imgUrl: "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000256-b95eab95ec/za%CC%81s%CC%8Ctita%20-%20ARCHIMEDES_Stra%CC%81nka_2.jpeg?ph=fb18f7b042" },
      { key: "mmr", title: "Záštita – MMR", subtitle: "Náhled dokumentu (sken).", imgUrl: "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000260-cf481cf483/IMG_9784.jpeg?ph=fb18f7b042" },
      { key: "eon", title: "Finalista E.ON Energy Globe", subtitle: "Projekt v soutěži E.ON Energy Globe.", href: "https://www.eon.cz/energy-globe/minule-rocniky/sit-energeticky-sobestacnych-uceben-archimedes/" },
    ],
    []
  );

  const featureCards = useMemo(
    () => [
      { title: "Inspirativní hosté", text: "Děti potkají lidi z praxe. Krátce, srozumitelně, interaktivně.", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80" },
      { title: "Pracovní listy", text: "Hotové materiály šetří učitelům čas. Hodina má jasný scénář.", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80" },
      { title: "Živé vysílání", text: "Google Meet – jednoduché připojení. Program je živý, ne pasivní.", img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1400&q=80" },
    ],
    []
  );

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* PublicHeader řeší pages/_app.js */}

      {/* HERO */}
      <div style={{ padding: "26px 16px 0" }}>
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto", borderRadius: 22, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 24px 70px rgba(0,0,0,0.10)", background: "white" }}>
          <div style={{ position: "relative", height: 560 }}>
            <img src={HERO_IMAGE} alt="ARCHIMEDES Live – ukázka výuky" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.10) 100%)" }} />

            <div style={{ position: "absolute", inset: 0, padding: 22, display: "flex", alignItems: "center" }}>
              <div style={{ maxWidth: 880 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", color: "white", fontSize: 13, fontWeight: 900, marginBottom: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: "#22c55e" }} />
                  Živý vzdělávací program pro školy a obce (ne software)
                </div>

                <h1 style={{ margin: 0, color: "white", fontSize: 56, lineHeight: 1.04, letterSpacing: -0.5, textShadow: "0 10px 40px rgba(0,0,0,0.35)" }}>
                  archimedes <span style={{ background: "#ef4444", padding: "2px 10px", borderRadius: 10 }}>live</span>
                </h1>

                <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.92)", fontSize: 18, lineHeight: 1.65, maxWidth: 760, textShadow: "0 10px 40px rgba(0,0,0,0.30)" }}>
                  Každý měsíc hotový obsah: <b>živé vstupy s hosty</b>, <b>pracovní listy</b>, komunitní program a neveřejný archiv pro předplatitele.
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                  <button onClick={() => scrollToId("hodina")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 14px", borderRadius: 14, fontWeight: 950, border: "1px solid rgba(255,255,255,0.24)", background: "rgba(0,0,0,0.35)", color: "white", boxShadow: "0 18px 50px rgba(0,0,0,0.30)", backdropFilter: "blur(6px)", cursor: "pointer" }}>
                    <span aria-hidden style={{ width: 30, height: 30, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" }}>▶</span>
                    Podívat se na ukázkovou hodinu
                  </button>

                  <Link href="/program" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 14px", borderRadius: 14, textDecoration: "none", fontWeight: 950, border: "1px solid rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.14)", color: "white", backdropFilter: "blur(6px)" }}>
                    Prohlédnout program →
                  </Link>

                  <Link href="/poptavka" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 14px", borderRadius: 14, textDecoration: "none", fontWeight: 950, border: "1px solid rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.10)", color: "white", backdropFilter: "blur(6px)" }}>
                    Domluvit ukázku →
                  </Link>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
                  {trustTop3.map((x) => (
                    <Pill key={x} tone="dark">{x}</Pill>
                  ))}
                  <button onClick={() => setProofOpen(true)} style={{ border: "1px solid rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.10)", color: "white", borderRadius: 999, padding: "8px 10px", fontWeight: 950, cursor: "pointer", backdropFilter: "blur(6px)" }}>
                    Detail →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "14px 18px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {valuePills.map((t) => <Pill key={t}>{t}</Pill>)}
            <div style={{ marginLeft: "auto" }}>
              <SoftButton onClick={() => setProofOpen(true)}>Zobrazit podklady</SoftButton>
            </div>
          </div>
        </div>
      </div>

      <Section id="fotky" title="Reálné prostředí – učebny a výuka" subtitle="Tady je realistický vizuální směr. Fotky kdykoli vyměníme za vaše (exteriér/interiér/děti/technologie).">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
          <div style={{ gridColumn: "span 5" }}><GalleryTile src={GALLERY[0].src} alt={GALLERY[0].alt} /></div>
          <div style={{ gridColumn: "span 7" }}><GalleryTile src={GALLERY[1].src} alt={GALLERY[1].alt} /></div>
          <div style={{ gridColumn: "span 4" }}><GalleryTile src={GALLERY[2].src} alt={GALLERY[2].alt} /></div>
          <div style={{ gridColumn: "span 4" }}><GalleryTile src={GALLERY[3].src} alt={GALLERY[3].alt} /></div>
          <div style={{ gridColumn: "span 4" }}><GalleryTile src={GALLERY[4].src} alt={GALLERY[4].alt} /></div>
        </div>
      </Section>

      <Section id="hodina" title="Jak vypadá jedna hodina" subtitle="Krátká ukázka vysílání v učebně. Tohle je nejrychlejší způsob, jak si udělat jasno.">
        <Aspect16x9><VideoFrame embedUrl={DEMO_VIDEO_EMBED} /></Aspect16x9>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
          <PrimaryLink href="/poptavka">Chci ukázkovou hodinu</PrimaryLink>
          <SecondaryLink href="/program">Prohlédnout program</SecondaryLink>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12, marginTop: 16 }}>
          <div style={{ gridColumn: "span 4" }}><MiniStat title="1 třída" text="Třída se připojí jednoduše přes odkaz. Bez složitostí." /></div>
          <div style={{ gridColumn: "span 4" }}><MiniStat title="1 živý vstup" text="Host z praxe – interaktivně, s otázkami a krátkými úkoly." /></div>
          <div style={{ gridColumn: "span 4" }}><MiniStat title="1 pracovní list" text="Okamžitá návaznost: aktivita, úkoly a přínos pro učitele." /></div>
        </div>
      </Section>

      <Section id="pilire" title="Proč to funguje" subtitle="ARCHIMEDES Live je program. Ne další software. Škole dá hotový obsah – obci dává viditelný přínos pro komunitu.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {featureCards.map((c) => (
            <div key={c.title} style={{ gridColumn: "span 4" }}>
              <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "white", boxShadow: "0 14px 40px rgba(0,0,0,0.06)" }}>
                <img src={c.img} alt={c.title} style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>{c.title}</div>
                  <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>{c.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sit" title="Síť učeben a škol" subtitle="Mapa existuje v portálu (/portal/skoly). Veřejná část ukazuje teaser a příběh, detail je po přihlášení.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>Mapa učeben</div>
                  <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.6 }}>Přehled učeben a škol zapojených do programu.</div>
                </div>
                <PrimaryLink href="/portal/skoly">Zobrazit mapu</PrimaryLink>
              </div>

              <div style={{ marginTop: 14, borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", background: "rgba(0,0,0,0.02)" }}>
                <img alt="Mapa – teaser" src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=2400&q=80" style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }} />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Hodonín", "Křenov", "Ostrava", "Praha (příprava)"].map((x) => <Pill key={x}>{x}</Pill>)}
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Komunita obce</div>
              <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.6 }}>Program není jen pro školu. Obec získá obsah i pro dospělé, seniory a spolky.</div>

              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {[{ t: "Škola", d: "Živé vstupy + pracovní listy + neveřejný archiv." }, { t: "Obec", d: "Komunitní program a prestiž díky síti učeben." }, { t: "Rodiny a senioři", d: "Vybrané programy a smysluplná setkávání." }].map((x) => (
                  <div key={x.t} style={{ padding: 12, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ fontWeight: 900 }}>{x.t}</div>
                    <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.55 }}>{x.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section id="financovani" title="Financování" subtitle="Ředitel řeší obsah pro školu. Starosta řeší přínos pro komunitu. Nejrychlejší je ukázková hodina – pak je rozhodnutí jednoduché.">
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
            <div style={{ gridColumn: "span 7" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Jak se obvykle rozhoduje</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, opacity: 0.82, lineHeight: 1.8 }}>
                <li>Ředitel: přínos do výuky a ulehčení práce učitelům.</li>
                <li>Starosta: přínos pro komunitu obce a prestiž.</li>
                <li>Společně: ukázková hodina → rychlé a jisté rozhodnutí.</li>
              </ul>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Chci to vidět naživo</div>
              <div style={{ marginTop: 10, opacity: 0.82, lineHeight: 1.7 }}>
                Domluvíme ukázkovou hodinu. Ukážeme program, materiály a jak to zapojit do školy i obce.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <PrimaryLink href="/poptavka">Domluvit ukázku</PrimaryLink>
                <SecondaryLink href="/cenik">Ceník</SecondaryLink>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section id="cta" tone="dark" title="Chcete ukázkovou hodinu?" subtitle="Nejrychlejší cesta k rozhodnutí: jedna ukázka a máte jasno.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card tone="dark">
              <div style={{ fontWeight: 950, fontSize: 16 }}>Co vám ukážeme</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, opacity: 0.92, lineHeight: 1.85 }}>
                <li>živý vstup s hostem</li>
                <li>kalendář programu</li>
                <li>pracovní list a návaznost</li>
                <li>síť učeben a komunitní rozměr</li>
              </ul>
            </Card>
          </div>
          <div style={{ gridColumn: "span 5" }}>
            <Card tone="dark">
              <div style={{ fontWeight: 950, fontSize: 16 }}>Domluvit ukázku</div>
              <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.7 }}>Napište nám. Ozveme se a vybereme variantu pro vaši školu a obec.</div>
              <div style={{ marginTop: 14 }}>
                <Link href="/poptavka" style={{ display: "inline-flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, textDecoration: "none", fontWeight: 950, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.10)", color: "white" }}>
                  <span>Chci ukázkovou hodinu</span><span aria-hidden>→</span>
                </Link>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.75, lineHeight: 1.6 }}>Pozn.: říkáme „živý program / živé vstupy“, ne „televize“.</div>
            </Card>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 26, opacity: 0.65, fontSize: 13 }}>© {new Date().getFullYear()} ARCHIMEDES Live</div>
      </Section>

      <Modal open={proofOpen} onClose={() => setProofOpen(false)} title="Záštity, ocenění a členství" subtitle="Detaily pro důvěryhodnost (dokumenty + odkazy).">
        <div style={{ display: "grid", gap: 14 }}>
          {proofItems.map((it) => <ProofItem key={it.key} title={it.title} subtitle={it.subtitle} imgUrl={it.imgUrl} href={it.href} />)}
        </div>
      </Modal>
    </div>
  );
}
