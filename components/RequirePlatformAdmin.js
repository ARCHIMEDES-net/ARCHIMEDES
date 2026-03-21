import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function RequirePlatformAdmin({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

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
          router.replace("/portal");
          return;
        }

        setChecking(false);
      } catch (_e) {
        router.replace("/portal");
      }
    }

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
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
