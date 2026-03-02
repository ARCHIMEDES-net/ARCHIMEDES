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

      if (!newSession) router.replace("/login");
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

  // Header a “okno” pro logo
  const HEADER_H = 70;

  // DŮLEŽITÉ: tady řešíme velké bílé okraje v PNG
  // LOGO_BOX_W = jak široké bude “okno” pro logo
  // LOGO_ZOOM = přiblížení loga uvnitř okna (1.0 = bez zoomu)
  const LOGO_BOX_W = 260;
  const LOGO_ZOOM = 1.55; // když bude pořád malé, dej 1.75; když moc velké, dej 1.35

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e6eaf0",
          height: HEADER_H,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            width: "100%",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          }}
        >
          {/* LOGO – ořez + zoom (řeší bílé okraje v PNG) */}
          <Link
            href="/portal"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              lineHeight: 0,
            }}
          >
            <div
              style={{
                height: HEADER_H,
                width: LOGO_BOX_W,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src="/logo.png"
                alt="Archimedes Live"
                style={{
                  height: "100%",
                  width: "100%",
                  display: "block",
                  objectFit: "cover", // ✅ ořez
                  objectPosition: "left center", // ✅ drží nápis vlevo
                  transform: `scale(${LOGO_ZOOM})`, // ✅ přiblížení (vyřeší prázdné okraje v PNG)
                  transformOrigin: "left center",
                }}
              />
            </div>
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
