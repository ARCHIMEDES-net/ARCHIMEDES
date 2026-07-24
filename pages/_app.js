// pages/_app.js
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";
import PublicHeader from "../components/PublicHeader";
import FloatingJoinCta from "../components/FloatingJoinCta";
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

const GA_MEASUREMENT_ID = "G-5J0WP0X4DK";
const ANALYTICS_CONSENT_KEY = "archimedes-analytics-consent";

const DEFAULT_DESCRIPTION =
  "Pravidelný živý program pro školy, spolky, seniory a další místní komunity. Lidé se při něm setkávají, vzdělávají a sbližují.";

const PAGE_SEO = {
  "/": {
    title: "ARCHIMEDES Live | Živý program pro obce, školy a spolky",
    description:
      "ARCHIMEDES Live přináší obcím, školám a spolkům pravidelná živá vysílání s odborníky a společný program, který lidi vzdělává a sbližuje.",
    image: "/hero-komunita-dsc00554.webp",
    imageWidth: 2048,
    imageHeight: 1365,
    imageAlt: "Společné komunitní setkání u učebny ARCHIMEDES",
    service: {
      name: "ARCHIMEDES Live – živý program pro obce, školy a spolky",
      serviceType: "Živý vzdělávací a komunitní program",
      audienceType: "Obce, školy, spolky, senioři a místní komunity",
    },
  },
  "/program": {
    title: "Co přinášíme | ARCHIMEDES Live",
    description:
      "Konkrétní živá vysílání a program ARCHIMEDES Live pro školy, spolky, seniory a místní komunity.",
    image: "/program-hero.jpg",
    imageWidth: 2048,
    imageHeight: 1152,
    imageAlt: "Společné sledování živého programu ARCHIMEDES Live",
    breadcrumbName: "Co přinášíme",
    service: {
      name: "Program a živá vysílání ARCHIMEDES Live",
      serviceType: "Moderovaná živá vzdělávací vysílání",
      audienceType: "Školy, obce, spolky, senioři a místní komunity",
    },
  },
  "/obec": {
    title: "Program pro obce | ARCHIMEDES Live",
    description:
      "Pravidelný živý program pro školu, spolky, seniory a další obyvatele v jednom předplatném pro celou obec.",
    image: "/ucebna-komunita.webp",
    imageWidth: 700,
    imageHeight: 467,
    imageAlt: "Společné komunitní setkání u učebny ARCHIMEDES",
    breadcrumbName: "Pro obce",
    service: {
      name: "ARCHIMEDES Live pro obce",
      serviceType: "Živý vzdělávací a komunitní program pro obce",
      audienceType: "Obce, jejich školy, spolky, senioři a další obyvatelé",
    },
  },
  "/skoly": {
    title: "Živý program pro školy | ARCHIMEDES Live",
    description:
      "Živé vstupy s odborníky, témata z praxe, pracovní listy a záznamy pro základní školy zapojené do ARCHIMEDES Live.",
    image: "/jak-funguje-trida.webp",
    imageWidth: 1400,
    imageHeight: 933,
    imageAlt: "Žáci se zapojují do programu ARCHIMEDES Live",
    breadcrumbName: "Pro školy",
    service: {
      name: "ARCHIMEDES Live pro základní školy",
      serviceType: "Živý vzdělávací program pro základní školy",
      audienceType: "Žáci a učitelé 1. a 2. stupně základních škol",
    },
  },
  "/spolky": {
    title: "Živý program pro spolky | ARCHIMEDES Live",
    description:
      "Živý odborný program pro hasiče, včelaře, myslivce, rybáře, zahrádkáře, seniorské a další spolky.",
    image: "/ucebna-komunita.webp",
    imageWidth: 700,
    imageHeight: 467,
    imageAlt: "Společné setkání u programu ARCHIMEDES Live",
    breadcrumbName: "Pro spolky",
    service: {
      name: "ARCHIMEDES Live pro spolky",
      serviceType: "Živý vzdělávací a komunitní program pro spolky",
      audienceType: "Spolky a jejich členové",
    },
  },
  "/pro-organizace": {
    title: "Pro národní svazy a organizace | ARCHIMEDES Live",
    description:
      "Partnerství pro národní svazy a organizace, které chtějí vysílat k místním členům a přiblížit svou činnost školám.",
    image: "/program-vysilani.webp",
    imageWidth: 1024,
    imageHeight: 683,
    imageAlt: "Živé odborné vysílání ARCHIMEDES v učebně",
    breadcrumbName: "Pro svazy",
    service: {
      name: "Partnerství ARCHIMEDES Live pro svazy a národní organizace",
      serviceType: "Odborné vysílání pro členy organizací a školy",
      audienceType: "Svazy, národní organizace, jejich místní členové a školy",
    },
  },
  "/ucebna": {
    title: "Venkovní učebna ARCHIMEDES® | Pro školy a obce",
    description:
      "Celoroční venkovní učebna ARCHIMEDES® pro moderní výuku, živé vysílání a komunitní program. Varianty, vybavení a výsledky realizací v obcích.",
    image: "/ucebna.jpg",
    imageWidth: 2048,
    imageHeight: 1365,
    imageAlt: "Celoroční venkovní učebna ARCHIMEDES",
    breadcrumbName: "Učebna ARCHIMEDES",
    product: {
      name: "Venkovní učebna ARCHIMEDES",
      category: "Celoroční venkovní učebna pro školy a obce",
    },
  },
  "/o-nas": {
    title: "Naše vize | ARCHIMEDES Live",
    description:
      "Naší vizí jsou obce, ve kterých kvalitní živý program podporuje školy, spolky a komunity a přivádí lidi k osobnímu setkávání.",
    image: "/spolecna.jpg",
    imageWidth: 1024,
    imageHeight: 683,
    imageAlt: "Lidé při společném komunitním setkání ARCHIMEDES",
    breadcrumbName: "Naše vize",
  },
  "/kontakt": {
    title: "Kontakt | ARCHIMEDES Live",
    description:
      "Kontakt na tým ARCHIMEDES Live. Ozvěte se nám kvůli programu pro školy, obce, komunitní spolupráci nebo vzorové učebně.",
    image: "/spolecna.jpg",
    imageWidth: 1024,
    imageHeight: 683,
    imageAlt: "Tým a komunita ARCHIMEDES Live",
    breadcrumbName: "Kontakt",
  },
  "/zadost": {
    title: "Zapojit obec, školu nebo spolek | ARCHIMEDES Live",
    description:
      "Objednejte jednotný program ARCHIMEDES Live pro obec, školu nebo spolek za 1 990 Kč měsíčně.",
    image: "/ucebna-komunita.webp",
    imageWidth: 700,
    imageHeight: 467,
    imageAlt: "Komunitní program ARCHIMEDES Live v obci",
    breadcrumbName: "Žádost o program",
  },
  "/poptavka-ucebny": {
    title: "Poptávka venkovní učebny ARCHIMEDES®",
    description:
      "Nezávazná poptávka venkovní učebny ARCHIMEDES® pro školu nebo obec. Ozveme se vám kvůli variantě, místu realizace a dalšímu postupu.",
    image: "/ucebna-exterier.webp",
    imageWidth: 2048,
    imageHeight: 1280,
    imageAlt: "Venkovní učebna ARCHIMEDES",
    breadcrumbName: "Poptávka učebny",
  },
  "/media": {
    title: "Média a realizace učeben ARCHIMEDES®",
    description:
      "Reálné realizace venkovních učeben ARCHIMEDES®, jejich využití a výběr článků a reportáží.",
    image: "/ucebna.jpg",
    imageWidth: 2048,
    imageHeight: 1365,
    imageAlt: "Realizace venkovní učebny ARCHIMEDES",
    breadcrumbName: "Média a realizace",
  },
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [analyticsConsent, setAnalyticsConsent] = useState(null);
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
    const storedConsent = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (storedConsent === "granted" || storedConsent === "denied") {
      setAnalyticsConsent(storedConsent);
    }
  }, []);

  useEffect(() => {
    if (analyticsConsent !== "granted") return undefined;

    const trackPageView = (url) => {
      if (typeof window.gtag !== "function") return;
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
        anonymize_ip: true,
      });
    };

    router.events.on("routeChangeComplete", trackPageView);
    return () => router.events.off("routeChangeComplete", trackPageView);
  }, [analyticsConsent, router.events]);

  useEffect(() => {
    if (!showPublicHeader) return undefined;
    return applyCzechNonBreakingSpaces(document.body);
  }, [showPublicHeader]);

  const active = activeKeyFromPath(pathname);

  const siteUrl = "https://www.archimedeslive.com";
  const publicPath = (router.asPath || pathname || "/").split(/[?#]/)[0] || "/";
  const canonicalUrl = `${siteUrl}${publicPath === "/" ? "" : publicPath}`;
  const noIndex = isPortal || NO_INDEX_PATHS.has(pathname);
  const pageSeo = PAGE_SEO[pathname] || {};
  const title = pageSeo.title || "ARCHIMEDES Live";
  const socialTitle = pageSeo.title || "ARCHIMEDES Live | Živý program pro celou obec";
  const description = pageSeo.description || DEFAULT_DESCRIPTION;
  const imageUrl = `${siteUrl}${pageSeo.image || "/spolecna.jpg"}`;
  const imageWidth = pageSeo.imageWidth || 1024;
  const imageHeight = pageSeo.imageHeight || 683;
  const imageAlt =
    pageSeo.imageAlt || "Účastníci společného programu před učebnou ARCHIMEDES";
  const structuredGraph = [
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
  ];

  if (pageSeo.service) {
    structuredGraph.push({
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: pageSeo.service.name,
      description,
      serviceType: pageSeo.service.serviceType,
      areaServed: { "@type": "Country", name: "Česká republika" },
      provider: { "@id": `${siteUrl}/#organization` },
      audience: {
        "@type": "Audience",
        audienceType: pageSeo.service.audienceType,
      },
    });
  }

  if (pageSeo.product) {
    structuredGraph.push({
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: pageSeo.product.name,
      description,
      category: pageSeo.product.category,
      image: imageUrl,
      brand: { "@id": `${siteUrl}/#organization` },
    });
  }

  if (!noIndex && pathname !== "/" && pageSeo.breadcrumbName) {
    structuredGraph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Domů",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageSeo.breadcrumbName,
          item: canonicalUrl,
        },
      ],
    });
  }

  const updateAnalyticsConsent = (value) => {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    setAnalyticsConsent(value);

    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: value,
      });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": structuredGraph,
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
        <meta property="og:image:width" content={String(imageWidth)} />
        <meta property="og:image:height" content={String(imageHeight)} />
        <meta
          property="og:image:alt"
          content={imageAlt}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content={imageAlt}
        />

        {!noIndex ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        ) : null}
      </Head>

      <Script id="google-consent-default" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});`}
      </Script>

      {analyticsConsent === "granted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`gtag('js', new Date());
