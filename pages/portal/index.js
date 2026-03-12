// pages/portal/index.js
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

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

export default function PortalIndex() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [nextEvents, setNextEvents] = useState([]);
  const [eventsErr, setEventsErr] = useState("");

  const [loadingProfileType, setLoadingProfileType] = useState(true);
  const [dashboardType, setDashboardType] = useState("default");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [membershipRole, setMembershipRole] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const [licenseStatus, setLicenseStatus] = useState("");
  const [licenseValidUntil, setLicenseValidUntil] = useState(null);
  const [licenseMode, setLicenseMode] = useState("default");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (_e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }

      try {
        setEventsErr("");
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
          .from("events")
          .select("id,title,starts_at,category,full_description")
          .eq("is_published", true)
          .gt("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(3);

        if (error) setEventsErr(error.message);
        else setNextEvents(data || []);
      } catch (e) {
        setEventsErr(e?.message || "Nepodařilo se načíst nejbližší vysílání.");
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setDashboardType("default");
          setLicenseMode("default");
          setLoadingProfileType(false);
          return;
        }

        const [
          { data: profile, error: profileError },
          { data: membership, error: membershipError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, user_type")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("organization_members")
            .select("organization_id, status, role_in_org")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle(),
        ]);

        if (profileError) throw profileError;
        if (membershipError) throw membershipError;

        setMembershipRole(membership?.role_in_org || "");

        if (membership?.organization_id) {
          const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("id, name, join_code, license_status, license_valid_until")
            .eq("id", membership.organization_id)
            .maybeSingle();

          if (orgError) throw orgError;

          setOrganizationName(org?.name || "");
          setOrganizationCode(org?.join_code || "");
          setLicenseStatus(org?.license_status || "trial");
          setLicenseValidUntil(org?.license_valid_until || null);
          setLicenseMode(resolveLicenseMode(org));

          setDashboardType("organization");
        } else if (profile?.user_type === "individual") {
          setDashboardType("individual");
          setLicenseMode("active");
        } else {
          setDashboardType("default");
          setLicenseMode("default");
        }
      } catch (_e) {
        setDashboardType("default");
        setLicenseMode("default");
      } finally {
        setLoadingProfileType(false);
      }
    })();
  }, []);

  const hasEvents = nextEvents && nextEvents.length > 0;

  const dashboard = useMemo(
    () => getDashboardConfig(dashboardType, organizationName, licenseMode, licenseValidUntil),
    [dashboardType, organizationName, licenseMode, licenseValidUntil]
  );

  const showGettingStarted =
    !loadingProfileType &&
    !!organizationName &&
    membershipRole === "organization_admin";

  const showTrialBanner = dashboardType === "organization" && licenseMode === "trial";
  const showExpiredBanner = dashboardType === "organization" && licenseMode === "expired";
  const showSuspendedBanner = dashboardType === "organization" && licenseMode === "suspended";

  async function handleCopyOrganizationCode() {
    if (!organizationCode) return;
    try {
      await navigator.clipboard.writeText(organizationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch (_e) {
      // no-op
    }
  }

  return (
    <RequireAuth>
      <PortalHeader title="Portál" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 48px" }}>
          {showTrialBanner ? (
            <LicenseBanner
              mode="trial"
              title="ARCHIMEDES Live – demo přístup"
              text={
                <>
                  Vaše organizace{organizationName ? ` ${organizationName}` : ""} má aktivní demo
                  přístup{licenseValidUntil ? (
                    <>
                      {" "}
                      do <strong>{formatDateCS(licenseValidUntil)}</strong>
                    </>
                  ) : null}
                  . Můžete si vyzkoušet portál, prohlédnout program a připravit si ukázkovou hodinu.
                </>
              }
              primaryHref="/poptavka"
              primaryLabel="Požádat o plnou licenci"
              secondaryHref="/portal/kalendar"
              secondaryLabel="Otevřít kalendář"
            />
          ) : null}

          {showExpiredBanner ? (
            <LicenseBanner
              mode="expired"
              title="Demo přístup vypršel"
              text={
                <>
                  Přístup organizace{organizationName ? ` ${organizationName}` : ""} je nyní v
                  omezeném režimu. Pro pokračování v plném programu kontaktujte EduVision a aktivujte
                  licenci.
                </>
              }
              primaryHref="/poptavka"
              primaryLabel="Aktivovat licenci"
              secondaryHref="/portal/skoly"
              secondaryLabel="Zobrazit síť učeben"
            />
          ) : null}

          {showSuspendedBanner ? (
            <LicenseBanner
              mode="suspended"
              title="Přístup organizace je pozastaven"
              text={
                <>
                  Přístup organizace{organizationName ? ` ${organizationName}` : ""} je dočasně
                  pozastaven. Pro obnovení kontaktujte EduVision.
                </>
              }
              primaryHref="/poptavka"
              primaryLabel="Kontaktovat EduVision"
              secondaryHref="/portal/skoly"
              secondaryLabel="Zobrazit síť učeben"
            />
          ) : null}

          <section
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: "22px 22px 20px",
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 520px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.06)",
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  {dashboard.badge}
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
                  {dashboard.heroTitleLine1}
                  <br />
                  {dashboard.heroTitleLine2}
                </h1>

                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "rgba(15,23,42,0.72)",
                    maxWidth: 760,
                  }}
                >
                  {loadingProfileType ? "Načítám prostředí portálu…" : dashboard.heroText}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(130px, 1fr))",
                  gap: 10,
                  flex: "0 1 320px",
                  width: "100%",
                  maxWidth: 320,
                }}
              >
                {dashboard.stats.map((item) => (
                  <StatCard key={`${item.value}-${item.label}`} value={item.value} label={item.label} />
                ))}
              </div>
            </div>
          </section>

          {showGettingStarted ? (
            <section
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                padding: 18,
                boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div style={{ minWidth: 0, flex: "1 1 520px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      color: "#0f172a",
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 10,
                    }}
                  >
                    Začínáme
                  </div>

                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      lineHeight: 1.08,
                      color: "#0f172a",
                    }}
                  >
                    Jak zapojit školu do portálu
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: "rgba(15,23,42,0.72)",
                      maxWidth: 760,
                    }}
                  >
                    Jste správce organizace{organizationName ? ` pro ${organizationName}` : ""}. Níže je
                    doporučený postup, jak připojit další učitele a rychle začít portál používat.
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 280,
                    flex: "0 1 360px",
                    background: "white",
                    border: "1px solid rgba(15,23,42,0.10)",
                    borderRadius: 18,
                    padding: 14,
                    boxShadow: "0 10px 28px rgba(15,23,42,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "rgba(15,23,42,0.64)",
                      marginBottom: 8,
                    }}
                  >
                    Kód školy / organizace
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: "1 1 180px",
                        minHeight: 48,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 14px",
                        borderRadius: 14,
                        background: "#f8fafc",
                        border: "1px solid rgba(15,23,42,0.10)",
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#0f172a",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {organizationCode || "Kód není k dispozici"}
                    </div>

                    <button
                      onClick={handleCopyOrganizationCode}
                      disabled={!organizationCode}
                      style={{
                        border: "none",
                        cursor: organizationCode ? "pointer" : "not-allowed",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 16px",
                        borderRadius: 14,
                        background: organizationCode ? "#0f172a" : "rgba(15,23,42,0.16)",
                        color: "white",
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {copiedCode ? "Zkopírováno" : "Kopírovat"}
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "rgba(15,23,42,0.64)",
                    }}
                  >
                    Tento kód pošlete učitelům. Po registraci zvolí možnost <b>Připojit se ke stávající organizaci</b>.
                  </div>
                </div>
              </div>

              <div className="onboarding-grid">
                <OnboardingStep
                  number="1"
                  title="Pošlete učitelům přístup"
                  text="Pošlete jim odkaz na přihlášení a kód školy. To je nejrychlejší způsob zapojení více lidí najednou."
                  footer={
                    <div
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 14,
                        background: "#f8fafc",
                        border: "1px solid rgba(15,23,42,0.08)",
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "#0f172a",
                      }}
                    >
                      <b>Login:</b> archimedeslive.com/login
                      <br />
                      <b>Kód školy:</b> {organizationCode || "—"}
                    </div>
                  }
                />

                <OnboardingStep
                  number="2"
                  title="Učitelé se sami připojí"
                  text="Učitel si vytvoří účet, přihlásí se a na obrazovce Welcome zvolí připojení ke stávající organizaci."
                />

                <OnboardingStep
                  number="3"
                  title="Začněte kalendářem"
                  text="Nejrychlejší vstup do programu je přes kalendář. Odtud se dostanete k živému vysílání i detailu programu."
                  actionHref="/portal/kalendar"
                  actionLabel="Otevřít kalendář"
                />

                <OnboardingStep
                  number="4"
                  title="Spravujte uživatele"
                  text="Na stránce Uživatelé uvidíte aktivní členy školy. Jednotlivé e-mailové pozvánky používejte jen když je to opravdu potřeba."
                  actionHref="/portal/uzivatele"
                  actionLabel="Otevřít uživatele"
                />
              </div>
            </section>
          ) : null}

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "rgba(15,23,42,0.72)",
              }}
            >
              {licenseMode === "trial"
                ? "Demo přístup pro registrované."
                : licenseMode === "expired" || licenseMode === "suspended"
                ? "Omezený přístup."
                : "Přístup k obsahu pro registrované."}
            </div>

            <div
              style={{
                marginLeft: "auto",
                fontSize: 13,
                color: "rgba(15,23,42,0.62)",
              }}
            >
              Tip: nejčastěji budete používat <b>{dashboard.tipBold}</b>.
            </div>
          </div>

          <div className="portal-main-grid">
            <div style={{ display: "grid", gap: 16 }}>
              <section
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 18,
                  boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                      {dashboard.quickTitle}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                      {dashboard.quickSubtitle}
                    </div>
                  </div>

                  <Link
                    href={dashboard.primaryCtaHref}
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 16px",
                      borderRadius: 14,
                      background: "#0f172a",
                      color: "white",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dashboard.primaryCtaLabel}
                  </Link>
                </div>

                <div className="tiles-grid">
                  {dashboard.tiles.map((tile, idx) => (
                    <Tile
                      key={`${tile.href}-${tile.title}`}
                      href={tile.href}
                      icon={tile.icon}
                      title={tile.title}
                      desc={tile.desc}
                      cta={tile.cta || "Otevřít"}
                      highlight={!!tile.highlight}
                      note={tile.note}
                      large={idx === 0}
                    />
                  ))}
                </div>
              </section>

              <section
                style={{
                  background: "white",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 18,
                  boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                    Administrace
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      color: "rgba(15,23,42,0.72)",
                    }}
                  >
                    vidí jen správci
                  </div>
                </div>

                {checkingAdmin ? (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: "1px dashed rgba(15,23,42,0.18)",
                      background: "rgba(15,23,42,0.02)",
                      color: "rgba(15,23,42,0.70)",
                    }}
                  >
                    Načítám práva…
                  </div>
                ) : isAdmin ? (
                  <div className="tiles-grid admin-grid">
                    <Tile
                      href="/portal/admin-udalosti"
                      icon="🛠️"
                      title="Události"
                      desc="Vkládání, úpravy a správa programu."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-inzerce"
                      icon="✅"
                      title="Inzerce"
                      desc="Moderace, TOP, ARCHIMEDES a správa příspěvků."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-poptavky"
                      icon="📨"
                      title="Poptávky"
                      desc="Přehled leadů a export do CSV."
                      cta="Otevřít"
                    />
                    <Tile
                      href="/portal/admin-skoly"
                      icon="🏫"
                      title="Školy"
                      desc="Správa databáze učeben, fotek, kontaktů a publikace."
                      cta="Otevřít"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: "1px dashed rgba(15,23,42,0.18)",
                      background: "rgba(15,23,42,0.02)",
                      color: "rgba(15,23,42,0.72)",
                      fontSize: 15,
                    }}
                  >
                    Administrace je dostupná jen správcům.
                  </div>
                )}
              </section>
            </div>

            <aside
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                padding: 18,
                boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.05, color: "#0f172a" }}>
                    Nejbližší vysílání
                  </div>
                  <div style={{ marginTop: 6, fontSize: 14, color: "rgba(15,23,42,0.68)" }}>
                    Přehled nejbližších publikovaných událostí.
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.06)",
                    color: "rgba(15,23,42,0.72)",
                    whiteSpace: "nowrap",
                  }}
                >
                  max. 3
                </div>
              </div>

              {eventsErr ? (
                <div
                  style={{
                    marginTop: 14,
                    background: "#fff3f3",
                    border: "1px solid #ffd0d0",
                    padding: 14,
                    borderRadius: 14,
                    color: "#8a1f1f",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Chyba: {eventsErr}
                </div>
              ) : null}

              {!eventsErr && !hasEvents ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: 16,
                    borderRadius: 16,
                    border: "1px dashed rgba(15,23,42,0.18)",
                    background: "rgba(15,23,42,0.02)",
                    color: "rgba(15,23,42,0.72)",
                    fontSize: 15,
                  }}
                >
                  Zatím nejsou naplánované publikované události.
                </div>
              ) : null}

              {hasEvents ? (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {nextEvents.map((e) => (
                    <EventRow key={e.id} e={e} />
                  ))}
                </div>
              ) : null}

              <Link
                href="/portal/kalendar"
                style={{
                  display: "inline-flex",
                  marginTop: 16,
                  textDecoration: "none",
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(15,23,42,0.18)",
                  background: "#0f172a",
                  color: "white",
                  fontWeight: 900,
                  justifyContent: "center",
                  width: "100%",
                  fontSize: 16,
                }}
              >
                Otevřít kalendář
              </Link>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 16,
                  background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>
                  {dashboard.sideBoxTitle}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "rgba(15,23,42,0.70)",
                  }}
                >
                  {dashboard.sideBoxText}
                </div>
              </div>
            </aside>
          </div>

          <style jsx>{`
            .portal-main-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.9fr);
              gap: 18px;
              align-items: start;
            }

            .tiles-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }

            .admin-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .onboarding-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }

            @media (max-width: 1080px) {
              .portal-main-grid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 760px) {
              .tiles-grid,
              .admin-grid,
              .onboarding-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </div>
      </div>
    </RequireAuth>
  );
}

function getDashboardConfig(type, organizationName = "", licenseMode = "default", licenseValidUntil = null) {
  const orgLabel = organizationName ? ` pro ${organizationName}` : "";
  const trialUntilText = licenseValidUntil ? formatDateCS(licenseValidUntil) : null;

  if (type === "organization") {
    if (licenseMode === "trial") {
      return {
        badge: "ARCHIMEDES Live • demo organizace",
        heroTitleLine1: "Vítejte v demo režimu",
        heroTitleLine2: "ARCHIMEDES Live",
        heroText: `Tady si můžete vyzkoušet fungování portálu${orgLabel}. Demo slouží k orientaci v programu, kalendáři a síti učeben${trialUntilText ? ` do ${trialUntilText}` : ""}.`,
        tipBold: "Kalendář",
        quickTitle: "Doporučené první kroky",
        quickSubtitle: "Začněte tím, co vám nejrychleji ukáže hodnotu programu.",
        primaryCtaLabel: "Otevřít kalendář",
        primaryCtaHref: "/portal/kalendar",
        sideBoxTitle: "Jak funguje demo",
        sideBoxText:
          "V demo režimu si můžete prohlédnout portál, program, síť učeben i složku Archiv. Po otevření archivu uvidíte jeho strukturu a informaci, že plný obsah je dostupný pro registrované organizace s aktivní licencí.",
        stats: [
          { value: "14 dní", label: "doporučená délka dema" },
          { value: "1", label: "ukázková hodina zdarma" },
          { value: "3", label: "nejbližší vysílání v přehledu" },
          { value: "demo", label: "režim organizace" },
        ],
        tiles: [
          {
            href: "/portal/kalendar",
            icon: "🗓️",
            title: "Kalendář programu",
            desc: "Podívejte se, jak vypadá program a jak se škola dostane k jednotlivým vstupům.",
            cta: "Otevřít",
            highlight: true,
            note: "Začněte zde",
          },
          {
            href: "/portal/archiv",
            icon: "📚",
            title: "Archiv",
            desc: "Uvidíte složku Archiv a její strukturu. Plné záznamy a navazující materiály jsou dostupné pro registrované organizace s aktivní licencí.",
            cta: "Otevřít",
            note: "Ukázka",
          },
          {
            href: "/portal/skoly",
            icon: "🏫",
            title: "Síť učeben",
            desc: "Prohlédněte si školy a obce, které už v síti ARCHIMEDES fungují.",
            cta: "Otevřít",
          },
          {
            href: "/poptavka",
            icon: "🎓",
            title: "Ukázková hodina",
            desc: "Požádejte o ukázkovou hodinu zdarma pro vaši školu nebo obec.",
            cta: "Požádat",
          },
          {
            href: "/poptavka",
            icon: "🔓",
            title: "Plná licence",
            desc: "Aktivujte plný přístup do programu, záznamů a dalších částí portálu.",
            cta: "Aktivovat",
          },
        ],
      };
    }

    if (licenseMode === "expired") {
      return {
        badge: "ARCHIMEDES Live • omezený režim",
        heroTitleLine1: "Přístup je nyní",
        heroTitleLine2: "v omezeném režimu",
        heroText: `Portál${orgLabel} zůstává dostupný v omezeném rozsahu. Pro pokračování v plném programu je potřeba aktivovat licenci organizace.`,
        tipBold: "Aktivace licence",
        quickTitle: "Další doporučený krok",
        quickSubtitle: "Obnovte plný přístup pro školu nebo obec.",
        primaryCtaLabel: "Aktivovat licenci",
        primaryCtaHref: "/poptavka",
        sideBoxTitle: "Co dál",
        sideBoxText:
          "Po obnovení licence získáte znovu plný přístup do programu, záznamů i dalších částí portálu.",
        stats: [
          { value: "omezeně", label: "režim portálu" },
          { value: "1", label: "doporučený další krok" },
          { value: "3", label: "nejbližší vysílání v přehledu" },
          { value: "0", label: "plných licencí aktivních v tomto režimu" },
        ],
        tiles: [
          {
            href: "/poptavka",
            icon: "🔓",
            title: "Aktivovat licenci",
            desc: "Kontaktujte EduVision a obnovte plný přístup pro organizaci.",
            cta: "Aktivovat",
            highlight: true,
            note: "Doporučeno",
          },
          {
            href: "/portal/skoly",
            icon: "🏫",
            title: "Síť učeben",
            desc: "Inspirace z praxe a přehled již zapojených škol a obcí.",
            cta: "Otevřít",
          },
          {
            href: "/portal/kalendar",
            icon: "🗓️",
            title: "Kalendář",
            desc: "Základní přehled programu a další orientace v portálu.",
            cta: "Otevřít",
          },
          {
            href: "/poptavka",
            icon: "📞",
            title: "Domluvit další postup",
            desc: "Ozvěte se nám a připravíme další krok pro vaši organizaci.",
            cta: "Kontaktovat",
          },
        ],
      };
    }

    if (licenseMode === "suspended") {
      return {
        badge: "ARCHIMEDES Live • přístup pozastaven",
        heroTitleLine1: "Přístup organizace je",
        heroTitleLine2: "dočasně pozastaven",
        heroText: `Portál${orgLabel} je dočasně pozastaven. Pro další postup kontaktujte EduVision.`,
        tipBold: "Kontakt s EduVision",
        quickTitle: "Co můžete udělat teď",
        quickSubtitle: "Nejrychlejší cesta k obnovení přístupu.",
        primaryCtaLabel: "Kontaktovat EduVision",
        primaryCtaHref: "/poptavka",
        sideBoxTitle: "Obnovení přístupu",
        sideBoxText:
          "Jakmile bude přístup obnoven, organizace se vrátí do běžného provozu.",
        stats: [
          { value: "pauza", label: "stav přístupu" },
          { value: "1", label: "doporučený další krok" },
          { value: "0", label: "plný obsah v tomto režimu" },
          { value: "info", label: "dostupný režim portálu" },
        ],
        tiles: [
          {
            href: "/poptavka",
            icon: "📞",
            title: "Kontaktovat EduVision",
            desc: "Ozvěte se nám a společně nastavíme další postup.",
            cta: "Kontaktovat",
            highlight: true,
            note: "Doporučeno",
          },
          {
            href: "/portal/skoly",
            icon: "🏫",
            title: "Síť učeben",
            desc: "Přehled škol a obcí zapojených do sítě ARCHIMEDES.",
            cta: "Otevřít",
          },
          {
            href: "/portal/kalendar",
            icon: "🗓️",
            title: "Kalendář",
            desc: "Základní orientace v programu a veřejně dostupných částech portálu.",
            cta: "Otevřít",
          },
          {
            href: "/poptavka",
            icon: "✉️",
            title: "Napsat zprávu",
            desc: "Pošlete nám informaci a navážeme na další krok.",
            cta: "Odeslat",
          },
        ],
      };
    }

    return {
      badge: "ARCHIMEDES Live • organizace",
      heroTitleLine1: "Vaše pracovní plocha",
      heroTitleLine2: "pro živý program",
      heroText: `Tady najdete přístup k programu, záznamům, spolupráci i síti učeben${orgLabel}.`,
      tipBold: "Kalendář",
      quickTitle: "Rychlý přístup",
      quickSubtitle: "Nejrychlejší cesta k programu a dalším sekcím portálu.",
      primaryCtaLabel: "Otevřít kalendář",
      primaryCtaHref: "/portal/kalendar",
      sideBoxTitle: "Doporučený další krok",
      sideBoxText:
        "Začněte kalendářem a podle potřeby přejděte do dalších sekcí portálu.",
      stats: [
        { value: "1", label: "místo pro vstup do programu" },
        { value: "3", label: "nejbližší vysílání v přehledu" },
        { value: "4", label: "hlavní sekce rychlého přístupu" },
        { value: "24/7", label: "přístup pro registrované" },
      ],
      tiles: [
        {
          href: "/portal/kalendar",
          icon: "🗓️",
          title: "Kalendář",
          desc: "Přehled vysílání, detail programu a nejsnazší vstup do živého obsahu.",
          cta: "Otevřít",
          highlight: true,
          note: "Doporučeno",
        },
        {
          href: "/portal/archiv",
          icon: "📚",
          title: "Archiv",
          desc: "Záznamy, materiály a další obsah, ke kterému se můžete vracet.",
          cta: "Otevřít",
        },
        {
          href: "/portal/inzerce",
          icon: "📌",
          title: "Inzerce",
          desc: "Nabídky, poptávky a partnerství mezi členy sítě.",
          cta: "Otevřít",
        },
        {
          href: "/portal/skoly",
          icon: "🏫",
          title: "Síť učeben",
          desc: "Přehled škol s učebnou ARCHIMEDES, inspirace z praxe a kontakty.",
          cta: "Otevřít",
        },
      ],
    };
  }

  if (type === "individual") {
    return {
      badge: "ARCHIMEDES Live • jednotlivec",
      heroTitleLine1: "Vaše pracovní plocha",
      heroTitleLine2: "pro osobní přístup",
      heroText:
        "Tady najdete živý program, záznamy, komunitní obsah a další sekce, které můžete využívat i bez organizace.",
      tipBold: "Kalendář",
      quickTitle: "Rychlý přístup",
      quickSubtitle: "Nejrychlejší cesta k programu, záznamům a dalšímu obsahu.",
      primaryCtaLabel: "Otevřít kalendář",
      primaryCtaHref: "/portal/kalendar",
      sideBoxTitle: "Doporučený další krok",
      sideBoxText:
        "Začněte kalendářem a poté projděte archiv. Pokud vás zaujme síť učeben nebo spolupráce, pokračujte do inzerce.",
      stats: [
        { value: "1", label: "místo pro vstup do programu" },
        { value: "3", label: "nejbližší vysílání v přehledu" },
        { value: "4", label: "hlavní sekce rychlého přístupu" },
        { value: "24/7", label: "přístup pro registrované" },
      ],
      tiles: [
        {
          href: "/portal/kalendar",
          icon: "🗓️",
          title: "Kalendář",
          desc: "Přehled vysílání, detail programu a nejsnazší vstup do živého obsahu.",
          cta: "Otevřít",
          highlight: true,
          note: "Doporučeno",
        },
        {
          href: "/portal/archiv",
          icon: "📚",
          title: "Archiv",
          desc: "Záznamy, materiály a další obsah, ke kterému se můžete vracet.",
          cta: "Otevřít",
        },
        {
          href: "/portal/inzerce",
          icon: "📌",
          title: "Inzerce",
          desc: "Nabídky, poptávky a partnerství mezi členy sítě.",
          cta: "Otevřít",
        },
        {
          href: "/portal/skoly",
          icon: "🏫",
          title: "Síť učeben",
          desc: "Přehled škol s učebnou ARCHIMEDES, inspirace z praxe a kontakty.",
          cta: "Otevřít",
        },
      ],
    };
  }

  return {
    badge: "ARCHIMEDES Live",
    heroTitleLine1: "Vaše pracovní plocha",
    heroTitleLine2: "pro živý program",
    heroText:
      "Tady najdete nejrychlejší přístup do programu, archivu, inzerce i sítě učeben. Nejčastěji budete pracovat s kalendářem vysílání a navazujícími materiály.",
    tipBold: "Kalendář",
    quickTitle: "Rychlý přístup",
    quickSubtitle: "Nejrychlejší cesta k tomu, co budete používat nejčastěji.",
    primaryCtaLabel: "Otevřít kalendář",
    primaryCtaHref: "/portal/kalendar",
    sideBoxTitle: "Doporučený další krok",
    sideBoxText:
      "Začněte kalendářem. Odtud se nejrychleji dostanete k živému programu a následně i k dalším sekcím portálu.",
    stats: [
      { value: "1", label: "místo pro vstup do programu" },
      { value: "3", label: "nejbližší vysílání v přehledu" },
      { value: "4", label: "hlavní sekce rychlého přístupu" },
      { value: "24/7", label: "přístup pro registrované" },
    ],
    tiles: [
      {
        href: "/portal/kalendar",
        icon: "🗓️",
        title: "Kalendář",
        desc: "Přehled vysílání, detail programu a nejsnazší vstup do živého obsahu.",
        cta: "Otevřít",
        highlight: true,
        note: "Doporučeno",
      },
      {
        href: "/portal/archiv",
        icon: "📚",
        title: "Archiv",
        desc: "Záznamy, materiály a pracovní listy. Postupně zde bude přibývat další obsah.",
        cta: "Otevřít",
      },
      {
        href: "/portal/inzerce",
        icon: "📌",
        title: "Inzerce",
        desc: "Nabídky, poptávky a partnerství mezi školami, obcemi a dalšími členy sítě.",
        cta: "Otevřít",
      },
      {
        href: "/portal/skoly",
        icon: "🏫",
        title: "Síť učeben",
        desc: "Přehled škol s učebnou ARCHIMEDES, inspirace z praxe a kontakty.",
        cta: "Otevřít",
      },
    ],
  };
}

function LicenseBanner({
  mode,
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  const config =
    mode === "trial"
      ? {
          bg: "linear-gradient(180deg, #fffdf6 0%, #fffaf0 100%)",
          border: "1px solid #f5d9a8",
          badgeBg: "#fff2cc",
          badgeColor: "#8a5a00",
        }
      : mode === "expired"
      ? {
          bg: "linear-gradient(180deg, #fff8f8 0%, #fff3f3 100%)",
          border: "1px solid #f2c9c9",
          badgeBg: "#ffe3e3",
          badgeColor: "#9f1d1d",
        }
      : {
          bg: "linear-gradient(180deg, #f8f9ff 0%, #f3f5ff 100%)",
          border: "1px solid #d8def8",
          badgeBg: "#e9edff",
          badgeColor: "#3646a3",
        };

  return (
    <section
      style={{
        background: config.bg,
        border: config.border,
        borderRadius: 24,
        padding: 18,
        marginBottom: 18,
        boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 560px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              background: config.badgeBg,
              color: config.badgeColor,
              fontSize: 12,
              fontWeight: 900,
              marginBottom: 10,
            }}
          >
            {mode === "trial"
              ? "Demo režim"
              : mode === "expired"
              ? "Licence vypršela"
              : "Přístup pozastaven"}
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.08,
              color: "#0f172a",
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 15,
              lineHeight: 1.6,
              color: "rgba(15,23,42,0.74)",
              maxWidth: 850,
            }}
          >
            {text}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {primaryHref ? (
            <Link
              href={primaryHref}
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: 14,
                background: "#0f172a",
                color: "white",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {primaryLabel}
            </Link>
          ) : null}

          {secondaryHref ? (
            <Link
              href={secondaryHref}
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: 14,
                background: "white",
                color: "#0f172a",
                border: "1px solid rgba(15,23,42,0.12)",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, label }) {
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
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.68)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Tile({ href, icon, title, desc, cta = "Otevřít", highlight, note, large = false }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "#0f172a",
        borderRadius: 20,
        border: highlight ? "2px solid rgba(15,23,42,0.92)" : "1px solid rgba(15,23,42,0.10)",
        background: highlight ? "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)" : "white",
        padding: large ? 18 : 16,
        boxShadow: highlight
          ? "0 16px 36px rgba(15,23,42,0.08)"
          : "0 10px 28px rgba(15,23,42,0.05)",
        minHeight: large ? 210 : 190,
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
        <div
          style={{
            width: large ? 52 : 46,
            height: large ? 52 : 46,
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.03)",
            fontSize: large ? 24 : 22,
            flex: "0 0 auto",
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                fontWeight: 900,
                lineHeight: 1.15,
                fontSize: large ? 18 : 16,
              }}
            >
              {title}
            </div>

            {note ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: highlight ? "#0f172a" : "rgba(15,23,42,0.06)",
                  color: highlight ? "white" : "#0f172a",
                  whiteSpace: "nowrap",
                }}
              >
                {note}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "calc(100% - 64px)",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {desc ? (
            <div
              style={{
                fontSize: large ? 15 : 14,
                opacity: 0.76,
                lineHeight: 1.5,
              }}
            >
              {desc}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-start",
            padding: "11px 14px",
            borderRadius: 14,
            background: highlight ? "#0f172a" : "rgba(15,23,42,0.06)",
            color: highlight ? "white" : "#0f172a",
            fontWeight: 900,
            fontSize: 14,
            whiteSpace: "nowrap",
          }}
        >
          {cta}
        </div>
      </div>
    </Link>
  );
}

function EventRow({ e }) {
  const title = e?.title || "—";
  const dt = formatDateTimeCS(e?.starts_at);
  const cat = e?.category ? String(e.category) : "";
  const desc = stripHtml(e?.full_description || "");
  const short = desc ? (desc.length > 115 ? desc.slice(0, 115) + "…" : desc) : "";

  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 16,
            lineHeight: 1.25,
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "rgba(15,23,42,0.70)",
            marginTop: 5,
            lineHeight: 1.45,
          }}
        >
          {dt}
          {cat ? <span style={{ marginLeft: 8 }}>• {cat}</span> : null}
        </div>

        {short ? (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "rgba(15,23,42,0.72)",
              lineHeight: 1.5,
            }}
          >
            {short}
          </div>
        ) : null}
      </div>

      <Link
        href="/portal/kalendar"
        style={{
          textDecoration: "none",
          padding: "11px 14px",
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.18)",
          background: "#0f172a",
          color: "white",
          fontWeight: 900,
          whiteSpace: "nowrap",
          flex: "0 0 auto",
        }}
      >
        Otevřít
      </Link>
    </div>
  );
}

function OnboardingStep({ number, title, text, actionHref, actionLabel, footer }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 10px 28px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          background: "#0f172a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 15,
          marginBottom: 12,
        }}
      >
        {number}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          lineHeight: 1.2,
          color: "#0f172a",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(15,23,42,0.72)",
        }}
      >
        {text}
      </div>

      {footer || null}

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          style={{
            marginTop: 14,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 14px",
            borderRadius: 14,
            background: "#0f172a",
            color: "white",
            fontWeight: 900,
          }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
