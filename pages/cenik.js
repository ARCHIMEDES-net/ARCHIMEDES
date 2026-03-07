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
        minHeight: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
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

        {badge ? (
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
        ) : null}
      </div>

      <p
        style={{
          margin: "0 0 18px 0",
          color: "rgba(17,24,39,0.72)",
          fontSize: 16,
          lineHeight: 1.6,
          minHeight: 52,
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

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
        <Link
          href={ctaHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 46,
            padding: "0 18px",
            borderRadius: 14,
            textDecoration: "none",
            background: "#111827",
            color: "white",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {ctaLabel}
        </Link>

        <Link
          href={secondaryHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 46,
            padding: "0 18px",
            borderRadius: 14,
            textDecoration: "none",
            background: "white",
            color: "#111827",
            border: "1px solid rgba(17,24,39,0.14)",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
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
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "56px 16px 80px",
          }}
        >
          <div style={{ maxWidth: 760, marginBottom: 34 }}>
            <h1
              style={{
                margin: "0 0 16px 0",
                fontSize: 54,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Ceník licencí ARCHIMEDES Live
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(17,24,39,0.72)",
              }}
            >
              Licence umožňuje přístup k živému programu, archivu a vzdělávacím
              materiálům programu ARCHIMEDES Live. Doporučená varianta pro obec
              spojuje školu, komunitu i seniory do jednoho smysluplného celku.
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)",
              borderRadius: 24,
              padding: 26,
              color: "white",
              marginBottom: 34,
              boxShadow: "0 18px 48px rgba(15,23,42,0.16)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 22,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.72)",
                    marginBottom: 10,
                    fontWeight: 700,
                  }}
                >
                  Doporučená volba pro obec
                </div>

                <h2
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: 34,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Jedna licence pro školu, komunitu i seniory v obci
                </h2>

                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  Balíček <strong>Obec</strong> spojuje program pro školu,
                  komunitu i seniory do jedné licence. Obec tak získává
                  pravidelný živý program, který může využít více generací
                  obyvatel.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.76)", marginBottom: 10 }}>
                  Složení doporučeného balíčku:
                </div>
                <div style={{ display: "grid", gap: 10, fontSize: 16 }}>
                  <div>Škola: <strong>2 000 Kč</strong></div>
                  <div>Komunita: <strong>500 Kč</strong></div>
                  <div>Senior klub: <strong>500 Kč</strong></div>
                  <div
                    style={{
                      marginTop: 4,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 18,
                    }}
                  >
                    Doporučená cena pro obec: <strong>2 800 Kč / měsíc</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            <PriceCard
              title="Obec"
              badge="Doporučeno"
              price="2 800 Kč"
              period="/ měsíc"
              subtitle="Jedna licence pro celou obec – školu, komunitu i seniory."
              items={[
                "přístup k měsíčnímu programu",
                "program pro školu, komunitu i seniory",
                "kalendář živých vysílání",
                "archiv a vzdělávací materiály",
                "jedna doporučená licence pro obec",
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
              subtitle="Program pro školy připravený tak, aby ho učitel mohl využít bez složité přípravy."
              items={[
                "živé vstupy odborníků",
                "projektové dny a tematické bloky",
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
              subtitle="Program pro komunitu obce a veřejnost."
              items={[
                "webináře pro veřejnost",
                "čtenářský klub a kulturní formáty",
                "wellbeing programy",
                "komunitní setkání a inspirace",
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
                "online Senior klub",
                "společné aktivity",
                "digitální vzdělávání",
                "komunitní setkání",
              ]}
              ctaLabel="Mám zájem o Senior klub"
              ctaHref="/poptavka"
              secondaryLabel="Program"
              secondaryHref="/program"
            />
          </div>

          <div
            style={{
              marginTop: 34,
              background: "white",
              border: "1px solid rgba(17,24,39,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: 24,
                color: "#111827",
              }}
            >
              Jak číst tento ceník
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.8,
                color: "rgba(17,24,39,0.72)",
              }}
            >
              Samostatné licence dávají smysl tam, kde chce organizace řešit pouze jednu
              cílovou skupinu. Doporučená varianta <strong>Obec</strong> je určena
              pro starosty a vedení obcí, kteří chtějí jeden srozumitelný balíček
              pro školu, komunitu i seniory.
            </p>
          </div>
        </section>
      </main>

      <style jsx>{`
        @media (max-width: 1120px) {
          h1 {
            font-size: 44px !important;
          }
        }

        @media (max-width: 1040px) {
          div[style*="repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          div[style*="grid-template-columns: 1.2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          h1 {
            font-size: 34px !important;
          }

          div[style*="repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
