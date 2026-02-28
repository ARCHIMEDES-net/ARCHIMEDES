export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>ARCHIMEDES Live</h1>
      <p>Veřejná část portálu (MVP).</p>

      <ul>
        <li><a href="/login">Přihlášení</a></li>
        <li><a href="/portal">Vstup do portálu (po přihlášení)</a></li>
      </ul>
    </div>
  );
}
