// pages/_app.js
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";

import { useRouter } from "next/router";
import Head from "next/head";
import PublicHeader from "../components/PublicHeader";

function activeKeyFromPath(pathname = "") {
  if (pathname === "/") return "home";
  if (pathname === "/program") return "program";
  if (pathname === "/cenik") return "cenik";
  if (pathname === "/poptavka") return "poptavka";
  if (pathname === "/kontakt") return "kontakt";
  return "";
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const pathname = router.pathname || "";

  const isPortal = pathname.startsWith("/portal");
  const isAuthPage = pathname === "/login";
  const isWelcomePage = pathname === "/welcome";
  const isCreateOrganizationPage = pathname === "/create-organization";
  const isJoinPage = pathname === "/join";

  const showPublicHeader =
    !isPortal &&
    !isAuthPage &&
    !isWelcomePage &&
    !isCreateOrganizationPage &&
    !isJoinPage;

  const active = activeKeyFromPath(pathname);

  const siteUrl = "https://www.archimedeslive.com";
  const title = "ARCHIMEDES Live";
  const description =
    "Živý vzdělávací program pro školy, obce a komunitu. Program, pracovní listy, online vstupy a portál ARCHIMEDES Live.";
  const imageUrl = `${siteUrl}/og-image.jpg`;

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta name="theme-color" content="#111827" />

        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ARCHIMEDES Live" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={imageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Head>

      {showPublicHeader && <PublicHeader active={active} />}
      <Component {...pageProps} />
    </>
  );
}
