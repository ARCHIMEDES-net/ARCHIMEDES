import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";
import { fetchMyOrganizations } from "../lib/myOrganizations";
import {
  UNREAD_NOTIFICATION_COUNT_EVENT,
  publishUnreadNotificationCount,
  syncAppBadge,
} from "../lib/appBadge";
import PwaInstallDiscovery from "./PwaInstallDiscovery";
import PortalMenu, { MenuLink } from "./PortalMenu";
import { communityLinks } from "../lib/portalNavigation";
import { CONTENT_NOTIFICATION_FILTER } from "../lib/notifications";
import PwaBadgePrompt from "./PwaBadgePrompt";

const LOGO_SRC = "/logo-archimedes-live.png";
let cachedHeaderAccess = null;

function normalizePath(value = "") {
  return (value || "").split("?")[0].split("#")[0];
}

function MenuIcon({ open = false }) {
  return (
    <span className="relative inline-block h-3.5 w-[18px]" aria-hidden="true">
      <span className={cn("absolute left-0 h-0.5 w-[18px] rounded-full bg-navy-900 transition-all", open ? "top-1.5 rotate-45" : "top-0")} />
      <span className={cn("absolute left-0 top-1.5 h-0.5 w-[18px] rounded-full bg-navy-900 transition-all", open && "opacity-0")} />
      <span className={cn("absolute left-0 h-0.5 w-[18px] rounded-full bg-navy-900 transition-all", open ? "top-1.5 -rotate-45" : "top-3")} />
    </span>
  );
}


