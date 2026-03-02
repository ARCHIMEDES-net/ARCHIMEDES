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

      // Pokud nejsi přihlášen, pošleme tě na /login
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

  // Zabrání “bliknutí” obsahu, než ověříme session
  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        Načítám…
      </div>
    );
  }

  // Když není session, stejně už přesměrováváme na /login
  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "white",
          borderBottom: "1px solid #e6eaf0",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          }}
        >
          {/* LOGO + home link */}
          <Link href="/portal" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <img
              src="/logo.png"
              alt="Archimedes Live"
              style={{ height: 34, width: "auto", display: "block" }}
            />
          </Link>

          {/* NAV */}
          <nav style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/portal" style={linkStyle}>
              Portál
            </Link>
            <Link href="/portal/kalendar" style={linkStyle}>
              Program
            </Link>

            {/* Pokud máš admin stránku, nech si to tu */}
            <Link href="/portal/admin-udalosti" style={linkStyle}>
              Admin
            </Link>

            <button onClick={handleLogout} style={buttonStyle}>
              Odhlásit
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>{children}</main>
    </div>
  );
}

const linkStyle = {
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
  padding: "8px 10px",
  borderRadius: 10,
  background: "transparent",
};

const buttonStyle = {
  fontSize: 14,
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e6eaf0",
  background: "white",
  cursor: "pointer",
};
