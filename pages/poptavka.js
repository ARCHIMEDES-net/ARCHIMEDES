import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/Button";

const LICENSE_OPTIONS = [
  { value: "obec", label: "Obec" },
  { value: "skola", label: "Škola" },
  { value: "komunita", label: "Komunita" },
  { value: "senior", label: "Senior klub" },
];

function normalizeLicenseType(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["obec", "municipality"].includes(v)) return "obec";
  if (["skola", "škola", "school"].includes(v)) return "skola";
  if (["komunita", "community"].includes(v)) return "komunita";
  if (
    ["senior", "seniori", "senior-klub", "senior_klub", "senior klub"].includes(
      v
    )
  )
    return "senior";

  return "obec";
}

export default function Poptavka() {
  const router = useRouter();

  const [licenseType, setLicenseType] = useState("obec");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const initialType = normalizeLicenseType(router.query.typ);
    setLicenseType(initialType);
  }, [router.isReady, router.query.typ]);

  const selectedLicenseLabel = useMemo(() => {
    return (
      LICENSE_OPTIONS.find((item) => item.value === licenseType)?.label || "Obec"
    );
  }, [licenseType]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!organization.trim()) {
        throw new Error("Vyplňte prosím název obce nebo školy.");
      }

      if (!email.trim()) {
        throw new Error("Vyplňte prosím e-mail.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      setMessage(
        `Poptávka pro licenci „${selectedLicenseLabel}“ je připravena. Po napojení odesílání se bude ukládat a posílat automaticky.`
      );
    } catch (e2) {
      setError(e2.message || "Poptávku se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <main>
        <section
          style={{
            maxWidth: 980,
            margin: "0 auto",
            padding: "56px 16px 80px",
          }}
        >
          <div style={{ maxWidth: 760, marginBottom: 26 }}>
            <h1
              style={{
                margin: "0 0 12px 0",
                fontSize: 52,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Poptávka licence
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(17,24,39,0.72)",
              }}
            >
              Nech nám kontakt. Ozveme se a pošleme přístup / smluvní podklady.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 22,
              border: "1px solid rgba(17,24,39,0.08)",
              boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
              padding: 18,
            }}
          >
            {error ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: "#fff1f1",
                  color: "#a40000",
                  border: "1px solid #f2c9c9",
                }}
              >
                Chyba: {error}
              </div>
            ) : null}

            {message ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: "#eefaf0",
                  color: "#166534",
                  border: "1px solid #cfe8d3",
                }}
              >
                {message}
              </div>
            ) : null}

            <form onSubmit={handleSubmit}>
              <div className="formGrid">
                <div>
                  <label className="fieldLabel">Typ licence*</label>

                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    style={inputStyle}
                  >
                    {LICENSE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="fieldLabel">Název obce / školy*</label>

                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="fieldLabel">E-mail*</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="fieldLabel">Telefon (volitelně)</label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label className="fieldLabel">Poznámka</label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={6}
                  placeholder="Např. máme zájem o ukázku pro obec / školu, chceme více informací k licenci, financování apod."
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: "1px solid rgba(17,24,39,0.14)",
                    fontSize: 16,
                    lineHeight: 1.6,
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div className="actionRow">
                <button
                  type="submit"
                  disabled={saving}
                  onMouseEnter={(e) => {
                    if (saving) return;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 22px rgba(0,0,0,0.18)";
                    e.currentTarget.style.background = "#1f2937";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#111827";
                  }}
                  onMouseDown={(e) => {
                    if (saving) return;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(0,0,0,0.2)";
                  }}
                  onMouseUp={(e) => {
                    if (saving) return;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 48,
                    padding: "0 20px",
                    borderRadius: 14,
                    border: "1px solid #111827",
                    background: "#111827",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
                    boxSizing: "border-box",
                  }}
                >
                  {saving ? "Odesílám..." : "Odeslat poptávku"}
                </button>

                <Button href="/cenik" variant="secondary">
                  Zpět na ceník
                </Button>
              </div>
            </form>
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 14,
              color: "rgba(17,24,39,0.5)",
            }}
          >
            Tip: typ licence lze předvyplnit i odkazem z ceníku, například{" "}
            <code>/poptavka?typ=komunita</code>.
          </div>
        </section>
      </main>

      <style jsx>{`
        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .fieldLabel {
          display: block;
          margin-bottom: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .actionRow {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        @media (max-width: 720px) {
          h1 {
            font-size: 36px !important;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .actionRow {
            flex-direction: column;
          }

          .actionRow button,
          .actionRow :global(a) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(17,24,39,0.14)",
  background: "white",
  fontSize: 16,
  color: "#111827",
  boxSizing: "border-box",
};
