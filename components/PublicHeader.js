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

  if (pathname.startsWith("/portal") || pathname === "/login") return null;

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 760);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    flexShrink: 0,
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

  const portalStyle = {
    ...itemBase,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  const isActive = (key) => {
    if (active) return active === key;
    if (key === "home") return asPath === "/";
    if (key === "program") return asPath === "/program";
    if (key === "ucebna") return asPath === "/ucebna";
    if (key === "cenik") return asPath === "/cenik";
    if (key === "poptavka") return asPath === "/poptavka";
    if (key === "kontakt") return asPath === "/kontakt";
    return false;
  };

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
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 10 : 16,
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

        <div
          style={{
            marginLeft: "auto",
            minWidth: 0,
            flex: 1,
            overflowX: isMobile ? "auto" : "visible",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <nav
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: isMobile ? "flex-start" : "flex-end",
              flexWrap: "nowrap",
              width: "max-content",
              minWidth: isMobile ? "max-content" : "auto",
              paddingBottom: isMobile ? 2 : 0,
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

            <Link href="/cenik" style={navItem("cenik")}>
              Ceník
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
        </div>
      </div>
    </header>
  );
}
