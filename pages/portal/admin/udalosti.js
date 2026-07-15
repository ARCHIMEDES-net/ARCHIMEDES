import { useEffect, useMemo, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";

/* =========================
   RUBRIKY
========================= */
const RUBRICS = [
  { key: "senior", label: "Senior Klub", titlePrefix: "Senior Klub – ", aud: ["Senioři"] },

  { key: "wellbeing", label: "Wellbeing", titlePrefix: "Wellbeing – ", aud: [] },

  { key: "science_on", label: "Science On", titlePrefix: "Science On – ", aud: ["II. stupeň"] },
  { key: "czexpats", label: "Czexpats in Science", titlePrefix: "Czexpats in Science – ", aud: ["II. stupeň"] },
  { key: "smart_city", label: "Smart City Klub", titlePrefix: "Smart City Klub – ", aud: ["II. stupeň"] },
  {
    key: "kariera",
    label: "Kariérní poradenství jinak",
    titlePrefix: "Kariérní poradenství jinak – ",
    aud: ["II. stupeň"],
  },

  {
    key: "lit_adult",
    label: "Literární klub Magnesia Litera (dospělí)",
    titlePrefix: "Literární klub – dospělí – ",
    aud: ["Dospělí"],
  },
  {
    key: "lit_kids",
    label: "Literární klub Magnesia Litera (děti)",
    titlePrefix: "Literární klub – děti – ",
    aud: ["I. stupeň"],
  },

  { key: "film", label: "Filmový klub", titlePrefix: "Filmový klub – ", aud: ["Komunita"] },
  { key: "special", label: "Speciál", titlePrefix: "Speciál – ", aud: [] },
];

/* =========================
   Cílovky
========================= */
const AUDIENCE_OPTIONS = [
  "I. stupeň",
  "II. stupeň",
  "Učitelé",
  "Senioři",
  "Komunita",
  "Dospělí",
];

const FILTER_OPTIONS = [
  { key: "all", label: "Vše" },
  { key: "I. stupeň", label: "I. stupeň" },
  { key: "II. stupeň", label: "II. stupeň" },
  { key: "Učitelé", label: "Učitelé" },
  { key: "Senioři", label: "Senioři" },
  { key: "Komunita", label: "Komunita" },
  { key: "Dospělí", label: "Dospělí" },
];

/* =========================
   Helpers
========================= */
function splitAudience(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinAudience(list) {
  return (list || []).join(", ");
}

function normalizeAudienceGroups(list) {
  const allowed = new Set(AUDIENCE_OPTIONS);
  return (list || []).map(String).filter((x) => allowed.has(x));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCZ(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function normalizeUrl(url) {
  let v = (url || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function safeFileExt(fileName) {
  const parts = String(fileName || "").split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
  return ext.replace(/[^a-z0-9]/g, "");
}

function makePosterPath(file) {
  const ext = safeFileExt(file?.name) || "jpg";
  const now = new Date();
  const ym = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ym}/${Date.now()}-${rand}.${ext}`;
}

function makeWorksheetPath(file) {
  const ext = safeFileExt(file?.name) || "pdf";
  const now = new Date();
  const ym = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  const rand = Math.random().toString(36).slice(2, 8);
  const baseName = String(file?.name || "worksheet")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${ym}/${Date.now()}-${rand}-${baseName}.${ext}`;
}

function detectBroadcastState(row) {
  const status = row?.broadcast_status || "";
  const viewerUrl = normalizeText(row?.broadcast_viewer_url);
  const recordingUrl = normalizeText(row?.broadcast_recording_url);
  const recordingStatus = normalizeText(row?.broadcast_recording_status).toLowerCase();

  if (!status && !viewerUrl && !recordingUrl) {
    return {
      key: "missing",
      label: "⚠ Vysílání nenastaveno",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  if (status === "live") {
    return {
      key: "live",
      label: "🔴 Právě vysíláme",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (recordingUrl && recordingStatus === "published") {
    return {
      key: "finished",
      label: "✅ Záznam publikován",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (status === "finished" || recordingUrl) {
    return {
      key: "finished",
      label: "⏳ Proběhlo / záznam není publikován",
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }

  if (status === "scheduled" || viewerUrl) {
    return {
      key: "ready",
      label: "🟢 Vysílání připraveno",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  return {
    key: "draft",
    label: "🟡 Vysílání rozpracováno",
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
  };
}

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 font-bold text-navy-900">{label}</div>
      {children}
    </div>
  );
}

function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-2 text-sm font-black",
        active ? "border-navy-900 bg-navy-900 text-white" : "border-slate-200 bg-white text-navy-900"
      )}
    >
      {children}
    </button>
  );
}

/* =========================
   Page
========================= */
export default function AdminUdalosti() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingWorksheet, setUploadingWorksheet] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [rows, setRows] = useState([]);
  const [filterKey, setFilterKey] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [lastSavedEventId, setLastSavedEventId] = useState("");

  const [rubricKey, setRubricKey] = useState("");
  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");

  const [audienceText, setAudienceText] = useState("");
  const [audienceSelected, setAudienceSelected] = useState([]);

  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (Array.isArray(audienceSelected)) {
      setAudienceText(joinAudience(audienceSelected));
    }
  }, [audienceSelected]);

  async function loadEvents() {
    setLoading(true);
    setError("");
    setInfo("");

    const { data, error } = await supabase
      .from("events")
      .select(
        `
          id,
          title,
          starts_at,
          audience,
          audience_groups,
          full_description,
          stream_url,
          worksheet_url,
          poster_url,
          is_published,
          created_at,
          broadcast_sessions (
            id,
            status,
            viewer_url,
            recording_url,
            recording_status
          )
        `
      )
      .order("starts_at", { ascending: false });

    if (error) {
      setError(error.message || "Chyba načítání událostí.");
      setRows([]);
    } else {
      const normalized = Array.isArray(data)
        ? data.map((row) => {
            const session = Array.isArray(row.broadcast_sessions) ? row.broadcast_sessions[0] : null;
            const groups = Array.isArray(row.audience_groups)
              ? normalizeAudienceGroups(row.audience_groups)
              : normalizeAudienceGroups(splitAudience(normalizeText(row.audience)));

            return {
              ...row,
              audience_groups: groups,
              audience: groups.length ? joinAudience(groups) : normalizeText(row.audience),
              broadcast_status: session?.status || "",
              broadcast_viewer_url: session?.viewer_url || "",
              broadcast_recording_url: session?.recording_url || "",
              broadcast_recording_status: session?.recording_status || "none",
            };
          })
        : [];
      setRows(normalized);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredRows = useMemo(() => {
    const copy = Array.isArray(rows) ? [...rows] : [];

    const filtered =
      filterKey === "all"
        ? copy
        : copy.filter((row) => {
            const groups = Array.isArray(row.audience_groups)
              ? normalizeAudienceGroups(row.audience_groups)
              : normalizeAudienceGroups(splitAudience(normalizeText(row.audience)));
            return groups.includes(filterKey);
          });

    filtered.sort((a, b) => {
      const ta = a?.starts_at ? new Date(a.starts_at).getTime() : 0;
      const tb = b?.starts_at ? new Date(b.starts_at).getTime() : 0;
      if (tb !== ta) return tb - ta;
      const ca = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const cb = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return cb - ca;
    });

    return filtered;
  }, [rows, filterKey]);

  function resetForm() {
    setEditingId(null);
    setLastSavedEventId("");
    setRubricKey("");
    setTitle("");
    setStartsAtLocal("");
    setAudienceText("");
    setAudienceSelected([]);
    setFullDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setPosterUrl("");
    setIsPublished(true);
    setError("");
    setInfo("");
  }

  function fillFormFromRow(r) {
    setEditingId(r.id);
    setLastSavedEventId(r.id);
    setRubricKey("");
    setTitle(normalizeText(r.title));
    setStartsAtLocal(toDatetimeLocalValue(r.starts_at));

    const groups = Array.isArray(r.audience_groups)
      ? normalizeAudienceGroups(r.audience_groups)
      : [];
    const audText = normalizeText(r.audience);
    const finalGroups = groups.length ? groups : normalizeAudienceGroups(splitAudience(audText));

    setAudienceSelected(finalGroups);
    setAudienceText(joinAudience(finalGroups));

    setFullDescription(normalizeText(r.full_description));
    setStreamUrl(normalizeText(r.stream_url));
    setWorksheetUrl(normalizeText(r.worksheet_url));
    setPosterUrl(normalizeText(r.poster_url));
    setIsPublished(r.is_published !== false);
    setError("");
    setInfo("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyRubric(r) {
    setRubricKey(r.key);

    if (!title.trim() || title.trim().length < 3) {
      setTitle(r.titlePrefix);
    }

    const cur = Array.isArray(audienceSelected) ? audienceSelected : [];
    const merged = Array.from(new Set([...(cur || []), ...(r.aud || [])]));
    const normalized = normalizeAudienceGroups(merged);

    setAudienceSelected(normalized);
    setAudienceText(joinAudience(normalized));

    setInfo(`Rubrika nastavena: ${r.label}`);
  }

  function validateForm() {
    const t = title.trim();
    const dt = fromDatetimeLocalValue(startsAtLocal);

    if (!t) return "Vyplň název události.";
    if (!startsAtLocal || !dt) return "Vyplň datum a čas (start).";
    if (!Array.isArray(audienceSelected) || audienceSelected.length === 0) {
      return "Vyber alespoň jednu cílovku (audience_groups nesmí být prázdné).";
    }
    return "";
  }

  async function handlePosterUpload(file) {
    setError("");
    setInfo("");
    if (!file) return;

    const okType =
      file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
    if (!okType) {
      setError("Plakát musí být JPG, PNG nebo WEBP.");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setError("Plakát je moc velký (max 7 MB).");
      return;
    }

    setUploadingPoster(true);
    try {
      const path = makePosterPath(file);

      const { error: upErr } = await supabase.storage.from("posters").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("posters").getPublicUrl(path);
      const url = data?.publicUrl ? String(data.publicUrl) : "";

      if (!url) {
        setError("Upload proběhl, ale nepodařilo se získat veřejnou URL.");
        return;
      }

      setPosterUrl(url);
      setInfo("Plakát nahrán. URL se vyplnila automaticky.");
    } catch (err) {
      setError(err?.message || "Chyba při nahrávání plakátu.");
    } finally {
      setUploadingPoster(false);
    }
  }

  async function handleWorksheetUpload(file) {
    setError("");
    setInfo("");
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
    ];

    const ext = safeFileExt(file?.name);
    const allowedExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setError("Pracovní list musí být PDF, DOC, DOCX, XLS, XLSX, PPT nebo PPTX.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Pracovní list je moc velký (max 15 MB).");
      return;
    }

    setUploadingWorksheet(true);

    try {
      const path = makeWorksheetPath(file);

      const { error: upErr } = await supabase.storage.from("worksheets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("worksheets").getPublicUrl(path);
      const url = data?.publicUrl ? String(data.publicUrl) : "";

      if (!url) {
        setError("Upload proběhl, ale nepodařilo se získat veřejnou URL pracovního listu.");
        return;
      }

      setWorksheetUrl(url);
      setInfo("Pracovní list nahrán. Odkaz se vyplnil automaticky.");
    } catch (err) {
      setError(err?.message || "Chyba při nahrávání pracovního listu.");
    } finally {
      setUploadingWorksheet(false);
    }
  }

  async function saveEvent(e) {
    e.preventDefault();
    setInfo("");
    setError("");

    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }

    const startsAt = fromDatetimeLocalValue(startsAtLocal);
    if (!startsAt) {
      setError("Neplatné datum a čas.");
      return;
    }

    const groups = normalizeAudienceGroups((audienceSelected || []).map(String).filter(Boolean));

    const payload = {
      title: title.trim(),
      starts_at: startsAt.toISOString(),
      audience: joinAudience(groups),
      audience_groups: groups,
      full_description: (fullDescription || "").trim(),
      stream_url: normalizeUrl(streamUrl),
      worksheet_url: normalizeUrl(worksheetUrl),
      poster_url: normalizeUrl(posterUrl),
      is_published: !!isPublished,
    };

    setSaving(true);

    try {
      let savedId = editingId || "";

      if (editingId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingId);
        if (error) throw error;
        setInfo("Událost byla upravena.");
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        savedId = data?.id || "";
        setInfo("Událost byla vytvořena.");
      }

      if (savedId) {
        setLastSavedEventId(savedId);
      }

      await loadEvents();

      if (editingId) {
        setEditingId(savedId || editingId);
      } else {
        setEditingId(null);
        setRubricKey("");
        setTitle("");
        setStartsAtLocal("");
        setAudienceText("");
        setAudienceSelected([]);
        setFullDescription("");
        setStreamUrl("");
        setWorksheetUrl("");
        setPosterUrl("");
        setIsPublished(true);
      }
    } catch (err) {
      setError(err?.message || "Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id) {
    setError("");
    setInfo("");

    const ok = window.confirm("Opravdu smazat událost? Tuto akci nelze vrátit.");
    if (!ok) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      setInfo("Událost byla smazána.");
      await loadEvents();
      if (editingId === id || lastSavedEventId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err?.message || "Chyba při mazání.");
    }
  }

  async function togglePublished(id, currentPublished) {
    setError("");
    setInfo("");
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_published: !currentPublished })
        .eq("id", id);
      if (error) throw error;
      setInfo(!currentPublished ? "Událost publikována." : "Událost skryta.");
      await loadEvents();
    } catch (err) {
      setError(err?.message || "Chyba při změně publikace.");
    }
  }

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <main className="mx-auto max-w-[1100px] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button href="/portal/admin" variant="ghost" size="sm">
            ← Zpět do adminu
          </Button>
          <span className="text-slate-400">|</span>
          <Button href="/portal/kalendar" variant="ghost" size="sm">
            Kalendář
          </Button>
        </div>

        <h1 className="mt-2.5 text-2xl font-black text-navy-900">Admin – události</h1>

        {error ? (
          <Alert variant="error" className="mt-3 whitespace-pre-wrap">
            <b>Chyba:</b> {error}
          </Alert>
        ) : null}

        {info ? (
          <Alert variant="success" className="mt-3 whitespace-pre-wrap">
            <div>{info}</div>

            {lastSavedEventId ? (
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                <Button href={`/portal/admin/vysilani/${lastSavedEventId}`} variant="primary" size="sm">
                  Nastavit vysílání
                </Button>

                <Button type="button" onClick={() => setLastSavedEventId("")} variant="secondary" size="sm">
                  Zavřít
                </Button>
              </div>
            ) : null}
          </Alert>
        ) : null}

        <section className="mt-4">
          <Card className="p-3.5">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-lg font-bold text-navy-900">
                {editingId ? "Upravit událost" : "Nová událost"}
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {editingId ? (
                  <Button type="button" onClick={resetForm} variant="secondary" size="sm">
                    Zrušit úpravy
                  </Button>
                ) : null}
                <Button type="button" onClick={loadEvents} disabled={loading} variant="secondary" size="sm">
                  Obnovit seznam
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-2 font-bold text-navy-900">Rubriky</div>
              <div className="flex flex-wrap gap-2">
                {RUBRICS.map((r) => (
                  <PillButton key={r.key} active={rubricKey === r.key} onClick={() => applyRubric(r)}>
                    {r.label}
                  </PillButton>
                ))}
              </div>
              <div className="mt-1.5 text-[13px] text-slate-500">
                Kliknutím se předvyplní název a případně doporučená cílovka.
              </div>
            </div>

            <form onSubmit={saveEvent} className="mt-3 grid gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Název události *">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>

                <Field label="Datum a čas (starts_at) *">
                  <Input
                    type="datetime-local"
                    value={startsAtLocal}
                    onChange={(e) => setStartsAtLocal(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Cílovka (audience_groups) *">
                  <div className="grid gap-2.5">
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
                      {AUDIENCE_OPTIONS.map((opt) => {
                        const checked = audienceSelected.includes(opt);
                        return (
                          <label
                            key={opt}
                            className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const cur = Array.isArray(audienceSelected) ? audienceSelected : [];
                                const next = e.target.checked
                                  ? Array.from(new Set([...cur, opt]))
                                  : cur.filter((x) => x !== opt);
                                setAudienceSelected(normalizeAudienceGroups(next));
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>

                    <Input value={audienceText} readOnly className="bg-slate-50 text-slate-600" placeholder="Text pro zobrazení" />

                    <div className="text-[13px] text-slate-500">
                      Vyber aspoň jednu cílovku. Rubrika a cílovka jsou nyní oddělené.
                    </div>
                  </div>
                </Field>

                <Field label="Publikovat">
                  <label className="flex items-center gap-2.5 py-2.5">
                    <input type="checkbox" checked={!!isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                    <span>{isPublished ? "Ano (viditelné v kalendáři)" : "Ne (skryté)"}</span>
                  </label>
                </Field>
              </div>

              <Field label="Popis (full_description)">
                <Textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="min-h-[110px]"
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Volitelný odkaz na vysílání (stream_url)">
                  <Input
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="Není nutný — pozvánku a odkaz rozešle WebMeeting"
                  />
                </Field>

                <Field label="Pracovní list (worksheet_url)">
                  <div className="grid grid-cols-[1fr_auto] gap-2.5">
                    <Input
                      value={worksheetUrl}
                      onChange={(e) => setWorksheetUrl(e.target.value)}
                      placeholder="URL pracovního listu nebo nahrajte soubor z PC"
                    />
                    <label className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 text-[15px] font-black text-navy-900">
                      {uploadingWorksheet ? "Nahrávám…" : "Nahrát z PC"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        className="hidden"
                        onChange={(e) => handleWorksheetUpload(e.target.files?.[0])}
                        disabled={uploadingWorksheet}
                      />
                    </label>
                  </div>

                  {worksheetUrl ? (
                    <div className="mt-2.5">
                      <a
                        href={normalizeUrl(worksheetUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-brand"
                      >
                        Otevřít nahraný pracovní list
                      </a>
                    </div>
                  ) : null}
                </Field>
              </div>

              <Field label="Plakát / cover (poster_url)">
                <div className="grid grid-cols-[1fr_auto] gap-2.5">
                  <Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
                  <label className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 text-[15px] font-black text-navy-900">
                    {uploadingPoster ? "Nahrávám…" : "Nahrát z PC"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handlePosterUpload(e.target.files?.[0])}
                      disabled={uploadingPoster}
                    />
                  </label>
                </div>

                {posterUrl ? (
                  <div className="mt-2.5">
                    <img
                      src={normalizeUrl(posterUrl)}
                      alt="Plakát"
                      className="h-[140px] w-[260px] rounded-xl border border-slate-200 bg-slate-50 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                ) : null}
              </Field>

              <div className="flex flex-wrap gap-2.5">
                <Button type="submit" disabled={saving} variant="primary">
                  {saving ? "Ukládám…" : editingId ? "Uložit změny" : "Vytvořit událost"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    onClick={() => deleteEvent(editingId)}
                    variant="secondary"
                    className="border-red-200 text-red-700 hover:border-red-300"
                  >
                    Smazat
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </section>

        <section className="mt-4">
          <Card className="p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy-900">Seznam událostí</h2>

              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((item) => (
                  <PillButton key={item.key} active={filterKey === item.key} onClick={() => setFilterKey(item.key)}>
                    {item.label}
                  </PillButton>
                ))}
              </div>
            </div>

            {loading ? <p className="mt-3 text-muted">Načítám…</p> : null}
            {!loading && filteredRows.length === 0 ? (
              <p className="mt-3 text-slate-500">Pro tento filtr zatím žádné události.</p>
            ) : null}

            {!loading && filteredRows.length > 0 ? (
              <div className="mt-3 grid gap-3">
                {filteredRows.map((r) => {
                  const published = r.is_published !== false;
                  const stream = normalizeText(r.stream_url);
                  const worksheet = normalizeText(r.worksheet_url);
                  const poster = normalizeText(r.poster_url);
                  const broadcastState = detectBroadcastState(r);

                  return (
                    <Card key={r.id} className="p-3">
                      <div className={cn("grid gap-3", poster ? "grid-cols-[140px_1fr]" : "grid-cols-1")}>
                        {poster ? (
                          <img
                            src={normalizeUrl(poster)}
                            alt="Plakát"
                            className="h-[90px] w-[140px] rounded-lg border border-slate-200 bg-slate-50 object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : null}

                        <div>
                          <div className="flex flex-wrap justify-between gap-3">
                            <div>
                              <div className="text-base font-bold text-navy-900">{r.title}</div>
                              <div className="mt-1.5 text-slate-600">
                                <span>{formatDateTimeCZ(r.starts_at)}</span>
                                {r.audience ? <span> &nbsp; • &nbsp; {String(r.audience)}</span> : null}
                                <span>
                                  {" "}
                                  &nbsp; • &nbsp;{" "}
                                  {published ? (
                                    <b className="text-emerald-700">publikováno</b>
                                  ) : (
                                    <b className="text-red-700">skryto</b>
                                  )}
                                </span>
                              </div>

                              <div
                                className={cn(
                                  "mt-2 inline-flex items-center rounded-full border px-2.5 py-1.5 text-[13px] font-bold",
                                  broadcastState.className
                                )}
                              >
                                {broadcastState.label}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                              <Button type="button" onClick={() => fillFormFromRow(r)} variant="secondary" size="sm">
                                Upravit
                              </Button>

                              <Button href={`/portal/admin/vysilani/${r.id}`} variant="secondary" size="sm">
                                Vysílání
                              </Button>

                              <Button
                                type="button"
                                onClick={() => togglePublished(r.id, published)}
                                variant="secondary"
                                size="sm"
                              >
                                {published ? "Skrýt" : "Publikovat"}
                              </Button>

                              <Button
                                type="button"
                                onClick={() => deleteEvent(r.id)}
                                variant="secondary"
                                size="sm"
                                className="border-red-200 text-red-700 hover:border-red-300"
                              >
                                Smazat
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-3">
                            {stream ? (
                              <a href={normalizeUrl(stream)} target="_blank" rel="noreferrer" className="text-brand">
                                ▶ Vysílání
                              </a>
                            ) : null}
                            {worksheet ? (
                              <a href={normalizeUrl(worksheet)} target="_blank" rel="noreferrer" className="text-brand">
                                📄 Pracovní list
                              </a>
                            ) : null}
                          </div>

                          {r.full_description ? (
                            <div className="mt-2.5 whitespace-pre-wrap text-slate-600">
                              {String(r.full_description)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : null}
          </Card>
        </section>
      </main>
    </RequirePlatformAdmin>
  );
}
