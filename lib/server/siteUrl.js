const LOCAL_DEVELOPMENT_ORIGIN = "http://localhost:3000";
const VERCEL_HOST_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+vercel\.app$/i;

function isLocalHostname(hostname) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(
    String(hostname || "").toLowerCase()
  );
}

function normalizeConfiguredOrigin(value, { allowLocalhost, source }) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    throw new Error(`${source} není nakonfigurována.`);
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`${source} nemá platný formát URL.`);
  }

  if (parsed.username || parsed.password) {
    throw new Error(`${source} nesmí obsahovat přihlašovací údaje.`);
  }

  const local = isLocalHostname(parsed.hostname);
  if (local && !allowLocalhost) {
    throw new Error(`${source} nesmí v tomto prostředí odkazovat na localhost.`);
  }
  if (parsed.protocol !== "https:" && !(allowLocalhost && local && parsed.protocol === "http:")) {
    throw new Error(`${source} musí používat HTTPS mimo lokální vývoj.`);
  }

  return parsed.origin;
}

function normalizeVercelOrigin(value, source) {
  const hostname = String(value || "").trim().toLowerCase();
  if (!hostname) return "";
  if (!VERCEL_HOST_PATTERN.test(hostname)) {
    throw new Error(`${source} nemá bezpečný formát Vercel domény.`);
  }
  return `https://${hostname}`;
}

export function getServerSiteUrl(environment = process.env) {
  const vercelEnvironment = String(
    environment.VERCEL_ENV || environment.VERCEL_TARGET_ENV || ""
  ).trim();

  if (vercelEnvironment === "preview") {
    const branchOrigin = normalizeVercelOrigin(
      environment.VERCEL_BRANCH_URL,
      "VERCEL_BRANCH_URL"
    );
    if (branchOrigin) return branchOrigin;

    const deploymentOrigin = normalizeVercelOrigin(
      environment.VERCEL_URL,
      "VERCEL_URL"
    );
    if (deploymentOrigin) return deploymentOrigin;

    throw new Error("Preview prostředí nemá bezpečnou Vercel URL.");
  }

  const production =
    vercelEnvironment === "production" ||
    (!vercelEnvironment && environment.NODE_ENV === "production");
  if (production) {
    return normalizeConfiguredOrigin(environment.NEXT_PUBLIC_SITE_URL, {
      allowLocalhost: false,
      source: "NEXT_PUBLIC_SITE_URL",
    });
  }

  const developmentOrigin = String(
    environment.NEXT_PUBLIC_SITE_URL || LOCAL_DEVELOPMENT_ORIGIN
  ).trim();
  return normalizeConfiguredOrigin(developmentOrigin, {
    allowLocalhost: true,
    source: "NEXT_PUBLIC_SITE_URL",
  });
}
