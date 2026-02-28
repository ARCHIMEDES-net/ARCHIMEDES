import Link from "next/link";

export default function Inzerce() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Inzerce</h1>
      <p>Zde bude prostor pro pozvánky, nabídky a partnery.</p>
      <p><Link href="/portal">← Zpět do portálu</Link></p>
    </div>
  );
}
