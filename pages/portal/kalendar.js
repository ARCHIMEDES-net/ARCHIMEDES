import RequireAuth from "../../components/RequireAuth";

const udalosti = [
  {
    id: 1,
    nazev: "Wellbeing pro 1. stupeň",
    datum: "12. 3. 2026 – 9:00",
    cilovaSkupina: "1. stupeň ZŠ",
  },
  {
    id: 2,
    nazev: "Senior klub – Digitální bezpečnost",
    datum: "15. 3. 2026 – 17:00",
    cilovaSkupina: "Senioři",
  },
  {
    id: 3,
    nazev: "Smart City Klub – Deváťáci",
    datum: "18. 3. 2026 – 10:00",
    cilovaSkupina: "2. stupeň ZŠ",
  },
];

export default function Kalendar() {
  return (
    return (
  <RequireAuth>
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>      <h1>Kalendář vysílání</h1>

      {udalosti.map((u) => (
        <div
          key={u.id}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 16,
            borderRadius: 8,
          }}
        >
          <h3>{u.nazev}</h3>
          <p>{u.datum}</p>
          <p><strong>{u.cilovaSkupina}</strong></p>

          <Link href={`/portal/udalost/${u.id}`}>
            Detail události →
          </Link>
        </div>
      ))}

      <p style={{ marginTop: 20 }}>
        <Link href="/portal">← Zpět do portálu</Link>
      </p>
        </div>
  </RequireAuth>
  ); 
}
