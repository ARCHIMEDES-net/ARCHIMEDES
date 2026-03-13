import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LOGO_SRC = "/logo.jpg";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

const NAV_ITEMS = [
  { href: "/", label: "Domů" },
  { href: "/program", label: "Program" },
  { href: "/vysilani", label: "Proběhlá vysílání" },
  { href: "/ucebna", label: "Učebna" },
  { href: "/cenik", label: "Ceník" },
  { href: "/poptavka", label: "Poptávka" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function PublicHeader({ active = "" }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const asPath = stripQuery(router?.asPath || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith("/portal") || pathname.startsWith("/login")) {
    return null;
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [asPath]);

  const isActive = (href) => {
    if (active && active === href) return true;
    if (href === "/") return asPath === "/";
    return asPath === href || pathname === href;
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
            color: "#0f172a",
            minWidth: 0,
          }}
        >
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{
              height: "48px",
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </Link>

        <nav className="desktop-nav" style={{ alignItems: "center", gap: "10px" }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: "999px",
                fontWeight: isActive(item.href) ? 800 : 700,
                color: isActive(item.href) ? "#173b77" : "#334155",
                background: isActive(item.href) ? "#eff6ff" : "transparent",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/portal"
            style={{
              textDecoration: "none",
              padding: "11px 18px",
              borderRadius: "999px",
              fontWeight: 800,
              color: "#fff",
              background: "#ef4444",
              boxShadow: "0 12px 22px rgba(239, 68, 68, 0.18)",
              whiteSpace: "nowrap",
            }}
          >
            Portál
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Otevřít menu"
          className="mobile-toggle"
          style={{
            display: "none",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            background: "#fff",
            color: "#0f172a",
            borderRadius: "14px",
            width: "44px",
            height: "44px",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(15, 23, 42, 0.08)",
            background: "#fff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "14px 20px 18px",
              display: "grid",
              gap: "10px",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: "16px",
                  fontWeight: isActive(item.href) ? 800 : 700,
                  color: isActive(item.href) ? "#173b77" : "#334155",
                  background: isActive(item.href) ? "#eff6ff" : "#f8fafc",
                }}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/portal"
              style={{
                textDecoration: "none",
                padding: "13px 16px",
                borderRadius: "16px",
                fontWeight: 800,
                color: "#fff",
                background: "#ef4444",
                textAlign: "center",
              }}
            >
              Portál
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .desktop-nav {
          display: flex;
        }

        @media (max-width: 1080px) {
          .desktop-nav {
            display: none;
          }

          .mobile-toggle {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
