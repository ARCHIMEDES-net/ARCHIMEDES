import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import RequireAuth from "../components/RequireAuth";
import PortalHeader from "../components/PortalHeader";

export default function WelcomePage() {
  const router = useRouter();
  const [savingIndividual, setSavingIndividual] = useState(false);
  const [error, setError] = useState("");

  async function continueAsIndividual() {
    setSavingIndividual(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ user_type: "individual" })
        .eq("id", user.id);

      if (updateError) throw updateError;

      router.push("/portal");
    } catch (e) {
      setError(e.message || "Nepodařilo se pokračovat jako jednotlivec.");
    } finally {
      setSavingIndividual(false);
    }
  }

  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: 22,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    minHeight: 220,
  };

  const primaryLinkStyle = {
    display: "inline-block",
    marginTop: 14,
    padding: "11px 15px",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  };

  const secondaryTextStyle = {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 1.5,
    color: "rgba(0,0,0,0.58)",
  };

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader />

        <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 16px 56px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.08)",
              marginBottom: 22,
            }}
          >
            <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 34, lineHeight: 1.15 }}>
              Vítejte v ARCHIMEDES Live
            </h1>

            <p
              style={{
                marginTop: 0,
                marginBottom: 10,
                color: "rgba(0,0,0,0.72)",
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 820,
              }}
            >
              Ještě nejste přiřazeni ke škole, obci ani jiné organizaci. Vyberte,
              jak chcete v ARCHIMEDES Live pokračovat.
            </p>

            <p
              style={{
                marginTop: 0,
                marginBottom: 0,
                color: "rgba(0,0,0,0.58)",
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 860,
              }}
            >
              Přístup do portálu je určen pro registrované organizace, jejich členy
              a vybrané jednotlivce. Pokud si nejste jistí správnou volbou, můžete
              jednoduše odeslat žádost o přístup.
            </p>

            {error ? (
              <div
                style={{
                  marginTop: 18,
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 18,
            }}
          >
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                Připojit se k organizaci
              </h2>

              <p style={{ color: "rgba(0,0,0,0.68)", lineHeight: 1.6, margin: 0 }}>
                Máte kód školy, obce, spolku nebo jiné organizace? Připojte se k již
                existujícímu účtu.
              </p>

              <div style={{ marginTop: "auto" }}>
                <Link href="/join" style={primaryLinkStyle}>
                  Připojit se
                </Link>

                <div style={secondaryTextStyle}>
                  Vhodné pro členy školy, obce, senior klubu nebo partnerské organizace.
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                Vytvořit organizaci
              </h2>

              <p style={{ color: "rgba(0,0,0,0.68)", lineHeight: 1.6, margin: 0 }}>
                Jste oprávněný zástupce školy, obce nebo jiné organizace a chcete
                založit vlastní přístup?
              </p>

              <div style={{ marginTop: "auto" }}>
                <Link href="/create-organization" style={primaryLinkStyle}>
                  Vytvořit organizaci
                </Link>

                <div style={secondaryTextStyle}>
                  Tato volba je určena zejména pro školy, obce, spolky a partnery.
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                Pokračovat jako jednotlivec
              </h2>

              <p style={{ color: "rgba(0,0,0,0.68)", lineHeight: 1.6, margin: 0 }}>
                Individuální přístup je určen pro vybrané uživatele, hosty,
                moderátory, odborníky nebo partnery bez organizačního účtu.
              </p>

              <div style={{ marginTop: "auto" }}>
                <button
                  type="button"
                  onClick={continueAsIndividual}
                  disabled={savingIndividual}
                  style={{
                    display: "inline-block",
                    marginTop: 14,
                    padding: "11px 15px",
                    borderRadius: 12,
                    background: "#111827",
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                    cursor: savingIndividual ? "default" : "pointer",
                    opacity: savingIndividual ? 0.7 : 1,
                  }}
                >
                  {savingIndividual ? "Pokračuji..." : "Pokračovat"}
                </button>

                <div style={secondaryTextStyle}>
                  Rozsah obsahu se může lišit od přístupu školy nebo obce.
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>
                Požádat o přístup
              </h2>

              <p style={{ color: "rgba(0,0,0,0.68)", lineHeight: 1.6, margin: 0 }}>
                Nejste si jistí, jaký typ přístupu je pro vás správný? Pošlete nám
                krátkou žádost a ozveme se vám s dalším postupem.
              </p>

              <div style={{ marginTop: "auto" }}>
                <Link href="/zadost-o-pristup" style={primaryLinkStyle}>
                  Odeslat žádost
                </Link>

                <div style={secondaryTextStyle}>
                  Vhodné pro nové školy, obce, zájemce o licenci i individuální dotazy.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
