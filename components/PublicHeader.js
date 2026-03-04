import Link from "next/link";
import { useRouter } from "next/router";

const LOGO_SRC = "/logo.jpg";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

export default function PublicHeader({ active = "" }) {
  const router = useRouter();
  const path = stripQuery(router?.asPath || "");

  const itemBase = {
    textDecoration: "none",
    color: "#111827",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
  };

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
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{ height: 44 }}
          />
        </Link>

        <nav style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link href="/" style={itemBase}>Domů</Link>
          <Link href="/program" style={itemBase}>Program</Link>
          <Link href="/cenik" style={itemBase}>Ceník</Link>
          <Link href="/poptavka" style={itemBase}>Poptávka</Link>
          <Link href="/portal" style={itemBase}>Portál</Link>
        </nav>
      </div>
    </header>
  );
}
