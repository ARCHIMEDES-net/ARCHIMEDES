import Link from "next/link";

export default function Clenove() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Databáze členů</h1>
      <p>Zde bude seznam obcí/škol a správa účtů.</p>
      <p><Link href="/portal">← Zpět do portálu</Link></p>
    </div>
  );
}
