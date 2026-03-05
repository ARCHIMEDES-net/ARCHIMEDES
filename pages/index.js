// pages/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const MAX_WIDTH = 1120;

// ---- Helpers (no external CSS needed) ----
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

function Section({ id, title, subtitle, children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <section
      id={id}
      style={{
        padding: "70px 16px",
        background: dark ? "#0b1220" : "transparent",
        color: dark ? "white" : "inherit",
      }}
    >
      <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
        {title ? (
          <h2 style={{ margin: 0, fontSize: 34, letterSpacing: -0.2, lineHeight: 1.15 }}>
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p style={{ margin: "12px 0 0", maxWidth: 820, opacity: dark ? 0.85 : 0.75, lineHeight: 1.65 }}>
            {subtitle}
          </p>
        ) : null}
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>
    </section>
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

function ButtonLink({ href, children, variant = "primary" }) {
  const primary = variant === "primary";
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
        fontWeight: 800,
        border: primary ? "1px solid rgba(0,0,0,0.9)" : "1px solid rgba(0,0,0,0.12)",
        background: primary ? "rgba(0,0,0,0.94)" : "white",
        color: primary ? "white" : "rgba(0,0,0,0.9)",
        boxShadow: primary ? "0 16px 42px rgba(0,0,0,0.22)" : "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      <span>{children}</span>
      <span aria-hidden style={{ opacity: 0.9 }}>
        →
      </span>
    </Link>
  );
}

function SoftButton({ onClick, children }) {
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
        fontWeight: 850,
        cursor: "pointer",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "white",
        boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      <span>{children}</span>
      <span aria-hidden>→</span>
    </button>
  );
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
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            {subtitle ? (
              <div style={{ marginTop: 2, opacity: 0.7, fontSize: 13, lineHeight: 1.4 }}>
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
              fontWeight: 850,
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
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: 12,
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900 }}>{title}</div>
          <div style={{ marginTop: 4, opacity: 0.75, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              alignSelf: "center",
              textDecoration: "none",
              fontWeight: 850,
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
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "white",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Aspect16x9({ children }) {
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
      <div style={{ position: "relative", paddingTop: "56.25%", background: "rgba(0,0,0,0.04)" }}>{children}</div>
    </div>
  );
}

function VideoPlaceholder({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        cursor: "pointer",
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.10) 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: 18 }}>
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: 999,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            fontSize: 28,
            fontWeight: 900,
          }}
          aria-hidden
        >
          ▶
        </div>
        <div style={{ marginTop: 12, fontWeight: 950, fontSize: 18 }}>Přehrát ukázku hodiny</div>
        <div style={{ marginTop: 6, opacity: 0.85, lineHeight: 1.6 }}>
          Sem vložíme krátké video (20–40 s). Zatím je to jen placeholder.
        </div>
      </div>
    </button>
  );
}

