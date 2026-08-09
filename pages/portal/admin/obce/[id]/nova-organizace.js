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
import { Select } from "../../../../../components/ui/select";

const EMPTY_FORM = {
  organizationType: "school",
  name: "",
  legalIdentifier: "",
  address: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  activityCode: "",
  activityCustomText: "",
};

export default function NewMunicipalityOrganizationPage() {
  const router = useRouter();
  const municipalityId = typeof router.query.id === "string" ? router.query.id : "";
  const [municipality, setMunicipality] = useState(null);
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (!router.isReady || !municipalityId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const [municipalityResult, activityResult] = await Promise.all([
        supabase
          .from("organizations")
          .select("id, name, org_type, status, license_status, license_valid_until")
          .eq("id", municipalityId)
          .maybeSingle(),
        supabase
          .from("activity_categories")
          .select("code, label, sort_order")
          .eq("section", "spolky")
          .eq("is_active", true)
          .order("sort_order"),
      ]);

      if (cancelled) return;
      if (
        municipalityResult.error ||
        !municipalityResult.data ||
        !["municipality", "obec"].includes(municipalityResult.data.org_type)
      ) {
        setError("Obec se nepodařilo načíst.");
      } else if (activityResult.error) {
        setError("Číselník činností se nepodařilo načíst.");
      } else {
        setMunicipality(municipalityResult.data);
        setActivities(activityResult.data || []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, municipalityId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setCreated(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Přihlášení vypršelo. Přihlaste se znovu.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/create-municipality-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ municipalityId, ...form }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Organizaci se nepodařilo založit.");
      }

      setCreated(result.organization);
    } catch (submitError) {
      setError(submitError?.message || "Organizaci se nepodařilo bezpečně založit.");
    } finally {
      setSubmitting(false);
    }
  }

  const isAssociation = form.organizationType === "association";

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • nová organizace" />
        <main className="mx-auto max-w-[860px] px-4 py-8 sm:px-6">
          <Link
            href={`/portal/admin/obce/${municipalityId}`}
            className="text-sm font-bold text-slate-600 underline underline-offset-4"
          >
            ← Zpět na detail obce
          </Link>

          <h1 className="mt-2 text-3xl font-black text-navy-900">
            Založit školu nebo spolek
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Organizace vznikne jako samostatný tenant pod licencí obce. Tento krok
            nevytvoří uživatele a správci obce neposkytne přístup k jejím datům.
          </p>

          {error ? <Alert variant="error" className="mt-5">{error}</Alert> : null}
          {created ? (
            <Alert variant="success" className="mt-5">
              Organizace „{created.organization_name}“ byla bezpečně založena.
              Správce organizace se přidává samostatným krokem.
            </Alert>
          ) : null}
          {loading ? <Card className="mt-5 p-6">Načítám obec…</Card> : null}

          {!loading && municipality && !created ? (
            <form onSubmit={submit}>
              <Card className="mt-5 p-6">
                <h2 className="text-xl font-black text-navy-900">{municipality.name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Založení je povoleno pouze pod aktivní licencí; server stav znovu ověří.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Typ organizace</Label>
                    <Select
                      value={form.organizationType}
                      onChange={(event) => update("organizationType", event.target.value)}
                    >
                      <option value="school">Škola</option>
                      <option value="association">Spolek</option>
                    </Select>
                  </div>
                  <div>
                    <Label>IČO (volitelné)</Label>
                    <Input
                      inputMode="numeric"
                      value={form.legalIdentifier}
                      onChange={(event) => update("legalIdentifier", event.target.value)}
                      maxLength={8}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Název organizace</Label>
                    <Input
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      maxLength={160}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresa</Label>
                    <Input
                      value={form.address}
                      onChange={(event) => update("address", event.target.value)}
                      maxLength={300}
                      required
                    />
                  </div>
                  {isAssociation ? (
                    <>
                      <div className="md:col-span-2">
                        <Label>Hlavní činnost spolku</Label>
                        <Select
                          value={form.activityCode}
                          onChange={(event) => update("activityCode", event.target.value)}
                          required
                        >
                          <option value="">Vyberte činnost</option>
                          {activities.map((activity) => (
                            <option key={activity.code} value={activity.code}>
                              {activity.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      {form.activityCode === "jine" ? (
                        <div className="md:col-span-2">
                          <Label>Vlastní popis činnosti</Label>
                          <Input
                            value={form.activityCustomText}
                            onChange={(event) => update("activityCustomText", event.target.value)}
                            maxLength={500}
                            required
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  <div>
                    <Label>Kontaktní osoba</Label>
                    <Input
                      value={form.contactName}
                      onChange={(event) => update("contactName", event.target.value)}
                      maxLength={120}
                      required
                    />
                  </div>
                  <div>
                    <Label>Kontaktní e-mail</Label>
                    <Input
                      type="email"
                      value={form.contactEmail}
                      onChange={(event) => update("contactEmail", event.target.value)}
                      maxLength={254}
                      required
                    />
                  </div>
                  <div>
                    <Label>Telefon (volitelné)</Label>
                    <Input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(event) => update("contactPhone", event.target.value)}
                      maxLength={32}
                    />
                  </div>
                </div>
              </Card>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Zakládám…" : "Založit samostatnou organizaci"}
                </Button>
                <Link href={`/portal/admin/obce/${municipalityId}`}>
                  <Button type="button" variant="secondary">Zrušit</Button>
                </Link>
              </div>
            </form>
          ) : null}

          {created ? (
            <div className="mt-5">
              <Link href={`/portal/admin/obce/${municipalityId}`}>
                <Button type="button">Zpět na detail obce</Button>
              </Link>
            </div>
          ) : null}
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
