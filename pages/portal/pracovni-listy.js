import Link from "next/link";

export default function PracovniListy() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Pracovní listy</h1>
      <p>Zde budou pracovní listy ke stažení (podle událostí).</p>
      <p><Link href="/portal">← Zpět do portálu</Link></p>
    </div>
  );
}
