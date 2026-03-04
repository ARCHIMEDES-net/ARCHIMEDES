// pages/_app.js
import "../styles/globals.css";
import { useRouter } from "next/router";
import PublicHeader from "../components/PublicHeader";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const path = router.pathname || "";

  // Skryj PublicHeader na portálu + admin stránkách (i kdyby byly v rootu /pages)
  const isPortalOrAdmin =
    path.startsWith("/portal") ||
    path.startsWith("/admin") ||
    path === "/kalendar" ||
    path === "/inzerce" ||
    path === "/archiv" ||
    path === "/admin-udalosti" ||
    path === "/admin-inzerce" ||
    path === "/admin-poptavky";

  const isAuthPage = path === "/login";

  const showPublicHeader = !isPortalOrAdmin && !isAuthPage;

  return (
    <>
      {showPublicHeader && <PublicHeader />}
      <Component {...pageProps} />
    </>
  );
}
