import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const LOGO_SRC = "/logo.jpg";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0].split("#")[0];
}

export default function PublicHeader({ active = "" }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const asPath = useMemo(() => stripQuery(router?.asPath || ""), [router?.asPath]);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith("/portal") || pathname === "/login") return null;

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 760;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [asPath]);

  const itemBase = {
    textDecoration: "none",
    color: "#111827",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };

  const activeStyle = {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
  };

  const inactiveStyle = {
    background: "transparent",
    border: "1px solid transparent",
    opacity: 0.92,
  };

  const portalStyle = {
    ...itemBase,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  const mobileMenuButtonStyle = {
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    borderRadius: 12,
    minHeight: 42,
    minWidth: 42,
    padding: "0 12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    lineHeight: 1,
    cursor: "pointer",
  };

  const mobileNavLinkStyle = (key, isPortal = false) => {
    if (isPortal) {
      return {
        ...portalStyle,
        width: "100%",
        justifyContent: "flex-start",
      };
    }

    return {
      ...itemBase,
      ...(isActive(key) ? activeStyle : inactiveStyle),
      width: "100%",
      justifyContent: "flex-start",
    };
  };

  function isActive(key) {
    if (active) return active === key;
    if (key === "home") return asPath === "/";
    if (key === "program") return asPath === "/program";
    if (key === "ucebna") return asPath === "/ucebna";
    if (key === "cenik") return asPath === "/cenik";
    if (key === "poptavka") return asPath === "/poptavka";
    if (key === "kontakt") return asPath === "/kontakt";
    return false;
  }

  const navItem = (key) => ({
    ...itemBase,
    ...(isActive(key) ? activeStyle : inactiveStyle),
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
          padding: isMobile ? "10px 12px" : "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt="ARCHIMEDES Live"
              style={{
                height: isMobile ? 38 : 44,
                width: "auto",
                display: "block",
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Link>

          {isMobile ? (
            <button
              type="button"
              aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              style={{
                ...mobileMenuButtonStyle,
                marginLeft: "auto",
              }}
            >
              {mobileOpen ? "×" : "☰"}
            </button>
          ) : (
            <nav
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "flex-end",
                flexWrap: "nowrap",
              }}
            >
              <Link href="/" style={navItem("home")}>
                Domů
              </Link>

              <Link href="/program" style={navItem("program")}>
                Program
              </Link>

              <Link href="/ucebna" style={navItem("ucebna")}>
                Učebna
              </Link>

              <Link href="/poptavka" style={navItem("poptavka")}>
                Poptávka
              </Link>

              <Link href="/kontakt" style={navItem("kontakt")}>
                Kontakt
              </Link>

              <Link href="/portal" style={portalStyle}>
                Portál
              </Link>
            </nav>
          )}
        </div>

        {isMobile && mobileOpen ? (
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 12,
              paddingTop: 4,
            }}
          >
            <Link href="/" style={mobileNavLinkStyle("home")}>
              Domů
            </Link>

            <Link href="/program" style={mobileNavLinkStyle("program")}>
              Program
            </Link>

            <Link href="/ucebna" style={mobileNavLinkStyle("ucebna")}>
              Učebna
            </Link>

            <Link href="/cenik" style={mobileNavLinkStyle("cenik")}>
              Ceník
            </Link>

            <Link href="/poptavka" style={mobileNavLinkStyle("poptavka")}>
              Poptávka
            </Link>

            <Link href="/kontakt" style={mobileNavLinkStyle("kontakt")}>
              Kontakt
            </Link>

            <Link href="/portal" style={mobileNavLinkStyle("", true)}>
              Portál
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
