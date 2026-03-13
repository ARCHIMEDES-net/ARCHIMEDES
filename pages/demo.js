import { useState } from "react";
import { useRouter } from "next/router";

export default function DemoPage() {
  const router = useRouter();

  const [school, setSchool] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/start-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school,
          name,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Nepodařilo se spustit demo.");
      }

      // přesměrování do portálu
      router.push("/portal");
    } catch (err) {
      setError(err.message || "Došlo k chybě.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "60px auto", padding: "20px" }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>
        Vyzkoušejte ARCHIMEDES Live ve vaší škole
      </h1>

      <p style={{ fontSize: 18, marginBottom: 40 }}>
        ARCHIMEDES Live je živý vzdělávací program pro školy a komunitu obce.
        Během několika sekund si můžete vytvořit ukázkovou učebnu a podívat se,
        jak portál funguje.
      </p>

      <div
        style={{
          background: "#f5f7fa",
          padding: 30,
          borderRadius: 10,
          marginBottom: 40,
        }}
      >
        <h2 style={{ marginBottom: 15 }}>Jak to funguje</h2>

        <ul style={{ lineHeight: 1.8 }}>
          <li>živé vysílání s inspirativními hosty</li>
          <li>sledování ve třídě na interaktivním panelu</li>
          <li>pracovní listy pro žáky</li>
          <li>archiv vysílání a program pro školy</li>
        </ul>
      </div>

      <h2 style={{ marginBottom: 20 }}>Spustit demo učebny</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 15,
          maxWidth: 500,
        }}
      >
        <input
          type="text"
          placeholder="Název školy"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          required
          style={{ padding: 12, fontSize: 16 }}
        />

        <input
          type="text"
          placeholder="Vaše jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 12, fontSize: 16 }}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 12, fontSize: 16 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 14,
            fontSize: 18,
            background: "#1e88e5",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Spouštím demo…" : "Spustit demo"}
        </button>

        {error && (
          <div style={{ color: "red", marginTop: 10 }}>{error}</div>
        )}
      </form>
    </div>
  );
}
