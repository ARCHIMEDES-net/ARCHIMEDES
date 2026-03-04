// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";

const LOGO_SRC = "/logo.jpg";

export default function PortalHeader({ title = "", onLogout = null }) {
  const router = useRouter();
  const path = router?.asPath || "";

  const itemBase = {
    textDecoration: "none",
    color: "#0f172a",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid transparent",
    opacity: 0.9,
  };

  const activeStyle = {
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #0f172a",
    opacity: 1,
  };

  const isActive = (key) => {
    if (key === "portal") return path === "/portal" || path.startsWith("/portal/");
    if (key === "program") return path.startsWith("/portal/kalendar");
    if (key === "admin") return path.startsWith("/portal/admin");
    return false;
  };

  const navItem = (key) => ({ ...itemBase, ...(isActive(key) ? activeStyle : {}) });

  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 30,
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
        <Link href="/portal" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{ height: 34, width: "auto", display: "block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {title ? <span style={{ fontWeight: 900, color: "#0f172a" }}>{title}</span> : null}
        </Link>

        <nav style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/portal" style={navItem("portal")}>Portál</Link>
          <Link href="/portal/kalendar" style={navItem("program")}>Program</Link>
          <Link href="/portal/admin-udalosti" style={navItem("admin")}>Admin</Link>

          {typeof onLogout === "function" ? (
            <button
              onClick={onLogout}
              style={{
                marginLeft: 8,
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Odhlásit
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
