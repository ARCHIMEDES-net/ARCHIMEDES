import { useEffect } from "react";

export const PWA_INSTALLABLE_EVENT = "archimedes:pwa-installable";
export const PWA_INSTALLED_EVENT = "archimedes:pwa-installed";

export default function PwaRegistration() {
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
