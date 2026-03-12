import Link from "next/link";

export default function Program() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>

      {/* HERO */}

      <section style={{ marginBottom: 60 }}>
        <h1 style={{ fontSize: 42, marginBottom: 20 }}>
          Program pro školy, seniory a komunitu obce
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.6 }}>
          ARCHIMEDES Live propojuje školu, seniory a komunitní život obce.
          Během roku přináší živá vysílání, inspirativní hosty a tematické programy
          pro různé generace.
        </p>

        <p style={{ fontSize: 18, lineHeight: 1.6 }}>
          Jednoduchý způsob, jak dát obci pravidelný vzdělávací a komunitní program.
        </p>

        <p style={{ marginTop: 20, color: "#555" }}>
          Program vzniká ve spolupráci se školami, obcemi a partnery zapojenými do sítě ARCHIMEDES.
        </p>

        <div style={{ marginTop: 30 }}>
          <Link href="/poptavka">
            <button
              style={{
                padding: "14px 26px",
                fontSize: 16,
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "white",
                cursor: "pointer",
                marginRight: 10,
              }}
            >
              Mám zájem o demo
            </button>
          </Link>

          <a href="#ceny">
            <button
              style={{
                padding: "14px 26px",
                fontSize: 16,
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "white",
                cursor: "pointer",
              }}
            >
              Kolik program stojí
            </button>
          </a>
        </div>
      </section>

      {/* RUBRIKY */}

      <section style={{ marginBottom: 70 }}>
        <h2 style={{ fontSize: 32, marginBottom: 30 }}>Hlavní rubriky programu</h2>

        <div style={{ display: "grid", gap: 30 }}>

          <div>
            <h3>Pro školy</h3>

            <p>
              Pravidelný program pro výuku, který přináší inspirativní témata a hosty z praxe.
            </p>

            <ul>
              <li>I. stupeň – Objevujeme svět</li>
              <li>II. stupeň – Svět v souvislostech</li>
              <li>Kariérní poradenství jinak</li>
              <li>Wellbeing – Generace Z navigátor</li>
            </ul>
          </div>

          <div>
            <h3>Pro seniory</h3>

            <ul>
              <li>
                Senior klub – setkání a rozhovory s inspirativními hosty
                (např. prof. Jan Pirk, Viktor Špaček)
              </li>

              <li>
                Čtenářský klub – společné čtení a živé debaty s autory knih
              </li>

              <li>
                Akademie třetího věku (připravujeme)
              </li>
            </ul>
          </div>

          <div>
            <h3>Pro komunitu a obec</h3>

            <ul>
              <li>Vzdělávání dobrovolných hasičů</li>
              <li>Smart City klub pro deváťáky</li>
              <li>Inspirace pro rozvoj obcí</li>
            </ul>
          </div>

          <div>
            <h3>Letní speciál a kultura</h3>

            <ul>
              <li>Filmový klub s Aerofilms</li>
              <li>Mimořádné tematické vstupy</li>
            </ul>
          </div>

        </div>
      </section>

      {/* VIDEO UKÁZKY */}

      <section style={{ marginBottom: 70 }}>
        <h2 style={{ fontSize: 32, marginBottom: 30 }}>
          Jak vypadá vysílání ARCHIMEDES Live
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: 30,
          }}
        >

          <iframe
            width="100%"
            height="200"
            src="https://www.youtube.com/embed/yvelfGeL6Jg"
            title="Vysílání pro školy"
            frameBorder="0"
            allowFullScreen
          />

          <iframe
            width="100%"
            height="200"
            src="https://www.youtube.com/embed/bX2y0Uxw-Dg"
            title="Angličtina"
            frameBorder="0"
            allowFullScreen
          />

          <iframe
            width="100%"
            height="200"
            src="https://www.youtube.com/embed/-VV3PYdWPUo"
            title="Senior klub"
            frameBorder="0"
            allowFullScreen
          />

        </div>
      </section>

      {/* CENY */}

      <section id="ceny">
        <h2 style={{ fontSize: 32, marginBottom: 30 }}>
          Jak se škola nebo obec může zapojit
        </h2>

        <div style={{ display: "grid", gap: 30 }}>

          <div>
            <h3>Program pro školu a obec</h3>
            <p style={{ fontSize: 28, fontWeight: "bold" }}>
              2 890 Kč / měsíc
            </p>

            <p>
              Pravidelný vzdělávací a komunitní program pro školu i obec během celého roku.
            </p>

            <ul>
              <li>živá vysílání pro školy</li>
              <li>program pro seniory a komunitu</li>
              <li>přístup k archivu vysílání</li>
            </ul>
          </div>

          <div>
            <h3>Senior klub</h3>
            <p style={{ fontSize: 24 }}>1 990 Kč / měsíc</p>
            <p>Pravidelný program pro seniory a komunitní setkávání.</p>
          </div>

          <div>
            <h3>Jednorázový vstup</h3>
            <p style={{ fontSize: 24 }}>490 Kč</p>
          </div>

          <div>
            <h3>Speciální kulturní formát</h3>
            <p style={{ fontSize: 24 }}>490 Kč</p>
          </div>

        </div>
      </section>

      {/* CTA */}

      <section style={{ marginTop: 80 }}>
        <h2>Nejlepší způsob, jak program poznat, je vidět ho naživo.</h2>

        <p>
          Krátká ukázka vysílání během několika minut ukáže,
          jak může ARCHIMEDES Live obohatit školu i komunitní život obce.
        </p>

        <Link href="/poptavka">
          <button
            style={{
              marginTop: 20,
              padding: "14px 26px",
              fontSize: 16,
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "white",
              cursor: "pointer",
            }}
          >
            Mám zájem o demo
          </button>
        </Link>
      </section>

    </main>
  );
}
