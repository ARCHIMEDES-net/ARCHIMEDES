// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";

const LOGO_SRC = "/logo-archimedes-live.png";

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

  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

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

        let roleInActiveOrg = "";

        if (profile?.active_organization_id) {
          const { data: membership, error: membershipError } = await supabase
            .from("organization_members")
            .select("role_in_org, status")
            .eq("user_id", user.id)
            .eq("organization_id", profile.active_organization_id)
            .eq("status", "active")
            .maybeSingle();

          if (membershipError) throw membershipError;
          if (!alive) return;

          roleInActiveOrg = membership?.role_in_org || "";
        }

        setIsOrgAdmin(roleInActiveOrg === "organization_admin");

        const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");

        if (isAdminError) throw isAdminError;
        if (!alive) return;

        setIsPlatformAdmin(!!isAdminResult);
      } catch (err) {
        console.error("PortalHeader loadRole error:", err);
        if (!alive) return;
        setIsOrgAdmin(false);
        setIsPlatformAdmin(false);
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
    if (key === "admin") return path.startsWith("/portal/admin");
    return false;
  };

  const navItemClass = (key) => cn(NAV_ITEM_BASE, isActive(key) ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE);
  const mobileNavItemClass = (key) =>
    cn(MOBILE_ITEM_BASE, isActive(key) ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_INACTIVE);

  async function onLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
    }
  }

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
