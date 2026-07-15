import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Wrench, Play, Lock, FileText, ArrowRight } from "lucide-react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { resolveLicenseMode } from "../../lib/licenseMode";
import { supabase } from "../../lib/supabaseClient";
import { fetchMyOrganization } from "../../lib/myOrganizations";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Alert } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";

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

function normalizeGroups(row) {
  if (Array.isArray(row?.audience_groups) && row.audience_groups.length) {
    return row.audience_groups;
  }

  const aud = row?.audience;
  if (!aud) return [];
  if (Array.isArray(aud)) return aud;

  return String(aud)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeSession(session) {
  if (!session) return null;
  if (Array.isArray(session)) return session[0] || null;
  return session;
}

function extractYouTubeId(url) {
  if (!url) return "";

  try {
    const parsed = new URL(String(url).trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return (parsed.pathname || "").replace(/^\//, "").split("/")[0] || "";
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const v = parsed.searchParams.get("v");
      if (v) return v;

      const parts = (parsed.pathname || "").split("/").filter(Boolean);
      const embedIndex = parts.findIndex(
        (x) => x === "embed" || x === "shorts" || x === "live"
      );
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }

    if (host === "youtube-nocookie.com") {
      const parts = (parsed.pathname || "").split("/").filter(Boolean);
      const embedIndex = parts.findIndex((x) => x === "embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
  } catch (_e) {
    return "";
  }

  return "";
}

function getRecordingUrl(row) {
  const session = normalizeSession(row?.broadcast_sessions);
  return session?.recording_url || row?.broadcast_recording_url || "";
}

function getArchiveVideoUrl(row) {
  return getRecordingUrl(row) || row?.stream_url || "";
}

function getArchiveCoverUrl(row) {
  const archiveUrl = getArchiveVideoUrl(row);
  const ytId = extractYouTubeId(archiveUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  if (row?.poster_url) return row.poster_url;

  return "";
}

function modeConfig(mode) {
  if (mode === "pending_approval") {
    return {
      badge: "Registrace se zpracovává",
      badgeClass: "bg-amber-100 text-amber-800",
      title: "Archiv bude dostupný po dokončení registrace",
      text:
        "Program vaší obce se právě registruje. Strukturu archivu si můžete prohlédnout už teď, plný přístup k záznamům se otevře po dokončení registrace.",
      primaryLabel: "Napsat nám",
    };
  }

  if (mode === "inactive") {
    return {
      badge: "Program není aktivní",
      badgeClass: "bg-red-100 text-red-800",
      title: "Přístup do archivu vyžaduje aktivní program",
      text:
        "Vaše obec momentálně nemá aktivní program ARCHIMEDES Live. Archiv záznamů je připravený, ale přístup k němu je teď omezený.",
      primaryLabel: "Napsat nám",
    };
  }

  return {
    badge: "Přístup pozastaven",
    badgeClass: "bg-indigo-100 text-indigo-800",
    title: "Program obce je dočasně pozastaven",
    text:
      "Archiv je dočasně nedostupný. Jakmile bude přístup obce obnoven, vrátí se i plný přístup k archivům a dalším navazujícím materiálům.",
    primaryLabel: "Napsat nám",
  };
}

function PreviewCard({ item }) {
  const coverUrl = getArchiveCoverUrl(item);

  return (
    <Card className="bg-gradient-to-b from-white to-blue-50/30 p-3.5">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={item.title || "Náhled záznamu"}
          className="h-[160px] w-full rounded-2xl border border-slate-900/[0.08] bg-slate-50 object-cover"
        />
      ) : (
        <div className="flex h-[160px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-900/[0.16] bg-gradient-to-b from-slate-50 to-indigo-50 text-[13px] font-bold text-slate-500">
          Náhled záznamu
        </div>
      )}

      <span className="mt-3 inline-flex items-center rounded-full bg-slate-900/[0.06] px-2.5 py-1 text-[11px] font-black text-navy-900">
        Záznam v archivu
      </span>

      <div className="mt-2.5 text-base font-black leading-snug text-navy-900">
        {item.title || "Záznam vysílání"}
      </div>

      <div className="mt-1.5 text-[13px] text-muted">
        {item._d ? formatDateTimeCS(item._d) : "—"}
        {item.category ? <span> &nbsp;•&nbsp; {item.category}</span> : null}
      </div>

      {(item._groups || []).length ? (
        <div className="mt-2 text-[13px] leading-relaxed text-slate-500">
          Cílové skupiny: {item._groups.join(", ")}
        </div>
      ) : null}
    </Card>
  );
}

function MiniStat({ value, label }) {
  return (
    <Card className="p-3.5">
      <div className="text-2xl font-black leading-none text-navy-900">{value}</div>
      <div className="mt-2 text-xs leading-relaxed text-muted">{label}</div>
    </Card>
  );
}

function LicenseFeature({ title, text }) {
  return (
    <Card className="p-3.5">
      <div className="text-sm font-black leading-snug text-navy-900">{title}</div>
      <div className="mt-1.5 text-[13px] leading-relaxed text-muted">{text}</div>
    </Card>
  );
}

export default function Archiv() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filterCategory, setFilterCategory] = useState("Vše");
  const [filterAudience, setFilterAudience] = useState("Vše");
  const [q, setQ] = useState("");

  const [licenseMode, setLicenseMode] = useState("active");
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isDemoViewer, setIsDemoViewer] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLicense() {
      try {
        const { data: adminData, error: adminError } = await supabase.rpc("is_admin");
        if (!adminError && isMounted) setIsPlatformAdmin(!!adminData);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          if (!isMounted) return;
          setIsOrgAdmin(false);
          setIsDemoViewer(false);
          setLicenseMode("default");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, active_organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!isMounted) return;

        if (!profile?.active_organization_id) {
          setIsOrgAdmin(false);
          setIsDemoViewer(false);
          setLicenseMode("active");
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id, role_in_org")
          .eq("user_id", user.id)
          .eq("organization_id", profile.active_organization_id)
          .eq("status", "active")
          .maybeSingle();

        if (membershipError) throw membershipError;

        if (!isMounted) return;

        setIsOrgAdmin(membership?.role_in_org === "organization_admin");
        setIsDemoViewer(membership?.role_in_org === "demo_viewer");

        if (!membership?.organization_id) {
          setIsDemoViewer(false);
          setLicenseMode("active");
          return;
        }

        const org = await fetchMyOrganization(
          supabase,
          profile.active_organization_id
        );

        if (!isMounted) return;
        const mode = await resolveLicenseMode(
          supabase,
          profile.active_organization_id,
          org
        );
        if (!isMounted) return;
        setLicenseMode(mode);
      } catch (_e) {
        if (!isMounted) return;
        setLicenseMode("inactive");
        setIsOrgAdmin(false);
        setIsDemoViewer(false);
      } finally {
        if (isMounted) setLicenseLoading(false);
      }
    }

    async function loadArchive() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          `
            id,
            title,
            starts_at,
            category,
            audience_groups,
            audience,
            stream_url,
            worksheet_url,
            is_published,
            poster_url,
            broadcast_sessions (
              recording_url,
              viewer_url,
              status
            )
          `
        )
        .order("starts_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setErr(error.message || "Chyba načítání");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    }

    loadLicense();
    loadArchive();

    return () => {
      isMounted = false;
    };
  }, []);

  const prepared = useMemo(() => {
    const now = new Date();

    return rows
      .filter((r) => r.is_published !== false)
      .map((r) => {
        const d = safeDate(r.starts_at);
        const recordingUrl = getRecordingUrl(r);
        const archiveUrl = recordingUrl || r.stream_url || "";

        return {
          ...r,
          _d: d,
          _groups: normalizeGroups(r),
          _recordingUrl: recordingUrl,
          _archiveUrl: archiveUrl,
          _coverUrl: getArchiveCoverUrl(r),
        };
      })
      .filter((r) => r._d && r._d < now);
  }, [rows]);

  const categories = useMemo(() => {
    const set = new Set();
    prepared.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ["Vše", ...Array.from(set).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [prepared]);

  const audiences = useMemo(() => {
    const set = new Set();
    prepared.forEach((r) => (r._groups || []).forEach((g) => set.add(g)));
    return ["Vše", ...Array.from(set).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [prepared]);

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return prepared
      .filter((r) => (filterCategory === "Vše" ? true : r.category === filterCategory))
      .filter((r) =>
        filterAudience === "Vše" ? true : (r._groups || []).includes(filterAudience)
      )
      .filter((r) => (qq ? String(r.title || "").toLowerCase().includes(qq) : true));
  }, [prepared, filterCategory, filterAudience, q]);

  const previewRows = useMemo(() => {
    const withVideo = prepared.filter((r) => !!r._archiveUrl);
    return (withVideo.length ? withVideo : prepared).slice(0, 3);
  }, [prepared]);

  const isArchiveAdmin = isPlatformAdmin || isOrgAdmin;
  const effectiveMode = isPlatformAdmin ? "active" : licenseMode;
  const isLocked =
    !isDemoViewer &&
    (effectiveMode === "pending_approval" ||
      effectiveMode === "inactive" ||
      effectiveMode === "suspended");

  if (licenseLoading) {
    return (
      <RequireAuth>
        <PortalHeader />
        <main className="mx-auto max-w-[1100px] px-4 py-5">
          <p className="mt-3.5 text-muted">Načítám…</p>
        </main>
      </RequireAuth>
    );
  }

  if (isLocked) {
    const cfg = modeConfig(effectiveMode);

    return (
      <RequireAuth>
        <PortalHeader />

        <main className="mx-auto max-w-[980px] px-4 py-8 pb-12">
          <Card className="p-7">
            <div className="min-w-0 max-w-[760px]">
              <Badge className={cfg.badgeClass}>{cfg.badge}</Badge>

              <h1 className="mt-3.5 text-[34px] font-[950] leading-[1.08] tracking-[-0.02em] text-navy-900">
                {cfg.title}
              </h1>

              <p className="mt-3.5 max-w-[760px] text-base leading-relaxed text-muted">
                {cfg.text}
              </p>

              <div className="mt-4 grid max-w-[760px] grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniStat
                  value={String(prepared.length)}
                  label="publikovaných záznamů v archivu"
                />
                <MiniStat
                  value={String(categories.filter((x) => x !== "Vše").length)}
                  label="rubrik v archivu"
                />
                <MiniStat
                  value={String(audiences.filter((x) => x !== "Vše").length)}
                  label="cílových skupin"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/kontakt">{cfg.primaryLabel}</Button>
                <Button href="/portal/kalendar" variant="secondary">
                  Otevřít program
                </Button>
              </div>
            </div>

            <div className="mt-5 w-full rounded-card-md border border-slate-900/[0.08] bg-gradient-to-b from-white to-blue-50/30 p-4">
              <div className="mb-3 text-[13px] font-black uppercase tracking-[0.04em] text-slate-500">
                Co je součástí plné licence
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                <LicenseFeature
                  title="Archiv odvysílaných témat"
                  text="návrat k videím z předchozích vysílání"
                />
                <LicenseFeature
                  title="Navazující materiály"
                  text="pracovní listy a další využití ve výuce"
                />
                <LicenseFeature
                  title="Praktické použití"
                  text="škola si obsah pustí ve chvíli, kdy ho potřebuje"
                />
                <LicenseFeature
                  title="Dlouhodobá hodnota"
                  text="program nezmizí po jednom vysílání"
                />
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2.5 text-xl font-black text-navy-900">
                Ukázka toho, co v archivu najdete
              </div>

              <div className="mb-4 text-[15px] leading-relaxed text-muted">
                Archiv je návrat k již proběhlým tématům. Škola se může vrátit ke konkrétnímu
                videu tehdy, kdy se jí to hodí do výuky nebo návazné práce.
              </div>

              {previewRows.length === 0 ? (
                <Alert variant="neutral">
                  Archiv se průběžně plní. Jakmile bude licence aktivní, zobrazí se zde odvysílané
                  záznamy podle programu.
                </Alert>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {previewRows.map((item) => (
                    <PreviewCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <main className="mx-auto max-w-[1100px] px-4 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-navy-900">Archiv</h1>
            <p className="mt-1.5 text-muted">
              Záznamy odvysílaných událostí, návrat k tématům a návazné materiály.
            </p>
          </div>

          {isArchiveAdmin ? (
            <div className="flex flex-wrap gap-2">
              <Button href="/portal/admin-udalosti/novy" size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" /> Nová událost
              </Button>
              <Button href="/portal/admin-udalosti" variant="secondary" size="sm">
                <Wrench className="h-4 w-4" aria-hidden="true" /> Správa vysílání
              </Button>
            </div>
          ) : null}
        </div>

        <Card className="mt-3.5 grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-3">
          <div>
            <Label>Hledat</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Název události…" />
          </div>

          <div>
            <Label>Rubrika</Label>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Cílovka</Label>
            <Select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)}>
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {err ? (
          <Alert variant="error" className="mt-3.5">
            <b>Chyba:</b> {err}
          </Alert>
        ) : null}

        {loading ? <p className="mt-4 text-muted">Načítám…</p> : null}

        {!loading && !err ? (
          <section className="mt-4">
            {visible.length === 0 ? (
              <Alert variant="neutral">Archiv je zatím prázdný podle zvolených filtrů.</Alert>
            ) : (
              <div className="grid gap-3">
                {visible.map((r) => (
                  <Card key={r.id} className="grid grid-cols-1 items-start gap-3 p-3 sm:grid-cols-[120px_1fr]">
                    {r._coverUrl ? (
                      <img
                        src={r._coverUrl}
                        alt={r.title || "Náhled záznamu"}
                        className="h-[90px] w-[120px] rounded-xl border border-slate-200 bg-slate-50 object-cover"
                      />
                    ) : (
                      <div className="flex h-[90px] w-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-500">
                        Náhled záznamu
                      </div>
                    )}

                    <div>
                      <div className="text-base font-black text-navy-900">{r.title}</div>

                      <div className="mt-1.5 leading-relaxed text-slate-700">
                        {r._d ? formatDateTimeCS(r._d) : "—"}
                        {r.category ? <span> &nbsp;•&nbsp; {r.category}</span> : null}
                        {(r._groups || []).length ? (
                          <span> &nbsp;•&nbsp; {r._groups.join(", ")}</span>
                        ) : null}
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-2.5">
                        {r._archiveUrl ? (
                          isDemoViewer ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-bold text-slate-500">
                              <Lock className="h-4 w-4" aria-hidden="true" /> Video dostupné v plné licenci
                            </span>
                          ) : (
                            <a
                              href={r._archiveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2.5 font-black text-white"
                            >
                              <Play className="h-4 w-4" aria-hidden="true" /> Otevřít video z archivu
                            </a>
                          )
                        ) : (
                          <Link
                            href={`/portal/udalost/${r.id}`}
                            className="inline-flex items-center rounded-xl bg-navy-900 px-3.5 py-2.5 font-black text-white"
                          >
                            Otevřít detail
                          </Link>
                        )}

                        {r.worksheet_url ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-slate-500">
                            <FileText className="h-4 w-4" aria-hidden="true" /> Pracovní list v detailu
                          </span>
                        ) : null}

                        <Link
                          href="/portal/kalendar"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-black text-navy-900"
                        >
                          Program <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </RequireAuth>
  );
}
