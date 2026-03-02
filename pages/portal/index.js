import Link from "next/link";
import { useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

export default function PortalIndex() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function signOut() {
    setMsg("");
    setErr("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErr(error.message || "Odhlášení selhalo.");
      return;
    }
    setMsg("Odhlášeno.");
    // volitelně: přesměrování na login, pokud ho máš
    // window.location.href = "/login";
  }

  return (
    <RequireAuth>
      <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Portál</h1>
        <p style={{ marginTop: 6, opacity: 0.8 }}>
          Rychlé odkazy pro práci s vysíláním a obsahem.
        </p>

        {err && <p style={{ color: "crimson" }}>Chyba: {err}</p>}
        {msg && <p style={{ color: "green" }}>{msg}</p>}

        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <Card
            title="Program (TV)"
            desc="Přehled vysílání jako TV program – nadcházející a archiv."
            href="/portal/kalendar"
          />

          <Card
            title="Pracovní listy"
            desc="Knihovna pracovních listů pro učitele (PDF / odkazy)."
            href="/portal/pracovni-listy"
          />

          <Card
            title="Admin – události"
            desc="Vkládání a správa událostí (jen pro administrátory)."
            href="/portal/admin/udalosti"
          />

          <button
            onClick={signOut}
            style={{
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.14)",
              background: "white",
              cursor: "pointer",
              fontWeight: 800,
              width: 180,
            }}
          >
            Odhlásit
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}

function Card({ title, desc, href }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.02)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, opacity: 0.8 }}>{desc}</div>
      <div style={{ marginTop: 10, fontWeight: 800 }}>Otevřít →</div>
    </Link>
  );
}
