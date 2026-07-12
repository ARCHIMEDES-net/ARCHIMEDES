import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

const ORG_TYPES = [
  { value: "school", label: "Škola" },
  { value: "municipality", label: "Obec / město" },
  { value: "senior_club", label: "Senior klub" },
  { value: "association", label: "Spolek" },
  { value: "community_center", label: "Komunitní centrum" },
  { value: "diaspora", label: "Krajanská organizace" },
  { value: "partner", label: "Partner" },
];

export default function CreateOrganizationPage() {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState("");
  const [orgType, setOrgType] = useState("school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdOrganizationName, setCreatedOrganizationName] = useState("");
  const [createdJoinCode, setCreatedJoinCode] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCopyMessage("");
    setCreatedOrganizationName("");
    setCreatedJoinCode("");
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
          organizationName,
          orgType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit organizaci.");
      }

      setCreatedOrganizationName(result?.organizationName || organizationName);
      setCreatedJoinCode(result?.joinCode || "");
    } catch (e) {
      setError(e.message || "Chyba při vytváření organizace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCode() {
    try {
      if (!createdJoinCode) return;
      await navigator.clipboard.writeText(createdJoinCode);
      setCopyMessage("Kód organizace byl zkopírován.");
      setTimeout(() => setCopyMessage(""), 1800);
    } catch (_e) {
      setCopyMessage("Kód zkopírujte ručně.");
      setTimeout(() => setCopyMessage(""), 1800);
    }
  }

  const createdSuccessfully = !!createdJoinCode;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[760px] px-5 py-16">
        <Card className="p-7">
          <h1 className="text-[28px] font-[950] tracking-[-0.03em] text-navy-900">
            Vytvořit organizaci
          </h1>

          <p className="mt-2 text-muted">
            Založíte novou organizaci a automaticky se stanete jejím administrátorem.
          </p>

          {error ? (
            <Alert variant="error" className="mb-4 mt-4">
              {error}
            </Alert>
          ) : null}

          {createdSuccessfully ? (
            <Alert variant="success" className="mb-4 mt-4">
              <div className="mb-1.5 font-black">Organizace byla úspěšně vytvořena.</div>

              {createdOrganizationName ? (
                <div className="mb-2.5">
                  Organizace: <strong>{createdOrganizationName}</strong>
                </div>
              ) : null}

              <div className="mb-1.5 text-sm text-slate-600">Kód organizace</div>

              <div className="mb-3 font-mono text-2xl font-black tracking-[0.05em] text-navy-900">
                {createdJoinCode}
              </div>

              <div className="mb-3.5 text-slate-600">
                Tento kód můžete poslat kolegům. Připojí se přes stránku <strong>/join</strong>.
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button type="button" variant="secondary" onClick={handleCopyCode}>
                  Zkopírovat kód
                </Button>
                <Button type="button" onClick={() => router.push("/portal/uzivatele")}>
                  Pokračovat do správy uživatelů
                </Button>
              </div>

              {copyMessage ? <div className="mt-2.5 text-sm">{copyMessage}</div> : null}
            </Alert>
          ) : null}

          {!createdSuccessfully ? (
            <form onSubmit={handleCreate} className="mt-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="organizationName">Název organizace</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Např. ZŠ Hodonín nebo Senior klub Křenov"
                  />
                </div>

                <div>
                  <Label htmlFor="orgType">Typ organizace</Label>
                  <Select id="orgType" value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                    {ORG_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <Alert variant="neutral">
                  Po vytvoření získáte vlastní <strong>kód organizace</strong>, který můžete poslat
                  kolegům. Vy se automaticky stanete <strong>administrátorem organizace</strong>.
                </Alert>

                <div className="pt-1.5">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Vytvářím..." : "Vytvořit organizaci"}
                  </Button>
                </div>
              </div>
            </form>
          ) : null}

          <div className="mt-4 text-muted">
            Máte kód organizace?{" "}
            <Link href="/join" className="font-bold text-brand hover:underline">
              Připojte se ke stávající organizaci
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
