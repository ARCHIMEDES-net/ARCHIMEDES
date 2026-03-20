import { useState } from "react";

const OPTIONS = [
  {
    key: "program",
    title: "Program ARCHIMEDES Live",
    text: "Živý vzdělávací a komunitní program s inspirativními hosty, který mohou využívat školy, obce i místní komunity během celého roku.",
  },
  {
    key: "senior",
    title: "Senior klub",
    text: "Pravidelný program pro seniory zaměřený na inspiraci, setkávání, rozhovory a aktivní komunitní život v obci.",
  },
  {
    key: "ucebna",
    title: "Učebna ARCHIMEDES",
    text: "Moderní venkovní učebna jako prostor pro výuku, setkávání lidí a komunitní aktivity.",
  },
  {
    key: "oboji",
    title: "Program a učebna",
    text: "Propojení prostoru a programu vytváří místo, kde se mohou potkávat děti, senioři i obyvatelé obce.",
  },
  {
    key: "navsteva",
    title: "Návštěva vzorové učebny",
    text: "Rádi vás provedeme vzorovou učebnou ARCHIMEDES na BVV v Brně a ukážeme vám, jak může projekt fungovat ve vaší obci.",
  },
];

export default function PoptavkaPage() {
  const [selectedOption, setSelectedOption] = useState("");
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedLabel =
    OPTIONS.find((item) => item.key === selectedOption)?.title || "";

  function scrollToForm() {
    const form = document.getElementById("formular");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleSelect(optionKey) {
    setSelectedOption(optionKey);
    setTimeout(() => {
      scrollToForm();
    }, 80);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/poptavka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedOption,
          selectedLabel,
          name,
          place,
          email,
          phone,
          message,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Nepodařilo se odeslat poptávku.");
      }

      setSuccess(true);
      setSelectedOption("");
      setName("");
      setPlace("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err.message || "Došlo k chybě při odeslání formuláře.");
    } finally {
      setLoading(false);
    }
  }

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
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "42px 36px",
          boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 36,
            padding: "0 14px",
            borderRadius: 999,
            background: "#eef2ff",
            color: "#1e3a8a",
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 18,
          }}
        >
          Spojme se
        </div>

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

        <div style={{ maxWidth: 860, marginTop: 22 }}>
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
            zapojit <strong>Senior klub</strong>, postavit{" "}
            <strong>učebnu ARCHIMEDES</strong> nebo obojí propojit.
          </p>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 20,
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            Vyberte si, o co máte zájem. Formulář se vám podle toho automaticky
            připraví.
          </p>
        </div>
      </section>

      {/* KARTY */}
      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 22,
          }}
          className="interest-grid"
        >
          {OPTIONS.map((item) => {
            const isActive = selectedOption === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.key)}
                className={`interest-card ${isActive ? "active" : ""}`}
                style={{
                  ...cardStyle,
                  textAlign: "left",
                  cursor: "pointer",
                  background: isActive ? "#eff6ff" : "#ffffff",
                  border: isActive ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  boxShadow: isActive
                    ? "0 18px 42px rgba(37,99,235,0.12)"
                    : "0 12px 30px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 360,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 32,
                    padding: "0 13px",
                    borderRadius: 999,
                    background: isActive ? "#2563eb" : "#f8fafc",
                    color: isActive ? "#ffffff" : "#334155",
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "-0.01em",
                    marginBottom: 18,
                    alignSelf: "flex-start",
                  }}
                >
                  {isActive ? "Vybráno" : "Vybrat"}
                </div>

                <div
                  style={{
                    minHeight: 74,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <h3 style={cardTitle}>{item.title}</h3>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <p style={cardText}>{item.text}</p>
                </div>

                <div
                  className="interest-card-cta"
                  style={{
                    marginTop: 20,
                    fontSize: 16,
                    fontWeight: 800,
                    color: isActive ? "#2563eb" : "#0f172a",
                  }}
                >
                  {isActive
                    ? "Pokračovat ve formuláři ↓"
                    : "Vybrat tuto možnost →"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 22,
          padding: "20px 22px",
          marginBottom: 18,
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
          Nejste si jistí? Vyberte nejbližší možnost nebo nám napište pár slov.
          Společně najdeme vhodné řešení pro školu, obec, seniory i komunitu.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 38,
        }}
      >
        <button
          type="button"
          onClick={scrollToForm}
          style={{
            minHeight: 52,
            padding: "0 22px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
            transition:
              "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 16px 32px rgba(15,23,42,0.10)";
            e.currentTarget.style.borderColor = "#94a3b8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.06)";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
        >
          Kontaktujte nás
        </button>
      </div>

      {/* FORMULÁŘ */}
      <section
        id="formular"
        style={{
          background: "#ffffff",
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
          Rádi se s Vámi spojíme 
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

        <form onSubmit={handleSubmit} style={{ maxWidth: 760, marginTop: 28 }}>
          <label style={labelStyle}>Mám zájem o</label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Vyberte možnost</option>
            {OPTIONS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
          </select>

          {selectedLabel ? (
            <div style={{ ...helpStyle, marginTop: 8 }}>
              Vybraná možnost: <strong>{selectedLabel}</strong>
            </div>
          ) : null}

          <label style={{ ...labelStyle, marginTop: 16 }}>Jméno</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <label style={{ ...labelStyle, marginTop: 16 }}>Odkud jste</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 16 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <div style={helpStyle}>Na tento email vám pošleme odpověď.</div>

          <label style={{ ...labelStyle, marginTop: 16 }}>Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
          <div style={helpStyle}>Telefon je volitelný, ale urychlí domluvu.</div>

          <label style={{ ...labelStyle, marginTop: 16 }}>Zpráva</label>
          <textarea
            rows="6"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={textareaStyle}
          />
          <div style={helpStyle}>
            Můžete doplnit základní představu, termín nebo místo.
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Odesílám..." : "Odeslat"}
            </button>
          </div>

          {success ? (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #bbf7d0",
                background: "#f0fdf4",
                color: "#166534",
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              Děkujeme, poptávka byla odeslána. Ozveme se vám co nejdříve.
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#991b1b",
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          ) : null}

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

      {/* BVV */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "34px 30px",
          boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
          marginBottom: 34,
        }}
      >
        <div className="visual-grid">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 34,
                padding: "0 12px",
                borderRadius: 999,
                background: "#f8fafc",
                color: "#475569",
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              Vzorová učebna
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 42px)",
                lineHeight: 1.08,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Navštivte vzorovou učebnu ARCHIMEDES na BVV
            </h2>

            <p
              style={{
                margin: "16px 0 0",
                fontSize: 18,
                lineHeight: 1.72,
                color: "#475569",
                maxWidth: 560,
              }}
            >
              V Brně vám rádi ukážeme reálnou podobu učebny ARCHIMEDES i to,
              jak může fungovat ve vaší škole, obci nebo komunitě.
            </p>

            <p
              style={{
                margin: "14px 0 0",
                fontSize: 17,
                lineHeight: 1.72,
                color: "#64748b",
                maxWidth: 560,
              }}
            >
              Osobní návštěva pomůže nejlépe pochopit prostor, atmosféru i
              možnosti využití v praxi.
            </p>

            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedOption("navsteva");
                  setTimeout(() => {
                    scrollToForm();
                  }, 80);
                }}
                style={secondaryDarkButton}
              >
                Chci domluvit návštěvu
              </button>
            </div>
          </div>

          <div>
            <div style={imageWrapStyle}>
              <img
                src="/bvv.jpg"
                alt="Vzorová učebna ARCHIMEDES na BVV"
                style={imageStyle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DŮVĚRA */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "34px 30px",
          boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
        }}
      >
        <div className="visual-grid reverse-on-mobile">
          <div>
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
              Projekt ARCHIMEDES dnes využívají školy a obce v různých
              regionech. Učebny slouží pro výuku, komunitní setkávání i kulturní
              programy.
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
          </div>

          <div>
            <div style={imageWrapStyle}>
              <img
                src="/prestrih.webp"
                alt="Slavnostní otevření projektu ARCHIMEDES"
                style={imageStyle}
              />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .interest-card {
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .interest-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.1) !important;
          border-color: #cbd5e1 !important;
          background: #fcfdff !important;
        }

        .interest-card:hover .interest-card-cta {
          color: #2563eb !important;
        }

        .interest-card.active:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 48px rgba(37, 99, 235, 0.16) !important;
          border-color: #2563eb !important;
          background: #eff6ff !important;
        }

        .visual-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 28px;
          align-items: center;
        }

        @media (max-width: 1280px) {
          .interest-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 1024px) {
          .interest-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .trust-grid {
            grid-template-columns: 1fr !important;
          }

          .visual-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .interest-grid {
            grid-template-columns: 1fr !important;
          }

          .interest-card:hover,
          .interest-card.active:hover {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}

const cardStyle = {
  background: "#ffffff",
  borderRadius: 22,
  padding: 28,
  boxSizing: "border-box",
};

const cardTitle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 850,
  lineHeight: 1.16,
  letterSpacing: "-0.02em",
  color: "#0f172a",
};

const cardText = {
  margin: 0,
  fontSize: 17,
  lineHeight: 1.72,
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

const secondaryDarkButton = {
  minHeight: 52,
  padding: "0 22px",
  borderRadius: 14,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 34px rgba(15,23,42,0.16)",
};

const imageWrapStyle = {
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  background: "#f8fafc",
};

const imageStyle = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};
