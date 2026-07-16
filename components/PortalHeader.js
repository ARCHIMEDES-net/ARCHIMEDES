// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";
import { fetchMyOrganizations } from "../lib/myOrganizations";

const LOGO_SRC = "/logo-archimedes-live.png";

// Preserve role-dependent menu geometry across client-side route changes.
// This memory-only cache is cleared on logout and resets on full reload.
let cachedHeaderAccess = null;

function normalizePath(value = "") {
  return (value || "").split("?")[0].split("#")[0];
}

function MenuIcon({ open = false }) {
  return (
    <span className="relative inline-block h-3.5 w-[18px]" aria-hidden="true">
      <span
        className={cn(
          "absolute left-0 h-0.5 w-[18px] rounded-full bg-navy-900 transition-all duration-200",
          open ? "top-1.5 rotate-45" : "top-0"
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-1.5 h-0.5 w-[18px] rounded-full bg-navy-900 transition-all duration-200",
          open && "opacity-0"
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-0.5 w-[18px] rounded-full bg-navy-900 transition-all duration-200",
          open ? "top-1.5 -rotate-45" : "top-3"
        )}
      />
    </span>
  );
}

const NAV_ITEM_BASE =
  "inline-flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-full border px-3.5 text-sm font-extrabold transition-colors";
const NAV_ITEM_INACTIVE = "border-slate-300 bg-white text-navy-900 hover:border-slate-400";
const NAV_ITEM_ACTIVE = "border-navy-900 bg-navy-900 text-white";

const MOBILE_ITEM_BASE =
  "flex min-h-[48px] items-center justify-start rounded-2xl border px-3.5 py-3 text-[15px] font-extrabold";
const MOBILE_ITEM_INACTIVE = "border-slate-200 bg-white text-navy-900";
const MOBILE_ITEM_ACTIVE = "border-navy-900 bg-navy-900 text-white";

