import { useRouter } from "next/router";
import Link from "next/link";

const udalosti = {
  1: {
    nazev: "Wellbeing pro 1. stupeň",
    datum: "12. 3. 2026 – 9:00",
    popis: "Interaktivní vstup zaměřený na duševní pohodu dětí.",
    link: "https://meet.google.com/",
    pracovnilist: true,
  },
  2: {
    nazev: "Senior klub – Digitální bezpečnost",
    datum: "15. 3. 2026 – 17:00",
    popis: "Jak se chránit před podvody na internetu.",
    link: "https://meet.google.com/",
    pracovnilist: false,
  },
  3: {
    nazev: "Smart City Klub – Deváťáci",
    datum: "18. 3. 2026 – 10:00",
    popis: "Diskuse o budoucnosti měst s urbanistkou.",
    link: "https://meet.google.com/",
    pracovnilist: true,
  },
};

export default function DetailUdalosti() {
  const router = useRouter();
  const { id } = router.query;

  const udalost = udalosti[id];

  if (!udalost) return <p>Načítání...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>{udalost.nazev}</h1>
      <p><strong>{udalost.datum}</strong></p>
      <p>{udalost.popis}</p>

      <a
        href={udalost.link}
        target="_blank"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "10px 20px",
          background: "#0070f3",
          color: "white",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Vstoupit do vysílání
      </a>

      {udalost.pracovnilist && (
        <p style={{ marginTop: 20 }}>
          📄 Pracovní list bude dostupný před vysíláním.
        </p>
      )}

      <p style={{ marginTop: 30 }}>
        <Link href="/portal/kalendar">← Zpět do kalendáře</Link>
      </p>
    </div>
  );
}
