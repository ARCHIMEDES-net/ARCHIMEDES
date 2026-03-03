import Link from "next/link";
import { useRouter } from "next/router";

const LOGO_SRC = "/logo/archimedes-live.png";

function isActivePath(asPath, href) {
  if (!asPath) return false;

  // normalize
  const p = asPath.split("?")[0];

  // Special: detail události patří pod Program
  if (href === "/portal/kalendar") {
    return p === "/portal/kalendar" || p.startsWith("/portal/udalost/");
  }

  if (href === "/portal") return p === "/portal";

  return p === href || p.startsWith(href + "/");
}

export default function PortalHeader() {
  const router = useRouter();
  const asPath = router?.asPath || "";

  const linkBase = {
    textDecoration: "none",
    color: "#111827",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const activeStyle = {
    background: "#111827",
    color: "#ffffff",
    border: "1px solid #111827",
  };

  const inactiveStyle = {
    background: "transparent",
    border: "1px solid transparent",
  };

  const navLinkStyle = (href) => {
    const active = isActivePath(asPath, href);
    return { ...linkBase, ...(active ? activeStyle : inactiveStyle) };
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "white",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Logo */}
        <Link
          href="/portal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
          aria-label="ARCHIMEDES Live – Portál"
        >
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{ height: 44, width: "auto", display: "block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span style={{ fontWeight: 900, color: "#111827" }}>Portál</span>
        </Link>

        {/* Menu */}
        <nav style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/portal" style={navLinkStyle("/portal")}>Portál</Link>
          <Link href="/portal/kalendar" style={navLinkStyle("/portal/kalendar")}>Program</Link>
          <Link href="/portal/archiv" style={navLinkStyle("/portal/archiv")}>Archiv</Link>
          <Link href="/portal/pracovni-listy" style={navLinkStyle("/portal/pracovni-listy")}>Pracovní listy</Link>
          <Link href="/portal/inzerce" style={navLinkStyle("/portal/inzerce")}>Inzerce</Link>

          <span style={{ width: 1, height: 18, background: "#e5e7eb", margin: "0 2px" }} />

          <Link
            href="/portal/admin-udalosti"
            title="Admin"
            style={{
              ...navLinkStyle("/portal/admin-udalosti"),
              border: "1px solid #e5e7eb",
              background: isActivePath(asPath, "/portal/admin-udalosti") ? "#111827" : "#fff",
              color: isActivePath(asPath, "/portal/admin-udalosti") ? "#fff" : "#111827",
            }}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
