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

const NAV_ITEM_BASE = "inline-flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-full border px-3.5 text-sm font-extrabold transition-colors";
const NAV_ITEM_INACTIVE = "border-slate-300 bg-white text-navy-900 hover:border-slate-400";
const NAV_ITEM_ACTIVE = "border-navy-900 bg-navy-900 text-white";
const MOBILE_ITEM_BASE = "flex min-h-[48px] items-center justify-start rounded-2xl border px-3.5 py-3 text-[15px] font-extrabold";
const MOBILE_ITEM_INACTIVE = "border-slate-200 bg-white text-navy-900";
const MOBILE_ITEM_ACTIVE = "border-navy-900 bg-navy-900 text-white";

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
          .is("read_at", null)
          .lte("available_at", new Date().toISOString());
        if (!notificationError && alive) {
          const unreadCount = publishUnreadNotificationCount(notificationCount || 0);
          setUnreadNotificationCount(unreadCount);
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

        if (nextActiveOrganizationId && nextActiveOrganizationId !== requestedActiveId) {
          await supabase.from("profiles").update({ active_organization_id: nextActiveOrganizationId }).eq("id", user.id);
        }

        const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");
        if (isAdminError) throw isAdminError;
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
      const mobile = window.innerWidth <= 900;
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
    window.addEventListener(UNREAD_NOTIFICATION_COUNT_EVENT, handleUnreadCount);
    return () => window.removeEventListener(UNREAD_NOTIFICATION_COUNT_EVENT, handleUnreadCount);
  }, []);

  const isActive = (key) => {
    if (key === "portal") return path === "/portal" || path === "/portal/";
    if (key === "program") return path.startsWith("/portal/kalendar");
    if (key === "archiv") return path.startsWith("/portal/archiv");
    if (key === "komunita") return path.startsWith("/portal/komunita");
    if (key === "souteze") return path.startsWith("/portal/souteze");
    if (key === "profil") return path.startsWith("/portal/muj-profil");
    if (key === "novinky") return path.startsWith("/portal/novinky");
    if (key === "organizace-obce") return path.startsWith("/portal/organizace-obce");
    if (key === "uzivatele") return path.startsWith("/portal/uzivatele");
    if (key === "sprava-vysilani") return path.startsWith("/portal/admin-udalosti") || path.startsWith("/portal/admin/udalosti");
    if (key === "email-skupiny") return path.startsWith("/portal/email-skupiny");
    if (key === "admin") return path === "/portal/admin";
    return false;
  };

  const navItemClass = (key) => cn(NAV_ITEM_BASE, isActive(key) ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE);
  const mobileNavItemClass = (key) => cn(MOBILE_ITEM_BASE, isActive(key) ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_INACTIVE);

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
    { key: "portal", href: "/portal", label: "Portál" },
    {
      key: "novinky",
      href: "/portal/novinky",
      label: "Co je nového",
      badge: unreadNotificationCount,
    },
    { key: "program", href: "/portal/kalendar", label: "Program" },
    { key: "archiv", href: "/portal/archiv", label: "Archiv" },
    { key: "komunita", href: "/portal/komunita", label: "Komunita" },
    { key: "souteze", href: "/portal/souteze", label: "Soutěže a projekty" },
    { key: "profil", href: "/portal/muj-profil", label: "Můj profil" },
  ];

  const adminLinks = [
    isPlatformAdmin ? { key: "email-skupiny", href: "/portal/email-skupiny", label: "E-mailové skupiny" } : null,
    isPlatformAdmin ? { key: "sprava-vysilani", href: "/portal/admin/udalosti", label: "Správa vysílání" } : null,
    isOrgAdmin && ["municipality", "obec"].includes(activeOrganizationType)
      ? { key: "organizace-obce", href: "/portal/organizace-obce", label: "Organizace obce" }
      : null,
    isOrgAdmin && activeOrganizationType === "school"
      ? { key: "uzivatele", href: "/portal/uzivatele", label: "Uživatelé" }
      : null,
    isPlatformAdmin ? { key: "admin", href: "/portal/admin", label: "Admin" } : null,
  ].filter(Boolean);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-900/[0.08] bg-white/96 backdrop-blur-md">
        <div className={cn("mx-auto max-w-[1160px]", isMobile ? "px-3.5 py-3" : "px-4 py-3")}>
          <div className="flex items-start justify-between gap-4">
          <div className="relative z-40 flex shrink-0 items-center gap-3">
            <Link href="/portal" className="flex shrink-0 items-center">
              <Image src={LOGO_SRC} alt="ARCHIMEDES Live" width={842} height={130} priority className={cn("-mt-0.5 block w-auto", isMobile ? "h-7" : "h-[34px]")} />
            </Link>
            {!isMobile && title ? <div className="max-w-[130px] truncate text-sm font-extrabold text-slate-500">{title}</div> : null}
            {!isMobile ? organizationSwitcher : null}
          </div>

          {isMobile ? (
            <button type="button" onClick={() => setMenuOpen((prev) => !prev)} aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"} aria-expanded={menuOpen} className="flex h-[42px] min-w-[42px] items-center justify-center rounded-2xl border border-slate-900/[0.12] bg-white px-3.5 font-extrabold text-navy-900">
              <MenuIcon open={menuOpen} />
            </button>
          ) : (
            <nav className="relative z-10 flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2.5">
              {mainLinks.map((item) => <Link key={item.key} href={item.href} className={navItemClass(item.key)}><span>{item.label}</span>{item.badge ? <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] leading-none text-white">{item.badge > 99 ? "99+" : item.badge}</span> : null}</Link>)}
              {adminLinks.map((item) => <Link key={item.key} href={item.href} className={navItemClass(item.key)}>{item.label}</Link>)}
              <Link href="/" className={cn(NAV_ITEM_BASE, NAV_ITEM_INACTIVE, "bg-slate-50")}>Veřejný web</Link>
              <button type="button" onClick={onLogout} className="min-h-[42px] rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-extrabold text-navy-900">Odhlásit</button>
            </nav>
          )}
          </div>

          {isMobile && menuOpen ? (
            <div className="mt-3 rounded-2xl border border-slate-900/[0.08] bg-slate-50 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <nav className="grid gap-2.5">
                {organizationSwitcher ? <div className="rounded-2xl border border-slate-200 bg-white p-3 [&_select]:w-full">{organizationSwitcher}</div> : null}
                {mainLinks.map((item) => <Link key={item.key} href={item.href} className={mobileNavItemClass(item.key)}><span>{item.label}</span>{item.badge ? <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] leading-none text-white">{item.badge > 99 ? "99+" : item.badge}</span> : null}</Link>)}
                {adminLinks.length > 0 ? <><div className="mb-1 mt-0.5 text-xs font-extrabold uppercase tracking-[0.04em] text-slate-500">Správa a nastavení</div>{adminLinks.map((item) => <Link key={item.key} href={item.href} className={mobileNavItemClass(item.key)}>{item.label}</Link>)}</> : null}
                <div className="mb-1 mt-0.5 text-xs font-extrabold uppercase tracking-[0.04em] text-slate-500">Další</div>
                <Link href="/instalace" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_INACTIVE)}>Přidat A Live do telefonu</Link>
                <Link href="/" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_INACTIVE)}>Veřejný web</Link>
                <button type="button" onClick={onLogout} className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_INACTIVE, "cursor-pointer text-left")}>Odhlásit</button>
              </nav>
            </div>
          ) : null}
        </div>
      </header>
      <PwaInstallDiscovery />
    </>
  );
}
