import Link from "next/link";

export default function Footer() {
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
          flexWrap: "wrap",
          gap: 12,
          fontSize: 14,
        }}
      >
        <div>
          © {new Date().getFullYear()} ARCHIMEDES Live
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/pravni">Právní informace</Link>
          <Link href="/pravni#cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
