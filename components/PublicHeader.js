import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LOGO_SRC = "/logo.jpg";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

export default function PublicHeader({ active = "" }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const asPath = stripQuery(router?.asPath || "");

  const [mobileOpen, setMobileOpen] = useState(false);

  // veřejná hlavička se nikdy nezobrazí v portálu ani na loginu
  if (pathname.startsWith("/portal") || pathname === "/login") return null;

  useEffect(() => {
    setMobileOpen(false);
  }, [asPath]);

  const itemBase = {
    textDecoration: "none",
    color: "#111827",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    transition: "all 0.15s ease",
  };

  const activeStyle = {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
  };

  const inactiveStyle = {
    background: "transparent",
    border: "1px solid transparent",
    opacity: 0.9,
  };

  const isActive = (key) => {
    if (active) return active === key;
    if (key === "home") return asPath === "/";
    if (key === "program") return asPath === "/program";
    if (key === "ucebna") return asPath === "/#ucebna";
    if (key === "cenik") return asPath === "/cenik";
    if (key === "poptavka") return asPath === "/poptavka";
    if (key === "kontakt") return asPath === "/kontakt";
    return false;
  };

  const navItem = (key) => ({
    ...itemBase,
    ...(isActive(key) ? activeStyle : inactiveStyle),
  });

  const mobileItem = (key, extra = {}) => ({
    ...itemBase,
    ...(isActive(key) ? activeStyle : inactiveStyle),
    width: "100%",
    justifyContent: "flex-start",
    padding: "12px 14px",
    borderRadius: 14,
    fontSize: 16,
    ...extra,
  });

  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flex: "0 0 auto",
            }}
            onClick={() => setMobileOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt="ARCHIMEDES Live"
              style={{ height: 44, width: "auto", display: "block" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Link>

          <nav
            className="desktopNav"
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={navItem("home")}>
              Domů
            </Link>

            <Link href="/program" style={navItem("program")}>
              Program
            </Link>

            <Link href="/#ucebna" style={navItem("ucebna")}>
              Učebna
            </Link>

            <Link href="/cenik" style={navItem("cenik")}>
              Ceník
            </Link>

            <Link href="/poptavka" style={navItem("poptavka")}>
              Poptávka
            </Link>

            <Link href="/kontakt" style={navItem("kontakt")}>
              Kontakt
            </Link>

            <span
              style={{
                width: 1,
                height: 18,
                background: "#e5e7eb",
                margin: "0 2px",
              }}
            />

            <Link
              href="/portal"
              style={{
                ...itemBase,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              Portál
            </Link>
          </nav>

          <button
            type="button"
            className="mobileMenuButton"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Otevřít menu"
            style={{
              marginLeft: "auto",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 48,
              height: 44,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#111827",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {mobileOpen ? "Zavřít" : "Menu"}
          </button>
        </div>

        {mobileOpen ? (
          <div
            className="mobileMenu"
            style={{
              display: "none",
              paddingTop: 12,
            }}
          >
            <nav
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              <Link
                href="/"
                style={mobileItem("home")}
                onClick={() => setMobileOpen(false)}
              >
                Domů
              </Link>

              <Link
                href="/program"
                style={mobileItem("program")}
                onClick={() => setMobileOpen(false)}
              >
                Program
              </Link>

              <Link
                href="/#ucebna"
                style={mobileItem("ucebna")}
                onClick={() => setMobileOpen(false)}
              >
                Učebna
              </Link>

              <Link
                href="/cenik"
                style={mobileItem("cenik")}
                onClick={() => setMobileOpen(false)}
              >
                Ceník
              </Link>

              <Link
                href="/poptavka"
                style={mobileItem("poptavka")}
                onClick={() => setMobileOpen(false)}
              >
                Poptávka
              </Link>

              <Link
                href="/kontakt"
                style={mobileItem("kontakt")}
                onClick={() => setMobileOpen(false)}
              >
                Kontakt
              </Link>

              <Link
                href="/portal"
                style={mobileItem("", {
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#111827",
                })}
                onClick={() => setMobileOpen(false)}
              >
                Portál
              </Link>
            </nav>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .desktopNav {
            display: none !important;
          }

          .mobileMenuButton {
            display: inline-flex !important;
          }

          .mobileMenu {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
