import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

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
  if (Array.isArray(row?.audience_groups) && row.audience_groups.length) return row.audience_groups;
  const aud = row?.audience;
  if (!aud) return [];
  if (Array.isArray(aud)) return aud;
  return String(aud)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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

function modeConfig(mode) {
  if (mode === "trial") {
    return {
      badge: "Demo režim",
      badgeBg: "#fff4d6",
      badgeColor: "#8a5a00",
      title: "Archiv vidíte, ale plný obsah je jen pro registrované organizace",
      text:
        "V demo režimu vidíte složku Archiv i ukázku jejího obsahu. Plné záznamy, navazující materiály a návrat k odvysílaným tématům jsou dostupné pro registrované organizace s aktivní licencí ARCHIMEDES Live.",
      primaryLabel: "Aktivovat licenci",
    };
  }

  if (mode === "expired") {
    return {
      badge: "Licence vypršela",
      badgeBg: "#ffe5e5",
      badgeColor: "#9f1d1d",
      title: "Přístup do archivu vyžaduje aktivní licenci",
      text:
        "Vaše organizace momentálně nemá aktivní licenci. Archiv záznamů je připravený, ale přístup k němu je nyní omezený. Pro pokračování v programu obnovte licenci organizace.",
      primaryLabel: "Obnovit licenci",
    };
  }

  return {
    badge: "Přístup pozastaven",
    badgeBg: "#e9edff",
    badgeColor: "#3646a3",
    title: "Přístup organizace je pozastaven",
    text:
      "Archiv je dočasně nedostupný. Jakmile bude přístup organizace obnoven, vrátí se i plný přístup k archivům a dalším navazujícím materiálům.",
    primaryLabel: "Kontaktovat EduVision",
  };
}

