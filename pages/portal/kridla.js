import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Download,
  Presentation,
  LockKeyhole,
  ShieldCheck,
  Upload,
} from "lucide-react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { Alert } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { supabase } from "../../lib/supabaseClient";

const PROGRAM_SLUG = "kridla-pro-budoucnost";
const MATERIALS_BUCKET = "program-materials";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("cs-CZ", {
    maximumFractionDigits: 1,
  })} MB`;
}

function safeFileName(value) {
  const clean = String(value || "soubor")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-120);
  return clean || "soubor";
}

export default function KridlaPage() {
  const [program, setProgram] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const participantHomes = useMemo(
    () =>
      participants
        .filter((row) => row.program_role === "participant")
        .map((row) => ({
          id: row.organization_id,
          name: row.organization_name,
          org_type: row.organization_type,
          contact_name: row.contact_name,
          contact_email: row.contact_email,
        })),
    [participants]
  );

  async function loadProgram() {
    setLoading(true);
    setError("");

    try {
      const { data: programRow, error: programError } = await supabase
        .from("access_programs")
        .select("id, slug, title, description")
        .eq("slug", PROGRAM_SLUG)
        .maybeSingle();
      if (programError) throw programError;
      if (!programRow) throw new Error("Projekt Křídla zatím není připraven.");

      setProgram(programRow);

      const [{ data: accessRows, error: accessError }, { data: manageResult, error: manageError }] =
        await Promise.all([
          supabase
            .from("access_program_organizations")
            .select("id")
            .eq("program_id", programRow.id)
            .eq("status", "active")
            .limit(1),
          supabase.rpc("can_administer_access_program", {
            target_program_id: programRow.id,
          }),
        ]);
      if (accessError) throw accessError;
      if (manageError) throw manageError;

      const nextCanManage = manageResult === true;
      const nextHasAccess = nextCanManage || (accessRows || []).length > 0;
      setCanManage(nextCanManage);
      setHasAccess(nextHasAccess);

      if (!nextHasAccess) {
        setMaterials([]);
        setParticipants([]);
        return;
      }

      const materialQuery = supabase
        .from("access_program_resources")
        .select(
          "id, title, description, storage_path, original_file_name, mime_type, file_size, sort_order, created_at"
        )
        .eq("program_id", programRow.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      const participantQuery = nextCanManage
        ? supabase.rpc("get_access_program_organizations", {
            target_program_id: programRow.id,
          })
        : Promise.resolve({ data: [], error: null });

      const [materialResult, participantResult] = await Promise.all([
        materialQuery,
        participantQuery,
      ]);
      if (materialResult.error) throw materialResult.error;
      if (participantResult.error) throw participantResult.error;

      setMaterials(materialResult.data || []);
      setParticipants(participantResult.data || []);
    } catch (loadError) {
      setError(loadError?.message || "Sekci se nepodařilo načíst.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgram();
  }, []);

  async function downloadMaterial(material) {
    setDownloadingId(material.id);
    setError("");
    try {
      const { data, error: downloadError } = await supabase.storage
        .from(MATERIALS_BUCKET)
        .download(material.storage_path);
      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = material.original_file_name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError?.message || "Soubor se nepodařilo stáhnout.");
    } finally {
      setDownloadingId("");
    }
  }

  async function uploadMaterial(event) {
    event.preventDefault();
    if (!program || !canManage || !uploadFile) return;

    setUploading(true);
    setError("");
    setMessage("");
    let storagePath = "";

    try {
      if (!ALLOWED_MIME_TYPES.has(uploadFile.type)) {
        throw new Error("Povoleny jsou pouze soubory PDF, PPT a PPTX.");
      }
      if (uploadFile.size <= 0 || uploadFile.size > MAX_FILE_SIZE) {
        throw new Error("Soubor musí mít nejvýše 25 MB.");
      }
      const title = uploadTitle.trim();
      if (title.length < 2 || title.length > 160) {
        throw new Error("Název materiálu musí mít 2 až 160 znaků.");
      }

      storagePath = `${PROGRAM_SLUG}/${crypto.randomUUID()}-${safeFileName(uploadFile.name)}`;
      const { error: storageError } = await supabase.storage
        .from(MATERIALS_BUCKET)
        .upload(storagePath, uploadFile, {
          cacheControl: "3600",
          contentType: uploadFile.type,
          upsert: false,
        });
      if (storageError) throw storageError;

      const nextSortOrder = materials.length
        ? Math.max(...materials.map((item) => Number(item.sort_order) || 0)) + 10
        : 10;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error: metadataError } = await supabase
        .from("access_program_resources")
        .insert({
          program_id: program.id,
          title,
          description: uploadDescription.trim() || null,
          storage_path: storagePath,
          original_file_name: uploadFile.name,
          mime_type: uploadFile.type,
          file_size: uploadFile.size,
          sort_order: nextSortOrder,
          is_published: true,
          created_by: user?.id || null,
        });
      if (metadataError) {
        await supabase.storage.from(MATERIALS_BUCKET).remove([storagePath]);
        throw metadataError;
      }

      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      setMessage("Materiál byl bezpečně nahrán do chráněné sekce.");
      await loadProgram();
    } catch (uploadError) {
      setError(uploadError?.message || "Materiál se nepodařilo nahrát.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader />
        <main className="mx-auto max-w-[1080px] px-4 py-8">
          <section className="overflow-hidden rounded-[28px] bg-navy-900 px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10">
            <div className="max-w-[760px]">
              <Badge className="border-white/20 bg-white/10 text-white">
                Nadační fond Křídla pro Budoucnost
              </Badge>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                Křídla pro budoucnost – dětské domovy
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-200">
                Materiály pro přípravu mladých lidí na samostatný život. Zapojené
                organizace mají zároveň přístup k programu, archivu a ostatním
                vysíláním ARCHIMEDES Live.
              </p>
            </div>
          </section>

          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-4">{message}</Alert> : null}
          {loading ? <p className="mt-6 text-muted">Ověřuji přístup…</p> : null}

          {!loading && !hasAccess ? (
            <Card className="mt-5 p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-navy-900">
                <LockKeyhole className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-navy-900">Chráněná knihovna</h2>
              <p className="mt-2 max-w-[720px] leading-7 text-muted">
                Sekci vidí všichni přihlášení uživatelé, ale materiály mohou otevřít
                pouze administrátorky Nadačního fondu Křídla pro Budoucnost a
                uživatelé zapojených dětských domovů.
              </p>
            </Card>
          ) : null}

          {!loading && hasAccess ? (
            <>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                Přístup k chráněným materiálům je aktivní
              </div>

              <section className="mt-4">
                <h2 className="text-2xl font-black text-navy-900">Materiály ke stažení</h2>
                {materials.length === 0 ? (
                  <Alert variant="neutral" className="mt-3">
                    Zatím zde nejsou zveřejněné žádné materiály.
                  </Alert>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {materials.map((material) => (
                      <Card key={material.id} className="flex flex-col p-5">
                        <Presentation className="h-7 w-7 text-brand" aria-hidden="true" />
                        <h3 className="mt-3 text-lg font-black text-navy-900">{material.title}</h3>
                        {material.description ? (
                          <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                            {material.description}
                          </p>
                        ) : <div className="flex-1" />}
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <span className="text-xs font-semibold text-slate-500">
                            {formatBytes(material.file_size)}
                          </span>
                          <Button
                            type="button"
                            onClick={() => downloadMaterial(material)}
                            disabled={downloadingId === material.id}
                          >
                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                            {downloadingId === material.id ? "Stahuji…" : "Stáhnout"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}

          {!loading && canManage ? (
            <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-brand" aria-hidden="true" />
                  <h2 className="text-xl font-black text-navy-900">Nahrát materiál</h2>
                </div>
                <form onSubmit={uploadMaterial} className="mt-4 grid gap-4">
                  <div>
                    <Label htmlFor="kridla-title">Název</Label>
                    <Input
                      id="kridla-title"
                      value={uploadTitle}
                      onChange={(event) => setUploadTitle(event.target.value)}
                      maxLength={160}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kridla-description">Krátký popis</Label>
                    <Input
                      id="kridla-description"
                      value={uploadDescription}
                      onChange={(event) => setUploadDescription(event.target.value)}
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kridla-file">Soubor PDF, PPT nebo PPTX</Label>
                    <Input
                      id="kridla-file"
                      type="file"
                      accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={uploading || !uploadFile}>
                    {uploading ? "Nahrávám…" : "Nahrát do chráněné sekce"}
                  </Button>
                </form>
              </Card>

              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand" aria-hidden="true" />
                  <h2 className="text-xl font-black text-navy-900">Zapojené dětské domovy</h2>
                </div>
                <div className="mt-4 grid gap-3">
                  {participantHomes.map((home) => (
                    <div key={home.id} className="rounded-2xl border border-slate-200 p-3.5">
                      <div className="font-extrabold text-navy-900">{home.name}</div>
                      <div className="mt-1 text-sm text-muted">
                        {home.contact_name || home.contact_email || "Kontakt bude doplněn"}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          ) : null}
        </main>
      </div>
    </RequireAuth>
  );
}
