import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import Link from "next/link";

export default function AdminUdalosti() {
  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/portal/admin">← Zpět do adminu</Link>
          <span style={{ color: "#6b7280" }}>|</span>
          <Link href="/portal/kalendar">Kalendář</Link>
        </div>

        <h1 style={{ margin: "10px 0 6px" }}>Admin – události</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Tady je správa událostí (vysílání). Pokud už máš hotový formulář a list, necháme ho tady a jen sjednotíme hlavičku.
        </p>

        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
          <b>MVP poznámka:</b> Pokud tu máš starší funkční kód, nech ho a jen doplň <code>&lt;PortalHeader /&gt;</code> nahoře.
        </div>
      </main>
    </RequireAuth>
  );
}
