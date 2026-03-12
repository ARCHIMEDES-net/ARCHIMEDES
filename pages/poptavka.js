
// pages/poptavka.js

import Link from "next/link";
import PublicHeader from "../components/PublicHeader";

export default function PoptavkaPage() {
  return (
    <>
      <PublicHeader />

      <main style={{maxWidth: 1100, margin: "0 auto", padding: "60px 20px"}}>

        {/* HERO */}

        <h1 style={{fontSize: 40, marginBottom: 20}}>
          Mám zájem
        </h1>

        <p style={{fontSize: 18, lineHeight: 1.6, maxWidth: 700}}>
          ARCHIMEDES propojuje vzdělávání, komunitní život a inspirativní
          setkávání lidí.
        </p>

        <p style={{fontSize: 18, lineHeight: 1.6, maxWidth: 700}}>
          Můžete využívat živý program <strong>ARCHIMEDES Live</strong>,
          postavit <strong>učebnu ARCHIMEDES</strong> nebo obojí propojit.
        </p>

        <p style={{fontSize: 18, lineHeight: 1.6, maxWidth: 700, marginBottom: 40}}>
          Stačí nám napsat pár informací a společně najdeme nejlepší řešení
          pro vaši školu, obec nebo komunitu.
        </p>

        {/* OPTIONS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 24,
            marginBottom: 60
          }}
        >

          <div style={card}>
            <h3>Program ARCHIMEDES Live</h3>
            <p>
              Živý vzdělávací a komunitní program s inspirativními hosty,
              který mohou využívat školy, obce i místní komunity během
              celého roku.
            </p>
          </div>

          <div style={card}>
            <h3>Učebna ARCHIMEDES</h3>
            <p>
              Moderní venkovní učebna jako prostor pro výuku, setkávání
              lidí a komunitní aktivity.
            </p>
          </div>

          <div style={card}>
            <h3>Program + učebna</h3>
            <p>
              Propojení prostoru a programu vytváří místo, kde se mohou
              potkávat děti, senioři i obyvatelé obce.
            </p>
          </div>

          <div style={card}>
            <h3>Návštěva vzorové učebny</h3>
            <p>
              Rádi vás provedeme vzorovou učebnou ARCHIMEDES na BVV v Brně
              a ukážeme vám, jak může projekt fungovat ve vaší obci.
            </p>
          </div>

        </div>

        <p style={{marginBottom: 60}}>
          Nejste si jistí? Stačí napsat pár slov a společně najdeme vhodné
          řešení.
        </p>

        {/* TRUST SECTION */}

        <section style={{marginBottom: 60}}>
          <h2>ARCHIMEDES už funguje v praxi</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 20,
              marginTop: 20
            }}
          >
            <div>
              <strong>20+ realizovaných učeben</strong>
              <p>Místa, kde se potkává výuka, komunita a inspirativní hosté.</p>
            </div>

            <div>
              <strong>Program pro více generací</strong>
              <p>Zapojit se mohou školy, senioři i místní komunita.</p>
            </div>

            <div>
              <strong>Oceněný projekt</strong>
              <p>ARCHIMEDES získal ocenění Obec 2030.</p>
            </div>
          </div>
        </section>

        {/* FORM */}

        <section id="formular">

          <h2>Domluvme se</h2>

          <p style={{marginBottom: 30}}>
            Napište nám pár informací o tom, o co máte zájem.
            Ozveme se vám a domluvíme další postup.
          </p>

          <form style={{maxWidth: 600}}>

            <label>Jméno</label>
            <input style={input} type="text" />

            <label>Odkud jste</label>
            <input style={input} type="text" />

            <label>Email</label>
            <input style={input} type="email" />

            <label>Telefon</label>
            <input style={input} type="tel" />
            <small>Telefon je volitelný, ale urychlí domluvu.</small>

            <label>Zpráva</label>
            <textarea style={textarea} rows="5" />
            <small>
              Můžete napsat, zda máte zájem o program, učebnu nebo
              návštěvu vzorové učebny.
            </small>

            <button style={button}>
              Chci se zapojit
            </button>

            <p style={{marginTop: 10}}>
              Ozveme se vám obvykle do 24 hodin.
            </p>

          </form>

        </section>

      </main>
    </>
  );
}

const card = {
  padding: 24,
  borderRadius: 14,
  background: "#f9fafb",
  border: "1px solid #e5e7eb"
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 16,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const textarea = {
  width: "100%",
  padding: 12,
  marginBottom: 16,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const button = {
  padding: "14px 24px",
  borderRadius: 12,
  border: "none",
  background: "#111827",
  color: "white",
  fontWeight: 600,
  marginTop: 10,
  cursor: "pointer"
};
