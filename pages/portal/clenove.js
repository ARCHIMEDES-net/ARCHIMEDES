import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

export default function Clenove() {
  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Databáze členů</h1>
        <p>Zde bude seznam obcí/škol a správa účtů.</p>

        <p>
          <Link href="/portal">← Zpět do portálu</Link>
        </p>
      </div>
    </RequireAuth>
  );
}
