// pages/portal/skoly/[id].js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight } from "lucide-react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { Card } from "../../../components/ui/card";
import { Alert } from "../../../components/ui/alert";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function normalizeHttp(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

function toNum(v) {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export default function SchoolDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErr("Škola nebyla nalezena.");
        setLoading(false);
        return;
      }

      setRow(data);
      setLoading(false);
    })();
  }, [id]);

  const photoUrl = useMemo(() => publicUrlFromPath(row?.photo_path), [row?.photo_path]);

  // GPS: primárně latitude/longitude, fallback lat/lng (kdyby v DB existovalo staré schéma)
  const lat = useMemo(() => {
    const a = toNum(row?.latitude);
    if (a !== null) return a;
    return toNum(row?.lat);
  }, [row?.latitude, row?.lat]);

  const lng = useMemo(() => {
    const a = toNum(row?.longitude);
    if (a !== null) return a;
    return toNum(row?.lng);
  }, [row?.longitude, row?.lng]);

  const hasCoords = typeof lat === "number" && typeof lng === "number";

  const websiteHref = useMemo(() => normalizeHttp(row?.website), [row?.website]);

  return (
    <RequireAuth>
      <PortalHeader title="Síť učeben" />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1000px] px-4 py-5 pb-10">
          <Link href="/portal/skoly" className="mb-3 inline-block font-black text-navy-900">
            ← Zpět na seznam
          </Link>

          {loading ? (
            <div className="p-3 text-muted">Načítám…</div>
          ) : err ? (
            <Alert variant="error">Chyba: {err}</Alert>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
                <div className="p-3.5">
                  <div className="text-[22px] font-black leading-[1.15] text-navy-900">
                    {row?.name || "—"}
                  </div>

                  <div className="mt-1.5 text-[13px] text-muted">
                    {(row?.address ? row.address + ", " : "")}
                    {row?.city || ""}
                    {row?.region ? ` • ${row.region}` : ""}
                    {row?.country ? ` • ${row.country}` : ""}
                  </div>

                  <div className="mt-3 grid gap-2">
                    {/* web školy */}
                    {websiteHref ? (
                      <a
                        href={websiteHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit items-center gap-1 font-black text-brand hover:underline"
                      >
                        Web školy <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : null}

                    {/* mapy */}
                    {hasCoords ? (
                      <div className="flex flex-wrap gap-3.5">
                        <a
                          href={`https://mapy.cz/zakladni?x=${lng}&y=${lat}&z=16&source=coor&id=${lat}%2C${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-black text-brand hover:underline"
                        >
                          Otevřít v Mapy.cz <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>

                        <a
                          href={`https://www.google.com/maps?q=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-black text-brand hover:underline"
                        >
                          Otevřít v Google Maps <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    ) : null}

                    {/* kontakt */}
                    {row?.contact_name || row?.contact_email || row?.contact_phone ? (
                      <div className="border-t border-slate-900/[0.08] pt-2.5">
                        <div className="mb-1.5 font-black text-navy-900">Kontakt</div>
                        {row?.contact_name ? <div>{row.contact_name}</div> : null}
                        {row?.contact_email ? <div>{row.contact_email}</div> : null}
                        {row?.contact_phone ? <div>{row.contact_phone}</div> : null}
                      </div>
                    ) : null}

                    {/* o škole */}
                    {row?.short_description ? (
                      <div className="border-t border-slate-900/[0.08] pt-2.5">
                        <div className="mb-1.5 font-black text-navy-900">O škole</div>
                        <div className="leading-relaxed text-slate-700">{row.short_description}</div>
                      </div>
                    ) : null}

                    {/* popis učebny */}
                    {row?.classroom_description ? (
                      <div className="border-t border-slate-900/[0.08] pt-2.5">
                        <div className="mb-1.5 font-black text-navy-900">Popis učebny</div>
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                          {row.classroom_description}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="relative min-h-[320px] bg-slate-900/[0.03]">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={row?.name || "Fotka učebny"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="p-3.5 text-slate-600">
                      Zatím bez fotky.
                      <div className="mt-2 text-xs">
                        Tip: fotku doplníš v <b>Admin – Školy</b>.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
