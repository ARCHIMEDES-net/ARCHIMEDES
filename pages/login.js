export default function Login() {
  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Přihlášení</h1>
      <p>Zatím jen šablona obrazovky. Napojení na Supabase doplníme jako další krok.</p>

      <label style={{ display: "block", marginTop: 16 }}>E-mail</label>
      <input style={{ width: "100%", padding: 10, fontSize: 16 }} placeholder="např. obec@domena.cz" />

      <label style={{ display: "block", marginTop: 16 }}>Heslo</label>
      <input style={{ width: "100%", padding: 10, fontSize: 16 }} type="password" placeholder="••••••••" />

      <button style={{ marginTop: 18, padding: "10px 14px", fontSize: 16 }}>
        Přihlásit se
      </button>

      <p style={{ marginTop: 18 }}>
        <a href="/">← Zpět na úvod</a>
      </p>
    </div>
  );
}
