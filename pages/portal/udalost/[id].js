import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "posters";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(date) {
  return date.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeColor(label) {
  const s = String(label || "").toLowerCase();
  if (s.includes("1")) return "bg-emerald-100 text-emerald-800";
  if (s.includes("2")) return "bg-blue-100 text-blue-800";
  if (s.includes("senior")) return "bg-amber-100 text-amber-800";
  if (s.includes("komunit")) return "bg-purple-100 text-purple-800";
  if (s.includes("rodi")) return "bg-pink-100 text-pink-800";
  if (s.includes("učitel")) return "bg-slate-200 text-slate-800";
  return "bg-slate-100 text-slate-700";
}

function normalizeAudience(aud) {
  if (!aud) return [];
  if (Array.isArray(aud)) return aud.filter(Boolean).map(String);
  const s = String(aud).trim();
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function normalizePosterPath(path) {
  if (!path) return "";
  let s = String(path).trim();
  if (!s) return "";
  if (s.startsWith(`${BUCKET}/`)) s = s.slice(BUCKET.length + 1);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) s = s.slice(1);
  return s;
}

function publicUrlFromPath(path) {
  const normalized = normalizePosterPath(path);
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(normalized);
  return data?.publicUrl || "";
}

function resolvePosterUrl(row) {
  const directUrl = String(row?.poster_url || "").trim();
  if (directUrl) return directUrl;
  return publicUrlFromPath(row?.poster_path);
}

function resolveLicenseMode(org) {
  if (!org) return "default";

  const status = String(org.license_status || "trial").toLowerCase().trim();
  const validUntil = safeDate(org.license_valid_until);

  if (status === "suspended") return "suspended";
  if (status === "active") return "active";
  if (status === "expired") return "expired";

  if (status === "trial") {
    if (!validUntil) return "trial";
    return validUntil.getTime() >= Date.now() ? "trial" : "expired";
  }

  return "expired";
}

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [licenseMode, setLicenseMode] = useState("active");
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;

      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setRow(data);
      setLoading(false);
    }

    load();
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadAccess() {
      try {
        const { data: adminData, error: adminError } = await supabase.rpc("is_admin");
        if (!adminError && mounted) {
          setIsPlatformAdmin(!!adminData);
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          if (mounted) setLicenseMode("default");
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (membershipError) throw membershipError;

        if (!membership?.organization_id) {
          if (mounted) setLicenseMode("active");
          return;
        }

        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .select("license_status, license_valid_until")
          .eq("id", membership.organization_id)
          .maybeSingle();

        if (orgError) throw orgError;

        if (mounted) {
          setLicenseMode(resolveLicenseMode(org));
        }
      } catch (_e) {
        if (mounted) setLicenseMode("expired");
      } finally {
        if (mounted) setLicenseLoading(false);
      }
    }

    loadAccess();

    return () => {
      mounted = false;
    };
  }, []);

  const starts = useMemo(() => safeDate(row?.starts_at), [row?.starts_at]);
  const aud = useMemo(
    () => normalizeAudience(row?.audience_groups || row?.audience),
    [row]
  );

  const streamUrl = row?.stream_url || row?.streamUrl || "";
  const worksheetUrl = row?.worksheet_url || "";

  const posterUrl = useMemo(() => resolvePosterUrl(row), [row]);

  const canAccessStream =
    !!streamUrl &&
    (isPlatformAdmin || licenseMode === "active");

  const showLockedStreamNotice =
    !!streamUrl &&
    !canAccessStream &&
    !licenseLoading;

  if (loading) return <div className="p-6">Načítám…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!row) return <div className="p-6">Událost nenalezena.</div>;

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <Link href="/portal/kalendar" className="text-sm text-slate-500 hover:underline">
            ← Zpět na Program
          </Link>

          <button
            onClick={() => router.back()}
            className="text-sm px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
            title="Zpět"
          >
            Zpět
          </button>
        </div>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          {posterUrl ? (
            <div className="mb-5 border border-slate-200 rounded-2xl overflow-hidden">
              <img
                src={posterUrl}
                alt="Plakát události"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ) : null}

          <div className="text-sm text-slate-500">
            {starts ? formatDateTimeCS(starts) : "Bez data"}
          </div>

          <h1 className="text-2xl font-semibold mt-2">
            {row.title || row.name || "Událost"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {row.category ? (
              <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                {row.category}
              </span>
            ) : null}

            {aud.map((a, i) => (
              <span key={i} className={`px-2 py-1 rounded-full text-xs ${badgeColor(a)}`}>
                {a}
              </span>
            ))}
          </div>

          {row.full_description || row.description || row.short_description ? (
            <div className="mt-5 text-slate-700 whitespace-pre-wrap">
              {row.full_description || row.description || row.short_description}
            </div>
          ) : (
            <div className="mt-5 text-slate-500">Popis zatím není vyplněn.</div>
          )}

          {showLockedStreamNotice ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-extrabold uppercase tracking-wide text-amber-800">
                Vysílání je součástí aktivní licence
              </div>

              <div className="mt-2 text-slate-700 leading-7">
                Tato událost je v portálu viditelná i v demo režimu, ale přímý vstup do vysílání
                je dostupný pouze pro zapojené školy a organizace s aktivní licencí ARCHIMEDES Live.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/poptavka"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  Požádat o plnou licenci
                </Link>

                <Link
                  href="/poptavka"
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                >
                  Domluvit ukázkovou hodinu
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {canAccessStream ? (
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                ▶ Odkaz na vysílání
              </a>
            ) : streamUrl ? (
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 cursor-not-allowed"
                title="Dostupné pouze pro aktivní organizace"
              >
                🔒 Odkaz na vysílání
              </button>
            ) : null}

            {worksheetUrl ? (
              <a
                href={worksheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
              >
                📄 Pracovní list
              </a>
            ) : null}

            <Link
              href="/portal/kalendar"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
            >
              Zpět na Program
            </Link>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
