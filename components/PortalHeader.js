
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
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!alive) return;

        if (!user) {
          setIsOrgAdmin(false);
          setIsPlatformAdmin(false);
          setIsDemoViewer(false);
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
        setIsDemoViewer(roleInActiveOrg === "demo_viewer");

        const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");

        if (isAdminError) throw isAdminError;
        if (!alive) return;

        setIsPlatformAdmin(!!isAdminResult);
      } catch (err) {
        console.error("PortalHeader loadRole error:", err);
        if (!alive) return
