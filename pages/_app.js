// pages/_app.js
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import { useRouter } from "next/router";
import PublicHeader from "../components/PublicHeader";

function activeKeyFromPath(pathname = "") {
  if (pathname === "/") return "home";
  if (pathname === "/program") return "program";
  if (pathname === "/cenik") return "cenik";
  if (pathname === "/poptavka") return "poptavka";
  return "";
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const pathname = router.pathname || "";

  const isPortal = pathname.startsWith("/portal");
  const isAuthPage = pathname === "/login";
  const showPublicHeader = !isPortal && !isAuthPage;

  const active = activeKeyFromPath(pathname);

  return (
    <>
      {showPublicHeader && <PublicHeader active={active} />}
      <Component {...pageProps} />
    </>
  );
}
