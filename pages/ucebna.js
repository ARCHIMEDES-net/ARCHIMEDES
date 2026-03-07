import Link from "next/link";

export default function Ucebna() {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>

        {/* HERO */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "60px 16px 40px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 52,
                  lineHeight: 1.05,
                  marginBottom: 18,
                  color: "#111827",
                  letterSpacing: "-0.02em",
                }}
              >
                Venkovní učebna ARCHIMEDES®
              </h1>

              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 18,
                  color: "#374151",
                }}
              >
                Budoucnost vzdělávání v souladu s přírodou
              </h2>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: "rgba(17,24,39,0.75)",
                  marginBottom: 26,
                  maxWidth: 600,
                }}
              >
                Inovativní prostor, který propojuje moderní technologie s
                přirozeným venkovním prostředím. Učte se, tvořte a setkávejte se
                na čerstvém vzduchu – bez kompromisů v komfortu nebo vybavení.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  href="#varianty"
                  style={{
                    background: "#111827",
                    color: "white",
                    padding: "14px 20px",
                    borderRadius: 14,
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Vybrat variantu
                </a>

                <Link
                  href="/kontakt"
                  style={{
                    border: "1px solid rgba(0,0,0,0.18)",
                    padding: "14px 20px",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "#111827",
                    fontWeight: 700,
                    background: "white",
                  }}
                >
                  Prohlédnout vzorovou učebnu
                </Link>
              </div>
            </div>

            {/* místo pro fotografii */}
            <div
              style={{
                width: "100%",
                height: 340,
                background: "#e5e7eb",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              Fotografie učebny
            </div>
          </div>
        </section>

        {/* O PROJEKTU */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 16,
              color: "#111827",
            }}
          >
            Prostor, který inspiruje
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "rgba(17,24,39,0.75)",
              maxWidth: 760,
            }}
          >
            ARCHIMEDES® je systém venkovních učeben o rozměru 6,5 × 10 metrů,
            navržený pro moderní školství i komunitní život obcí. Spojuje
            přírodní prostředí, moderní technologie a flexibilní prostor pro
            výuku, workshopy i kulturní akce.
          </p>
        </section>

        {/* VARIANTY */}
        <section
          id="varianty"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px 80px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 28,
              color: "#111827",
            }}
          >
            Vyberte si svou variantu
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
          >
            <Variant
              title="ARCHIMEDES OPTIMAL"
              subtitle="Svoboda v otevřenosti"
              text="Celodřevěná konstrukce s posuvnými stěnami umožňuje plné otevření učebny do okolní krajiny."
            />

            <Variant
              title="ARCHIMEDES OPTIMAL+"
              subtitle="Komfort za každého počasí"
              text="Lepší izolace a energetická efektivita při zachování přírodního vzhledu dřeva."
            />

            <Variant
              title="ARCHIMEDES PREMIUM"
              subtitle="Standard trvalé stavby"
              text="Plně zateplená konstrukce navržená pro intenzivní celoroční využití."
            />
          </div>
        </section>

        {/* MODULY */}
        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px 80px",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              marginBottom: 28,
              color: "#111827",
            }}
          >
            Moduly a vybavení
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 30,
            }}
          >
            <Module
              title="Modul WC"
              text="Možnost doplnění o sociální zázemí se dvěma toaletami a technickým skladem."
            />

            <Module
              title="Digitální výuka"
              text="Interaktivní panel, projektor, Wi-Fi infrastruktura a profesionální audiovizuální technika."
            />

            <Module
              title="Ekosystém"
              text="Zelené stěny, vyvýšené záhony, retenční nádrže a pozorování přírody."
            />

            <Module
              title="Variabilní mobiliář"
              text="Skládací stoly a lavice umožňují rychlou změnu uspořádání výuky."
            />
          </div>
        </section>

      </main>
    </div>
  );
}

function Variant({ title, subtitle, text }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{subtitle}</div>
      <p style={{ opacity: 0.8 }}>{text}</p>
    </div>
  );
}

function Module({ title, text }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <p style={{ opacity: 0.8 }}>{text}</p>
    </div>
  );
}
