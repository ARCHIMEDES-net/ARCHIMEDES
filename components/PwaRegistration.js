import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

export const PWA_INSTALLABLE_EVENT = "archimedes:pwa-installable";
export const PWA_INSTALLED_EVENT = "archimedes:pwa-installed";
export const PWA_START_PATH = "/portal/novinky";

function isStandaloneDisplayMode() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)")?.matches === true
  );
}

export default function PwaRegistration() {
  const router = useRouter();
  const launchHandled = useRef(false);

  useEffect(() => {
    if (!router.isReady || launchHandled.current) return;

    launchHandled.current = true;
    const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

    // iOS may restore the installed app at /portal instead of honoring
    // the manifest start_url. Correct only the initial standalone launch;
    // later in-app navigation to the portal dashboard remains untouched.
    if (isStandaloneDisplayMode() && pathname === "/portal") {
      router.replace(PWA_START_PATH);
    }
  }, [router]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      window.__archimedesPwaInstallPrompt = event;
      window.dispatchEvent(new Event(PWA_INSTALLABLE_EVENT));
    }

    function handleInstalled() {
      window.__archimedesPwaInstallPrompt = null;
      window.dispatchEvent(new Event(PWA_INSTALLED_EVENT));
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if (
      process.env.NODE_ENV === "production" &&
      window.isSecureContext &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("PWA service worker registration error:", error);
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  return null;
}