gtag('consent', 'update', { analytics_storage: 'granted' });
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {analyticsConsent === null ? (
        <section
          role="dialog"
          aria-label="Nastavení analytických cookies"
          style={{
            position: "fixed",
            zIndex: 10000,
            right: "1rem",
            bottom: "1rem",
            width: "min(420px, calc(100vw - 2rem))",
            padding: "1rem",
            borderRadius: "14px",
            background: "#111827",
            color: "#fff",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.3)",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.4rem" }}>
            Pomozte nám zlepšovat ARCHIMEDES Live
          </strong>
          <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.5, color: "#e5e7eb" }}>
            S vaším souhlasem použijeme Google Analytics k anonymizovanému měření
            návštěvnosti. Bez souhlasu analytické cookies neaktivujeme.{" "}
            <a
              href="/ochrana-osobnich-udaju"
              style={{ color: "#f6c344", textDecoration: "underline" }}
            >
              Více informací
            </a>
          </p>
          <div style={{ display: "flex", gap: "0.65rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => updateAnalyticsConsent("denied")}
              style={{
                padding: "0.6rem 0.9rem",
                border: "1px solid #9ca3af",
                borderRadius: "9px",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Odmítnout
            </button>
            <button
              type="button"
              onClick={() => updateAnalyticsConsent("granted")}
              style={{
                padding: "0.6rem 0.9rem",
                border: 0,
                borderRadius: "9px",
                background: "#f6c344",
                color: "#111827",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Povolit analytiku
            </button>
          </div>
        </section>
      ) : null}

      {showPublicHeader && <PublicHeader active={active} />}

      <Component {...pageProps} />

      <FloatingJoinCta />

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}
