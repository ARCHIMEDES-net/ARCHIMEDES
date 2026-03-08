import Link from "next/link";

export default function Home() {
  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh", fontFamily: "system-ui" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>

          <div>
            <h1 style={{ fontSize: 44, lineHeight: 1.2, marginBottom: 16 }}>
              Živý vzdělávací program a moderní učebny
              <br />
              pro školy a obce
            </h1>

            <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 20 }}>
              ARCHIMEDES Live propojuje školy, obce a špičkové odborníky.
              Součástí projektu je také moderní venkovní učebna ARCHIMEDES,
              která slouží pro výuku, komunitní program a živé vysílání.
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

          <div style={placeholderBig}>
            FOTKA / VIDEO
          </div>
        </div>
      </div>

      {/* DŮVĚRA */}
      <div style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>

          <h2 style={{ textAlign: "center", marginBottom: 30 }}>Důvěra</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            <div style={card}>20+ učeben ARCHIMEDES</div>
            <div style={card}>1000+ zapojených žáků</div>
            <div style={card}>2× měsíčně Senior klub</div>
            <div style={card}>vítěz soutěže Obec 2030</div>
          </div>

        </div>
      </div>

      {/* UČEBNA */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>

          <div style={placeholderBig}>
            FOTKA UČEBNY
          </div>

          <div>
            <h2>Moderní učebna ARCHIMEDES</h2>

            <p style={{ opacity: 0.8 }}>
              Venkovní učebna ARCHIMEDES je prostor pro moderní výuku,
              komunitní setkávání i živé vysílání ARCHIMEDES Live.
            </p>

            <ul style={{ lineHeight: 1.8 }}>
              <li>výuka venku po celý rok</li>
              <li>prostor pro komunitní program</li>
              <li>místo pro živé vzdělávací vysílání</li>
            </ul>

            <Link href="/ucebna" style={{ ...btnPrimary, marginTop: 20, display: "inline-block" }}>
              Více o učebně
            </Link>
          </div>

        </div>
      </div>

      {/* PROGRAM */}
      <div style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>

          <h2 style={{ textAlign: "center", marginBottom: 30 }}>Program</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            <div style={card}>Science ON</div>
            <div style={card}>Smart City klub</div>
            <div style={card}>Čtenářský klub</div>
            <div style={card}>Senior klub</div>
          </div>

        </div>
      </div>

      {/* HOSTÉ */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>

        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Hosté programu</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          <div style={placeholder}>HOST</div>
          <div style={placeholder}>HOST</div>
          <div style={placeholder}>HOST</div>
          <div style={placeholder}>HOST</div>
        </div>

      </div>

      {/* PARTNEŘI */}
      <div style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>

          <h2 style={{ textAlign: "center", marginBottom: 30 }}>Partneři projektu</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 20 }}>
            <div style={logo}>LOGO</div>
            <div style={logo}>LOGO</div>
            <div style={logo}>LOGO</div>
            <div style={logo}>LOGO</div>
            <div style={logo}>LOGO</div>
            <div style={logo}>LOGO</div>
          </div>

        </div>
      </div>

      {/* MÉDIA */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px" }}>

        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Média</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 20 }}>
          <div style={logo}>LOGO</div>
          <div style={logo}>LOGO</div>
          <div style={logo}>LOGO</div>
          <div style={logo}>LOGO</div>
        </div>

      </div>

      {/* CTA */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>

        <h2>Zapojte svou školu nebo obec</h2>

        <Link href="/poptavka" style={{ ...btnPrimary, marginTop: 20, display: "inline-block" }}>
          Chci více informací
        </Link>

      </div>

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

const card = {
  background: "#f9fafb",
  padding: 20,
  borderRadius: 12,
  textAlign: "center",
  fontWeight: 600,
};

const placeholder = {
  background: "#e5e7eb",
  height: 160,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const placeholderBig = {
  background: "#e5e7eb",
  height: 260,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const logo = {
  background: "#f3f4f6",
  height: 70,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};
