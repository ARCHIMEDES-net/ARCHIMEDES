// pages/_app.js
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PublicHeader from "../components/PublicHeader";
import { Analytics } from "@vercel/analytics/react";
import { applyCzechNonBreakingSpaces } from "../lib/czechTypography";

function activeKeyFromPath(pathname = "") {
  if (pathname === "/program") return "program";
  if (pathname === "/obec") return "obec";
  if (pathname === "/skoly") return "skoly";
  if (pathname === "/pro-organizace") return "pro-organizace";
  if (pathname === "/ucebna") return "ucebna";
  if (pathname === "/o-nas") return "o-nas";
  if (pathname === "/kontakt") return "kontakt";
  return "";
}

const NO_INDEX_PATHS = new Set([
  "/login",
  "/logout",
  "/reset-hesla",
  "/nastavit-heslo",
  "/nastaveni-pristupu",
  "/join",
  "/welcome",
  "/create-organization",
  "/registrace-skoly",
  "/registrace-spolku",
  "/pridat-se-k-organizaci",
  "/guest",
]);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const pathname = router.pathname || "";

  const isPortal = pathname.startsWith("/portal");
  const isAccessSetupPage =
    pathname === "/nastaveni-pristupu" || pathname === "/welcome";
  const isCreateOrganizationPage = pathname === "/create-organization";
  const isJoinPage = pathname === "/join";

  const showPublicHeader =
    !isPortal &&
    !isAccessSetupPage &&
    !isCreateOrganizationPage &&
    !isJoinPage;

  useEffect(() => {
    if (!showPublicHeader) return undefined;
    return applyCzechNonBreakingSpaces(document.body);
  }, [showPublicHeader]);

  const active = activeKeyFromPath(pathname);

  const siteUrl = "https://www.archimedeslive.com";
  const publicPath = (router.asPath || pathname || "/").split(/[?#]/)[0] || "/";
  const canonicalUrl = `${siteUrl}${publicPath === "/" ? "" : publicPath}`;
  const noIndex = isPortal || NO_INDEX_PATHS.has(pathname);
  const title = "ARCHIMEDES Live";
  const socialTitle = "ARCHIMEDES Live | Živý program pro celou obec";
  const description =
    "Pravidelný živý program pro školy, spolky, seniory a další místní komunity. Lidé se při něm setkávají, vzdělávají a sbližují.";
  const imageUrl = `${siteUrl}/spolecna.jpg`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "ARCHIMEDES Live",
        legalName: "EduVision s.r.o.",
        url: siteUrl,
        logo: `${siteUrl}/logo-archimedes-live.png`,
        email: "zive@archimedeslive.com",
        telephone: "+420732827210",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Purkyňova 649/127",
          postalCode: "612 00",
          addressLocality: "Brno",
          addressCountry: "CZ",
        },
        sameAs: [
          "https://www.facebook.com/profile.php?id=61566688307686&locale=cs_CZ",
          "https://www.instagram.com/archimedes_live/",
          "https://www.linkedin.com/company/108554477/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "ARCHIMEDES Live",
        url: siteUrl,
        inLanguage: "cs-CZ",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}/#live-program`,
        name: "Pravidelný živý program ARCHIMEDES Live pro obce",
        description,
        serviceType: "Živý vzdělávací a komunitní program pro obce",
        areaServed: { "@type": "Country", name: "Česká republika" },
        provider: { "@id": `${siteUrl}/#organization` },
        audience: {
          "@type": "Audience",
          audienceType: "Obce, školy, spolky, senioři a místní komunity",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta name="theme-color" content="#111827" />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

        {!noIndex ? <link rel="canonical" href={canonicalUrl} /> : null}

        <link rel="icon" href="/logo-archimedes-live-mark.png" />
        <link rel="shortcut icon" href="/logo-archimedes-live-mark.png" />
        <link rel="apple-touch-icon" href="/logo-archimedes-live-mark-512.png" />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="cs_CZ" />
        <meta property="og:site_name" content="ARCHIMEDES Live" />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="683" />
        <meta
          property="og:image:alt"
          content="Účastníci společného programu před učebnou ARCHIMEDES"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Účastníci společného programu před učebnou ARCHIMEDES"
        />

        {!noIndex ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        ) : null}
      </Head>

      {showPublicHeader && <PublicHeader active={active} />}

      <Component {...pageProps} />

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}
