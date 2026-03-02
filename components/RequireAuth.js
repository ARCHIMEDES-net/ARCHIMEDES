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
    return <div style={{ padding: 24 }}>Načítám…</div>;
  }

  if (!session) return null;

  const HEADER_H = 70;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>

      {/* HEADER */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e6eaf0",
          height: HEADER_H,
          display: "flex",
          alignItems: "center"
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
            justifyContent: "space-between"
          }}
        >

          {/* LOGO – celé bez ořezu */}
          <Link href="/portal">

            <img
              src="/logo.png"
              alt="Archimedes Live"
              style={{
                height: 60,
                width: "auto",
                display: "block"
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
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 30
        }}
      >
        {children}
      </main>

    </div>
  );
}

const linkStyle = {
  fontSize: 16,
  textDecoration: "none",
  color: "#111"
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer"
};
