import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { fetchMyOrganizations } from "../lib/myOrganizations";

const DEMO_ORG_NAME = "ARCHIMEDES DEMO SKOLA";

function normalizeText(value = "") {
  return String(value).trim();
}

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

    async function resolveActiveMembership(userId, profile) {
      const { data: membershipRows, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id, role_in_org, status")
        .eq("user_id", userId)
        .eq("status", "active");

      if (membershipError) {
        throw membershipError;
      }

      const memberships = Array.isArray(membershipRows) ? membershipRows : [];
      if (!memberships.length) {
        return null;
      }

      const orgIds = [
        ...new Set(memberships.map((m) => m.organization_id).filter(Boolean)),
      ];

      const orgRows = await fetchMyOrganizations(supabase, orgIds);

      const orgById = new Map((orgRows || []).map((org) => [org.id, org]));

      const enriched = memberships.map((m) => ({
        ...m,
        organization_name: orgById.get(m.organization_id)?.name || "",
      }));

      let resolved = profile?.active_organization_id
        ? enriched.find(
            (m) => m.organization_id === profile.active_organization_id
          ) || null
        : null;

      if (!resolved) {
        const realMemberships = enriched.filter(
          (m) => normalizeText(m.organization_name) !== DEMO_ORG_NAME
        );
        const demoMemberships = enriched.filter(
          (m) => normalizeText(m.organization_name) === DEMO_ORG_NAME
        );

        if (realMemberships.length === 1) {
          resolved = realMemberships[0];
        } else if (enriched.length === 1) {
          resolved = enriched[0];
        } else if (!realMemberships.length && demoMemberships.length === 1) {
          resolved = demoMemberships[0];
        } else {
          console.error("RequireAuth: ambiguous memberships", {
            userId,
            memberships: enriched,
            activeOrganizationId: profile?.active_organization_id || null,
          });
          return { ambiguous: true };
        }

        if (
          resolved?.organization_id &&
          profile?.active_organization_id !== resolved.organization_id
        ) {
          try {
            await supabase
              .from("profiles")
              .update({ active_organization_id: resolved.organization_id })
              .eq("id", userId);
          } catch (_e) {
            // no-op
          }
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

        const [
          { data: profile, error: profileError },
          { data: audRows, error: audError },
          { data: catRows, error: catError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, full_name, must_set_password, user_type, active_organization_id"
            )
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
        ]);

        if (profileError || !profile) {
          await deny("/login");
          return;
        }

        if (profile.must_set_password) {
          await deny("/nastavit-heslo");
          return;
        }

        if (audError || catError) {
          await deny("/login");
          return;
        }

        const activeMembership = await resolveActiveMembership(user.id, profile);

        if (activeMembership?.ambiguous) {
          await deny("/login");
          return;
        }

        const hasFullName = !!profile?.full_name?.trim();
        const hasAudience = Array.isArray(audRows) && audRows.length > 0;
        const hasCategory = Array.isArray(catRows) && catRows.length > 0;

        const profileComplete = hasFullName && hasAudience && hasCategory;
        const hasOrganization = !!activeMembership?.organization_id;
        const isOrgAdmin =
          activeMembership?.role_in_org === "organization_admin";
        const isIndividual = profile?.user_type === "individual";

        const isProfilePage = pathname === "/portal/muj-profil";
        const isUsersPage = pathname === "/portal/uzivatele";
        const isWelcomePage = pathname === "/welcome";
        const isCreateOrganizationPage = pathname === "/create-organization";
        const isJoinPage = pathname === "/join";

        // 1) Uživatel s aktivní organizací
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

        // 4) Uživatel bez organizace, ale s hotovým profilem
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
