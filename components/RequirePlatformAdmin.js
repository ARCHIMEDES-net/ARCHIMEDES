import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

// Reuse a successful platform-admin check during client-side navigation.
// The value is memory-only, resets on reload and is cleared on any denied
// access or logout event.
let platformAdminVerified = false;

export default function RequirePlatformAdmin({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(() => !platformAdminVerified);

  useEffect(() => {
    let alive = true;

    async function checkAccess() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!alive) return;

        if (userError || !user) {
          platformAdminVerified = false;
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("platform_admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;

        if (error || !data?.user_id) {
          platformAdminVerified = false;
          router.replace("/portal");
          return;
        }

        platformAdminVerified = true;
        setChecking(false);
      } catch (_e) {
        platformAdminVerified = false;
        router.replace("/portal");
      }
    }

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        platformAdminVerified = false;
        router.replace("/login");
      }
    });

    return () => {
      alive = false;
      subscription?.unsubscribe?.();
    };
  }, [router]);

  if (checking) {
    return <div style={{ padding: 16 }}>Načítám…</div>;
  }

  return <>{children}</>;
}
