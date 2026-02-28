import Link from "next/link";

export default function Archiv() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Archiv</h1>
      <p>Zde bude archiv záznamů a materiálů.</p>
      <p><Link href="/portal">← Zpět do portálu</Link></p>
    </div>
  );
}
