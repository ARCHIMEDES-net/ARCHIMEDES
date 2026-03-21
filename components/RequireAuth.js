import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function deny(path = "/login") {
      if (!mounted) return;
      router.replace(path);
    }

    async function allow() {
      if (!mounted) return;
      setChecking(false);
    }

    async function check() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          await deny("/login");
          return;
        }

        const pathname = router.pathname || "";

        const [
          { data: profile, error: profileError },
          { data: audRows, error: audError },
          { data: catRows, error: catError },
          { data: membershipRows, error: membershipError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, must_set_password")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("user_audience_preferences")
            .select("id")
            .eq("user_id", user.id)
            .limit(1),

          supabase
            .from("user_category_preferences")
            .select("id")
            .eq("user_id", user.id)
            .limit(1),

          supabase
            .from("organization_members")
            .select("organization_id, role_in_org, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .limit(2),
        ]);

        if (profileError || !profile) {
          await deny("/login");
          return;
        }

        if (profile.must_set_password) {
          await deny("/login");
          return;
        }

        if (audError || catError || membershipError) {
          await deny("/login");
          return;
        }

        const memberships = Array.isArray(membershipRows) ? membershipRows : [];
        const membership = memberships[0] || null;

        // Bezpečnostní fallback: více aktivních členství nechceme tiše ignorovat
        if (memberships.length > 1) {
          console.error("RequireAuth: user has multiple active memberships", {
            userId: user.id,
            memberships,
          });
          await deny("/login");
          return;
        }

        const hasFullName = !!profile?.full_name?.trim();
        const hasAudience = Array.isArray(audRows) && audRows.length > 0;
        const hasCategory = Array.isArray(catRows) && catRows.length > 0;

        const profileComplete = hasFullName && hasAudience && hasCategory;
        const hasOrganization = !!membership?.organization_id;
        const isOrgAdmin = membership?.role_in_org === "organization_admin";

        const isProfilePage = pathname === "/portal/muj-profil";
        const isUsersPage = pathname === "/portal/uzivatele";
        const isWelcomePage = pathname === "/welcome";
        const isCreateOrganizationPage = pathname === "/create-organization";
        const isJoinPage = pathname === "/join";
        const isPortalPage = pathname === "/portal" || pathname.startsWith("/portal/");

        // 1) Uživatel s organizací
        if (hasOrganization) {
          if (isUsersPage && !isOrgAdmin) {
            await deny("/portal");
            return;
          }

          await allow();
          return;
        }

        // 2) Uživatel bez organizace a bez kompletního profilu
        if (!profileComplete) {
          if (
            isProfilePage ||
            isWelcomePage ||
            isCreateOrganizationPage ||
            isJoinPage
          ) {
            await allow();
            return;
          }

          await deny("/portal/muj-profil");
          return;
        }

        // 3) Uživatel bez organizace, ale s hotovým profilem
        // Bezpečněji ho nepouštíme do celého /portal/*
        if (!hasOrganization) {
          if (
            isWelcomePage ||
            isCreateOrganizationPage ||
            isJoinPage ||
            isProfilePage
          ) {
            await allow();
            return;
          }

          await deny("/welcome");
          return;
        }

        await allow();
      } catch (_e) {
        await deny("/login");
      }
    }

    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [router]);

  if (checking) {
    return <div style={{ padding: 16 }}>Načítám…</div>;
  }

  return <>{children}</>;
}
