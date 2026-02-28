import Link from "next/link";

export default function Program() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Program</h1>
      <p>Zde bude přehled programů a rubrik.</p>
      <p><Link href="/portal">← Zpět do portálu</Link></p>
    </div>
  );
}
