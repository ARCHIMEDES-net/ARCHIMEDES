// components/PortalHeader.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const LOGO_SRC = "/logo.jpg";

export default function PortalHeader({ title = "" }) {
  const router = useRouter();
  const path = router?.asPath || "";

  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  async function loadRole() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsSchoolAdmin(false);
        setLoadingRole(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setIsSchoolAdmin(false);
        setLoadingRole(false);
        return;
      }

      setIsSchoolAdmin(data?.role === "school_admin");
    } catch (e) {
      setIsSchoolAdmin(false);
    } finally {
      setLoadingRole(false);
    }
  }

  const itemBase = {
    textDecoration: "none",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 13,
    lineHeight: 1,
  };

  const activeStyle = {
    ...itemBase,
    background: "#0f172a",
    border: "1px solid #0f172a",
    color: "#fff",
  };

  const isActive = (key) => {
    if (key === "portal") return path === "/portal" || path === "/portal/";
    if (key === "program") return path.startsWith("/portal/kalendar");
    if (key === "profil") return path.startsWith("/portal/muj-profil");
    if (key === "uzivatele") return path.startsWith("/portal/uzivatele");
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
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/portal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="ARCHIMEDES Live"
            style={{ height: 34, width: "auto", display: "block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {title ? (
            <span style={{ fontWeight: 900, color: "#0f172a" }}>{title}</span>
          ) : null}
        </Link>

        <nav
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/portal" style={navItem("portal")}>
            Portál
          </Link>

          <Link href="/portal/kalendar" style={navItem("program")}>
            Program
          </Link>

          <Link href="/portal/muj-profil" style={navItem("profil")}>
            Můj profil
          </Link>

          {!loadingRole && isSchoolAdmin ? (
            <Link href="/portal/uzivatele" style={navItem("uzivatele")}>
              Uživatelé školy
            </Link>
          ) : null}

          {!loadingRole && isSchoolAdmin ? (
            <Link href="/portal/admin-udalosti" style={navItem("admin")}>
              Admin
            </Link>
          ) : null}

          <button
            onClick={onLogout}
            style={{
              marginLeft: 6,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Odhlásit
          </button>
        </nav>
      </div>
    </header>
  );
}
