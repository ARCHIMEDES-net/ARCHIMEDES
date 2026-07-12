import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

export default function Clenove() {
  return (
    <RequireAuth>
      <PortalHeader />

      <div className="mx-auto max-w-[900px] p-4 py-10">
        <h1 className="text-2xl font-black text-navy-900">Databáze členů</h1>
        <p className="mt-2 text-muted">Zde bude seznam obcí/škol a správa účtů.</p>

        <p className="mt-4">
          <Link href="/portal" className="font-bold text-brand hover:underline">
            ← Zpět do portálu
          </Link>
        </p>
      </div>
    </RequireAuth>
  );
}