function PreviewCard({ item }) {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 18,
        padding: 14,
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 15, color: "#0f172a", lineHeight: 1.35 }}>
        {item.title || "Záznam vysílání"}
      </div>

      <div style={{ marginTop: 6, fontSize: 13, color: "rgba(15,23,42,0.68)" }}>
        {item._d ? formatDateTimeCS(item._d) : "—"}
        {item.category ? <span> &nbsp;•&nbsp; {item.category}</span> : null}
      </div>

      {(item._groups || []).length ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: "rgba(15,23,42,0.62)",
            lineHeight: 1.5,
          }}
        >
          Cílové skupiny: {item._groups.join(", ")}
        </div>
      ) : null}
    </div>
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
          setLicenseMode("default");
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
          if (!isMounted) return;
          setLicenseMode("active");
          return;
        }

        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .select("license_status, license_valid_until")
          .eq("id", membership.organization_id)
          .maybeSingle();

        if (orgError) throw orgError;

        if (!isMounted) return;
        setLicenseMode(resolveLicenseMode(org));
      } catch (_e) {
        if (!isMounted) return;
        setLicenseMode("expired");
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
          "id,title,starts_at,category,audience_groups,audience,stream_url,worksheet_url,is_published,poster_url"
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
      .map((r) => ({ ...r, _d: safeDate(r.starts_at), _groups: normalizeGroups(r) }))
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
      .filter((r) => (filterAudience === "Vše" ? true : (r._groups || []).includes(filterAudience)))
      .filter((r) => (qq ? String(r.title || "").toLowerCase().includes(qq) : true));
  }, [prepared, filterCategory, filterAudience, q]);

  const previewRows = useMemo(() => prepared.slice(0, 3), [prepared]);

  const effectiveMode = isPlatformAdmin ? "active" : licenseMode;
  const isLocked =
    effectiveMode === "trial" ||
    effectiveMode === "expired" ||
    effectiveMode === "suspended";

  if (licenseLoading) {
    return (
      <RequireAuth>
        <PortalHeader />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
          <p style={{ marginTop: 14 }}>Načítám…</p>
        </main>
      </RequireAuth>
    );
  }

  if (isLocked) {
    const cfg = modeConfig(effectiveMode);

    return (
      <RequireAuth>
        <PortalHeader />

        <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px 48px" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: 28,
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 18,
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 560px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 120,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: cfg.badgeBg,
                    color: cfg.badgeColor,
                    fontSize: 12,
                    fontWeight: 900,
                    marginBottom: 14,
                  }}
                >
                  {cfg.badge}
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 34,
                    lineHeight: 1.08,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {cfg.title}
                </h1>

                <p
                  style={{
                    marginTop: 14,
                    marginBottom: 0,
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "rgba(15,23,42,0.72)",
                    maxWidth: 760,
                  }}
                >
                  {cfg.text}
                </p>

                <div
                  style={{
                    marginTop: 18,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12,
                    maxWidth: 760,
                  }}
                >
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

                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/poptavka"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: "#0f172a",
                      color: "white",
                      fontWeight: 900,
                    }}
                  >
                    {cfg.primaryLabel}
                  </Link>

                  <Link
                    href="/poptavka"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: "white",
                      color: "#0f172a",
                      fontWeight: 900,
                      border: "1px solid rgba(15,23,42,0.14)",
                    }}
                  >
                    Domluvit ukázkovou hodinu
                  </Link>

                  <Link
                    href="/portal/kalendar"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: "white",
                      color: "#0f172a",
                      fontWeight: 900,
                      border: "1px solid rgba(15,23,42,0.14)",
                    }}
                  >
                    Otevřít program
                  </Link>
                </div>
              </div>

              <div
                style={{
                  minWidth: 260,
                  flex: "0 1 320px",
                  background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 22,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "rgba(15,23,42,0.64)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Co je součástí plné licence
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: "#0f172a",
                    lineHeight: 1.8,
                    fontSize: 15,
                  }}
                >
                  <li>archiv odvysílaných pořadů</li>
                  <li>návrat k tématům podle potřeby školy</li>
                  <li>navazující pracovní materiály</li>
                  <li>dlouhodobá využitelnost programu</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 26 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#0f172a",
                  marginBottom: 10,
                }}
              >
                Ukázka toho, co v archivu najdete
              </div>

              <div
                style={{
                  fontSize: 15,
                  color: "rgba(15,23,42,0.7)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Archiv není prázdné úložiště. Je to praktický návrat k odvysílaným tématům, který
                dává škole možnost použít obsah znovu, ve vhodný čas a s odstupem.
              </div>

              {previewRows.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed rgba(15,23,42,0.18)",
                    borderRadius: 18,
                    padding: 18,
                    color: "rgba(15,23,42,0.7)",
                    background: "rgba(15,23,42,0.02)",
                  }}
                >
                  Archiv se průběžně plní. Jakmile bude licence aktivní, zobrazí se zde odvysílané
                  záznamy podle programu.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 14,
                  }}
                >
                  {previewRows.map((item) => (
                    <PreviewCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <style jsx>{`
            @media (max-width: 900px) {
              .archive-preview-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>Archiv</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Záznamy odvysílaných událostí, návrat k tématům a návazné materiály.
        </p>

        <div
          style={{
            marginTop: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Hledat</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Název události…"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Rubrika</div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Cílovka</div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {err ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              borderRadius: 12,
            }}
          >
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 14 }}>Načítám…</p> : null}

        {!loading && !err ? (
          <section style={{ marginTop: 14 }}>
            {visible.length === 0 ? (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  color: "#6b7280",
                }}
              >
                Archiv je zatím prázdný podle zvolených filtrů.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {visible.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                      gap: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: 12,
                      alignItems: "start",
                      background: "#fff",
                    }}
                  >
                    {r.poster_url ? (
                      <img
                        src={r.poster_url}
                        alt=""
                        style={{
                          width: 120,
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          background: "#f9fafb",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 120,
                          height: 90,
                          borderRadius: 12,
                          border: "1px dashed #d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        Bez plakátu
                      </div>
                    )}

                    <div>
                      <Link
                        href={`/portal/udalost/${r.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
                          {r.title}
                        </div>
                      </Link>

                      <div style={{ marginTop: 6, color: "#374151" }}>
                        {r._d ? formatDateTimeCS(r._d) : "—"}
                        {r.category ? <span> &nbsp; • &nbsp; {r.category}</span> : null}
                        {(r._groups || []).length ? (
                          <span> &nbsp; • &nbsp; {r._groups.join(", ")}</span>
                        ) : null}
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {r.stream_url ? (
                          <Link href={`/portal/udalost/${r.id}`}>▶ Otevřít detail</Link>
                        ) : (
                          <span style={{ color: "#6b7280" }}>Odkaz není nastaven.</span>
                        )}

                        {r.worksheet_url ? (
                          <span style={{ color: "#6b7280" }}>📄 Pracovní list v detailu</span>
                        ) : null}

                        <Link href="/portal/kalendar">→ Program</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </RequireAuth>
  );
}

function MiniStat({ value, label }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 18,
        padding: "14px 14px 12px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          lineHeight: 1,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          lineHeight: 1.45,
          color: "rgba(15,23,42,0.68)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