// ---- Page ----
export default function Home() {
  const [proofOpen, setProofOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  useLockBodyScroll(proofOpen || videoOpen);

  // TODO: Replace with your real assets (from archimedesoec.com gallery)
  const HERO_IMAGE =
    "https://images.unsplash.com/photo-1588072432836-7fb78b4a0b1f?auto=format&fit=crop&w=2400&q=80";

  // TODO: Replace with real YouTube embed (or leave empty to show placeholder)
  // Example: "https://www.youtube.com/embed/XXXXXXXXXXX"
  const DEMO_VIDEO_EMBED = "";

  const trustRow = useMemo(
    () => ["Eva Pavlová", "MPO", "MŽP", "MMR", "E.ON Energy Globe", "Creative Business Cup", "UNESCO GEP"],
    []
  );

  const trustBadges = useMemo(
    () => [
      "Živý vzdělávací program (ne software)",
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
      {
        key: "zastita-web",
        title: "Záštity – přehled na webu projektu",
        subtitle: "Veřejná stránka s informacemi o záštitách.",
        href: "https://www.archimedes-net.com/zastita/",
      },
      {
        key: "mpo",
        title: "Záštita – MPO (dokument)",
        subtitle: "Náhled dokumentu záštity (sken).",
        imgUrl:
          "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000182-a2f4fa2f53/zastita%20MPO.jpeg?ph=fb18f7b042",
      },
      {
        key: "mzp",
        title: "Záštita – MŽP (dokument)",
        subtitle: "Náhled dokumentu záštity (sken).",
        imgUrl:
          "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000256-b95eab95ec/za%CC%81s%CC%8Ctita%20-%20ARCHIMEDES_Stra%CC%81nka_2.jpeg?ph=fb18f7b042",
      },
      {
        key: "mmr",
        title: "Záštita – MMR (dokument)",
        subtitle: "Náhled dokumentu záštity (sken).",
        imgUrl:
          "https://fb18f7b042.clvaw-cdnwnd.com/672ddf20a524990e3e51b0287606f721/200000260-cf481cf483/IMG_9784.jpeg?ph=fb18f7b042",
      },
      {
        key: "eon",
        title: "Finalista E.ON Energy Globe",
        subtitle: "Odkaz na stránku E.ON Energy Globe (minulé ročníky).",
        href: "https://www.eon.cz/energy-globe/minule-rocniky/sit-energeticky-sobestacnych-uceben-archimedes/",
      },
      {
        key: "cbc",
        title: "Creative Business Cup – Miláček publika",
        subtitle: "Zmínka CzechInvest (národní finále Creative Business Cup).",
        href: "https://www.facebook.com/CzechInvest/posts/601127312058741/",
      },
      {
        key: "unesco",
        title: "Greening Education Partnership (UNESCO)",
        subtitle: "Základní odkaz + zmínka na vašem webu.",
        href: "https://www.archimedes-net.com/",
      },
    ],
    []
  );

  const featureCards = useMemo(
    () => [
      {
        title: "Inspirativní hosté",
        text: "Děti potkají lidi z praxe. Krátce, srozumitelně, interaktivně.",
        img:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80",
      },
      {
        title: "Pracovní listy",
        text: "Hotové materiály šetří učitelům čas. Hodina má jasný scénář.",
        img:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
      },
      {
        title: "Živé vysílání",
        text: "Google Meet – jednoduché připojení. Program je živý, ne pasivní.",
        img:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1400&q=80",
      },
    ],
    []
  );

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* PublicHeader řeší pages/_app.js */}

      {/* HERO */}
      <div style={{ padding: "26px 16px 0" }}>
        <div
          style={{
            maxWidth: MAX_WIDTH,
            margin: "0 auto",
            borderRadius: 22,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.10)",
            background: "white",
          }}
        >
          <div style={{ position: "relative", height: 520 }}>
            <img
              src={HERO_IMAGE}
              alt="ARCHIMEDES Live – ukázka výuky"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.12) 100%)",
              }}
            />
            <div style={{ position: "absolute", inset: 0, padding: 22, display: "flex", alignItems: "center" }}>
              <div style={{ maxWidth: 820 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: "#22c55e" }} />
                  Živý vzdělávací program pro školy a obce (ne software)
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: 54,
                    lineHeight: 1.04,
                    letterSpacing: -0.45,
                    textShadow: "0 10px 40px rgba(0,0,0,0.35)",
                  }}
                >
                  archimedes{" "}
                  <span style={{ background: "#ef4444", padding: "2px 10px", borderRadius: 10 }}>live</span>
                </h1>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "rgba(255,255,255,0.92)",
                    fontSize: 18,
                    lineHeight: 1.65,
                    maxWidth: 720,
                    textShadow: "0 10px 40px rgba(0,0,0,0.30)",
                  }}
                >
                  Každý měsíc hotový obsah: <b>živé vstupy s hosty</b>, <b>pracovní listy</b>, komunitní program a
                  neveřejný archiv pro předplatitele.
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                  <button
                    onClick={() => setVideoOpen(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 14,
                      fontWeight: 900,
                      border: "1px solid rgba(255,255,255,0.24)",
                      background: "rgba(0,0,0,0.35)",
                      color: "white",
                      boxShadow: "0 18px 50px rgba(0,0,0,0.30)",
                      backdropFilter: "blur(6px)",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.22)",
                      }}
                    >
                      ▶
                    </span>
                    Podívat se na ukázkovou hodinu
                  </button>

                  <Link
                    href="/program"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 14,
                      textDecoration: "none",
                      fontWeight: 900,
                      border: "1px solid rgba(255,255,255,0.24)",
                      background: "rgba(255,255,255,0.14)",
                      color: "white",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    Prohlédnout program →
                  </Link>

                  <Link
                    href="/poptavka"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 14,
                      textDecoration: "none",
                      fontWeight: 900,
                      border: "1px solid rgba(255,255,255,0.24)",
                      background: "rgba(255,255,255,0.10)",
                      color: "white",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    Domluvit ukázku →
                  </Link>
                </div>

                {/* Minimal trust: keep it subtle, not "in your face" */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.86)", fontSize: 13, fontWeight: 850 }}>
                    Záštity a ocenění:
                  </span>
                  {trustRow.map((x) => (
                    <Pill key={x} tone="dark">
                      {x}
                    </Pill>
                  ))}
                  <div style={{ marginLeft: 6 }}>
                    <button
                      onClick={() => setProofOpen(true)}
                      style={{
                        border: "1px solid rgba(255,255,255,0.24)",
                        background: "rgba(255,255,255,0.10)",
                        color: "white",
                        borderRadius: 999,
                        padding: "8px 10px",
                        fontWeight: 850,
                        cursor: "pointer",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      Podklady →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Below-hero value pills (keep), but remove any second "trust strip" below */}
          <div style={{ padding: "14px 18px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {trustBadges.map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <SoftButton onClick={() => setProofOpen(true)}>Zobrazit podklady</SoftButton>
            </div>
          </div>
        </div>
      </div>

      {/* (Removed) Duplicate "Záštity a ocenění" block — was too loud & repetitive */}

      {/* Hour demo */}
      <Section
        id="hodina"
        title="Jak vypadá jedna hodina"
        subtitle="Zde bude krátká ukázka (20–40 s). Teď je připravený reálný vizuál – video jen doplníme."
      >
        <div style={{ maxWidth: MAX_WIDTH, margin: "0 auto" }}>
          <Aspect16x9>
            {DEMO_VIDEO_EMBED ? (
              <iframe
                title="Ukázková hodina ARCHIMEDES Live"
                src={DEMO_VIDEO_EMBED}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            ) : (
              <VideoPlaceholder onClick={() => setVideoOpen(true)} />
            )}
          </Aspect16x9>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <ButtonLink href="/program" variant="primary">
              Více o programu
            </ButtonLink>
            <ButtonLink href="/poptavka" variant="secondary">
              Chci ukázkovou hodinu
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Feature cards */}
      <Section
        id="features"
        title="Síť učeben ARCHIMEDES"
        subtitle="Spojení fyzických učeben a živého programu je vaše největší konkurenční výhoda. (Fotky později vyměníme za vaše.)"
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          {featureCards.map((c) => (
            <div key={c.title} style={{ gridColumn: "span 4" }}>
              <div
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "white",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
                }}
              >
                <img
                  src={c.img}
                  alt={c.title}
                  style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>{c.title}</div>
                  <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.6 }}>{c.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Map + community */}
      <Section
        id="sit"
        title="Mapa učeben a škol"
        subtitle="V portálu už máte reálnou mapu (/portal/skoly). Na veřejné homepage stačí teaser + CTA."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 7" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>Síť učeben v ČR</div>
                  <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.6 }}>
                    Na veřejné části jen teaser a odkaz do portálu.
                  </div>
                </div>
                <ButtonLink href="/portal/skoly" variant="primary">
                  Zobrazit mapu
                </ButtonLink>
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 18,
                  border: "1px solid rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  background: "rgba(0,0,0,0.02)",
                }}
              >
                <img
                  alt="Mapa – teaser"
                  src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=2400&q=80"
                  style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Hodonín", "Křenov", "Ostrava", "Praha (příprava)"].map((x) => (
                  <Pill key={x}>{x}</Pill>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "span 5" }}>
            <Card>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Komunita</div>
              <div style={{ marginTop: 6, opacity: 0.78, lineHeight: 1.6 }}>
                Program není jen pro školu. Obec získá obsah i pro dospělé, seniory a spolky.
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {[
                  { t: "Škola", d: "Živé vstupy + pracovní listy + archiv." },
                  { t: "Obec", d: "Komunitní program a prestiž (síť učeben)." },
                  { t: "Rodiny a senioři", d: "Vybrané komunitní programy a setkávání." },
                ].map((x) => (
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

      {/* Financing */}
      <Section
        id="financovani"
        title="Financování"
        subtitle="Jednoduchá logika: ředitel řeší obsah pro školu, starosta přínos pro komunitu. V praxi se financování často kombinuje."
      >
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
            <div style={{ gridColumn: "span 7" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Jak se obvykle rozhoduje</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, opacity: 0.82, lineHeight: 1.8 }}>
                <li>Ředitel: přínos do výuky a ulehčení práce učitelům.</li>
                <li>Starosta: přínos pro komunitu obce a prestiž.</li>
                <li>Společně: rychlá ukázková hodina → jasné rozhodnutí.</li>
              </ul>
            </div>
            <div style={{ gridColumn: "span 5" }}>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Chci to vidět naživo</div>
              <div style={{ marginTop: 10, opacity: 0.82, lineHeight: 1.7 }}>
                Domluvíme ukázkovou hodinu. Ukážeme program, materiály a jak to zapojit do školy i obce.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ButtonLink href="/poptavka" variant="primary">
                  Domluvit ukázku
                </ButtonLink>
                <ButtonLink href="/cenik" variant="secondary">
                  Ceník
                </ButtonLink>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Final CTA */}
      <Section
        id="cta"
        tone="dark"
        title="Chcete ukázkovou hodinu?"
        subtitle="Nejrychlejší způsob, jak to pochopit i rozhodnout: jedna ukázka a máte jasno."
      >
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
              <div style={{ marginTop: 10, opacity: 0.92, lineHeight: 1.7 }}>
                Napište nám. Ozveme se a vybereme variantu pro vaši školu a obec.
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
                    fontWeight: 900,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.10)",
                    color: "white",
                  }}
                >
                  <span>Chci ukázkovou hodinu</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.75, lineHeight: 1.6 }}>
                Pozn.: říkáme „živý program / živé vstupy“, ne „televize“.
              </div>
            </Card>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 26, opacity: 0.65, fontSize: 13 }}>
          © {new Date().getFullYear()} ARCHIMEDES Live
        </div>
      </Section>

      {/* Proof modal */}
      <Modal
        open={proofOpen}
        onClose={() => setProofOpen(false)}
        title="Podklady: záštity, ocenění a členství"
        subtitle="Detaily pro důvěryhodnost (dokumenty + odkazy)."
      >
        <div style={{ display: "grid", gap: 14 }}>
          {proofItems.map((it) => (
            <ProofItem key={it.key} title={it.title} subtitle={it.subtitle} imgUrl={it.imgUrl} href={it.href} />
          ))}
        </div>
      </Modal>

      {/* Video modal */}
      <Modal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="Ukázková hodina"
        subtitle={DEMO_VIDEO_EMBED ? "Přehrávání ukázky." : "Zatím nemáme vložené video – doplníme později."}
      >
        {DEMO_VIDEO_EMBED ? (
          <Aspect16x9>
            <iframe
              title="Ukázková hodina ARCHIMEDES Live"
              src={DEMO_VIDEO_EMBED}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </Aspect16x9>
        ) : (
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontWeight: 900 }}>Chybí video URL</div>
            <div style={{ marginTop: 8, opacity: 0.78, lineHeight: 1.65 }}>
              Až bude hotové krátké video, vložte sem YouTube embed URL (proměnná <b>DEMO_VIDEO_EMBED</b> nahoře v souboru).
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              Příklad: https://www.youtube.com/embed/XXXXXXXXXXX
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
