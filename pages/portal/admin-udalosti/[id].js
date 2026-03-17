import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "posters";

function toDateTimeLocalValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromDateTimeLocalValue(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function normalizeAudienceGroups(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  const s = String(val).trim();
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function publicUrlFromPath(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

function safeFileName(name) {
  return String(name || "soubor")
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 120);
}

export default function AdminUdalostEdit() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [row, setRow] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [audienceGroups, setAudienceGroups] = useState([]);
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [posterPath, setPosterPath] = useState("");
  const posterUrl = useMemo(() => publicUrlFromPath(posterPath), [posterPath]);

  const [catOptions, setCatOptions] = useState([]);
  const [audOptions, setAudOptions] = useState([]);
  const [lookupErr, setLookupErr] = useState("");

  async function loadLookups() {
    setLookupErr("");
    const catRes = await supabase.from("categories").select("*").order("sort", { ascending: true });
    if (!catRes.error) {
      setCatOptions(
        (catRes.data || []).map((x) => ({
          value: x.slug || x.code || x.name || x.id,
          label: x.name || x.title || x.slug || x.code || String(x.id),
        }))
      );
    }

    const audRes = await supabase.from("audience_groups").select("*").order("sort", { ascending: true });
    if (!audRes.error) {
      setAudOptions(
        (audRes.data || []).map((x) => ({
          value: x.slug || x.code || x.name || x.id,
          label: x.name || x.title || x.slug || x.code || String(x.id),
        }))
      );
    }

    if (catRes.error && audRes.error) {
      setLookupErr(
        "Pozn.: Nepodařilo se načíst tabulky categories/audience_groups. Nevadí — lze zadat ručně, ale musí to odpovídat DB constraintům."
      );
    }
  }

  async function loadRow() {
    if (!id) return;

    setLoading(true);
    setErr("");
    setInfo("");

    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRow(data);

    setTitle(data.title || "");
    setCategory(data.category || "");
    setAudienceGroups(normalizeAudienceGroups(data.audience_groups || data.audience) || []);
    setDescription(data.description || "");
    setFullDescription(data.full_description || "");
    setStreamUrl(data.stream_url || data.streamUrl || "");
    setWorksheetUrl(data.worksheet_url || "");
    setStartsAtLocal(toDateTimeLocalValue(data.starts_at || new Date()));
    setIsPublished(!!data.is_published);
    setPosterPath(data.poster_path || "");

    setLoading(false);
  }

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    if (!id) return;

    setSaving(true);
    setErr("");
    setInfo("");

    if (!title.trim()) {
      setErr("Vyplň prosím název události.");
      setSaving(false);
      return;
    }

    const starts_at = fromDateTimeLocalValue(startsAtLocal);
    if (!starts_at) {
      setErr("Vyplň prosím datum a čas (starts_at).");
      setSaving(false);
      return;
    }

    const aud = normalizeAudienceGroups(audienceGroups);
    const audience_groups = aud.length ? aud : ["komunita"];

    const payload = {
      title: title.trim(),
      category: category || null,
      audience_groups,
      description: description || "",
      full_description: fullDescription || "",
      stream_url: streamUrl || "",
      worksheet_url: worksheetUrl || "",
      starts_at,
      is_published: !!isPublished,
      poster_path: posterPath || null,
    };

    const { error } = await supabase.from("events").update(payload).eq("id", id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setInfo("Uloženo.");
    setSaving(false);
    loadRow();
  }

  async function deleteEvent() {
    if (!id) return;
    if (!confirm("Opravdu smazat událost?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }

    router.push("/portal/admin-udalosti");
  }

  async function onPosterSelected(file) {
    if (!id || !file) return;

    setErr("");
    setInfo("");

    const ext = file.name?.split(".").pop() || "png";
    const path = `events/${id}/${Date.now()}_${safeFileName(file.name || "poster")}`;

    const up = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || `image/${ext}`,
    });

    if (up.error) {
      setErr(up.error.message);
      return;
    }

    setPosterPath(path);
    setInfo("Plakát nahrán. Nezapomeň uložit událost.");
  }

  async function clearPoster() {
    if (!confirm("Odebrat plakát z události? (soubor zůstane ve storage)")) return;
    setPosterPath("");
    setInfo("Plakát odebrán z formuláře. Nezapomeň uložit událost.");
  }

  if (loading) {
    return (
      <RequirePlatformAdmin>
        <PortalHeader />
        <div className="p-6">Načítám…</div>
      </RequirePlatformAdmin>
    );
  }

  if (err && !row) {
    return (
      <RequirePlatformAdmin>
        <PortalHeader />
        <div className="p-6 text-red-600">{err}</div>
      </RequirePlatformAdmin>
    );
  }

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <Link href="/portal/admin-udalosti" className="text-sm text-slate-500 hover:underline">
            ← Zpět do Adminu událostí
          </Link>

          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/portal/udalost/${id}`}
              className="text-sm px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
              title="Zobrazit jako uživatel"
            >
              👁 Náhled
            </Link>

            <button
              onClick={deleteEvent}
              className="text-sm px-3 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
            >
              Smazat
            </button>
          </div>
        </div>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Upravit událost</h1>
            <div className="text-xs text-slate-500">ID: {id}</div>
          </div>

          {lookupErr ? <div className="mt-3 text-xs text-amber-700">{lookupErr}</div> : null}
          {err ? <div className="mt-3 text-red-600">{err}</div> : null}
          {info ? <div className="mt-3 text-green-700">{info}</div> : null}

          <div className="mt-5 grid grid-cols-1 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Název události*</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-3 py-2 border rounded-xl"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Datum a čas (starts_at)*</span>
              <input
                type="datetime-local"
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
                className="px-3 py-2 border rounded-xl"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Rubrika (category)</span>
              {catOptions.length ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border rounded-xl"
                >
                  <option value="">—</option>
                  {catOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border rounded-xl"
                  placeholder="Pokud máte constraint, musí to být povolená hodnota"
                />
              )}
            </label>

            <div className="grid gap-2">
              <div className="text-sm text-slate-600">Cílovky (audience_groups)*</div>

              {audOptions.length ? (
                <div className="flex flex-wrap gap-2">
                  {audOptions.map((o) => {
                    const on = audienceGroups.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() =>
                          setAudienceGroups((prev) =>
                            prev.includes(o.value) ? prev.filter((x) => x !== o.value) : [...prev, o.value]
                          )
                        }
                        className={`text-sm px-3 py-1 rounded-full border ${
                          on ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={audienceGroups.join(", ")}
                  onChange={(e) => setAudienceGroups(normalizeAudienceGroups(e.target.value))}
                  className="px-3 py-2 border rounded-xl"
                  placeholder="např. 1. stupeň, 2. stupeň, senioři, komunita…"
                />
              )}

              <div className="text-xs text-slate-500">
                Pokud nic nevybereš, uloží se fallback <b>komunita</b> (kvůli DB constraintu).
              </div>
            </div>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Krátký popis (description)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-2 border rounded-xl min-h-[80px]"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Plný popis (full_description)</span>
              <textarea
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="px-3 py-2 border rounded-xl min-h-[140px]"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Odkaz na vysílání (stream_url)</span>
              <input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="px-3 py-2 border rounded-xl"
                placeholder="https://meet.google.com/..."
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-slate-600">Pracovní list (worksheet_url)</span>
              <input
                value={worksheetUrl}
                onChange={(e) => setWorksheetUrl(e.target.value)}
                className="px-3 py-2 border rounded-xl"
                placeholder="https://..."
              />
            </label>

            <div className="grid gap-2">
              <div className="text-sm text-slate-600">Plakát události</div>

              {posterUrl ? (
                <div className="border rounded-2xl overflow-hidden">
                  <img src={posterUrl} alt="Plakát" className="w-full h-auto" />
                </div>
              ) : (
                <div className="text-sm text-slate-500">Zatím není nahrán.</div>
              )}

              <div className="flex gap-2 flex-wrap">
                <label className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPosterSelected(e.target.files?.[0])}
                  />
                  Nahrát plakát
                </label>

                {posterPath ? (
                  <button
                    type="button"
                    onClick={clearPoster}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                  >
                    Odebrat plakát
                  </button>
                ) : null}
              </div>

              <div className="text-xs text-slate-500">
                Bucket: <b>{BUCKET}</b> (PUBLIC). Po nahrání nezapomeň kliknout na <b>Uložit</b>.
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="text-sm text-slate-700">Publikovat (is_published = true)</span>
            </label>

            <div className="flex gap-2 flex-wrap pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Ukládám…" : "Uložit"}
              </button>

              <Link
                href="/portal/admin-udalosti"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
              >
                Zpět do seznamu
              </Link>

              <Link
                href="/portal/kalendar"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
              >
                Program
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequirePlatformAdmin>
  );
}
