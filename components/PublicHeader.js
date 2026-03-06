// components/PublicHeader.js
import Link from "next/link";
import { useRouter } from "next/router";

const LOGO_SRC = "/logo.jpg";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

export default function PublicHeader({ active = "" }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const asPath = stripQuery(router?.asPath || "");

  // veřejná hlavička se nikdy nezobrazí v portálu ani na loginu
  if (pathname.startsWith("/portal") || pathname === "/login") return null;

  const itemBase = {
    textDecoration: "none",
    color: "#111827",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
  };

  const activeStyle = {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
  };

  const inactiveStyle = {
    background: "transparent",
    border: "1px solid transparent",
    opacity: 0.85,
  };

  const isActive = (key) => {
    if (active) return active === key;
    if (key === "home") return asPath === "/";
    if (key === "program") return asPath === "/program";
    if (key === "cenik") return asPath === "/cenik";
    if (key === "poptavka") return asPath === "/poptavka";
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
          }}
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
      </div>
    </header>
  );
}
