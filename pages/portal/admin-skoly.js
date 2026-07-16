// pages/portal/admin-skoly.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { cn } from "../../lib/utils";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toNumOrNull(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function safeFileName(name) {
  return String(name || "file")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");
}

function normalizeHttp(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

function buildGeoQuery(form) {
  const parts = [];
  const a = String(form.address || "").trim();
  const c = String(form.city || "").trim();
  const co = String(form.country || "").trim();

  if (a) parts.push(a);
  if (c) parts.push(c);
  if (co) parts.push(co);

  if (parts.length === 0) {
    const n = String(form.name || "").trim();
    if (n) parts.push(n);
  }

  return parts.join(", ");
}

function emptyForm() {
  return {
    name: "",
    website: "",
    address: "",
    city: "",
    country: "Česká republika",
    school_type: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    archimedes_since: "",
    short_description: "",
    classroom_description: "",
    latitude: "",
    longitude: "",
    has_archimedes_classroom: true,
    is_published: true,
    photo_path: "",
  };
}

function FieldLabel({ children }) {
  return <div className="mb-1.5 text-xs text-slate-500">{children}</div>;
}

export default function AdminSkoly() {
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [err, setErr] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  async function load() {
    setLoadingList(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,website,address,city,country,school_type,contact_name,contact_phone,contact_email,archimedes_since,short_description,classroom_description,latitude,longitude,has_archimedes_classroom,is_published,photo_path,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoadingList(false);
      return;
    }

    setRows(data || []);
    setLoadingList(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const selectedPhotoUrl = useMemo(() => {
    if (photoPreviewUrl) return photoPreviewUrl;
    return publicUrlFromPath(form.photo_path);
  }, [photoPreviewUrl, form.photo_path]);

  const geoQuery = useMemo(() => buildGeoQuery(form), [form]);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm());
    setPhotoFile(null);
    setPhotoPreviewUrl("");
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openRow(r) {
    setErr("");
    setEditingId(r.id);

    setForm({
      name: r.name || "",
      website: r.website || "",
      address: r.address || "",
      city: r.city || "",
      country: r.country || "Česká republika",
      school_type: r.school_type || "",
      contact_name: r.contact_name || "",
      contact_phone: r.contact_phone || "",
      contact_email: r.contact_email || "",
      archimedes_since: toDateInputValue(r.archimedes_since),
      short_description: r.short_description || "",
      classroom_description: r.classroom_description || "",
      latitude: r.latitude ?? "",
      longitude: r.longitude ?? "",
      has_archimedes_classroom: !!r.has_archimedes_classroom,
      is_published: !!r.is_published,
      photo_path: r.photo_path || "",
    });

    setPhotoFile(null);
    setPhotoPreviewUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPhotoForSchool(schoolId) {
    if (!photoFile) return null;

    const ext = safeFileName(photoFile.name);
    const path = `schools/${schoolId}/${Date.now()}-${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, photoFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: photoFile.type || "image/*",
    });

    if (upErr) throw new Error(upErr.message);
    return path;
  }

  async function save() {
    setSaving(true);
    setErr("");

    try {
      if (!String(form.name || "").trim()) {
        throw new Error("Vyplň Název školy.");
      }

      const payload = {
        name: String(form.name || "").trim(),
        website: String(form.website || "").trim() || null,
        address: String(form.address || "").trim() || null,
        city: String(form.city || "").trim() || null,
        country: String(form.country || "").trim() || null,
        school_type: String(form.school_type || "").trim() || null,
        contact_name: String(form.contact_name || "").trim() || null,
        contact_phone: String(form.contact_phone || "").trim() || null,
        contact_email: String(form.contact_email || "").trim() || null,
        archimedes_since: form.archimedes_since ? new Date(form.archimedes_since).toISOString() : null,
        short_description: String(form.short_description || "").trim() || null,
        classroom_description: String(form.classroom_description || "").trim() || null,
        latitude: toNumOrNull(form.latitude),
        longitude: toNumOrNull(form.longitude),
        has_archimedes_classroom: !!form.has_archimedes_classroom,
        is_published: !!form.is_published,
      };

      let schoolId = editingId;

      if (!editingId) {
        const { data, error } = await supabase
          .from("schools")
          .insert([{ ...payload }])
          .select("id")
          .single();

        if (error) throw new Error(error.message);
        schoolId = data?.id;
        setEditingId(schoolId);
      } else {
        const { error } = await supabase.from("schools").update(payload).eq("id", editingId);
        if (error) throw new Error(error.message);
      }

      if (photoFile) {
        const photo_path = await uploadPhotoForSchool(schoolId);

        const { error: up2 } = await supabase.from("schools").update({ photo_path }).eq("id", schoolId);
        if (up2) throw new Error(up2.message);

        setForm((p) => ({ ...p, photo_path }));
        setPhotoFile(null);
        setPhotoPreviewUrl("");
      }

      await load();
    } catch (e) {
      setErr(e?.message || "Nepodařilo se uložit školu.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSchool(id) {
    if (!confirm("Opravdu smazat tuto školu?")) return;

    setErr("");
    try {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (error) throw new Error(error.message);

      if (editingId === id) startNew();
      await load();
    } catch (e) {
      setErr(e?.message || "Nepodařilo se smazat školu.");
    }
  }

  function openMapy() {
    const q = encodeURIComponent(geoQuery || "");
    window.open(`https://mapy.cz/zakladni?q=${q}`, "_blank", "noopener,noreferrer");
  }

  function openGoogleMaps() {
    const q = encodeURIComponent(geoQuery || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
  }

  const websiteHref = useMemo(() => normalizeHttp(form.website), [form.website]);

  return (
    <RequirePlatformAdmin>
      <PortalHeader title="Admin – Školy" />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[22px] font-black text-navy-900">Admin – Školy</div>
              <div className="mt-1 text-[13px] text-muted">
                Databáze škol s učebnou ARCHIMEDES (interně spravovaná).
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2.5">
              <Button href="/portal" variant="secondary" size="sm">
                ← Zpět do portálu
              </Button>

              {editingId ? (
                <Button href={`/portal/skoly/${editingId}`} variant="secondary" size="sm">
                  Zobrazit detail →
                </Button>
              ) : null}

              <Button onClick={startNew} variant="secondary" size="sm">
                Nový záznam
              </Button>

              <Button onClick={save} disabled={saving} variant="primary" size="sm">
                {saving ? "Ukládám…" : "Uložit"}
              </Button>
            </div>
          </div>

          {err ? (
            <Alert variant="error" className="mt-3 whitespace-pre-wrap">
              Chyba: {err}
            </Alert>
          ) : null}

          <Card className="mt-3.5 p-3.5 shadow-card">
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-black text-navy-900">Přidat / upravit školu</div>
              <div className="text-xs text-slate-500">
                {editingId ? (
                  <>
                    Editace ID: <b>{editingId}</b>
                  </>
                ) : (
                  "Nový záznam"
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-3">
                <div>
                  <FieldLabel>Název školy*</FieldLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Web školy</FieldLabel>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                      placeholder="https://… nebo www…"
                    />
                    {websiteHref ? (
                      <div className="mt-1.5 text-xs text-slate-500">
                        Odkaz:{" "}
                        <a href={websiteHref} target="_blank" rel="noreferrer" className="font-black text-brand">
                          otevřít
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <FieldLabel>Typ školy</FieldLabel>
                    <Input
                      value={form.school_type}
                      onChange={(e) => setForm((p) => ({ ...p, school_type: e.target.value }))}
                      placeholder="ZŠ / MŠ / SŠ…"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Adresa</FieldLabel>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Ulice, č.p."
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Město / obec</FieldLabel>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <FieldLabel>Země</FieldLabel>
                    <Input
                      value={form.country}
                      onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-900/[0.08] bg-slate-900/[0.02] p-3">
                  <div className="mb-1.5 font-black text-navy-900">Pomocník pro GPS</div>
                  <div className="text-xs leading-normal text-slate-500">
                    Dotaz: <b className="text-navy-900">{geoQuery || "—"}</b>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    <Button
                      onClick={openMapy}
                      disabled={!geoQuery}
                      variant="secondary"
                      size="sm"
                    >
                      Otevřít v Mapy.cz →
                    </Button>
                    <Button
                      onClick={openGoogleMaps}
                      disabled={!geoQuery}
                      variant="secondary"
                      size="sm"
                    >
                      Otevřít v Google Maps →
                    </Button>
                    <div className="text-xs text-slate-500">
                      Tip: z mapy zkopíruj souřadnice do polí Latitude/Longitude.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Latitude (GPS)</FieldLabel>
                    <Input
                      value={form.latitude ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                      placeholder="např. 49.12345"
                    />
                  </div>
                  <div>
                    <FieldLabel>Longitude (GPS)</FieldLabel>
                    <Input
                      value={form.longitude ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                      placeholder="např. 17.23456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <FieldLabel>Kontaktní osoba</FieldLabel>
                    <Input
                      value={form.contact_name}
                      onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <FieldLabel>Telefon</FieldLabel>
                    <Input
                      value={form.contact_phone}
                      onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      value={form.contact_email}
                      onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Datum otevření učebny</FieldLabel>
                  <Input
                    type="date"
                    value={form.archimedes_since}
                    onChange={(e) => setForm((p) => ({ ...p, archimedes_since: e.target.value }))}
                  />
                </div>

                <div>
                  <FieldLabel>Krátký popis školy</FieldLabel>
                  <Textarea
                    value={form.short_description}
                    onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))}
                    className="min-h-[90px]"
                    placeholder="Stručně: čím je škola zajímavá…"
                  />
                </div>

                <div>
                  <FieldLabel>Popis učebny (text)</FieldLabel>
                  <Textarea
                    value={form.classroom_description}
                    onChange={(e) => setForm((p) => ({ ...p, classroom_description: e.target.value }))}
                    className="min-h-[110px] whitespace-pre-wrap"
                    placeholder="Např. základní / voda / kuchyň / dílna / 3D tisk / specifika…"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3.5">
                  <label className="flex items-center gap-2 font-bold text-navy-900">
                    <Switch
                      checked={!!form.has_archimedes_classroom}
                      onChange={(e) => setForm((p) => ({ ...p, has_archimedes_classroom: e.target.checked }))}
                    />
                    Má učebnu ARCHIMEDES
                  </label>

                  <label className="flex items-center gap-2 font-bold text-navy-900">
                    <Switch
                      checked={!!form.is_published}
                      onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
                    />
                    Publikovat v síti učeben
                  </label>
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <div className="mb-2 font-black text-navy-900">Fotka učebny</div>

                  <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-900/[0.03]">
                    {selectedPhotoUrl ? (
                      <img
                        src={selectedPhotoUrl}
                        alt="Fotka učebny"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="p-3 text-center text-[13px] text-slate-500">
                        Zatím bez fotky.
                        <div className="mt-1.5 text-xs">
                          Vyber soubor níže a klikni <b>Uložit</b>.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                    <div className="mt-1.5 text-xs text-slate-500">
                      Doporučení: JPG/PNG, šířka alespoň 1200 px.
                    </div>
                  </div>

                  {editingId ? (
                    <div className="mt-2.5 text-xs text-slate-500">
                      Tip: detail školy je na{" "}
                      <Link href={`/portal/skoly/${editingId}`} className="font-black text-navy-900">
                        /portal/skoly/{editingId}
                      </Link>
                    </div>
                  ) : null}
                </div>

                {editingId ? (
                  <Button
                    onClick={() => removeSchool(editingId)}
                    variant="secondary"
                    size="sm"
                    className="w-fit border-red-300 bg-red-50 text-red-700 hover:border-red-400"
                  >
                    Smazat školu
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>

          <Card className="mt-3.5 p-3.5 shadow-card">
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-black text-navy-900">Seznam škol</div>
              <div className="text-xs text-slate-500">
                Celkem: <b>{rows.length}</b>
              </div>
            </div>

            {loadingList ? (
              <div className="mt-2.5 text-muted">Načítám…</div>
            ) : rows.length === 0 ? (
              <div className="mt-2.5 text-muted">Zatím žádné školy.</div>
            ) : (
              <Table className="mt-2.5">
                <TableHeader>
                  <TableRow>
                    <TableHead>Název</TableHead>
                    <TableHead>Město / obec</TableHead>
                    <TableHead>Země</TableHead>
                    <TableHead>Publikace</TableHead>
                    <TableHead>GPS</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const gpsOk =
                      r.latitude !== null &&
                      r.latitude !== undefined &&
                      r.longitude !== null &&
                      r.longitude !== undefined;

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-black">{r.name || "—"}</TableCell>
                        <TableCell className="text-slate-600">{r.city || "—"}</TableCell>
                        <TableCell className="text-slate-600">{r.country || "—"}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-xs",
                              r.is_published
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-200 bg-slate-50"
                            )}
                          >
                            {r.is_published ? "Publikováno" : "Skryté"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-xs",
                              gpsOk ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
                            )}
                          >
                            {gpsOk ? "OK" : "Bez GPS"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => openRow(r)} variant="primary" size="sm">
                            Otevřít
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </RequirePlatformAdmin>
  );
}
