import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../../components/PortalHeader";
import { supabase } from "../../../../../lib/supabaseClient";
import { Alert } from "../../../../../components/ui/alert";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";

export default function AdminMunicipalityAdminsPage() {
  const router = useRouter();
  const organizationId =
    typeof router.query.id === "string" ? router.query.id : "";
  const [municipality, setMunicipality] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady || !organizationId) return;
    loadMunicipality();
  }, [router.isReady, organizationId]);

  async function loadMunicipality() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("organizations")
      .select("id, name, org_type, status, contact_name, contact_email")
      .eq("id", organizationId)
      .maybeSingle();

    if (
      loadError ||
      !data ||
      !["municipality", "obec"].includes(data.org_type)
    ) {
      setError("Obec se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setMunicipality(data);
    setForm({
      fullName: data.contact_name || "",
      email: data.contact_email || "",
    });
    setLoading(false);
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Přihlášení vypršelo. Přihlaste se znovu.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/invite-municipality-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ organizationId, ...form }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Správce se nepodařilo přidat.");
      }

      setMessage(result.message);
    } catch (submitError) {
      setError(
        submitError?.message || "Správce se nepodařilo bezpečně přidat."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • správce obce" />
        <main className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
          <Link
            href={`/portal/admin/obce/${organizationId}`}
            className="text-sm font-bold text-slate-600 underline underline-offset-4"
          >
            ← Zpět na detail obce
          </Link>

          <h1 className="mt-2 text-3xl font-black text-navy-900">
            Přidat správce obce
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tento krok přidá pouze přístup správce. Nemění licenci, smlouvu,
            fakturaci ani aktivaci obce.
          </p>

          {error ? (
            <Alert variant="error" className="mt-5">
              {error}
            </Alert>
          ) : null}
          {message ? (
            <Alert variant="success" className="mt-5">
              {message}
            </Alert>
          ) : null}
          {loading ? <Card className="mt-5 p-6">Načítám…</Card> : null}

          {!loading && municipality ? (
            <form onSubmit={submit}>
              <Card className="mt-5 p-6">
                <h2 className="text-xl font-black text-navy-900">
                  {municipality.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Před odesláním zkontrolujte schválené jméno a pracovní e-mail.
                </p>

                <div className="mt-5 grid gap-4">
                  <div>
                    <Label>Jméno a příjmení</Label>
                    <Input
                      value={form.fullName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Pracovní e-mail</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </Card>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Ověřuji a odesílám…" : "Pozvat správce obce"}
                </Button>
                <Link href={`/portal/admin/obce/${organizationId}`}>
                  <Button type="button" variant="secondary">
                    Zrušit
                  </Button>
                </Link>
              </div>
            </form>
          ) : null}
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
