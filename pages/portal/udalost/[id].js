import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

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

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  const starts = useMemo(() => safeDate(row?.starts_at), [row?.starts_at]);
  const aud = useMemo(() => normalizeAudience(row?.audience_groups || row?.audience), [row]);

  const streamUrl = row?.stream_url || row?.streamUrl || "";
  const worksheetUrl = row?.worksheet_url || "";

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
          <div className="text-sm text-slate-500">
            {starts ? formatDateTimeCS(starts) : "Bez data"}
          </div>

          <h1 className="text-2xl font-semibold mt-2">{row.title || row.name || "Událost"}</h1>

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

          <div className="mt-6 flex flex-wrap gap-2">
            {streamUrl ? (
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                ▶ Odkaz na vysílání
              </a>
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
