// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const LOGO_SRC = "/logo.jpg";

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

        const { data: membership, error: membershipError } = await supabase
          .from("organization_members")
          .select("role_in_org, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (!alive) return;

        if (!membershipError && membership?.role_in_org === "organization_admin") {
          setIsOrgAdmin(true);
        } else {
          setIsOrgAdmin(false);
        }

        const { data: platformAdminRow, error: platformAdminError } = await supabase
          .from("platform_admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;

        if (!platformAdminError && platformAdminRow?.user_id) {
          setIsPlatformAdmin(true);
        } else {
          setIsPlatformAdmin(false);
        }
      } catch (_e) {
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
    whiteSpace: "nowrap",
    color: "#0f172a",
    boxSizing: "border-box",
  };

  const isActive = (key) => {
    if (key === "portal") return path === "/portal" || path === "/portal/";
    if (key === "program") return path.startsWith("/portal/kalendar");
    if (key === "archiv") return path.startsWith("/portal/archiv");
    if (key === "profil") return path.startsWith("/portal/muj-profil");
    if (key === "uzivatele") return path.startsWith("/portal/uzivatele");
    if (key === "sprava-vysilani") {
      return path.startsWith("/portal/admin-udalosti") || path.startsWith("/portal/admin/udalosti");
    }
    if (key === "admin") {
      return path.startsWith("/portal/admin") && !path.startsWith("/portal/admin-udalosti");
    }
    return false;
  };

  const navItem = (key) => (isActive(key) ? activeStyle : itemBase);

  async function onLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
    }
  }

  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 12 : 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Link
            href="/portal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flexShrink: 0,
              minWidth: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt="ARCHIMEDES Live"
              style={{
                display: "block",
                height: "auto",
                width: isMobile ? 150 : 170,
                maxWidth: "100%",
                objectFit: "contain",
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            {!isMobile && title ? (
              <span
                style={{
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                {title}
              </span>
            ) : null}
          </Link>
        </div>

        {isMobile && title ? (
          <div
            style={{
              width: "100%",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.15,
              marginTop: -2,
            }}
          >
            {title}
          </div>
        ) : null}

        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            width: isMobile ? "100%" : "auto",
            marginLeft: isMobile ? 0 : "auto",
          }}
        >
          <Link href="/portal" style={navItem("portal")}>
            Portál
          </Link>

          <Link href="/portal/kalendar" style={navItem("program")}>
            Program
          </Link>

          <Link href="/portal/archiv" style={navItem("archiv")}>
            Archiv
          </Link>

          {!loadingRole && (isOrgAdmin || isPlatformAdmin) ? (
            <Link href="/portal/admin-udalosti" style={navItem("sprava-vysilani")}>
              Správa vysílání
            </Link>
          ) : null}

          {!loadingRole && isOrgAdmin ? (
            <Link href="/portal/uzivatele" style={navItem("uzivatele")}>
              Uživatelé
            </Link>
          ) : null}

          <Link href="/portal/muj-profil" style={navItem("profil")}>
            Můj profil
          </Link>

          {!loadingRole && isPlatformAdmin ? (
            <Link href="/portal/admin" style={navItem("admin")}>
              Admin
            </Link>
          ) : null}

          <Link href="/" style={publicWebStyle}>
            Veřejný web
          </Link>

          <button onClick={onLogout} style={logoutButtonStyle} type="button">
            Odhlásit
          </button>
        </nav>
      </div>
    </header>
  );
}
