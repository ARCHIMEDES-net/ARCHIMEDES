import Link from "next/link";

const LOGO_SRC = "/logo/archimedes-live.png";

export default function PortalHeader() {
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
          style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          aria-label="ARCHIMEDES Live – Portál"
        >
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{
              height: 44,
              width: "auto",
              display: "block",
            }}
            onError={(e) => {
              // Když by logo nebylo nalezeno, ať je aspoň vidět fallback text
              e.currentTarget.style.display = "none";
            }}
          />
          <span style={{ fontWeight: 700, color: "#111827" }}>Portál</span>
        </Link>

        {/* Menu */}
        <nav style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/portal" style={linkStyle}>Portál</Link>
          <Link href="/portal/kalendar" style={linkStyle}>Program</Link>
          <Link href="/portal/archiv" style={linkStyle}>Archiv</Link>
          <Link href="/portal/pracovni-listy" style={linkStyle}>Pracovní listy</Link>
          <Link href="/portal/inzerce" style={linkStyle}>Inzerce</Link>

          <span style={{ width: 1, height: 18, background: "#e5e7eb", margin: "0 4px" }} />

          <Link
            href="/portal/admin"
            title="Admin"
            style={{
              ...linkStyle,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "8px 10px",
              fontWeight: 700,
            }}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#111827",
  padding: "8px 6px",
  borderRadius: 8,
};
