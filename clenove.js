import Link from "next/link";

export default function clenove() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Kalendář</h1>
      <p>Zde bude kalendář událostí + odkazy na vysílání.</p>
      <p><Link href="/portal">← Zpět do portálu</Link></p>
    </div>
  );
}
