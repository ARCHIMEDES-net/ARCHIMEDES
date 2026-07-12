import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

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
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;
      const user = session?.user;

      if (!user || !accessToken) {
        throw new Error("Nejste přihlášen.");
      }

      const response = await fetch("/api/create-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          organizationName: schoolName,
          orgType: "school",
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
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[600px] px-5 py-20">
        <Card className="p-7">
          <h1 className="text-[28px] font-[950] tracking-[-0.03em] text-navy-900">Založit školu</h1>
          <p className="mb-5 mt-2.5 text-muted">
            Vytvoříte organizaci školy a stanete se jejím administrátorem.
          </p>

          {error ? (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={handleCreate}>
            <Label htmlFor="schoolName">Název školy</Label>
            <Input
              id="schoolName"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Např. ZŠ Hodonín"
              className="mb-4"
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Vytvářím..." : "Vytvořit školu"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
