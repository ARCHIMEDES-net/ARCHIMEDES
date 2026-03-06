// components/RequireAuth.js
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
          .select("id, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
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

        const hasFullName = !!profile?.full_name?.trim();
        const hasAudience = Array.isArray(audRows) && audRows.length > 0;
        const hasCategory = Array.isArray(catRows) && catRows.length > 0;

        const profileComplete = hasFullName && hasAudience && hasCategory;
        const isProfilePage = pathname === "/portal/muj-profil";

        if (!profileComplete && !isProfilePage) {
          router.replace("/portal/muj-profil");
          return;
        }

        if (profileComplete && isProfilePage) {
          // profil už je hotový, stránku ale necháme přístupnou,
          // takže zde nic nepřesměrováváme
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
