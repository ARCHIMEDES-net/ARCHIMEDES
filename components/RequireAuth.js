// components/RequireAuth.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data?.session || null);
      setLoading(false);

      if (!data?.session) {
        router.replace("/login");
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setLoading(false);

      if (!newSession) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        Načítám…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      {/* HLAVIČKA - pevně nízká */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e6eaf0",
          height: 70, // <- TADY se řeší "široký" horní řádek
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
            padding: "0 20px", // žádné svislé paddingy
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          }}
        >
          {/* LOGO - velké, ale header neroztahuje (přesahuje nahoru) */}
          <Link
            href="/portal"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              lineHeight: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="Archimedes Live"
              style={{
                height: 120, // logo zůstává velké
                width: "auto",
                marginTop: -28, // posun nahoru -> header zůstane nízký
                display: "block",
                cursor: "pointer",
              }}
            />
          </Link>

          {/* MENU */}
          <nav style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/portal" style={linkStyle}>
              Portál
            </Link>

            <Link href="/portal/kalendar" style={linkStyle}>
              Program
            </Link>

            <Link href="/portal/admin-udalosti" style={linkStyle}>
              Admin
            </Link>

            <button onClick={handleLogout} style={buttonStyle}>
              Odhlásit
            </button>
          </nav>
        </div>
      </header>

      {/* OBSAH */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 30 }}>{children}</main>
    </div>
  );
}

const linkStyle = {
  fontSize: 16,
  textDecoration: "none",
  color: "#111",
  padding: "8px 8px",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontSize: 14,
};
