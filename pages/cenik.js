// pages/cenik.js
import Link from "next/link";

function PriceCard({
  title,
  badge,
  price,
  period,
  subtitle,
  items,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  highlight,
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        border: highlight ? "2px solid rgba(0,0,0,0.85)" : "1px solid rgba(0,0,0,0.10)",
        boxShadow: highlight ? "0 18px 45px rgba(0,0,0,0.10)" : "0 10px 30px rgba(0,0,0,0.06)",
        padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
        {badge ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: 999,
              background: highlight ? "black" : "rgba(0,0,0,0.06)",
              color: highlight ? "white" : "black",
              border: highlight ? "1px solid black" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {subtitle ? <div style={{ opacity: 0.75, marginBottom: 12 }}>{subtitle}</div> : null}

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <div style={{ fontWeight: 1000, fontSize: 34, letterSpacing: -0.2 }}>{price}</div>
        <div style={{ opacity: 0.7, fontWeight: 700 }}>
          {period ? ` / ${period}` : ""}
        </div>
      </div>

      <ul style={{ margin: "10px 0 16px", paddingLeft: 18, lineHeight: 1.5 }}>
        {items.map((t, i) => (
          <li key={i} style={{ marginBottom: 6, opacity: 0.9 }}>
            {t}
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href={ctaHref}
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            background: highlight ? "black" : "rgba(0,0,0,0.92)",
            color: "white",
            fontWeight: 800,
          }}
        >
          {ctaLabel}
        </Link>

        {secondaryLabel ? (
          <Link
            href={secondaryHref}
            style={{
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.18)",
              background: "white",
              color: "black",
              fontWeight: 700,
            }}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
        Uvedené ceny jsou bez DPH (pokud se u vás uplatňuje).
      </div>
    </div>
  );
}

export default function Cenik() {
  const contactEmail = "info@archimedeslive.cz"; // uprav dle reality
  const poptavkaHref = `/portal`; // zatím směrujeme do portálu; později dáme /poptavka form

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* HEADER */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 16px",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            <span style={{ letterSpacing: 0.2 }}>ARCHIMEDES</span>{" "}
            <span
              style={{
                background: "#ff2d2d",
                color: "white",
                padding: "2px 8px",
                borderRadius: 8,
                fontWeight: 900,
              }}
            >
              live
            </span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ textDecoration: "none", color: "black", opacity: 0.8 }}>
              Domů
            </Link>
            <Link href="/program" style={{ textDecoration: "none", color: "black", opacity: 0.8 }}>
              Program
            </Link>
            <span style={{ fontWeight: 800 }}>Ceník</span>
            <Link
              href="/portal"
              style={{
                textDecoration: "none",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "white",
                color: "black",
                fontWeight: 800,
              }}
            >
              Portál
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px 8px" }}>
        <h1 style={{ margin: "6px 0 10px", fontSize: 28 }}>Ceník licencí</h1>
        <div style={{ opacity: 0.8, lineHeight: 1.5, maxWidth: 900 }}>
          Licence je vždy k programu a obsahu platformy (živé vysílání + navazující materiály). Pro obce i školy je klíčové,
          že získávají pravidelný obsah a jednoduchý přístup přes portál.
        </div>
      </div>

      {/* CARDS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 10px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <PriceCard
            title="Obec"
            badge="Doporučeno"
            price="2 800 Kč"
            period="měsíc"
            subtitle="Pro malé i střední obce – program pro školu i komunitu."
            items={[
              "Přístup k měsíčnímu programu ARCHIMEDES Live",
              "Školy a mládež + dospělí + senioři + komunita",
              "Kalendář událostí + archiv + pracovní listy (dle událostí)",
              "Vhodné jako služba pro obyvatele obce (komunitní přínos)",
            ]}
            ctaLabel="Chci licenci pro obec"
            ctaHref={poptavkaHref}
            secondaryLabel="Zobrazit program"
            secondaryHref="/program"
            highlight
          />

          <PriceCard
            title="Škola"
            badge="ZŠ / SŠ"
            price="2 000 Kč"
            period="měsíc"
            subtitle="Pro školy, které chtějí pravidelný moderní obsah a inspiraci do výuky."
            items={[
              "Živé vstupy a tematické bloky pro výuku",
              "Pracovní listy / doplňky (dle událostí)",
              "Archiv a záznamy (dle nastavení událostí)",
              "Jednoduché sdílení odkazu v rámci školy",
            ]}
            ctaLabel="Chci licenci pro školu"
            ctaHref={poptavkaHref}
            secondaryLabel="Jak to funguje"
            secondaryHref="/program"
          />

          <PriceCard
            title="Senior klub"
            badge="2× měsíčně"
            price="500 Kč"
            period="měsíc"
            subtitle="Pro obce, kluby a organizace zaměřené na seniory."
            items={[
              "Pravidelný Senior klub 2× měsíčně",
              "Jednoduchý přístup přes kalendář a portál",
              "Vhodné jako program proti izolaci seniorů",
              "Možnost doplnit o další komunitní události",
            ]}
            ctaLabel="Chci Senior klub"
            ctaHref={poptavkaHref}
            secondaryLabel="Zobrazit program"
            secondaryHref="/program"
          />
        </div>

        {/* INFO BLOCK */}
        <div
          style={{
            marginTop: 14,
            background: "white",
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Poznámky k nákupu</div>
          <div style={{ opacity: 0.85, lineHeight: 1.55 }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li style={{ marginBottom: 6 }}>
                Obsah je plánovaný dopředu – vše uvidíte v <b>Programu</b>.
              </li>
              <li style={{ marginBottom: 6 }}>
                Odkazy na vysílání a interní materiály jsou dostupné registrovaným v <b>Portálu</b>.
              </li>
              <li style={{ marginBottom: 6 }}>
                Chcete-li ceník upravit na míru (větší město, více zařízení), napište na{" "}
                <a href={`mailto:${contactEmail}`} style={{ color: "black", fontWeight: 800 }}>
                  {contactEmail}
                </a>
                .
              </li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Link
              href="/portal"
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 12,
                background: "black",
                color: "white",
                fontWeight: 900,
              }}
            >
              Poptat licenci / Přihlásit se
            </Link>

            <Link
              href="/program"
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "white",
                color: "black",
                fontWeight: 800,
              }}
            >
              Zobrazit program
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
          Pokud chceš, další krok je jednoduchý: vytvoříme veřejnou stránku <b>/poptavka</b> s formulářem a ukládáním do DB.
        </div>
      </div>
    </div>
  );
}
