export const ANALYTICS_CONSENT_KEY = "archimedes-analytics-consent";
export const ANALYTICS_CONSENT_AT_KEY = "archimedes-analytics-consent-at";
export const ANALYTICS_CONSENT_EVENT = "archimedes:analytics-consent";
export const ANALYTICS_CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function storageAvailable() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function readAnalyticsConsent() {
  if (!storageAvailable()) return null;

  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (value !== "granted" && value !== "denied") return null;

    const storedAt = Number(
      window.localStorage.getItem(ANALYTICS_CONSENT_AT_KEY)
    );

    // Preserve an existing choice made before consent timestamps were introduced.
    if (!Number.isFinite(storedAt) || storedAt <= 0) {
      window.localStorage.setItem(ANALYTICS_CONSENT_AT_KEY, String(Date.now()));
      return value;
    }

    if (Date.now() - storedAt > ANALYTICS_CONSENT_MAX_AGE_MS) {
      clearAnalyticsConsent();
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value) {
  if (value !== "granted" && value !== "denied") return;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    window.localStorage.setItem(ANALYTICS_CONSENT_AT_KEY, String(Date.now()));
  } catch {
    // The current page can still honor the choice when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: { value } })
  );
}

export function clearAnalyticsConsent() {
  if (!storageAvailable()) return;

  try {
    window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    window.localStorage.removeItem(ANALYTICS_CONSENT_AT_KEY);
  } catch {
    // A blocked storage API must not break the page.
  }
}

export function deleteGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;

  const hostname = window.location.hostname;
  const rootDomain = hostname.split(".").slice(-2).join(".");
  const domainCandidates = [
    "",
    hostname,
    `.${hostname}`,
    rootDomain,
    `.${rootDomain}`,
  ];
  const cookieNames = document.cookie
    .split(";")
    .map((item) => item.split("=")[0]?.trim())
    .filter((name) => name === "_ga" || name?.startsWith("_ga_"));

  cookieNames.forEach((name) => {
    domainCandidates.forEach((domain) => {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
    });
  });
}
