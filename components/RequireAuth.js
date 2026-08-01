import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import {
  fetchMyOrganization,
  fetchMyOrganizations,
} from "../lib/myOrganizations";

// Reuse a successful check only during the current client-side visit.
// A full reload always performs the complete authorization check again.
let portalSessionVerified = false;

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(() => !portalSessionVerified);

  useEffect(() => {
    let mounted = true;

    async function deny(path = "/login") {
      if (!mounted) return;
      portalSessionVerified = false;
      router.replace(path);
    }

    async function allow() {
      if (!mounted) return;
      portalSessionVerified = true;
      setChecking(false);
    }

    async function resolveActiveOrganization(userId, profile) {
      if (profile?.active_organization_id) {
        const activeOrganization = await fetchMyOrganization(
          supabase,
          profile.active_organization_id
        );

        if (activeOrganization) {
          return activeOrganization;
        }
      }

      const organizations = await fetchMyOrganizations(supabase);
      if (!organizations.length) {
        return null;
      }

      if (organizations.length > 1) {
        console.error("RequireAuth: ambiguous organizations", {
          userId,
          organizationIds: organizations.map((organization) => organization.id),
          activeOrganizationId: profile?.active_organization_id || null,
        });
        return { ambiguous: true };
      }

      const resolved = organizations[0];
      if (
        resolved?.id &&
        profile?.active_organization_id !== resolved.id
      ) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ active_organization_id: resolved.id })
          .eq("id", userId);

        if (updateError) {
          throw updateError;
        }
      }

      return resolved || null;
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

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "id, full_name, must_set_password, user_type, active_organization_id"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile) {
          await deny("/login");
          return;
        }

        if (profile.must_set_password) {
          await deny("/nastavit-heslo");
          return;
        }

        const activeOrganization = await resolveActiveOrganization(user.id, profile);

        if (activeOrganization?.ambiguous) {
          if (pathname === "/nastaveni-pristupu") {
            await allow();
          } else {
            await deny("/nastaveni-pristupu");
          }
          return;
        }

        const hasFullName = !!profile?.full_name?.trim();
        const profileComplete = hasFullName;
        const hasOrganization = !!activeOrganization?.id;
        const isOrgAdmin =
          activeOrganization?.role_in_org === "organization_admin";
        const isIndividual = profile?.user_type === "individual";

        const isProfilePage = pathname === "/portal/muj-profil";
        const isUsersPage = pathname === "/portal/uzivatele";
        const isAccessSetupPage = pathname === "/nastaveni-pristupu";
        const isCreateOrganizationPage = pathname === "/create-organization";
        const isJoinPage = pathname === "/join";

        // 1) Uživatel s aktivní přímo nebo zděděně dostupnou organizací
        if (hasOrganization) {
          if (isUsersPage && !isOrgAdmin) {
            await deny("/portal");
            return;
          }

          await allow();
          return;
        }

        // 2) Jednotlivec bez organizace
        if (isIndividual) {
          if (isUsersPage) {
            await deny("/portal");
            return;
          }

          await allow();
          return;
        }

        // 3) Uživatel bez organizace a bez kompletního profilu
        if (!profileComplete) {
          if (
            isProfilePage ||
            isAccessSetupPage ||
            isCreateOrganizationPage ||
            isJoinPage
          ) {
            await allow();
            return;
          }

          await deny("/portal/muj-profil");
          return;
        }

        // 4) Uživatel bez organizace, ale s hotovým profilem
        if (!hasOrganization) {
          if (
            isAccessSetupPage ||
            isCreateOrganizationPage ||
            isJoinPage ||
            isProfilePage
          ) {
            await allow();
            return;
          }

          await deny("/nastaveni-pristupu");
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
        portalSessionVerified = false;
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
