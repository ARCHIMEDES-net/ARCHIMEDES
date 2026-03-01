import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  if (loading)
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        🔒 Ověřuji přihlášení…
      </div>
    );

  return children;
}
