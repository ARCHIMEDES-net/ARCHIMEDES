import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      router.replace("/login");
    })();
  }, [router]);

  return <div className="p-6 text-muted">Odhlašuji…</div>;
}
