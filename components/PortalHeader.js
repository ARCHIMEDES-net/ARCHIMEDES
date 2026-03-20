// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const LOGO_SRC = "/logo-archimedes-live.png";

function normalizePath(value = "") {
  return (value || "").split("?")[0].split("#")[0];
}

export default function PortalHeader({ title = "" }) {
  const router = useRouter();
  const path = useMemo(() => normalizePath(router?.asPath || ""), [router?.asPath]);

  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

        setIsOrgAdmin(membership?.role_in_org === "organization_admin");

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
      setIsMobile(window.innerWidth <= 760);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemBase = {
    textDecoration: "none",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 13,
    lineHeight: 1,
    minHeight: 40,
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

  const logoutButtonStyle = {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
    minHeight: 40,
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

  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

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
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/portal" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{
              height: isMobile ? 30 : 34,
              display: "block",
              marginTop: -3,
            }}
          />
        </Link>

        <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/portal" style={navItem("portal")}>Portál</Link>
          <Link href="/portal/kalendar" style={navItem("program")}>Program</Link>
          <Link href="/portal/archiv" style={navItem("archiv")}>Archiv</Link>

          {!loadingRole && isPlatformAdmin && (
            <Link href="/portal/admin-udalosti" style={navItem("sprava-vysilani")}>
              Správa vysílání
            </Link>
          )}

          {!loadingRole && isOrgAdmin && (
            <Link href="/portal/uzivatele" style={navItem("uzivatele")}>
              Uživatelé
            </Link>
          )}

          <Link href="/portal/muj-profil" style={navItem("profil")}>Můj profil</Link>

          {!loadingRole && isPlatformAdmin && (
            <Link href="/portal/admin" style={navItem("admin")}>Admin</Link>
          )}

          <Link href="/" style={publicWebStyle}>Veřejný web</Link>

          <button onClick={onLogout} style={logoutButtonStyle}>
            Odhlásit
          </button>
        </nav>
      </div>
    </header>
  );
}
