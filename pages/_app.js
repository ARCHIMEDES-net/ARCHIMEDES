// pages/_app.js
import "../styles/globals.css";
import { useRouter } from "next/router";
import PublicHeader from "../components/PublicHeader";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const path = router.pathname || "";

  const isPortal = path.startsWith("/portal");
  const isAuthPage = path === "/login"; // případně i /logout, pokud ho používáte jako stránku
  const showPublicHeader = !isPortal && !isAuthPage;

  return (
    <>
      {showPublicHeader && <PublicHeader />}
      <Component {...pageProps} />
    </>
  );
}
