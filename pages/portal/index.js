// pages/portal/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import JoinBroadcastButton from "../../components/JoinBroadcastButton";
import { getEventStart, getJoinButtonState } from "../../lib/broadcastState";
import { supabase } from "../../lib/supabaseClient";

const POSTERS_BUCKET = "posters";
const FALLBACK_POSTER = "/ucebna-exterier.webp";

const DEMO_FEATURED_VIDEO = {
  title: "Ukázka živého vstupu do výuky",
  subtitle: "ZOO Praha – host ve školním programu ARCHIMEDES Live",
  src: "https://www.youtube.com/embed/yvelfGeL6Jg",
};

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

function formatTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPosterUrl(event) {
  if (!event) return FALLBACK_POSTER;
  if (event.poster_url) return event.poster_url;

  const path = event.poster_path || "";
  if (!path) return FALLBACK_POSTER;

  const { data } = supabase.storage.from(POSTERS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || FALLBACK_POSTER;
}

function createCalendarHref(event) {
  const start = safeDate(event?.starts_at);
  if (!start) return "/portal/kalendar";

  const end = new Date(start.getTime() + 45 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const title = encodeURIComponent(event?.title || "ARCHIMEDES Live vysílání");
  const details = encodeURIComponent(stripHtml(event?.full_description || ""));
  const dates = `${fmt(start)}/${fmt(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
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

  const [licenseValidUntil, setLicenseValidUntil] = useState(null);
  const [licenseMode, setLicenseMode] = useState("default");

  useEffect(() => {
    let alive = true;

    async function loadPortalData() {
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error && alive) setIsAdmin(!!data);
      } catch (_e) {
        // no-op
      } finally {
        if (alive) setCheckingAdmin(false);
      }

      try {
        setEventsErr("");
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
          .from("events")
          .select(`
            id,
            title,
            starts_at,
            category,
            full_description,
            stream_url,
            poster_url,
            poster_path,
            is_published,
            broadcast_sessions (
              id,
              event_id,
              status,
              viewer_url,
              starts_at
            )
          `)
          .eq("is_published", true)
          .gt("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(3);

        if (!alive) return;

        if (error) setEventsErr(error.message);
        else setNextEvents(data || []);
      } catch (e) {
        if (alive) {
          setEventsErr(e?.message || "Nepodařilo se načíst nejbližší vysílání.");
        }
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!alive) return;

        if (!user) {
          setMembershipRole("");
          setOrganizationName("");
          setOrganizationCode("");
          setLicenseValidUntil(null);
          setDashboardType("default");
          setLicenseMode("default");
          setLoadingProfileType(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, user_type, active_organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!alive) return;

        let membership = null;
        let resolvedOrganizationId = null;

        if (profile?.active_organization_id) {
          const { data: membershipByActiveOrg, error: membershipByActiveOrgError } =
            await supabase
              .from("organization_members")
              .select("organization_id, status, role_in_org")
              .eq("user_id", user.id)
              .eq("organization_id", profile.active_organization_id)
              .eq("status", "active")
              .maybeSingle();

          if (membershipByActiveOrgError) throw membershipByActiveOrgError;
          if (!alive) return;

          if (membershipByActiveOrg?.organization_id) {
            membership = membershipByActiveOrg;
            resolvedOrganizationId = membershipByActiveOrg.organization_id;
          }
        }

        if (!membership) {
          const { data: fallbackMembership, error: fallbackMembershipError } =
            await supabase
              .from("organization_members")
              .select("organization_id, status, role_in_org")
              .eq("user_id", user.id)
              .eq("status", "active")
              .order("organization_id", { ascending: true })
              .limit(1)
              .maybeSingle();

          if (fallbackMembershipError) throw fallbackMembershipError;
          if (!alive) return;

          if (fallbackMembership?.organization_id) {
            membership = fallbackMembership;
            resolvedOrganizationId = fallbackMembership.organization_id;
          }
        }

        if (membership?.organization_id && resolvedOrganizationId) {
          const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("id, name, join_code, license_status, license_valid_until")
            .eq("id", resolvedOrganizationId)
            .maybeSingle();

          if (orgError) throw orgError;
          if (!alive) return;

          const roleInOrg = membership?.role_in_org || "";
          setMembershipRole(roleInOrg);
          setOrganizationName(org?.name || "");
          setOrganizationCode(org?.join_code || "");
          setLicenseValidUntil(org?.license_valid_until || null);
          setLicenseMode(resolveLicenseMode(org));

          if (roleInOrg === "demo_viewer") setDashboardType("demo_viewer");
          else setDashboardType("organization");

          setLoadingProfileType(false);
          return;
        }

        if (profile?.user_type === "individual") {
          setMembershipRole("");
          setOrganizationName("");
          setOrganizationCode("");
          setLicenseValidUntil(null);
          setDashboardType("individual");
          setLicenseMode("active");
        } else {
          setMembershipRole("");
          setOrganizationName("");
          setOrganizationCode("");
          setLicenseValidUntil(null);
          setDashboardType("default");
          setLicenseMode("default");
        }
      } catch (_e) {
        if (alive) {
          setMembershipRole("");
          setOrganizationName("");
          setOrganizationCode("");
          setLicenseValidUntil(null);
          setDashboardType("default");
          setLicenseMode("default");
        }
      } finally {
        if (alive) setLoadingProfileType(false);
      }
    }

    loadPortalData();

    return () => {
      alive = false;
    };
  }, []);

  const hasEvents = nextEvents && nextEvents.length > 0;
  const featuredEvent = hasEvents ? nextEvents[0] : null;
  const otherEvents = hasEvents ? nextEvents.slice(1) : [];

  const isDemoViewer =
    dashboardType === "demo_viewer" && membershipRole === "demo_viewer";

  const dashboard = useMemo(
    () =>
      getDashboardConfig(
        dashboardType,
        organizationName,
        licenseMode,
        licenseValidUntil
      ),
    [dashboardType, organizationName, licenseMode, licenseValidUntil]
  );

  const showGettingStarted =
    !loadingProfileType &&
    !!organizationName &&
    dashboardType === "organization" &&
    membershipRole === "organization_admin";

  const showAdminSection = !isDemoViewer && isAdmin;

  const showTrialBanner =
    dashboardType === "organization" && licenseMode === "trial";
  const showExpiredBanner =
    (dashboardType === "organization" || dashboardType === "demo_viewer") &&
    licenseMode === "expired";
  const showSuspendedBanner =
    (dashboardType === "organization" || dashboardType === "demo_viewer") &&
    licenseMode === "suspended";

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

      <div className="portal-page">
        <div className="portal-wrap">
          {isDemoViewer ? (
            <DemoFeaturedSection
              organizationName={organizationName}
              validUntil={licenseValidUntil}
            />
          ) : null}

          {showTrialBanner ? (
            <LicenseBanner
              mode="trial"
              title="ARCHIMEDES Live – ukázkový přístup"
              text={
                <>
                  Vaše organizace{organizationName ? ` ${organizationName}` : ""} má aktivní
                  ukázkový přístup. Můžete si projít portál, podívat se na program a připravit si další krok
                  pro zapojení školy.
                </>
              }
              primaryHref="/start"
              primaryLabel="Chci balíček START"
              secondaryHref="/portal/kalendar"
              secondaryLabel="Otevřít program"
            />
          ) : null}

          {showExpiredBanner ? (
            <LicenseBanner
              mode="expired"
              title="Ukázkový přístup skončil"
              text={
                <>
                  Přístup organizace{organizationName ? ` ${organizationName}` : ""} je nyní v
                  omezeném režimu. Pro pokračování v programu kontaktujte EduVision a vyberte
                  vhodnou variantu zapojení školy.
                </>
              }
              primaryHref="/start"
              primaryLabel="Chci balíček START"
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

          {!loadingProfileType && featuredEvent ? (
            <TeacherJoinHero event={featuredEvent} />
          ) : null}

          {showGettingStarted ? (
            <section className="card start-card">
              <div className="start-head">
                <div>
                  <div className="pill">Začínáme</div>
                  <h2>Jak zapojit školu do portálu</h2>
                  <p>
                    Jste správce organizace{organizationName ? ` pro ${organizationName}` : ""}.
                    Níže je doporučený postup, jak připojit další učitele a rychle začít.
                  </p>
                </div>

                <div className="org-code-box">
                  <div className="org-label">Kód školy / organizace</div>
                  <div className="org-code-row">
                    <div className="org-code">{organizationCode || "Kód není k dispozici"}</div>
                    <button onClick={handleCopyOrganizationCode} disabled={!organizationCode}>
                      {copiedCode ? "Zkopírováno" : "Kopírovat"}
                    </button>
                  </div>
                  <p>
                    Tento kód pošlete učitelům. Po registraci zvolí možnost{" "}
                    <b>Připojit se ke stávající organizaci</b>.
                  </p>
                </div>
              </div>

              <div className="onboarding-grid">
                <OnboardingStep
                  number="1"
                  title="Pošlete učitelům přístup"
                  text="Pošlete jim odkaz na přihlášení a kód školy. To je nejrychlejší způsob zapojení více lidí najednou."
                  footer={
                    <div className="login-note">
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
                  title="Začněte programem"
                  text="Nejrychlejší vstup do programu je přes kalendář. Odtud se dostanete k živému vysílání i detailu tématu."
                  actionHref="/portal/kalendar"
                  actionLabel="Otevřít program"
                />

                <OnboardingStep
                  number="4"
                  title="Spravujte uživatele"
                  text="Na stránce Uživatelé uvidíte aktivní členy školy. Jednotlivé e-mailové pozvánky používejte jen tehdy, když je to potřeba."
                  actionHref="/portal/uzivatele"
                  actionLabel="Otevřít uživatele"
                />
              </div>
            </section>
          ) : null}

          <div className="portal-grid">
            <section className="card quick-card">
              <div className="section-head">
                <div>
                  <h2>{dashboard.quickTitle}</h2>
                  <p>{dashboard.quickSubtitle}</p>
                </div>

                <Link href={dashboard.primaryCtaHref} className="dark-btn">
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

            <aside className="card events-card">
              <div className="events-head">
                <div>
                  <h2>Nejbližší další vysílání</h2>
                </div>
                <div className="max-pill">max. 3</div>
              </div>

              {eventsErr ? <div className="error-box">Chyba: {eventsErr}</div> : null}

              {!eventsErr && !hasEvents ? (
                <div className="empty-box">Zatím nejsou naplánované publikované události.</div>
              ) : null}

              {hasEvents ? (
                <div className="events-list">
                  {(otherEvents.length ? otherEvents : nextEvents).map((e) => (
                    <EventRow key={e.id} e={e} />
                  ))}
                </div>
              ) : null}
            </aside>
          </div>

          {showAdminSection ? (
            <section className="card admin-card">
              <div className="admin-head">
                <h2>Administrace</h2>
                <span>vidí jen správci portálu</span>
              </div>

              {checkingAdmin ? (
                <div className="empty-box">Načítám práva…</div>
              ) : isAdmin ? (
                <div className="tiles-grid admin-grid">
                  <Tile href="/portal/admin-udalosti/novy" icon="➕" title="Nová událost" desc="Rychlé založení nového vysílání nebo akce do programu." cta="Vytvořit" />
                  <Tile href="/portal/admin-udalosti" icon="🛠️" title="Správa vysílání" desc="Vkládání, úpravy, odkazy na vysílání, záznamy a publikace." cta="Otevřít" />
                  <Tile href="/portal/archiv" icon="📁" title="Archiv" desc="Kontrola záznamů, návazných materiálů a výsledného zobrazení pro uživatele." cta="Otevřít" />
                  <Tile href="/portal/admin-inzerce" icon="✅" title="Inzerce" desc="Moderace, TOP, ARCHIMEDES a správa příspěvků." cta="Otevřít" />
                  <Tile href="/portal/admin-poptavky" icon="📨" title="Poptávky" desc="Přehled leadů a export do CSV." cta="Otevřít" />
                  <Tile href="/portal/admin-skoly" icon="🏫" title="Školy" desc="Správa databáze učeben, fotek, kontaktů a publikace." cta="Otevřít" />
                </div>
              ) : (
                <div className="empty-box">Administrace je dostupná jen správcům portálu.</div>
              )}
            </section>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .portal-page {
          background: #f6f7fb;
          min-height: 100vh;
        }

        .portal-wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 16px 54px;
        }

        .card {
          background: white;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.04);
        }

        .portal-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.78fr);
          gap: 18px;
          align-items: start;
          margin-top: 18px;
        }

        .quick-card,
        .events-card,
        .admin-card,
        .start-card {
          padding: 18px;
        }

        .section-head,
        .events-head,
        .admin-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        h2 {
          margin: 0;
          color: #0f172a;
          font-size: 26px;
          line-height: 1.08;
          letter-spacing: -0.03em;
          font-weight: 950;
        }

        p {
          margin: 6px 0 0;
          color: rgba(15, 23, 42, 0.66);
          font-size: 14px;
          line-height: 1.55;
        }

        .dark-btn {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 16px;
          border-radius: 13px;
          background: #0f172a;
          color: white;
          font-weight: 900;
          white-space: nowrap;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14);
        }

        .tiles-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .admin-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .max-pill,
        .pill,
        .admin-head span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.06);
          color: rgba(15, 23, 42, 0.72);
          font-size: 12px;
          font-weight: 900;
          padding: 6px 10px;
          white-space: nowrap;
        }

        .events-list {
          display: grid;
          gap: 10px;
        }

        .empty-box {
          padding: 14px;
          border-radius: 16px;
          border: 1px dashed rgba(15, 23, 42, 0.18);
          background: rgba(15, 23, 42, 0.02);
          color: rgba(15, 23, 42, 0.72);
          font-size: 14px;
          line-height: 1.55;
        }

        .error-box {
          margin-top: 12px;
          background: #fff3f3;
          border: 1px solid #ffd0d0;
          padding: 14px;
          border-radius: 14px;
          color: #8a1f1f;
          white-space: pre-wrap;
        }

        .start-card {
          margin-bottom: 18px;
        }

        .start-head {
          display: flex;
          gap: 14px;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .start-head > div:first-child {
          flex: 1 1 520px;
          min-width: 0;
        }

        .org-code-box {
          min-width: 280px;
          flex: 0 1 360px;
          background: white;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
        }

        .org-label {
          font-size: 13px;
          font-weight: 900;
          color: rgba(15, 23, 42, 0.64);
          margin-bottom: 8px;
        }

        .org-code-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .org-code {
          flex: 1 1 180px;
          min-height: 48px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.1);
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
        }

        .org-code-row button {
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          border-radius: 14px;
          background: #0f172a;
          color: white;
          font-weight: 900;
          white-space: nowrap;
        }

        .org-code-row button:disabled {
          cursor: not-allowed;
          background: rgba(15, 23, 42, 0.16);
        }

        .onboarding-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .login-note {
          margin-top: 10px;
          padding: 12px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.08);
          font-size: 13px;
          line-height: 1.55;
          color: #0f172a;
        }

        .admin-card {
          margin-top: 18px;
        }

        @media (max-width: 1080px) {
          .portal-grid {
            grid-template-columns: 1fr;
          }

          .tiles-grid,
          .admin-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .portal-wrap {
            padding: 16px 12px 42px;
          }

          .quick-card,
          .events-card,
          .admin-card,
          .start-card {
            padding: 14px;
            border-radius: 20px;
          }

          .tiles-grid,
          .admin-grid,
          .onboarding-grid {
            grid-template-columns: 1fr;
          }

          .dark-btn {
            width: 100%;
          }

          h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </RequireAuth>
  );
}

function TeacherJoinHero({ event }) {
  const start = getEventStart(event);
  const joinState = getJoinButtonState(event);
  const title = event?.title || "Nejbližší vysílání";
  const date = start ? formatDateCS(start) : "Termín připravujeme";
  const time = start ? formatTimeCS(start) : "";
  const cat = event?.category ? String(event.category) : "";
  const desc = stripHtml(event?.full_description || "");
  const short = desc
    ? desc.length > 155
      ? desc.slice(0, 155) + "…"
      : desc
    : "Přehled nejbližšího vysílání. Tady má učitel nejrychlejší cestu k připojení.";
  const posterUrl = getPosterUrl(event);
  const calendarHref = createCalendarHref(event);

  return (
    <section className="teacher-hero">
      <div className="hero-top-label">
        {joinState.state === "join"
          ? "NEJBLIŽŠÍ / PRÁVĚ PROBÍHAJÍCÍ VYSÍLÁNÍ"
          : "NEJBLIŽŠÍ VYSÍLÁNÍ"}
      </div>

      <div className="hero-grid">
        <Link href={`/portal/udalost/${event?.id}`} className="hero-poster">
          <img src={posterUrl} alt={title} />
        </Link>

        <div className="hero-content">
          <h1>{title}</h1>

          <div className="meta-row">
            <span>📅 {date}</span>
            {time ? <span>🕘 {time}</span> : null}
            {cat ? <span className="category-pill">{cat}</span> : null}
          </div>

          <p>{short}</p>

          <div className="hero-actions">
            <JoinBroadcastButton
              event={event}
              fullWidth={false}
              detailHref={`/portal/udalost/${event?.id}`}
            />

            <a
              href={calendarHref}
              target="_blank"
              rel="noreferrer"
              className="calendar-btn"
            >
              📅 Přidat do kalendáře
            </a>
          </div>
        </div>

        <div className="help-panel">
          <h3>Jak se připojit?</h3>

          <div className="help-list">
            <div><span>✓</span><p>Připojení je možné 15 minut před začátkem.</p></div>
            <div><span>✓</span><p>Klikněte na „Vstoupit do vysílání“.</p></div>
            <div><span>✓</span><p>Otevře se okno Google Meet.</p></div>
            <div><span>✓</span><p>Připojte se se zapnutým mikrofonem a kamerou.</p></div>
          </div>

          <div className="help-footer">
            <b>Potřebujete pomoc?</b>
            <Link href="/portal/napoveda">Nápověda ↗</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .teacher-hero {
          background: white;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 18px;
          box-shadow: 0 18px 46px rgba(15, 23, 42, 0.06);
        }

        .hero-top-label {
          margin-bottom: 14px;
          color: #00843d;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 0.02em;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: minmax(280px, 430px) minmax(0, 1fr) minmax(230px, 250px);
          gap: 30px;
          align-items: center;
        }

        .hero-poster {
          display: block;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16 / 10.5;
          background: #e2e8f0;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
        }

        .hero-poster img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-content {
          min-width: 0;
        }

        .hero-content h1 {
          margin: 0;
          color: #0f172a;
          font-size: 31px;
          line-height: 1.07;
          letter-spacing: -0.035em;
          font-weight: 950;
        }

        .meta-row {
          margin-top: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          color: #475569;
          font-size: 14px;
          font-weight: 800;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 9px;
          background: #d9f7e6;
          color: #00843d;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .hero-content p {
          margin: 18px 0 0;
          color: #475569;
          font-size: 15px;
          line-height: 1.55;
          max-width: 620px;
        }

        .hero-actions {
          margin-top: 34px;
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .calendar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 20px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: white;
          color: #0f172a;
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
          white-space: nowrap;
        }

        .help-panel {
          background: linear-gradient(180deg, #eefaf4 0%, #f8fffb 100%);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(0, 132, 61, 0.08);
        }

        .help-panel h3 {
          margin: 0;
          padding: 18px 18px 8px;
          color: #00843d;
          font-size: 15px;
          font-weight: 950;
        }

        .help-list {
          display: grid;
          gap: 13px;
          padding: 10px 18px 18px;
        }

        .help-list div {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 10px;
          align-items: flex-start;
        }

        .help-list span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 999px;
          border: 1.5px solid #00843d;
          color: #00843d;
          font-size: 11px;
          font-weight: 950;
          margin-top: 1px;
        }

        .help-list p {
          margin: 0;
          color: #334155;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 650;
        }

        .help-footer {
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          padding: 14px 18px;
          color: #0f172a;
          font-size: 13px;
          line-height: 1.45;
        }

        .help-footer b {
          display: block;
          margin-bottom: 3px;
        }

        .help-footer a {
          color: #00843d;
          text-decoration: none;
          font-weight: 900;
        }

        @media (max-width: 1100px) {
          .hero-grid {
            grid-template-columns: 320px minmax(0, 1fr);
          }

          .help-panel {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .teacher-hero {
            padding: 14px;
            border-radius: 20px;
          }

          .hero-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .hero-content h1 {
            font-size: 28px;
          }

          .hero-actions {
            margin-top: 22px;
          }

          .calendar-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

function EventRow({ e }) {
  const title = e?.title || "—";
  const dt = formatDateTimeCS(e?.starts_at);
  const cat = e?.category ? String(e.category) : "";
  const posterUrl = getPosterUrl(e);

  return (
    <Link href={`/portal/udalost/${e?.id}`} className="event-row">
      <div className="event-thumb">
        <img src={posterUrl} alt={title} />
      </div>

      <div className="event-info">
        <div className="event-title">{title}</div>
        <div className="event-meta">
          {dt}
          {cat ? <span> • {cat}</span> : null}
        </div>
      </div>

      <div className="event-arrow">›</div>

      <style jsx>{`
        .event-row {
          display: grid;
          grid-template-columns: 66px minmax(0, 1fr) 18px;
          gap: 12px;
          align-items: center;
          padding: 8px 0;
          color: #0f172a;
          text-decoration: none;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .event-row:last-child {
          border-bottom: none;
        }

        .event-thumb {
          width: 66px;
          height: 66px;
          border-radius: 9px;
          overflow: hidden;
          background: #e2e8f0;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .event-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .event-info {
          min-width: 0;
        }

        .event-title {
          font-size: 14px;
          line-height: 1.25;
          font-weight: 950;
          color: #0f172a;
        }

        .event-meta {
          margin-top: 6px;
          font-size: 13px;
          line-height: 1.3;
          color: #334155;
          font-weight: 700;
        }

        .event-arrow {
          color: #0f172a;
          font-size: 34px;
          line-height: 1;
          font-weight: 400;
          opacity: 0.9;
        }
      `}</style>
    </Link>
  );
}

function Tile({ href, icon, title, desc, cta = "Otevřít", highlight, note }) {
  return (
    <Link href={href} className={`tile ${highlight ? "highlight" : ""}`}>
      <div className="tile-top">
        <div className="tile-icon">{icon}</div>
        <div className="tile-title-wrap">
          <div className="tile-title">{title}</div>
          {note ? <span>{note}</span> : null}
        </div>
      </div>

      <p>{desc}</p>

      <div className="tile-arrow">→</div>

      <style jsx>{`
        .tile {
          min-height: 178px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 10px;
          background: white;
          padding: 14px;
          text-decoration: none;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
        }

        .tile.highlight {
          border: 2px solid rgba(15, 23, 42, 0.9);
        }

        .tile-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tile-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: #f8fafc;
          font-size: 22px;
          flex: 0 0 auto;
        }

        .tile-title-wrap {
          min-width: 0;
        }

        .tile-title {
          font-size: 15px;
          line-height: 1.15;
          font-weight: 950;
          color: #0f172a;
        }

        .tile-title-wrap span {
          display: inline-flex;
          margin-top: 4px;
          padding: 3px 8px;
          border-radius: 999px;
          background: #0f172a;
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        p {
          margin: 14px 0 0;
          color: rgba(15, 23, 42, 0.72);
          font-size: 13px;
          line-height: 1.5;
        }

        .tile-arrow {
          align-self: flex-end;
          font-size: 24px;
          font-weight: 900;
          line-height: 1;
          color: #0f172a;
        }
      `}</style>
    </Link>
  );
}

function OnboardingStep({ number, title, text, actionHref, actionLabel, footer }) {
  return (
    <div className="onboarding-step">
      <div className="num">{number}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {footer || null}

      {actionHref && actionLabel ? (
        <Link href={actionHref}>{actionLabel}</Link>
      ) : null}

      <style jsx>{`
        .onboarding-step {
          background: white;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
        }

        .num {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: #0f172a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          font-size: 15px;
          margin-bottom: 12px;
        }

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
          line-height: 1.2;
          color: #0f172a;
        }

        p {
          margin: 8px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(15, 23, 42, 0.72);
        }

        a {
          margin-top: 14px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 14px;
          background: #0f172a;
          color: white;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
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
              ? "Ukázkový režim"
              : mode === "expired"
              ? "Přístup skončil"
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

function DemoFeaturedSection({ organizationName }) {
  return (
    <section className="demo-section">
      <div className="demo-grid">
        <div>
          <div className="demo-pill">Ukázka pro ředitele školy</div>

          <h1>
            Podívejte se,
            <br />
            jak může škola pracovat s programem ARCHIMEDES Live
          </h1>

          <p>
            Tohle je ukázkové prostředí ARCHIMEDES Live
            {organizationName ? ` pro ${organizationName}` : ""}. Během několika minut
            si projdete program, archiv i další části portálu a uvidíte,
            jak vypadá živý vstup hosta do výuky.
          </p>

          <p>
            Nejde o technickou ukázku systému. Jde o rychlou a srozumitelnou představu,
            co může škola získat po zapojení do programu.
          </p>

          <div className="demo-actions">
            <Link href="/start">Chci balíček START pro naši školu</Link>
            <Link href="/poptavka">Chci celý program pro školu</Link>
          </div>
        </div>

        <div className="video-card">
          <div className="video-frame">
            <iframe
              width="100%"
              height="100%"
              src={DEMO_FEATURED_VIDEO.src}
              title={DEMO_FEATURED_VIDEO.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="video-text">
            <h3>{DEMO_FEATURED_VIDEO.title}</h3>
            <p>{DEMO_FEATURED_VIDEO.subtitle}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .demo-section {
          background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 28px;
          padding: 22px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
          margin-bottom: 18px;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: 1.02fr 1fr;
          gap: 22px;
          align-items: center;
        }

        .demo-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: #eef2ff;
          color: #1e3a8a;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.04;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        p {
          margin: 16px 0 0;
          font-size: 17px;
          line-height: 1.7;
          color: #334155;
          max-width: 700px;
        }

        .demo-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .demo-actions a {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 20px;
          border-radius: 14px;
          font-weight: 900;
        }

        .demo-actions a:first-child {
          background: #0f172a;
          color: white;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
        }

        .demo-actions a:last-child {
          background: #fff;
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.12);
        }

        .video-card {
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid #dbe3ef;
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.1);
        }

        .video-frame {
          aspect-ratio: 16 / 9;
          background: #dbe4f0;
        }

        iframe {
          display: block;
          width: 100%;
          height: 100%;
        }

        .video-text {
          padding: 18px;
        }

        .video-text h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 900;
          line-height: 1.3;
          color: #0f172a;
        }

        .video-text p {
          margin: 6px 0 0;
          font-size: 15px;
          line-height: 1.6;
          color: #64748b;
        }

        @media (max-width: 920px) {
          .demo-grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 34px;
          }
        }
      `}</style>
    </section>
  );
}

function getDashboardConfig(type, organizationName = "", licenseMode = "default") {
  const orgLabel = organizationName ? ` pro ${organizationName}` : "";

  if (type === "demo_viewer") {
    return {
      tipBold: "Program",
      quickTitle: "Co si projít dál v portálu",
      quickSubtitle: "Po zhlédnutí ukázky živého vstupu si projděte další části, které škola běžně používá.",
      primaryCtaLabel: "Otevřít program",
      primaryCtaHref: "/portal/kalendar",
      tiles: [
        {
          href: "/portal/kalendar",
          icon: "🗓️",
          title: "Program",
          desc: "Podívejte se, jak je přehledně uspořádaný program a jak se škola dostává k jednotlivým vstupům.",
          cta: "Otevřít",
          highlight: true,
          note: "Začněte zde",
        },
        {
          href: "/portal/archiv",
          icon: "📚",
          title: "Archiv",
          desc: "Uvidíte strukturu archivu a návaznost na výuku.",
          cta: "Otevřít",
        },
        {
          href: "/portal/skoly",
          icon: "🏫",
          title: "Síť učeben",
          desc: "Inspirace z praxe a přehled škol a obcí zapojených do sítě ARCHIMEDES.",
          cta: "Otevřít",
        },
        {
          href: "/start",
          icon: "🚀",
          title: "Balíček START",
          desc: "Nejrychlejší cesta, jak školu zapojit do programu.",
          cta: "Chci START",
          note: "Doporučeno",
        },
      ],
    };
  }

  if (type === "organization") {
    if (licenseMode === "trial") {
      return {
        tipBold: "Program",
        quickTitle: "Doporučené první kroky",
        quickSubtitle: `Začněte tím, co vám nejrychleji ukáže hodnotu programu pro školu${orgLabel}.`,
        primaryCtaLabel: "Otevřít program",
        primaryCtaHref: "/portal/kalendar",
        tiles: [
          {
            href: "/portal/kalendar",
            icon: "🗓️",
            title: "Program",
            desc: "Podívejte se, jak vypadá program a jak se škola dostane k jednotlivým vstupům.",
            cta: "Otevřít",
            highlight: true,
            note: "Začněte zde",
          },
          {
            href: "/portal/archiv",
            icon: "📚",
            title: "Archiv",
            desc: "Uvidíte strukturu archivu a návazné materiály.",
            cta: "Otevřít",
          },
          {
            href: "/portal/skoly",
            icon: "🏫",
            title: "Síť učeben",
            desc: "Prohlédněte si školy a obce, které už v síti ARCHIMEDES fungují.",
            cta: "Otevřít",
          },
          {
            href: "/start",
            icon: "🚀",
            title: "Balíček START",
            desc: "Nejrychlejší způsob, jak se školou začít bez zbytečného odkladu.",
            cta: "Chci START",
            note: "Doporučeno",
          },
        ],
      };
    }

    if (licenseMode === "expired") {
      return {
        tipBold: "Balíček START",
        quickTitle: "Další doporučený krok",
        quickSubtitle: "Obnovte plný přístup pro školu nebo obec.",
        primaryCtaLabel: "Chci balíček START",
        primaryCtaHref: "/start",
        tiles: [
          {
            href: "/start",
            icon: "🚀",
            title: "Balíček START",
            desc: "Nejrychlejší cesta k obnovení programu pro vaši školu.",
            cta: "Chci START",
            highlight: true,
            note: "Doporučeno",
          },
          {
            href: "/poptavka",
            icon: "⭐",
            title: "Celý program",
            desc: "Pokud chcete pokračovat naplno, dejte nám vědět.",
            cta: "Mám zájem",
          },
          {
            href: "/portal/skoly",
            icon: "🏫",
            title: "Síť učeben",
            desc: "Inspirace z praxe a přehled zapojených škol.",
            cta: "Otevřít",
          },
          {
            href: "/portal/kalendar",
            icon: "🗓️",
            title: "Program",
            desc: "Základní přehled programu a orientace v portálu.",
            cta: "Otevřít",
          },
        ],
      };
    }

    if (licenseMode === "suspended") {
      return {
        tipBold: "Kontakt s EduVision",
        quickTitle: "Co můžete udělat teď",
        quickSubtitle: "Nejrychlejší cesta k obnovení přístupu.",
        primaryCtaLabel: "Kontaktovat EduVision",
        primaryCtaHref: "/poptavka",
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
            title: "Program",
            desc: "Základní orientace v programu.",
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
      tipBold: "Program",
      quickTitle: "Rychlý přístup",
      quickSubtitle: "Nejrychlejší cesta k programu a dalším sekcím portálu.",
      primaryCtaLabel: "Otevřít program",
      primaryCtaHref: "/portal/kalendar",
      tiles: [
        {
          href: "/portal/kalendar",
          icon: "🗓️",
          title: "Program",
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
          href: "/portal/skoly",
          icon: "🏫",
          title: "Síť učeben",
          desc: "Přehled škol s učebnou ARCHIMEDES, inspirace z praxe a kontakty.",
          cta: "Otevřít",
        },
        {
          href: "/portal/inzerce",
          icon: "📌",
          title: "Inzerce",
          desc: "Nabídky, poptávky a partnerství mezi členy sítě.",
          cta: "Otevřít",
        },
      ],
    };
  }

  return {
    tipBold: "Program",
    quickTitle: "Rychlý přístup",
    quickSubtitle: "Nejrychlejší cesta k programu a dalším sekcím portálu.",
    primaryCtaLabel: "Otevřít program",
    primaryCtaHref: "/portal/kalendar",
    tiles: [
      {
        href: "/portal/kalendar",
        icon: "🗓️",
        title: "Program",
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
        href: "/portal/skoly",
        icon: "🏫",
        title: "Síť učeben",
        desc: "Přehled škol s učebnou ARCHIMEDES, inspirace z praxe a kontakty.",
        cta: "Otevřít",
      },
      {
        href: "/portal/inzerce",
        icon: "📌",
        title: "Inzerce",
        desc: "Nabídky, poptávky a partnerství mezi členy sítě.",
        cta: "Otevřít",
      },
    ],
  };
}
