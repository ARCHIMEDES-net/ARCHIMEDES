import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminUdalostiRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/admin/udalosti");
  }, [router]);

  return null;
}
