import Link from "next/link";

export default function Footer() {
  const linkStyle = {
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 700,
  };

  return (
    <footer
      style={{
        marginTop: 60,
        padding: "30px 20px",
        borderTop: "1px solid #e5e5e5",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 14,
          color: "rgba(15,23,42,0.72)",
        }}
      >
        <div>© {new Date().getFullYear()} ARCHIMEDES Live</div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/pravni" style={linkStyle}>
            Právní informace
          </Link>
          <Link href="/pravni#cookies" style={linkStyle}>
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
