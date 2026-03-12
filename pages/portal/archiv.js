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

export default function Archiv() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filterCategory, setFilterCategory] = useState("Vše");
  const [filterAudience, setFilterAudience] = useState("Vše");
  const [q, setQ] = useState("");

  const [licenseMode, setLicenseMode] = useState("active");
  const [licenseLoading, setLicenseLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLicense() {
      try {
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

  if (licenseMode === "trial" || licenseMode === "expired" || licenseMode === "suspended") {
    const title =
      licenseMode === "trial"
        ? "Archiv je dostupný pro aktivní organizace"
        : licenseMode === "expired"
        ? "Přístup do archivu vyžaduje aktivní licenci"
        : "Přístup organizace je pozastaven";

    const text =
      licenseMode === "trial"
        ? "Archiv vysílání je součástí plné licence ARCHIMEDES Live. V demo režimu si můžete prohlédnout portál a program, ale archiv je zamčený."
        : licenseMode === "expired"
        ? "Licence organizace momentálně není aktivní. Pro další přístup do archivu kontaktujte EduVision."
        : "Přístup organizace je dočasně pozastaven. Pro obnovení archivu kontaktujte EduVision.";

    const buttonLabel =
      licenseMode === "trial"
        ? "Aktivovat licenci"
        : licenseMode === "expired"
        ? "Obnovit licenci"
        : "Kontaktovat EduVision";

    return (
      <RequireAuth>
        <PortalHeader />
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 16px" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 120,
                padding: "6px 12px",
                borderRadius: 999,
                background:
                  licenseMode === "trial"
                    ? "#fff4d6"
                    : licenseMode === "expired"
                    ? "#ffe5e5"
                    : "#e9edff",
                color:
                  licenseMode === "trial"
                    ? "#8a5a00"
                    : licenseMode === "expired"
                    ? "#9f1d1d"
                    : "#3646a3",
                fontSize: 12,
                fontWeight: 900,
                marginBottom: 14,
              }}
            >
              {licenseMode === "trial"
                ? "Demo režim"
                : licenseMode === "expired"
                ? "Licence vypršela"
                : "Přístup pozastaven"}
            </div>

            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, color: "#0f172a" }}>
              {title}
            </h1>

            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                fontSize: 16,
                lineHeight: 1.65,
                color: "rgba(15,23,42,0.72)",
              }}
            >
              {text}
            </p>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 12,
                justifyContent: "center",
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
                {buttonLabel}
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
                Otevřít kalendář
              </Link>
            </div>
          </div>
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
          Minulé události. Později sem přidáme i pole pro záznam (recording link).
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
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Rubrika</div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
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
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
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
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 14 }}>Načítám…</p> : null}

        {!loading && !err ? (
          <section style={{ marginTop: 14 }}>
            {visible.length === 0 ? (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, color: "#6b7280" }}>
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
                        style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f9fafb" }}
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
                      <Link href={`/portal/udalost/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ fontWeight: 900, fontSize: 16, cursor: "pointer" }}>{r.title}</div>
                      </Link>

                      <div style={{ marginTop: 6, color: "#374151" }}>
                        {r._d ? formatDateTimeCS(r._d) : "—"}
                        {r.category ? <span> &nbsp; • &nbsp; {r.category}</span> : null}
                        {(r._groups || []).length ? <span> &nbsp; • &nbsp; {r._groups.join(", ")}</span> : null}
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {r.stream_url ? (
                          <a href={r.stream_url} target="_blank" rel="noreferrer">
                            ▶ Otevřít odkaz (vysílání / záznam)
                          </a>
                        ) : (
                          <span style={{ color: "#6b7280" }}>Odkaz není nastaven.</span>
                        )}
                        {r.worksheet_url ? (
                          <a href={r.worksheet_url} target="_blank" rel="noreferrer">
                            📄 Pracovní list
                          </a>
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
