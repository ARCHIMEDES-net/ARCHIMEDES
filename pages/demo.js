import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [school, setSchool] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/start-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school,
          name,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Nepodařilo se spustit demo.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Došlo k chybě.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          padding: "40px 16px",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 12, fontSize: 34, lineHeight: 1.15 }}>
            Demo učebna byla vytvořena
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: 16,
              color: "rgba(0,0,0,0.72)",
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            Na zadaný e-mail jsme odeslali odkaz pro dokončení přístupu do demo
            portálu ARCHIMEDES Live.
          </p>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#eefaf0",
              border: "1px solid #cfe8d3",
              color: "#166534",
              marginBottom: 18,
              lineHeight: 1.7,
            }}
          >
            Otevřete e-mailovou schránku, klikněte na odkaz v e-mailu a nastavte
            si heslo. Poté budete automaticky pokračovat do portálu.
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#f8f9fc",
              border: "1px solid rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.72)",
              marginBottom: 24,
              lineHeight: 1.7,
            }}
          >
            Pokud e-mail nevidíte hned, podívejte se také do složky Hromadné,
            Promo nebo Spam.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "12px 18px",
                borderRadius: 12,
                background: "#111827",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Pokračovat na přihlášení
            </Link>

            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 18px",
                borderRadius: 12,
                background: "#fff",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 700,
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        padding: "40px 16px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 14, fontSize: 38, lineHeight: 1.12 }}>
            Vyzkoušejte ARCHIMEDES Live ve vaší škole
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: 22,
              color: "rgba(0,0,0,0.72)",
              fontSize: 18,
              lineHeight: 1.7,
            }}
          >
            ARCHIMEDES Live je živý vzdělávací program pro školy a komunitu obce.
            Během několika minut si můžete vytvořit ukázkovou učebnu a podívat se,
            jak portál funguje z pohledu školy.
          </p>

          <div
            style={{
              background: "#f8f9fc",
              padding: 22,
              borderRadius: 18,
              marginBottom: 22,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 24 }}>
              Co v demu uvidíte
            </h2>

            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, color: "rgba(0,0,0,0.74)" }}>
              <li>jak vypadá živé vysílání s inspirativním hostem</li>
              <li>jak škola sleduje program na interaktivním panelu</li>
              <li>jak fungují pracovní listy a návaznost do výuky</li>
              <li>jak vypadá portál pro školu a přístup k programu</li>
            </ul>
          </div>

          <div
            style={{
              background: "#eefaf0",
              padding: 18,
              borderRadius: 18,
              border: "1px solid #cfe8d3",
              color: "#166534",
              lineHeight: 1.7,
            }}
          >
            Demo je určeno pro školy, které si chtějí ARCHIMEDES Live nejprve
            vyzkoušet a teprve potom řešit další spolupráci nebo cenovou nabídku.
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
            alignSelf: "start",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 28 }}>
            Spustit demo školy
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              color: "rgba(0,0,0,0.66)",
              lineHeight: 1.7,
            }}
          >
            Vyplňte krátký formulář. Vytvoříme vám demo učebnu a pošleme odkaz
            pro dokončení přístupu do portálu.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Název školy
              </label>
              <input
                type="text"
                placeholder="Např. ZŠ Hodonín"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Vaše jméno
              </label>
              <input
                type="text"
                placeholder="Např. Jan Novák"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                placeholder="Např. reditel@skola.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                padding: "14px 18px",
                fontSize: 18,
                background: "#111827",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                cursor: loading ? "default" : "pointer",
                fontWeight: 700,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Vytvářím demo učebnu…" : "Spustit demo školy"}
            </button>

            {error ? (
              <div
                style={{
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 12,
                  background: "#fff1f1",
                  color: "#a40000",
                  border: "1px solid #f2c9c9",
                }}
              >
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
