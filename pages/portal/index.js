// pages/portal/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function PortalIndex() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }
    })();
  }, []);

  const topTiles = useMemo(
    () => [
      {
        href: "/portal/kalendar",
        title: "Kalendář",
        desc: "Přehled vysílání jako TV program + detail.",
        icon: "🗓️",
        primary: true,
      },
      {
        href: "/portal/archiv",
        title: "Archiv",
        desc: "Záznamy, materiály a pracovní listy.",
        icon: "📚",
      },
      {
        href: "/portal/inzerce",
        title: "Inzerce",
        desc: "Nabídky, poptávky a partnerství.",
        icon: "📌",
      },
    ],
    []
  );

  const adminTiles = useMemo(
    () => [
      {
        href: "/portal/admin-udalosti",
        title: "Události",
        desc: "Vkládání, úpravy a správa programu.",
        icon: "🛠️",
      },
      {
        href: "/portal/admin-inzerce",
        title: "Inzerce",
        desc: "Moderace, TOP, ARCHIMEDES, mazání.",
        icon: "✅",
      },
      {
        href: "/portal/admin-poptavky",
        title: "Poptávky",
        desc: "Přehled leadů + export CSV.",
        icon: "📥",
      },
    ],
    []
  );

  return (
    <RequireAuth>
      <PortalHeader title="Portál" />

      <div style={{ minHeight: "calc(100vh - 70px)", background: "#f6f7fb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 40px" }}>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 26, letterSpacing: -0.2 }}>Portál</h1>
              <div style={{ marginTop: 6, fontSize: 14, opacity: 0.75 }}>
                Přístup k obsahu pro registrované.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/portal/kalendar"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.14)",
                  background: "white",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                🗓️ Program
              </Link>

              <Link
                href="/portal/inzerce"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.14)",
                  background: "white",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                📌 Inzerce
              </Link>

              {checkingAdmin ? (
                <span
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "rgba(255,255,255,0.7)",
                    opacity: 0.75,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  Načítám práva…
                </span>
              ) : isAdmin ? (
                <Link
                  href="/portal/admin-udalosti"
                  style={{
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.14)",
                    background: "#0f172a",
                    color: "white",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  🛠️ Admin
                </Link>
              ) : null}
            </div>
          </div>

          {/* Top tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {topTiles.map((t) => (
              <Tile key={t.href} {...t} />
            ))}
          </div>

          {/* Admin area */}
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 900, letterSpacing: -0.1 }}>Administrace</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>
                Vidí jen správci. Běžní uživatelé mají Program / Archiv / Inzerci.
              </div>
            </div>

            {checkingAdmin ? (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 16,
                  padding: 14,
                  opacity: 0.8,
                }}
              >
                Načítám práva…
              </div>
            ) : isAdmin ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {adminTiles.map((t) => (
                  <Tile key={t.href} {...t} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 16,
                  padding: 14,
                  opacity: 0.8,
                }}
              >
                Administrace je dostupná jen správcům.
              </div>
            )}
          </div>

          {/* footer hint */}
          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
            Tip: pokud někde uvidíš chybu oprávnění, je to typicky role/RLS nebo přihlášení.
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function Tile({ href, title, desc, icon, primary }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 18,
          border: primary ? "2px solid rgba(15,23,42,0.90)" : "1px solid rgba(0,0,0,0.10)",
          boxShadow: primary ? "0 16px 40px rgba(0,0,0,0.10)" : "0 10px 26px rgba(0,0,0,0.06)",
          padding: 16,
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          transition: "transform 120ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flex: "0 0 auto",
              }}
            >
              {icon || "→"}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {title}
              </div>
              {desc ? (
                <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75, lineHeight: 1.35 }}>
                  {desc}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: primary ? "1px solid rgba(15,23,42,0.28)" : "1px solid rgba(0,0,0,0.14)",
              background: primary ? "#0f172a" : "white",
              color: primary ? "white" : "#0f172a",
              fontWeight: 900,
              fontSize: 13,
              flex: "0 0 auto",
            }}
          >
            Otevřít
          </div>
        </div>

        {primary ? (
          <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.7 }}>
            Doporučeno: zde budeš nejčastěji.
          </div>
        ) : (
          <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.7 }}> </div>
        )}
      </div>
    </Link>
  );
}
