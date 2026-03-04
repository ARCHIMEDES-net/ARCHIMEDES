// pages/cenik.js
import Link from "next/link";
import PortalHeader from "../components/PortalHeader";

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
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      {subtitle ? <div style={{ opacity: 0.75, marginTop: 8 }}>{subtitle}</div> : null}

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16 }}>
        <div style={{ fontWeight: 1000, fontSize: 36 }}>{price}</div>
        <div style={{ opacity: 0.7, fontWeight: 700 }}>/ {period}</div>
      </div>

      <ul style={{ marginTop: 16, paddingLeft: 18, lineHeight: 1.6 }}>
        {(items || []).map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <Link
          href={ctaHref}
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 12,
            background: highlight ? "black" : "rgba(0,0,0,0.9)",
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
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "white",
              color: "black",
              fontWeight: 700,
            }}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>Cena bez DPH.</div>
    </div>
  );
}

export default function Cenik() {
  const poptavkaHref = "/poptavka";

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* sjednocená hlavička jako v portálu */}
      <PortalHeader />

      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>Ceník licencí ARCHIMEDES Live</h1>

        <p style={{ opacity: 0.8, maxWidth: 700 }}>
          Licence umožňuje přístup k živému programu, archivu a vzdělávacím materiálům platformy ARCHIMEDES Live.
        </p>
      </div>

      {/* CENÍK */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px 50px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        <PriceCard
          title="Obec"
          badge="Doporučeno"
          price="2 800 Kč"
          period="měsíc"
          subtitle="Program pro školu i komunitu obce."
          items={[
            "Přístup k měsíčnímu programu",
            "Program pro školu, dospělé i seniory",
            "Kalendář vysílání",
            "Archiv a materiály",
          ]}
          ctaLabel="Chci licenci"
          ctaHref={poptavkaHref}
          secondaryLabel="Program"
          secondaryHref="/program"
          highlight
        />

        <PriceCard
          title="Škola"
          badge="ZŠ / SŠ"
          price="2 000 Kč"
          period="měsíc"
          subtitle="Pro školy a vzdělávací instituce."
          items={["Živé vstupy odborníků", "Projektové dny", "Pracovní listy", "Archiv vysílání"]}
          ctaLabel="Chci licenci"
          ctaHref={poptavkaHref}
          secondaryLabel="Program"
          secondaryHref="/program"
        />

        <PriceCard
          title="Senior klub"
          badge="2× měsíčně"
          price="500 Kč"
          period="měsíc"
          subtitle="Program pro seniory."
          items={["Online senior klub", "Společné aktivity", "Digitální vzdělávání", "Komunitní setkání"]}
          ctaLabel="Chci Senior klub"
          ctaHref={poptavkaHref}
          secondaryLabel="Program"
          secondaryHref="/program"
        />
      </div>

      {/* CTA */}
      <div style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Máte zájem o licenci?</h2>

          <Link
            href="/poptavka"
            style={{
              display: "inline-block",
              marginTop: 14,
              background: "black",
              color: "white",
              padding: "14px 22px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Odeslat poptávku
          </Link>
        </div>
      </div>
    </div>
  );
}
