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

    const { data: sub } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
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
      <div
        style={{
          padding: 24,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        Načítám…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
      }}
    >

      {/* HORNÍ LIŠTA */}
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
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily:
              "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          }}
        >

          {/* LOGO */}
          <Link
            href="/portal"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              src="/logo.png"
              alt="Archimedes Live"
              style={{
                height: 60,
                width: "auto",
              }}
            />
          </Link>

          {/* MENU */}
          <nav
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
            }}
          >

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
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {children}
      </main>

    </div>
  );
}

const linkStyle = {
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 15,
};

const buttonStyle = {
  fontSize: 14,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #e6eaf0",
  background: "white",
  cursor: "pointer",
};
