// pages/ukazka.js
import Link from "next/link";

export default function Ukazka() {
  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      
      {/* HERO */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "70px 16px 40px 16px",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          Domluvit ukázku programu ARCHIMEDES Live
        </h1>

        <p
          style={{
            fontSize: 18,
            maxWidth: 700,
            opacity: 0.8,
            marginBottom: 30,
          }}
        >
          Během krátké online ukázky vám představíme, jak funguje program
          ARCHIMEDES Live – jak vypadá jedna hodina, pracovní list pro žáky
          a prostředí portálu.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              background: "white",
              padding: "10px 14px",
              borderRadius: 30,
              fontSize: 14,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            20 minut
          </div>

          <div
            style={{
              background: "white",
              padding: "10px 14px",
              borderRadius: 30,
              fontSize: 14,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            online setkání
          </div>

          <div
            style={{
              background: "white",
              padding: "10px 14px",
              borderRadius: 30,
              fontSize: 14,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            pro školy i obce
          </div>
        </div>
      </div>

      {/* FORMULÁŘ */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 16px 60px 16px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
            border: "1px solid rgba(0,0,0,0.08)",
            maxWidth: 600,
          }}
        >
          <h2 style={{ marginBottom: 20 }}>Domluvit ukázku</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input placeholder="Jméno a příjmení" style={inputStyle} />
            <input placeholder="Škola / obec" style={inputStyle} />
            <input placeholder="E-mail" style={inputStyle} />
            <input placeholder="Telefon" style={inputStyle} />

            <select style={inputStyle}>
              <option>Typ zájmu</option>
              <option>Škola</option>
              <option>Obec</option>
              <option>Jiná organizace</option>
            </select>

            <textarea
              placeholder="Poznámka (volitelné)"
              rows={3}
              style={inputStyle}
            />

            <button
              style={{
                marginTop: 10,
                background: "#111",
                color: "white",
                padding: "14px 20px",
                borderRadius: 10,
                border: "none",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Odeslat žádost o ukázku
            </button>
          </div>
        </div>
      </div>

      {/* CO UVIDÍ */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px 80px 16px",
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Co během ukázky uvidíte</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 20,
          }}
        >
          <Card
            title="Jak vypadá jedna hodina"
            text="Ukázka živého vstupu s hostem a práce s pracovním listem."
          />

          <Card
            title="Jak funguje portál"
            text="Program vysílání, archiv hodin a pracovní listy pro učitele."
          />

          <Card
            title="Jak lze program využít"
            text="Možnosti zapojení pro školu nebo komunitu obce."
          />
        </div>
      </div>

      {/* REFERENCE */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "60px 16px",
          }}
        >
          <h2 style={{ marginBottom: 20 }}>
            Program už využívají školy a obce
          </h2>

          <p style={{ opacity: 0.8, marginBottom: 30 }}>
            ARCHIMEDES Live funguje například v těchto městech a obcích:
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Tag text="Hodonín" />
            <Tag text="Křenov" />
            <Tag text="Bučovice" />
            <Tag text="Frýdek-Místek" />
            <Tag text="Hradec Králové" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "70px 16px 90px 16px",
        }}
      >
        <div
          style={{
            background: "#111",
            color: "white",
            padding: 40,
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: 10 }}>
            Chcete vidět ukázku programu?
          </h2>

          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            Stačí vyplnit krátký formulář a domluvíme termín.
          </p>

          <button
            style={{
              background: "white",
              color: "#111",
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Domluvit ukázku programu
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.15)",
  fontSize: 14,
};

function Card({ title, text }) {
  return (
    <div
      style={{
        background: "white",
        padding: 24,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <p style={{ opacity: 0.75 }}>{text}</p>
    </div>
  );
}

function Tag({ text }) {
  return (
    <div
      style={{
        background: "#f3f4f6",
        padding: "8px 14px",
        borderRadius: 20,
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
}
