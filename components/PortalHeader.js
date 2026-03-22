// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const LOGO_SRC = "/logo-archimedes-live.png";

function normalizePath(value = "") {
  return (value || "").split("?")[0].split("#")[0];
}

function MenuIcon({ open = false }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: 18,
        height: 14,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: open ? 6 : 0,
          width: 18,
          height: 2,
          borderRadius: 999,
          background: "#0f172a",
          transform: open ? "rotate(45deg)" : "none",
          transition: "all 0.18s ease",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 6,
          width: 18,
          height: 2,
          borderRadius: 999,
          background: "#0f172a",
          opacity: open ? 0 : 1,
          transition: "all 0.18s ease",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          top: open ? 6 : 12,
          width: 18,
          height: 2,
          borderRadius: 999,
          background: "#0f172a",
          transform: open ? "rotate(-45deg)" : "none",
          transition: "all 0.18s ease",
        }}
      />
    </span>
  );
}

export default function PortalHeader({ title = "" }) {
  const router = useRouter();
  const path = useMemo(() => normalizePath(router?.asPath || ""), [router?.asPath]);

  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isDemoViewer, setIsDemoViewer] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!alive) return;

        if (!user) {
          setIsOrgAdmin(false);
          setIsPlatformAdmin(false);
          setIsDemoViewer(false);
          setLoadingRole(false);
          return;
        }

        const { data: membership } = await supabase
          .from("organization_members")
          .select("role_in_org, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (!alive) return;

        const roleInOrg = membership?.role_in_org || "";
        setIsOrgAdmin(roleInOrg === "organization_admin");
        setIsDemoViewer(roleInOrg === "demo_viewer");

        const { data: platformAdminRow } = await supabase
          .from("platform_admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;

        setIsPlatformAdmin(!!platformAdminRow?.user_id);
      } catch {
        if (!alive) return;
        setIsOrgAdmin(false);
        setIsPlatformAdmin(false);
        setIsDemoViewer(false);
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

  const itemBase = {
    textDecoration: "none",
    color: "#0f172a",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 14,
    lineHeight: 1.1,
    minHeight: 42,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    transition: "all 0.18s ease",
  };

  const activeStyle = {
    ...itemBase,
    background: "#0f172a",
    border: "1px solid #0f172a",
    color: "#fff",
  };

  const publicWebStyle = {
    ...itemBase,
    background: "#f8fafc",
  };

  const mobileMenuButtonStyle = {
    border: "1px solid rgba(15,23,42,0.12)",
    background: "#ffffff",
    color: "#0f172a",
    minHeight: 42,
    minWidth: 42,
    padding: "0 14px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const logoutButtonStyle = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
    minHeight: 42,
    color: "#0f172a",
  };

  const mobileLinkStyle = {
    textDecoration: "none",
    color: "#0f172a",
    padding: "13px 14px",
    borderRadius: 14,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: 15,
    lineHeight: 1.25,
    minHeight: 48,
    boxSizing: "border-box",
  };

  const mobileActiveStyle = {
    ...mobileLinkStyle,
    background: "#0f172a",
    border: "1px solid #0f172a",
    color: "#fff",
  };

  const mobileSecondaryGroupTitle = {
    margin: "2px 0 8px",
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#64748b",
  };

  const isActive = (key) => {
    if (key === "portal") return path === "/portal" || path === "/portal/";
    if (key === "program") return path.startsWith("/portal/kalendar");
    if (key === "archiv") return path.startsWith("/portal/archiv");
    if (key === "profil") return path.startsWith("/portal/muj-profil");
    if (key === "uzivatele") return path.startsWith("/portal/uzivatele");
    if (key === "sprava-vysilani") return path.startsWith("/portal/admin-udalosti");
    if (key === "admin") return path.startsWith("/portal/admin");
    return false;
  };

  const navItem = (key) => (isActive(key) ? activeStyle : itemBase);
  const mobileNavItem = (key) => (isActive(key) ? mobileActiveStyle : mobileLinkStyle);

  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const mainLinks = [
    { key: "portal", href: "/portal", label: "Portál" },
    { key: "program", href: "/portal/kalendar", label: "Program" },
    { key: "archiv", href: "/portal/archiv", label: "Archiv" },
    { key: "profil", href: "/portal/muj-profil", label: "Můj profil" },
  ];

  const adminLinks = [
    !loadingRole && !isDemoViewer && isPlatformAdmin
      ? {
          key: "sprava-vysilani",
          href: "/portal/admin-udalosti",
          label: "Správa vysílání",
        }
      : null,
    !loadingRole && !isDemoViewer && isOrgAdmin
      ? {
          key: "uzivatele",
          href: "/portal/uzivatele",
          label: "Uživatelé",
        }
      : null,
    !loadingRole && !isDemoViewer && isPlatformAdmin
      ? {
          key: "admin",
          href: "/portal/admin",
          label: "Admin",
        }
      : null,
  ].filter(Boolean);

  return (
    <header
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: isMobile ? "12px 14px" : "12px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              gap: 12,
            }}
          >
            <Link
              href="/portal"
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={LOGO_SRC}
                alt="ARCHIMEDES Live"
                style={{
                  height: isMobile ? 28 : 34,
                  width: "auto",
                  display: "block",
                  marginTop: -2,
                }}
              />
            </Link>

            {!isMobile && title ? (
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.3,
                  fontWeight: 800,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </div>
            ) : null}
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={menuOpen}
              style={mobileMenuButtonStyle}
            >
              <MenuIcon open={menuOpen} />
            </button>
          ) : (
            <nav
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {mainLinks.map((item) => (
                <Link key={item.key} href={item.href} style={navItem(item.key)}>
                  {item.label}
                </Link>
              ))}

              {adminLinks.map((item) => (
                <Link key={item.key} href={item.href} style={navItem(item.key)}>
                  {item.label}
                </Link>
              ))}

              <Link href="/" style={publicWebStyle}>
                Veřejný web
              </Link>

              <button onClick={onLogout} style={logoutButtonStyle}>
                Odhlásit
              </button>
            </nav>
          )}
        </div>

        {isMobile && menuOpen ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 20,
              background: "#f8fafc",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            }}
          >
            <nav
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {mainLinks.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  style={mobileNavItem(item.key)}
                >
                  {item.label}
                </Link>
              ))}

              {adminLinks.length > 0 ? (
                <>
                  <div style={mobileSecondaryGroupTitle}>Správa a nastavení</div>
                  {adminLinks.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      style={mobileNavItem(item.key)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : null}

              <div style={mobileSecondaryGroupTitle}>Další</div>

              <Link href="/" style={mobileLinkStyle}>
                Veřejný web
              </Link>

              <button
                onClick={onLogout}
                style={{
                  ...mobileLinkStyle,
                  cursor: "pointer",
                  textAlign: "left",
                  justifyContent: "flex-start",
                }}
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
