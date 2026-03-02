import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

export default function Archiv() {
  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>Archiv</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Záznamy vysílání (MVP). Později napojíme na tabulku v DB / úložiště odkazů.
        </p>

        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, color: "#6b7280" }}>
          Archiv je zatím prázdný.
        </div>
      </main>
    </RequireAuth>
  );
}
