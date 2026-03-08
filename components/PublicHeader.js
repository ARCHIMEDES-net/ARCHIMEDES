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
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{ height: 44 }}
          />
        </Link>

        <nav
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 10,
            alignItems: "center",
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
      </div>
    </header>
  );
}