export default function PortalHeader({ title = "" }) {
  const router = useRouter();
  const path = useMemo(() => normalizePath(router?.asPath || ""), [router?.asPath]);

  const [isOrgAdmin, setIsOrgAdmin] = useState(() => cachedHeaderAccess?.isOrgAdmin || false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(() => cachedHeaderAccess?.isPlatformAdmin || false);
  const [loadingRole, setLoadingRole] = useState(() => !cachedHeaderAccess);
  const [activeOrganizationId, setActiveOrganizationId] = useState(
    () => cachedHeaderAccess?.activeOrganizationId || ""
  );
  const [organizations, setOrganizations] = useState(
    () => cachedHeaderAccess?.organizations || []
  );
  const [switchingOrganization, setSwitchingOrganization] = useState(false);
  const [organizationSwitchError, setOrganizationSwitchError] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!alive) return;

        if (!user) {
          setIsOrgAdmin(false);
          setIsPlatformAdmin(false);
          setActiveOrganizationId("");
          setOrganizations([]);
          setLoadingRole(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, active_organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!alive) return;

        const { data: membershipRows, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id, role_in_org, status")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (membershipError) throw membershipError;
        if (!alive) return;

        const memberships = Array.isArray(membershipRows) ? membershipRows : [];
        const activeMembership = memberships.find(
          (membership) =>
            membership.organization_id === profile?.active_organization_id
        );
        const roleInActiveOrg = activeMembership?.role_in_org || "";

        const organizationRows = memberships.length
          ? await fetchMyOrganizations(
              supabase,
              memberships.map((membership) => membership.organization_id)
            )
          : [];

        if (!alive) return;

        const nextActiveOrganizationId = profile?.active_organization_id || "";
        const nextOrganizations = [...organizationRows].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""), "cs")
        );
        const nextIsOrgAdmin = roleInActiveOrg === "organization_admin";

        setActiveOrganizationId(nextActiveOrganizationId);
        setOrganizations(nextOrganizations);
        setIsOrgAdmin(nextIsOrgAdmin);

        const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");

        if (isAdminError) throw isAdminError;
        if (!alive) return;

        const nextIsPlatformAdmin = !!isAdminResult;
        setIsPlatformAdmin(nextIsPlatformAdmin);
        cachedHeaderAccess = {
          isOrgAdmin: nextIsOrgAdmin,
          isPlatformAdmin: nextIsPlatformAdmin,
          activeOrganizationId: nextActiveOrganizationId,
          organizations: nextOrganizations,
        };
      } catch (err) {
        console.error("PortalHeader loadRole error:", err);
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

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  const isActive = (key) => {
    if (key === "portal") return path === "/portal" || path === "/portal/";
    if (key === "program") return path.startsWith("/portal/kalendar");
    if (key === "archiv") return path.startsWith("/portal/archiv");
    if (key === "komunita") return path.startsWith("/portal/komunita");
    if (key === "souteze") return path.startsWith("/portal/souteze");
    if (key === "profil") return path.startsWith("/portal/muj-profil");
    if (key === "uzivatele") return path.startsWith("/portal/uzivatele");
    if (key === "sprava-vysilani") return path.startsWith("/portal/admin-udalosti");
    if (key === "email-skupiny") return path.startsWith("/portal/email-skupiny");
    if (key === "admin") {
      return path === "/portal/admin" || path.startsWith("/portal/admin/");
    }
    return false;
  };

  const navItemClass = (key) => cn(NAV_ITEM_BASE, isActive(key) ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE);
  const mobileNavItemClass = (key) =>
    cn(MOBILE_ITEM_BASE, isActive(key) ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_INACTIVE);

  async function onLogout() {
    try {
      cachedHeaderAccess = null;
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
    }
  }

  async function onOrganizationChange(event) {
    const organizationId = event.target.value;
    if (
      !organizationId ||
      organizationId === activeOrganizationId ||
      !organizations.some((organization) => organization.id === organizationId)
    ) {
      return;
    }

    setSwitchingOrganization(true);
    setOrganizationSwitchError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError || new Error("Uživatel není přihlášen.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ active_organization_id: organizationId })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setActiveOrganizationId(organizationId);
      if (cachedHeaderAccess) {
        cachedHeaderAccess = {
          ...cachedHeaderAccess,
          activeOrganizationId: organizationId,
        };
      }
      router.reload();
    } catch (error) {
      console.error("PortalHeader organization switch error:", error);
      setOrganizationSwitchError("Organizaci se nepodařilo přepnout.");
      setSwitchingOrganization(false);
    }
  }

  const organizationSwitcher =
    !loadingRole && organizations.length > 1 ? (
      <div className="min-w-0">
        <label className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-600">
          <span className="shrink-0">Organizace</span>
          <select
            value={activeOrganizationId}
            onChange={onOrganizationChange}
            disabled={switchingOrganization}
            aria-label="Aktivní organizace"
            className="min-h-[42px] min-w-0 max-w-[260px] rounded-xl border border-slate-300 bg-white px-3 font-bold text-navy-900"
          >
            <option value="" disabled>
              Vyberte organizaci
            </option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        {organizationSwitchError ? (
          <p className="mt-1 text-xs font-semibold text-red-600">
            {organizationSwitchError}
          </p>
        ) : null}
      </div>
    ) : null;

  const mainLinks = [
    { key: "portal", href: "/portal", label: "Portál" },
    { key: "program", href: "/portal/kalendar", label: "Program" },
    { key: "archiv", href: "/portal/archiv", label: "Archiv" },
    { key: "komunita", href: "/portal/komunita", label: "Komunita" },
    { key: "souteze", href: "/portal/souteze", label: "Soutěže a projekty" },
    { key: "profil", href: "/portal/muj-profil", label: "Můj profil" },
  ];

  const adminLinks = [
    !loadingRole && isPlatformAdmin
      ? {
          key: "email-skupiny",
          href: "/portal/email-skupiny",
          label: "E-mailové skupiny",
        }
      : null,
    !loadingRole && isPlatformAdmin
      ? {
          key: "sprava-vysilani",
          href: "/portal/admin-udalosti",
          label: "Správa vysílání",
        }
      : null,
    !loadingRole && isOrgAdmin
      ? {
          key: "uzivatele",
          href: "/portal/uzivatele",
          label: "Uživatelé",
        }
      : null,
    !loadingRole && isPlatformAdmin
      ? {
          key: "admin",
          href: "/portal/admin",
          label: "Admin",
        }
      : null,
  ].filter(Boolean);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-900/[0.08] bg-white/96 backdrop-blur-md">
      <div className={cn("mx-auto max-w-[1160px]", isMobile ? "px-3.5 py-3" : "px-4 py-3")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/portal" className="flex shrink-0 items-center">
              <img
                src={LOGO_SRC}
                alt="ARCHIMEDES Live"
                className={cn("-mt-0.5 block w-auto", isMobile ? "h-7" : "h-[34px]")}
              />
            </Link>

            {!isMobile && title ? (
              <div className="truncate text-sm font-extrabold text-slate-500">{title}</div>
            ) : null}

            {!isMobile ? organizationSwitcher : null}
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={menuOpen}
              className="flex h-[42px] min-w-[42px] items-center justify-center gap-2.5 rounded-2xl border border-slate-900/[0.12] bg-white px-3.5 font-extrabold text-navy-900"
            >
              <MenuIcon open={menuOpen} />
            </button>
          ) : (
            <nav className="flex flex-wrap items-center justify-end gap-2.5">
              {mainLinks.map((item) => (
                <Link key={item.key} href={item.href} className={navItemClass(item.key)}>
                  {item.label}
                </Link>
              ))}

              {adminLinks.map((item) => (
                <Link key={item.key} href={item.href} className={navItemClass(item.key)}>
                  {item.label}
                </Link>
              ))}

              <Link href="/" className={cn(NAV_ITEM_BASE, NAV_ITEM_INACTIVE, "bg-slate-50")}>
                Veřejný web
              </Link>

              <button
                type="button"
                onClick={onLogout}
                className="min-h-[42px] rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-extrabold text-navy-900"
              >
                Odhlásit
              </button>
            </nav>
          )}
        </div>

        {isMobile && menuOpen ? (
          <div className="mt-3 rounded-2xl border border-slate-900/[0.08] bg-slate-50 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <nav className="grid gap-2.5">
              {organizationSwitcher ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  {organizationSwitcher}
                </div>
              ) : null}

              {mainLinks.map((item) => (
                <Link key={item.key} href={item.href} className={mobileNavItemClass(item.key)}>
                  {item.label}
                </Link>
              ))}

              {adminLinks.length > 0 ? (
                <>
                  <div className="mb-1 mt-0.5 text-xs font-extrabold uppercase tracking-[0.04em] text-slate-500">
                    Správa a nastavení
                  </div>
                  {adminLinks.map((item) => (
                    <Link key={item.key} href={item.href} className={mobileNavItemClass(item.key)}>
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : null}

              <div className="mb-1 mt-0.5 text-xs font-extrabold uppercase tracking-[0.04em] text-slate-500">
                Další
              </div>

              <Link href="/" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_INACTIVE)}>
                Veřejný web
              </Link>

              <button
                type="button"
                onClick={onLogout}
                className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_INACTIVE, "cursor-pointer text-left")}
              >
                Odhlásit
              </button>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
