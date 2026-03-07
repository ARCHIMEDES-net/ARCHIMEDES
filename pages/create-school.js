import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function CreateSchoolPage() {
  const router = useRouter();

  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Nejste přihlášen.");
      }

      const response = await fetch("/api/create-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          organizationName: schoolName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit školu.");
      }

      router.push("/portal");
    } catch (e) {
      setError(e.message || "Chyba při vytváření školy.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: 20,
        fontFamily: "system-ui",
      }}
    >
      <h1>Založit školu</h1>

      <p>
        Vytvoříte organizaci školy a stanete se jejím administrátorem.
      </p>

      {error && (
        <div style={{ color: "red", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCreate}>
        <label>Název školy</label>

        <input
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="Např. ZŠ Hodonín"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 16,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 18px",
            fontWeight: 700,
          }}
        >
          {loading ? "Vytvářím..." : "Vytvořit školu"}
        </button>
      </form>
    </main>
  );
}
