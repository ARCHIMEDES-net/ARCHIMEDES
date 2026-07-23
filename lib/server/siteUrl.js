const PRODUCTION_SITE_URL = "https://www.archimedeslive.com";

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function getServerSiteUrl() {
  const vercelUrl = normalizeUrl(process.env.VERCEL_URL);

  if (
    process.env.VERCEL_ENV === "preview" &&
    /^[a-z0-9.-]+\.vercel\.app$/i.test(vercelUrl)
  ) {
    return `https://${vercelUrl}`;
  }

  return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) || PRODUCTION_SITE_URL;
}
