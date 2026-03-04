// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";

const LOGO_SRC = "/logo.jpg";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

function isAdminPath(p) {
  return p === "/portal/admin" || p.startsWith("/portal/admin-") || p.startsWith("/portal/admin/");
}

function isActivePath(asPath, href) {
  if (!asPath) return false;
  const p = stripQuery(asPath);

  // Detail události patří pod Program
  if (href === "/portal/kalendar") {
    return p === "/portal/kalendar" || p.startsWith("/portal/udalost/");
  }

  // Admin aktivní pro celou admin sekci
  if (href === "/portal/admin-udalosti") {
    return isAdminPath(p);
  }

  if (href === "/portal") return p === "/portal";

  return p === href || p.startsWith(href + "/");
}

export default function PortalHeader() {
  const router = useRouter();
  const asPath = router?.asPath || "";
  const p = stripQuery(asPath);
  const inAdmin = isAdminPath(p);

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

  // Admin submenu
  const adminLinkBase = {
    textDecoration: "none",
    color: "#111827",
    padding: "7px 10px",
    borderRadius: 999,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  const adminActive = {
    background: "#111827",
    color: "#fff",
    border: "1px solid #111827",
  };

  const adminItems = [
    { href: "/portal/admin-udalosti", label: "Události" },
    { href: "/portal/admin-inzerce", label: "Inzerce" },
    { href: "/portal/admin-poptavky", label: "Poptávky" },
  ];

  const adminItemStyle = (href) => {
    const ap = stripQuery(asPath);
    const active = ap === href || ap.startsWith(href + "/");
    return { ...adminLinkBase, ...(active ? adminActive : null) };
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{ height: 44, width: "auto", display: "block" }}
            onError={(e) => {
              // nehidej celou hlavičku – jen skryj img, ať zůstane text
              e.currentTarget.style.display = "none";
            }}
          />
          <span style={{ fontWeight: 900, color: "#111827" }}>Portál</span>
        </Link>

        <nav style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/portal" style={navLinkStyle("/portal")}>
            Portál
          </Link>
          <Link href="/portal/kalendar" style={navLinkStyle("/portal/kalendar")}>
            Program
          </Link>
          <Link href="/portal/archiv" style={navLinkStyle("/portal/archiv")}>
            Archiv
          </Link>
          <Link href="/portal/pracovni-listy" style={navLinkStyle("/portal/pracovni-listy")}>
            Pracovní listy
          </Link>
          <Link href="/portal/inzerce" style={navLinkStyle("/portal/inzerce")}>
            Inzerce
          </Link>

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

      {inAdmin && (
        <div style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "10px 16px",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 800, color: "#111827", marginRight: 6 }}>Admin:</span>
            {adminItems.map((it) => (
              <Link key={it.href} href={it.href} style={adminItemStyle(it.href)}>
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
