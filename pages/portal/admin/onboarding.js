import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { Input } from "../../../components/ui/input";

const REVIEW_LABELS = {
  pending: "Čeká na schválení",
  approved: "Schváleno",
  rejected: "Zamítnuto",
  consumed: "Použito",
  expired: "Vypršelo",
};

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("cs-CZ");
}

function statusTone(status) {
  if (status === "READY" || status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "POZOR" || status === "pending") return "border-amber-200 bg-amber-50 text-amber-900";
  if (status === "STOP" || status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function AdminOnboardingPage() {
  const [organizations, setOrganizations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [reviewReason, setReviewReason] = useState({});
  const [reviewingId, setReviewingId] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setError("Přihlášení vypršelo. Přihlaste se znovu.");
      setLoading(false);
      return;
    }
    setCurrentUserId(userData.user.id);

    const [organizationResult, reviewResult] = await Promise.all([
      supabase
        .from("organizations")
        .select("id,name,org_type,status,license_status,registration_number,ico,contact_name,contact_email,created_at")
        .in("org_type", ["municipality", "obec"])
        .is("parent_organization_id", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("onboarding_preflight_reviews")
        .select("id,organization_id,requested_by,status,preflight_status,preflight_report,review_reason,reviewed_by,reviewed_at,expires_at,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (organizationResult.error) {
      setError("Obce se nepodařilo načíst.");
      setLoading(false);
      return;
    }
    if (reviewResult.error) {
      setError("Schvalovací frontu se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setOrganizations(organizationResult.data || []);
    setReviews(reviewResult.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const organizationById = useMemo(
    () => new Map(organizations.map((item) => [item.id, item])),
    [organizations]
  );

  const filteredOrganizations = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("cs");
    if (!needle) return organizations;
    return organizations.filter((item) =>
      [item.name, item.ico, item.registration_number, item.contact_name, item.contact_email]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("cs").includes(needle))
    );
  }, [organizations, search]);

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending" && new Date(review.expires_at).getTime() > Date.now()
  );

  async function decideReview(review, decision) {
    const reason = String(reviewReason[review.id] || "").trim();
    if (reason.length < 3) {
      setError("Ke schválení nebo zamítnutí uveďte auditní důvod alespoň třemi znaky.");
      return;
    }
    if (review.requested_by === currentUserId) {
      setError("Vlastní žádost nelze schválit ani zamítnout. Je vyžadován druhý super_admin.");
      return;
    }

    setReviewingId(review.id);
    setError("");
    setMessage("");
    const { error: reviewError } = await supabase.rpc("review_onboarding_preflight_v1", {
      p_review_id: review.id,
      p_decision: decision,
      p_reason: reason,
    });
    if (reviewError) {
      setError(reviewError.message || "Rozhodnutí se nepodařilo uložit.");
      setReviewingId("");
      return;
    }

    setMessage(decision === "approve" ? "Výjimka POZOR byla schválena." : "Výjimka POZOR byla zamítnuta.");
    setReviewReason((current) => ({ ...current, [review.id]: "" }));
    setReviewingId("");
    await loadData();
  }

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • onboarding" />
        <main className="mx-auto max-w-[1320px] px-6 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-navy-900">Centrální onboarding obcí</h1>
              <p className="mt-2 max-w-[900px] text-muted">
                Kontrolní centrum pro onboarding, preflight a čtyřočkové schvalování stavu POZOR.
                Ostrý onboarding zůstává v jednotném aktivačním formuláři a servisní vrstva blokuje STOP i neschválené odchylky.
              </p>
            </div>
            <Link href="/portal/admin/obce">
              <Button type="button">Otevřít onboarding zákazníka</Button>
            </Link>
          </div>

          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-4">{message}</Alert> : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <div className="text-sm font-bold text-slate-500">Obce v registru</div>
              <div className="mt-1 text-3xl font-black text-navy-900">{organizations.length}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-bold text-slate-500">Čekající POZOR</div>
              <div className="mt-1 text-3xl font-black text-amber-700">{pendingReviews.length}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-bold text-slate-500">Bezpečnost</div>
              <div className="mt-1 text-lg font-black text-navy-900">READY / POZOR / STOP</div>
              <div className="mt-1 text-sm text-slate-600">Vlastní žádost nelze schválit.</div>
            </Card>
          </div>

          <Card className="mt-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-navy-900">Schvalovací fronta POZOR</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Schválení je auditované, časově omezené a vyžaduje druhého super_admina.
                </p>
              </div>
              <Button type="button" variant="secondary" disabled={loading} onClick={loadData}>Obnovit</Button>
            </div>

            <div className="mt-5 grid gap-4">
              {pendingReviews.length === 0 && !loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  Žádná čekající žádost POZOR.
                </div>
              ) : null}

              {pendingReviews.map((review) => {
                const organization = organizationById.get(review.organization_id);
                const report = review.preflight_report || {};
                const checks = Array.isArray(report.checks) ? report.checks : [];
                const ownRequest = review.requested_by === currentUserId;
                return (
                  <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-navy-900">{organization?.name || review.organization_id}</div>
                        <div className="mt-1 text-sm text-slate-600">{report.headline || "Vyžaduje ruční posouzení"}</div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusTone(review.preflight_status)}`}>
                        {review.preflight_status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {checks.filter((item) => item.status !== "READY").map((item) => (
                        <div key={item.code} className={`rounded-xl border p-3 text-sm ${statusTone(item.status)}`}>
                          <span className="font-black">{item.status}</span> • {item.message}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                      Vytvořeno {formatDateTime(review.created_at)} • platí do {formatDateTime(review.expires_at)}
                    </div>

                    {ownRequest ? (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                        Tuto žádost jste vytvořili vy. Rozhodnout musí druhý super_admin.
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Input
                          value={reviewReason[review.id] || ""}
                          maxLength={500}
                          onChange={(event) => setReviewReason((current) => ({ ...current, [review.id]: event.target.value }))}
                          placeholder="Auditní důvod rozhodnutí"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button type="button" disabled={reviewingId === review.id} onClick={() => decideReview(review, "approve")}>Schválit POZOR</Button>
                          <Button type="button" variant="secondary" disabled={reviewingId === review.id} onClick={() => decideReview(review, "reject")}>Zamítnout</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="mt-6 p-6">
            <h2 className="text-2xl font-black text-navy-900">Obce</h2>
            <div className="mt-4 max-w-xl">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Hledat podle názvu, IČO, kontaktu…" />
            </div>
            <div className="mt-4 grid gap-3">
              {filteredOrganizations.slice(0, 50).map((organization) => (
                <div key={organization.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <div className="font-black text-navy-900">{organization.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      IČO {organization.ico || "—"} • reg. č. {organization.registration_number || "—"} • {organization.contact_email || "bez kontaktního e-mailu"}
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusTone(organization.license_status === "active" ? "READY" : "pending")}`}>
                    {organization.license_status || organization.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
