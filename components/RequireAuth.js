import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const user = session.user;
        const pathname = router.pathname || "";

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, must_set_password")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile) {
          router.replace("/login");
          return;
        }

        if (profile.must_set_password) {
          router.replace("/login");
          return;
        }

        const { data: audRows, error: audError } = await supabase
          .from("user_audience_preferences")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (audError) {
          router.replace("/login");
          return;
        }

        const { data: catRows, error: catError } = await supabase
          .from("user_category_preferences")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (catError) {
          router.replace("/login");
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id, role_in_org, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (membershipError) {
          router.replace("/login");
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
        const isPortalPage =
          pathname === "/portal" ||
          pathname.startsWith("/portal/");

        // 1) Uživatel s organizací:
        // pustíme ho normálně do portálu i tehdy,
        // když ještě nemá vyplněné preference.
        // To je důležité pro demo režim a první vstup školy.
        if (hasOrganization) {
          if (isUsersPage && !isOrgAdmin) {
            router.replace("/portal");
            return;
          }

          if (mounted) setChecking(false);
          return;
        }

        // 2) Uživatel bez organizace:
        // pokud nemá hotový profil, pustíme ho jen na profil,
        // welcome, join a create-organization.
        if (!profileComplete) {
          if (
            isProfilePage ||
            isWelcomePage ||
            isCreateOrganizationPage ||
            isJoinPage
          ) {
            if (mounted) setChecking(false);
            return;
          }

          router.replace("/portal/muj-profil");
          return;
        }

        // 3) Uživatel bez organizace, ale s hotovým profilem:
        // může dál do welcome / create-organization / join / portálu.
        if (!hasOrganization) {
          if (
            isWelcomePage ||
            isCreateOrganizationPage ||
            isJoinPage ||
            isProfilePage ||
            isPortalPage
          ) {
            if (mounted) setChecking(false);
            return;
          }

          if (mounted) setChecking(false);
          return;
        }

        if (mounted) setChecking(false);
      } catch (_e) {
        router.replace("/login");
      }
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [router]);

  if (checking) {
    return <div style={{ padding: 16 }}>Načítám…</div>;
  }

  return <>{children}</>;
}
