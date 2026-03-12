export default function PoptavkaPage() {
  return (
    <main
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "56px 20px 90px",
      }}
    >
      {/* HERO */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "42px 36px",
          boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
          marginBottom: 34,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(38px, 5vw, 64px)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: "#0f172a",
          }}
        >
          Mám zájem
        </h1>

        <div style={{ maxWidth: 820, marginTop: 22 }}>
          <p
            style={{
              margin: 0,
              fontSize: 21,
              lineHeight: 1.7,
              color: "#334155",
            }}
          >
            ARCHIMEDES propojuje vzdělávání, komunitní život a inspirativní
            setkávání lidí.
          </p>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 21,
              lineHeight: 1.7,
              color: "#334155",
            }}
          >
            Můžete využívat živý program <strong>ARCHIMEDES Live</strong>,
            postavit <strong>učebnu ARCHIMEDES</strong> nebo obojí propojit.
          </p>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 20,
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            Stačí nám napsat pár informací a společně najdeme nejlepší řešení
            pro vaši školu, obec nebo komunitu.
          </p>
        </div>
      </section>

      {/* KARTY */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 22,
          }}
          className="interest-grid"
        >
          <div style={cardStyle}>
            <h3 style={cardTitle}>Program ARCHIMEDES Live</h3>
            <p style={cardText}>
              Živý vzdělávací a komunitní program s inspirativními hosty,
              který mohou využívat školy, obce i místní komunity během celého
              roku.
            </p>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitle}>Učebna ARCHIMEDES</h3>
            <p style={cardText}>
              Moderní venkovní učebna jako prostor pro výuku, setkávání lidí a
              komunitní aktivity.
            </p>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitle}>Program a učebna</h3>
            <p style={cardText}>
              Propojení prostoru a programu vytváří místo, kde se mohou
              potkávat děti, senioři i obyvatelé obce.
            </p>
          </div>

          <div style={cardStyle}>
            <h3 style={cardTitle}>Návštěva vzorové učebny</h3>
            <p style={cardText}>
              Rádi vás provedeme vzorovou učebnou ARCHIMEDES na BVV v Brně a
              ukážeme vám, jak může projekt fungovat ve vaší obci.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 22,
          padding: "20px 22px",
          marginBottom: 34,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 17,
            lineHeight: 1.65,
            color: "#475569",
          }}
        >
          Nejste si jistí? Stačí napsat pár slov a společně najdeme vhodné
          řešení.
        </p>
      </section>

      {/* DUVĚRA */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "34px 30px",
          boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
          marginBottom: 34,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 1.08,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          ARCHIMEDES už funguje v praxi
        </h2>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 760,
            fontSize: 18,
            lineHeight: 1.7,
            color: "#475569",
          }}
        >
          Projekt ARCHIMEDES dnes využívají školy a obce v různých regionech.
          Učebny slouží pro výuku, komunitní setkávání i kulturní programy.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 22,
            marginTop: 26,
          }}
          className="trust-grid"
        >
          <div style={trustCard}>
            <div style={trustTitle}>20+ realizovaných učeben</div>
            <div style={trustText}>
              Místa, kde se potkává výuka, komunita a inspirativní hosté.
            </div>
          </div>

          <div style={trustCard}>
            <div style={trustTitle}>Program pro více generací</div>
            <div style={trustText}>
              Zapojit se mohou školy, senioři i místní komunita.
            </div>
          </div>

          <div style={trustCard}>
            <div style={trustTitle}>Oceněný projekt</div>
            <div style={trustText}>
              ARCHIMEDES získal ocenění Obec 2030 za inovativní přístup k
              rozvoji obcí.
            </div>
          </div>
        </div>
      </section>

      {/* FORMULAR */}
      <section
        id="formular"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "34px 30px",
          boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 1.08,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          Domluvme se
        </h2>

        <p
          style={{
            margin: "14px 0 0",
            fontSize: 18,
            lineHeight: 1.7,
            color: "#475569",
            maxWidth: 760,
          }}
        >
          Napište nám pár informací o tom, o co máte zájem. Ozveme se vám a
          domluvíme další postup.
        </p>

        <p
          style={{
            margin: "10px 0 0",
            fontSize: 15,
            lineHeight: 1.6,
            color: "#64748b",
          }}
        >
          Vyplnění formuláře zabere méně než minutu.
        </p>

        <form style={{ maxWidth: 760, marginTop: 28 }}>
          <label style={labelStyle}>Jméno</label>
          <input type="text" style={inputStyle} />

          <label style={labelStyle}>Odkud jste</label>
          <input type="text" style={inputStyle} />

          <label style={labelStyle}>Email</label>
          <input type="email" style={inputStyle} />
          <div style={helpStyle}>Na tento email vám pošleme odpověď.</div>

          <label style={{ ...labelStyle, marginTop: 16 }}>Telefon</label>
          <input type="tel" style={inputStyle} />
          <div style={helpStyle}>Telefon je volitelný, ale urychlí domluvu.</div>

          <label style={{ ...labelStyle, marginTop: 16 }}>Zpráva</label>
          <textarea rows="6" style={textareaStyle} />
          <div style={helpStyle}>
            Můžete napsat, zda máte zájem o program, učebnu nebo návštěvu
            vzorové učebny.
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" style={buttonStyle}>
              Chci se zapojit
            </button>
          </div>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 15,
              lineHeight: 1.6,
              color: "#64748b",
            }}
          >
            Ozveme se vám obvykle do 24 hodin.
          </p>
        </form>
      </section>

      <style jsx>{`
        @media (max-width: 1024px) {
          .interest-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .trust-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .interest-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 22,
  padding: 26,
  boxShadow: "0 12px 30px rgba(15,23,42,0.04)",
};

const cardTitle = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  color: "#0f172a",
};

const cardText = {
  margin: "14px 0 0",
  fontSize: 17,
  lineHeight: 1.75,
  color: "#475569",
};

const trustCard = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 22,
};

const trustTitle = {
  fontSize: 20,
  fontWeight: 800,
  lineHeight: 1.25,
  color: "#0f172a",
};

const trustText = {
  marginTop: 10,
  fontSize: 16,
  lineHeight: 1.65,
  color: "#475569",
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  minHeight: 52,
  padding: "0 16px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  color: "#0f172a",
  background: "#fff",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 16,
  color: "#0f172a",
  background: "#fff",
  boxSizing: "border-box",
  resize: "vertical",
};

const helpStyle = {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 1.55,
  color: "#64748b",
};

const buttonStyle = {
  minHeight: 54,
  padding: "0 24px",
  borderRadius: 14,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 34px rgba(15,23,42,0.16)",
};
