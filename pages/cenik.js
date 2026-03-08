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
        border: highlight
          ? "2px solid rgba(17,24,39,0.85)"
          : "1px solid rgba(17,24,39,0.10)",
        boxShadow: highlight
          ? "0 18px 45px rgba(17,24,39,0.10)"
          : "0 10px 30px rgba(17,24,39,0.06)",
        padding: 22,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          {title}
        </h3>

        {badge && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              background: highlight ? "#111827" : "#f3f4f6",
              color: highlight ? "white" : "#111827",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <p
        style={{
          margin: "0 0 18px 0",
          color: "rgba(17,24,39,0.72)",
          fontSize: 16,
          lineHeight: 1.6,
        }}
      >
        {subtitle}
      </p>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 38,
              lineHeight: 1,
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.03em",
            }}
          >
            {price}
          </span>
          <span
            style={{
              fontSize: 16,
              color: "rgba(17,24,39,0.7)",
              fontWeight: 600,
            }}
          >
            {period}
          </span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "#374151",
            lineHeight: 1.8,
            fontSize: 16,
          }}
        >
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="buttonRow">
        <Link href={ctaHref} className="btnPrimary">
          {ctaLabel}
        </Link>

        <Link href={secondaryHref} className="btnSecondary">
          {secondaryLabel}
        </Link>
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 14,
          color: "rgba(17,24,39,0.45)",
        }}
      >
        Cena bez DPH.
      </div>
    </div>
  );
}

export default function Cenik() {
  return (
    <div className="page">
      <main>
        <section className="section">
          <div className="intro">
            <h1>Ceník licencí ARCHIMEDES Live</h1>

            <p>
              Licence umožňuje přístup k živému programu, archivu a
              vzdělávacím materiálům programu ARCHIMEDES Live.
            </p>
          </div>

          <div className="cardsGrid">
            <PriceCard
              title="Obec"
              badge="Doporučeno"
              price="2 800 Kč"
              period="/ měsíc"
              subtitle="Jedna licence pro celou obec."
              items={[
                "program pro školu",
                "program pro komunitu",
                "senior klub",
              ]}
              ctaLabel="Mám zájem o licenci"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
              highlight
            />

            <PriceCard
              title="Škola"
              badge="ZŠ / SŠ"
              price="2 000 Kč"
              period="/ měsíc"
              subtitle="Program pro školy."
              items={[
                "živé vstupy odborníků",
                "pracovní listy",
                "archiv vysílání",
              ]}
              ctaLabel="Mám zájem o licenci"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />

            <PriceCard
              title="Komunita"
              badge="Veřejnost"
              price="500 Kč"
              period="/ měsíc"
              subtitle="Program pro komunitu."
              items={[
                "webináře",
                "kulturní program",
                "wellbeing",
              ]}
              ctaLabel="Mám zájem o program"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />

            <PriceCard
              title="Senior klub"
              badge="2× měsíčně"
              price="500 Kč"
              period="/ měsíc"
              subtitle="Program pro seniory."
              items={[
                "online klub",
                "digitální vzdělávání",
                "komunitní setkání",
              ]}
              ctaLabel="Mám zájem o Senior klub"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />
          </div>
        </section>
      </main>

      <style jsx>{`

.page{
font-family:system-ui;
background:#f6f7fb;
min-height:100vh;
}

.section{
max-width:1180px;
margin:0 auto;
padding:60px 16px;
}

.cardsGrid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:18px;
}

.buttonRow{
display:flex;
gap:10px;
flex-wrap:wrap;
margin-top:22px;
}

/* PRIMARY BUTTON */

.btnPrimary{
display:inline-flex;
align-items:center;
justify-content:center;
height:48px;
padding:0 20px;
background:#111827;
color:white;
border-radius:14px;
font-weight:700;
text-decoration:none;
transition:all .15s ease;
}

.btnPrimary:hover{
transform:translateY(-2px);
box-shadow:0 10px 22px rgba(0,0,0,0.18);
background:#1f2937;
}

.btnPrimary:active{
transform:translateY(0);
box-shadow:0 4px 10px rgba(0,0,0,0.2);
}

/* SECONDARY BUTTON */

.btnSecondary{
display:inline-flex;
align-items:center;
justify-content:center;
height:48px;
padding:0 20px;
background:white;
border:1px solid rgba(0,0,0,0.18);
color:#111827;
border-radius:14px;
font-weight:700;
text-decoration:none;
transition:all .15s ease;
}

.btnSecondary:hover{
transform:translateY(-2px);
box-shadow:0 8px 18px rgba(0,0,0,0.12);
}

.btnSecondary:active{
transform:translateY(0);
box-shadow:0 4px 10px rgba(0,0,0,0.2);
}

/* RESPONSIVE */

@media (max-width:1040px){

.cardsGrid{
grid-template-columns:repeat(2,1fr);
}

}

@media (max-width:640px){

.cardsGrid{
grid-template-columns:1fr;
}

}

`}</style>
    </div>
  );
}
