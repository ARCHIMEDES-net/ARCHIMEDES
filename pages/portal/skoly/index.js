// pages/portal/skoly/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/ui/card";
import { Alert } from "../../../components/ui/alert";

const BUCKET = "schools";

// DŮLEŽITÉ: mapy jen na klientovi (jinak Next SSR spadne)
const SchoolsMap = dynamic(() => import("../../../components/SchoolsMap"), {
  ssr: false,
  loading: () => <div className="text-muted">Načítám mapu…</div>,
});

const SchoolsGrowthMap = dynamic(
  () => import("../../../components/SchoolsGrowthMap"),
  {
    ssr: false,
    loading: () => <div className="text-muted">Načítám mapu růstu…</div>,
  }
);

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function safeYear(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeLatLng(row) {
  // kompatibilita: někde může být latitude/longitude, jinde lat/lng
  const lat =
    toNumberOrNull(row?.latitude) ?? toNumberOrNull(row?.lat) ?? null;
  const lng =
    toNumberOrNull(row?.longitude) ?? toNumberOrNull(row?.lng) ?? null;

  return {
    ...row,
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
  };
}

function SegButton({ id, label, current, onClick }) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "rounded-full border px-3 py-2 font-black",
        active
          ? "border-navy-900 bg-navy-900 text-white shadow-[0_10px_22px_rgba(0,0,0,0.1)]"
          : "border-slate-900/[0.12] bg-white text-navy-900"
      )}
    >
      {label}
    </button>
  );
}

const PILL_TINTS = {
  blue: "bg-blue-600/10 border-blue-600/[0.18]",
  green: "bg-emerald-500/10 border-emerald-500/[0.18]",
  orange: "bg-amber-500/10 border-amber-500/[0.22]",
  neutral: "bg-slate-900/[0.04] border-slate-900/[0.08]",
};

function StatPill({ label, value, tint = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-black text-navy-900",
        PILL_TINTS[tint]
      )}
    >
      {label}: <span className="text-[13px]">{value}</span>
    </span>
  );
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // "cards" | "map" | "growth"
  const [view, setView] = useState("cards");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select("*")
      // jen publikované školy (až bude veřejně)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows((data || []).map(normalizeLatLng));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const withCoords = useMemo(
    () =>
      rows.filter(
        (r) => typeof r.lat === "number" && typeof r.lng === "number"
      ),
    [rows]
  );

  const photoUrlByPath = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const p = r?.photo_path;
      if (p && !m.has(p)) m.set(p, publicUrlFromPath(p));
    }
    return m;
  }, [rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const withGps = withCoords.length;

    const countriesSet = new Set(
      rows
        .map((r) => String(r.country || "").trim())
        .filter((s) => s.length > 0)
    );

    const newestYear =
      rows
        .map((r) => safeYear(r.archimedes_since) || safeYear(r.created_at))
        .filter((y) => Number.isFinite(y))
        .sort((a, b) => b - a)[0] || "—";

    return {
      total,
      withGps,
      countries: countriesSet.size || 0,
      newestYear,
    };
  }, [rows, withCoords]);

  return (
    <RequireAuth>
      <PortalHeader title="Síť učeben" />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1100px] px-4 py-5 pb-16">
          <Link href="/portal" className="mb-2.5 inline-block font-black text-navy-900">
            ← Zpět do portálu
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-3.5">
            <div>
              <div className="text-[28px] font-black tracking-[-0.02em] text-navy-900">
                Síť učeben ARCHIMEDES
              </div>
              <div className="mt-1.5 max-w-[720px] text-muted">
                Přehled škol s učebnou ARCHIMEDES. Slouží jako reference,
                inspirace a možnost kontaktu.
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatPill label="Učeben" value={stats.total} />
                <StatPill label="S GPS" value={stats.withGps} tint="blue" />
                <StatPill label="Země" value={stats.countries} tint="green" />
                <StatPill label="Nejnovější" value={stats.newestYear} tint="orange" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SegButton id="cards" label="Karty" current={view} onClick={setView} />
              <SegButton id="map" label="Mapa" current={view} onClick={setView} />
              <SegButton id="growth" label="Růst" current={view} onClick={setView} />
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <Card className="p-3.5">Načítám…</Card>
            ) : err ? (
              <Alert variant="error">Chyba: {err}</Alert>
            ) : view === "map" ? (
              <Card className="p-3.5">
                <div className="mb-1.5 text-base font-black text-navy-900">Mapa učeben</div>
                <div className="mb-3 text-[13px] text-muted">
                  Zobrazuji se jen školy, které mají vyplněné souřadnice (GPS).
                  Aktuálně: <b>{withCoords.length}</b> z <b>{rows.length}</b>.
                </div>

                <SchoolsMap items={withCoords} />
              </Card>
            ) : view === "growth" ? (
              <Card className="p-3.5">
                <div className="mb-1.5 text-base font-black text-navy-900">Růst sítě</div>
                <div className="mb-3 text-[13px] text-muted">
                  Posuň rok a sleduj expanzi sítě. Body v aktuálním roce pulzují.
                </div>

                <SchoolsGrowthMap items={withCoords} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((r) => {
                  const photoUrl = r?.photo_path
                    ? photoUrlByPath.get(r.photo_path) || null
                    : null;

                  return (
                    <Link key={r.id} href={`/portal/skoly/${r.id}`}>
                      <Card className="cursor-pointer overflow-hidden p-0">
                        <div className="flex h-[150px] items-center justify-center bg-slate-900/[0.03] font-black text-slate-400">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={r?.name || "Fotka učebny"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "Bez fotky"
                          )}
                        </div>

                        <div className="p-3.5">
                          <div className="text-lg font-black leading-[1.15] text-navy-900">
                            {r.name || "Škola"}
                          </div>

                          <div className="mt-1.5 text-[13px] text-muted">
                            {r.city ? r.city : "—"}
                            {r.country ? ` • ${r.country}` : ""}
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {r.type ? (
                              <span className="rounded-full border border-slate-900/[0.08] bg-slate-900/[0.04] px-2.5 py-1.5 text-xs font-black">
                                {String(r.type).toLowerCase()}
                              </span>
                            ) : null}

                            {typeof r.lat === "number" && typeof r.lng === "number" ? (
                              <span className="rounded-full border border-blue-600/[0.18] bg-blue-600/10 px-2.5 py-1.5 text-xs font-black">
                                Má souřadnice
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 inline-flex items-center gap-1 font-black text-navy-900">
                            Zobrazit detail <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