export default function PortalHeader({ title = "" }) {
  const router = useRouter();
  const path = useMemo(() => normalizePath(router?.asPath || ""), [router?.asPath]);
  const [isOrgAdmin, setIsOrgAdmin] = useState(() => cachedHeaderAccess?.isOrgAdmin || false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(() => cachedHeaderAccess?.isPlatformAdmin || false);
  const [loadingRole, setLoadingRole] = useState(() => !cachedHeaderAccess);
  const [activeOrganizationId, setActiveOrganizationId] = useState(() => cachedHeaderAccess?.activeOrganizationId || "");
  const [organizations, setOrganizations] = useState(() => cachedHeaderAccess?.organizations || []);
  const [switchingOrganization, setSwitchingOrganization] = useState(false);
  const [organizationSwitchError, setOrganizationSwitchError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [operationalCount, setOperationalCount] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!alive) return;

        if (!user) {
          setIsOrgAdmin(false);
          setIsPlatformAdmin(false);
          setActiveOrganizationId("");
          setOrganizations([]);
          setUnreadNotificationCount(0);
          return;
        }

        const { count: notificationCount, error: notificationError } = await supabase
          .from("user_notifications")
          .select("id", { count: "exact", head: true })
          .or(CONTENT_NOTIFICATION_FILTER)
          .is("read_at", null)
          .lte("available_at", new Date().toISOString());
        if (!notificationError && alive) {
          const unreadCount = publishUnreadNotificationCount(notificationCount || 0);
          setUnreadNotificationCount(unreadCount);
        }

        const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");
        if (isAdminError) throw isAdminError;
        if (isAdminResult) {
          const { count } = await supabase.from("user_notifications").select("id", { count: "exact", head: true }).like("target_path", "/portal/admin%").is("read_at", null).lte("available_at", new Date().toISOString());
          if (alive) setOperationalCount(count || 0);
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, active_organization_id")
          .eq("id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;

        const { data: membershipRows, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id, role_in_org, status")
          .eq("user_id", user.id)
          .eq("status", "active");
        if (membershipError) throw membershipError;

        const memberships = Array.isArray(membershipRows) ? membershipRows : [];
        const organizationRows = memberships.length
          ? await fetchMyOrganizations(supabase, memberships.map((item) => item.organization_id))
          : [];
        if (!alive) return;

        const nextOrganizations = [...organizationRows].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""), "cs")
        );
        const requestedActiveId = profile?.active_organization_id || "";
        const nextActiveOrganizationId = nextOrganizations.some((org) => org.id === requestedActiveId)
          ? requestedActiveId
          : nextOrganizations[0]?.id || "";
        const activeMembership = memberships.find((item) => item.organization_id === nextActiveOrganizationId);
        const nextIsOrgAdmin = activeMembership?.role_in_org === "organization_admin";

        if (!isAdminResult && nextActiveOrganizationId && nextActiveOrganizationId !== requestedActiveId) {
          await supabase.from("profiles").update({ active_organization_id: nextActiveOrganizationId }).eq("id", user.id);
        }

        if (!alive) return;

        const nextIsPlatformAdmin = !!isAdminResult;
        setActiveOrganizationId(nextActiveOrganizationId);
        setOrganizations(nextOrganizations);
        setIsOrgAdmin(nextIsOrgAdmin);
        setIsPlatformAdmin(nextIsPlatformAdmin);
        cachedHeaderAccess = {
          isOrgAdmin: nextIsOrgAdmin,
          isPlatformAdmin: nextIsPlatformAdmin,
          activeOrganizationId: nextActiveOrganizationId,
          organizations: nextOrganizations,
        };
      } catch (error) {
        console.error("PortalHeader loadRole error:", error);
        if (!alive) return;
        setIsOrgAdmin(false);
        setIsPlatformAdmin(false);
        setActiveOrganizationId("");
        setOrganizations([]);
      } finally {
        if (alive) setLoadingRole(false);
      }
    }

    loadRole();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 1100;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [path]);

  useEffect(() => {
    function handleUnreadCount(event) {
      setUnreadNotificationCount(Number(event?.detail?.count) || 0);
    }
    function handleOperationalCount(event) { setOperationalCount(Number(event.detail?.count) || 0); }
    window.addEventListener("archimedes:operational-count", handleOperationalCount);
    window.addEventListener(UNREAD_NOTIFICATION_COUNT_EVENT, handleUnreadCount);
    return () => { window.removeEventListener(UNREAD_NOTIFICATION_COUNT_EVENT, handleUnreadCount); window.removeEventListener("archimedes:operational-count", handleOperationalCount); };
  }, []);

  async function onLogout() {
    try {
      cachedHeaderAccess = null;
      void syncAppBadge(0);
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
    }
  }

  async function onOrganizationChange(event) {
    const organizationId = event.target.value;
    if (!organizationId || organizationId === activeOrganizationId || !organizations.some((org) => org.id === organizationId)) return;

    setSwitchingOrganization(true);
    setOrganizationSwitchError("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Uživatel není přihlášen.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ active_organization_id: organizationId })
        .eq("id", user.id);
      if (updateError) throw updateError;

      const selectedMembership = await supabase
        .from("organization_members")
        .select("role_in_org")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .maybeSingle();
      if (selectedMembership.error) throw selectedMembership.error;

      const nextIsOrgAdmin = selectedMembership.data?.role_in_org === "organization_admin";
      setActiveOrganizationId(organizationId);
      setIsOrgAdmin(nextIsOrgAdmin);
      cachedHeaderAccess = {
        ...(cachedHeaderAccess || {}),
        isOrgAdmin: nextIsOrgAdmin,
        isPlatformAdmin,
        activeOrganizationId: organizationId,
        organizations,
      };

      await router.replace(router.asPath, undefined, { scroll: false });
      router.reload();
    } catch (error) {
      console.error("PortalHeader organization switch error:", error);
      setOrganizationSwitchError("Organizaci se nepodařilo přepnout.");
      setSwitchingOrganization(false);
    }
  }

  const activeOrganization = organizations.find((org) => org.id === activeOrganizationId);
  const activeOrganizationType = activeOrganization?.org_type || "";

  const organizationSwitcher = !loadingRole && organizations.length > 1 ? (
    <div className="relative z-50 shrink-0">
      <label className="block text-sm font-bold text-slate-600">
        <span className="sr-only">Organizace</span>
        <select
          value={activeOrganizationId}
          onChange={onOrganizationChange}
          disabled={switchingOrganization}
          aria-label="Aktivní organizace"
          className="relative z-50 block min-h-[42px] w-[250px] cursor-pointer rounded-xl border border-slate-300 bg-white px-3 pr-9 font-bold text-navy-900 shadow-sm disabled:cursor-wait disabled:opacity-70"
        >
          <option value="" disabled>Vyberte organizaci</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </select>
      </label>
      {organizationSwitchError ? <p className="mt-1 text-xs font-semibold text-red-600">{organizationSwitchError}</p> : null}
    </div>
  ) : null;

  const mainLinks = [
    ["Portál", "/portal"], ["Program", "/portal/kalendar"],
    ["Archiv", "/portal/archiv"], ["Co je nového", "/portal/novinky"],
  ];
  const schoolAdminHref = ["municipality", "obec"].includes(activeOrganizationType) ? "/portal/organizace-obce" : "/portal/uzivatele";
  const schoolAdminLabel = activeOrganizationType === "school" ? "Správa školy" : "Správa organizace";
  const adminArea = path.startsWith("/portal/admin") || path === "/portal/email-skupiny";
  const navLink = ([label, href]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-bold", path === href ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-slate-100")}>
    {label}{href === "/portal/novinky" && unreadNotificationCount > 0 ? <span className="ml-2 rounded-full bg-red-600 px-1.5 text-xs text-white">{unreadNotificationCount}</span> : null}
  </Link>;
  const managementLinks = <>
    <MenuLink href="/portal/admin">Přehled administrace</MenuLink>
    <MenuLink href="/portal/admin/organizace">Vyhledat organizaci</MenuLink>
    <MenuLink href="/portal/admin/udalosti">Správa vysílání</MenuLink>
    <MenuLink href="/portal/email-skupiny">E-mailové skupiny</MenuLink>
    <MenuLink href="/portal/admin/upozorneni">Provozní upozornění{operationalCount ? ` (${operationalCount})` : ""}</MenuLink>
  </>;
  const accountLinks = <>
    <MenuLink href="/portal/muj-profil">Můj profil</MenuLink>
    <MenuLink href="/instalace">Přidat aplikaci do telefonu</MenuLink>
    <MenuLink href="/">Veřejný web</MenuLink>
    <button type="button" onClick={onLogout} className="min-h-11 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">Odhlásit</button>
  </>;
  return <>
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/portal" aria-label="ARCHIMEDES Live – portál" className="shrink-0"><Image src={LOGO_SRC} alt="ARCHIMEDES Live" width={842} height={130} priority className="h-auto w-[185px]" /></Link>
          {isMobile ? <button type="button" aria-expanded={menuOpen} aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"} onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 font-bold"><MenuIcon open={menuOpen} /> Menu</button> :
            <nav aria-label="Hlavní navigace" className="flex items-center gap-1">
              {mainLinks.map(navLink)}
              <PortalMenu label="Komunita" active={communityLinks.some(([,href]) => path.startsWith(href))}>{communityLinks.map(([label,href]) => <MenuLink key={href} href={href}>{label}</MenuLink>)}</PortalMenu>
              {isPlatformAdmin ? <PortalMenu label={operationalCount ? `Správa (${operationalCount})` : "Správa"} active={adminArea}>{managementLinks}</PortalMenu> : isOrgAdmin ? navLink([schoolAdminLabel,schoolAdminHref]) : null}
              <PortalMenu label="Můj účet" active={path === "/portal/muj-profil"}>{accountLinks}</PortalMenu>
            </nav>}
        </div>
        {!loadingRole ? <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-sm text-slate-600">
          {isPlatformAdmin ? <><span className="font-semibold">Správce platformy</span><Link href="/portal/admin/organizace" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 font-bold text-navy-900">Vyhledat školu, obec nebo organizaci →</Link></> : <div className="flex min-w-0 flex-wrap items-center gap-2"><span>Vaše organizace:</span>{organizationSwitcher || <strong className="break-words">{activeOrganization?.name || "Osobní účet"}</strong>}</div>}
        </div> : null}
        {isMobile && menuOpen ? <nav aria-label="Mobilní navigace" className="mt-3 grid max-h-[65dvh] gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2" onClick={(event) => { if (event.target.closest("a")) setMenuOpen(false); }}>
          {mainLinks.map(navLink)}
          <p className="px-3 pt-3 text-xs font-bold uppercase text-slate-500">Komunita</p>
          {communityLinks.map(navLink)}
          {isPlatformAdmin ? <><p className="px-3 pt-3 text-xs font-bold uppercase text-slate-500">Správa platformy</p>{managementLinks}</> : isOrgAdmin ? navLink([schoolAdminLabel,schoolAdminHref]) : null}
          <p className="px-3 pt-3 text-xs font-bold uppercase text-slate-500">Můj účet</p>{accountLinks}
        </nav> : null}
      </div>
    </header>
    {!isPlatformAdmin && path === "/portal" ? <PwaInstallDiscovery /> : null}
    <PwaBadgePrompt unreadCount={unreadNotificationCount} />
  </>;
}
