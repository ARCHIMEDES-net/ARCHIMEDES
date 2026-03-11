import Link from "next/link";
import dynamic from "next/dynamic";
import PublicHeader from "../components/PublicHeader";

/* Leaflet mapa musí běžet jen v prohlížeči */
const SchoolsMap = dynamic(
  () => import("../components/SchoolsMap"),
  { ssr: false }
);

function InstagramReel({ id }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden" }}>
      <iframe
        src={`https://www.instagram.com/reel/${id}/embed`}
        width="100%"
        height="480"
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
      />
    </div>
  );
}

export default function NovaHomepage() {

  return (
    <>
      <PublicHeader />

      <main style={{ fontFamily: "Inter, sans-serif" }}>

        {/* HERO */}

        <section
          style={{
            maxWidth: 1200,
            margin: "80px auto",
            padding: "0 20px",
            textAlign: "center"
          }}
        >

          <h1 style={{ fontSize: 42, fontWeight: 800 }}>
            ARCHIMEDES® Live
          </h1>

          <p style={{ fontSize: 20, marginTop: 20 }}>
            živý vzdělávací program pro školy a komunitu obce
          </p>

          <p style={{ maxWidth: 700, margin: "20px auto" }}>
            Síť učeben propojených s odborníky, vědou, kulturou a praxí.
          </p>

          <div style={{ marginTop: 30 }}>

            <Link href="/program">
              <a
                style={{
                  padding: "14px 22px",
                  borderRadius: 10,
                  background: "#111827",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  marginRight: 12
                }}
              >
                Ukázková hodina
              </a>
            </Link>

            <Link href="/jak-program-funguje">
              <a
                style={{
                  padding: "14px 22px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Jak program funguje
              </a>
            </Link>

          </div>

        </section>

        {/* VIDEA */}

        <section
          style={{
            maxWidth: 1200,
            margin: "80px auto",
            padding: "0 20px"
          }}
        >

          <h2
            style={{
              textAlign: "center",
              fontSize: 34,
              fontWeight: 800
            }}
          >
            ARCHIMEDES Live v praxi
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 24,
              marginTop: 40
            }}
          >

            {/* Instagram Reels */}
            <InstagramReel id="DVvUBXDCMYC" />
            <InstagramReel id="REEL2" />
            <InstagramReel id="REEL3" />

          </div>

        </section>

        {/* MAPA */}

        <section
          style={{
            maxWidth: 1200,
            margin: "100px auto",
            padding: "0 20px"
          }}
        >

          <h2
            style={{
              textAlign: "center",
              fontSize: 34,
              fontWeight: 800
            }}
          >
            Síť učeben ARCHIMEDES®
          </h2>

          <p
            style={{
              textAlign: "center",
              maxWidth: 700,
              margin: "20px auto"
            }}
          >
            Učebny propojují školy a komunity v České republice
            a postupně vznikají i v dalších evropských zemích.
          </p>

          <div style={{ marginTop: 40 }}>
            <SchoolsMap />
          </div>

        </section>

        {/* PROGRAM */}

        <section
          style={{
            maxWidth: 1200,
            margin: "100px auto",
            padding: "0 20px",
            textAlign: "center"
          }}
        >

          <h2 style={{ fontSize: 34, fontWeight: 800 }}>
            Program ARCHIMEDES Live
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 30,
              marginTop: 40
            }}
          >

            <div>
              <h3>Science</h3>
              <p>setkání s vědci a odborníky</p>
            </div>

            <div>
              <h3>Smart Cities</h3>
              <p>jak bude vypadat město budoucnosti</p>
            </div>

            <div>
              <h3>Čtenářský klub</h3>
              <p>setkání s autory knih</p>
            </div>

            <div>
              <h3>Senior klub</h3>
              <p>program pro starší generaci</p>
            </div>

          </div>

        </section>

        {/* CTA */}

        <section
          style={{
            maxWidth: 900,
            margin: "120px auto",
            padding: "40px",
            textAlign: "center",
            background: "#f5f5f5",
            borderRadius: 16
          }}
        >

          <h2 style={{ fontSize: 32, fontWeight: 800 }}>
            Chcete ARCHIMEDES ve vaší škole nebo obci?
          </h2>

          <p style={{ marginTop: 20 }}>
            Domluvte si ukázkovou hodinu a vyzkoušejte ARCHIMEDES Live
            přímo s vaší třídou.
          </p>

          <div style={{ marginTop: 30 }}>

            <Link href="/poptavka">
              <a
                style={{
                  padding: "14px 26px",
                  borderRadius: 10,
                  background: "#111827",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Domluvit ukázkovou hodinu
              </a>
            </Link>

          </div>

        </section>

      </main>
    </>
  );
}
