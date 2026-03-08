import Link from "next/link";

const trustItems = [
  { value: "20+", label: "učeben ARCHIMEDES" },
  { value: "1 000+", label: "zapojených žáků v síti" },
  { value: "2×", label: "měsíčně Senior klub" },
  { value: "Obec 2030", label: "vítěz soutěže" },
];

const marqueeRow1 = [
  "Hodonín",
  "Hovorany",
  "Moravský Krumlov",
  "Luže",
  "BVV Brno",
  "Ratíškovice",
  "Radvanice",
  "Dašice",
  "Mikulov",
];

const marqueeRow2 = [
  "Křenov",
  "Louny",
  "Čejč",
  "Hlinsko",
  "Chrudim",
  "Kyjov",
  "Dubňany",
  "Frýdek‑Místek",
  "Bučovice",
];

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      
      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "70px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>

          <div>
            <h1 style={{ fontSize: 44, lineHeight: 1.2, marginBottom: 20 }}>
              Živý vzdělávací program
              <br />
              pro školy a obce
            </h1>

            <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 20 }}>
              ARCHIMEDES Live propojuje školy, obce a špičkové odborníky.
              Žáci se učí od vědců, spisovatelů, sportovců a odborníků z praxe – živě.
            </p>

            <ul style={{ lineHeight: 1.8 }}>
              <li>hosté z Akademie věd, univerzit a praxe</li>
              <li>program pro školy i komunitu obce</li>
              <li>síť moderních učeben ARCHIMEDES</li>
            </ul>

            <div style={{ marginTop: 30, display: "flex", gap: 14 }}>
              <Link href="/program" style={btnPrimary}>
                Ukázka programu
              </Link>

              <Link href="/poptavka" style={btnSecondary}>
                Zapojit školu nebo obec
              </Link>
            </div>
          </div>

          <div style={heroImage}>
            FOTO / VIDEO
          </div>

        </div>
      </div>

      {/* TRUST */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 30, opacity: 0.7 }}>
          Důvěra
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {trustItems.map((item) => (
            <div key={item.label} style={trustCard}>
              <div style={{ fontWeight: 700, fontSize: 22 }}>{item.value}</div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MARQUEE CITIES */}
      <div style={{ overflow: "hidden", padding: "40px 0" }}>
        
        <Marquee items={marqueeRow1} direction="left" />
        <Marquee items={marqueeRow2} direction="right" />

      </div>

      {/* CTA */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>
        <h2 style={{ marginBottom: 20 }}>Zapojte svou školu nebo obec</h2>

        <Link href="/poptavka" style={btnPrimary}>
          Chci více informací
        </Link>
      </div>

    </div>
  );
}


function Marquee({ items, direction }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        justifyContent: "center",
        marginBottom: 12,
        flexWrap: "wrap",
      }}
    >
      {items.map((city) => (
        <div key={city} style={cityBadge}>
          {city}
        </div>
      ))}
    </div>
  );
}


const btnPrimary = {
  padding: "12px 20px",
  background: "#111827",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
};

const btnSecondary = {
  padding: "12px 20px",
  border: "2px solid #111827",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
  color: "#111827",
};

const heroImage = {
  background: "#e5e7eb",
  height: 260,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const trustCard = {
  background: "#f3f4f6",
  padding: 18,
  borderRadius: 12,
  textAlign: "center",
};

const cityBadge = {
  padding: "10px 16px",
  background: "white",
  borderRadius: 999,
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  fontWeight: 600,
};
