import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QrCode, Smartphone, X } from "lucide-react";
import { PWA_INSTALLED_EVENT } from "./PwaRegistration";
import { isStandalonePwa } from "../lib/pwa";
import { installPlatformFromNavigator } from "../lib/pwaInstall";
import {
  PWA_DISCOVERY_STORAGE_KEY,
  pwaDiscoveryDismissalValue,
  pwaDiscoveryInstalledValue,
  shouldShowPwaDiscovery,
} from "../lib/pwaDiscovery";

export default function PwaInstallDiscovery() {
  const [platform, setPlatform] = useState("loading");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = isStandalonePwa();
    let storedValue = "";
    try {
      storedValue = window.localStorage.getItem(PWA_DISCOVERY_STORAGE_KEY) || "";
    } catch {
      // The prompt still works when a browser blocks local storage.
    }

    setPlatform(installPlatformFromNavigator(window.navigator));
    setVisible(shouldShowPwaDiscovery({ standalone, storedValue }));

    function markInstalled() {
      try {
        window.localStorage.setItem(
          PWA_DISCOVERY_STORAGE_KEY,
          pwaDiscoveryInstalledValue()
        );
      } catch {
        // Standalone detection keeps the card hidden even without storage.
      }
      setVisible(false);
    }

    const displayMode = window.matchMedia?.("(display-mode: standalone)");
    function handleDisplayModeChange(event) {
      if (event.matches) markInstalled();
    }

    window.addEventListener(PWA_INSTALLED_EVENT, markInstalled);
    displayMode?.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(PWA_INSTALLED_EVENT, markInstalled);
      displayMode?.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(
        PWA_DISCOVERY_STORAGE_KEY,
        pwaDiscoveryDismissalValue()
      );
    } catch {
      // Dismiss the card for the current page even if storage is unavailable.
    }
    setVisible(false);
  }

  if (!visible || platform === "loading") return null;

  const isDesktop = platform === "desktop";

  return (
    <section
      aria-label="Přidání A Live do telefonu"
      className="border-b border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50"
    >
      <div className="relative mx-auto flex max-w-[1160px] flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Nyní nezobrazovat. Připomenout za 30 dní."
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex max-w-2xl gap-4 pr-10">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm">
            {isDesktop ? (
              <QrCode className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Smartphone className="h-7 w-7" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.08em] text-red-600">
              A Live vždy po ruce
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-navy-900 sm:text-2xl">
              Přidejte si A Live do telefonu
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
              Na ploše budete mít vlastní ikonu a může na ní být vidět počet novinek.
              Nic nemusíte hledat v App Storu ani Google Play.
            </p>
          </div>
        </div>

        {isDesktop ? (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 pr-5 shadow-sm">
            <Image
              src="/qr-instalace.svg"
              alt="QR kód pro otevření instalačního průvodce A Live v telefonu"
              width={296}
              height={296}
              unoptimized
              className="h-28 w-28 rounded-lg"
            />
            <div className="max-w-[210px]">
              <p className="font-black text-navy-900">Naskenujte fotoaparátem</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Nebo v telefonu otevřete archimedeslive.com/instalace.
              </p>
              <Link
                href="/instalace"
                className="mt-2 inline-flex min-h-11 items-center font-black text-navy-900 underline decoration-slate-300 underline-offset-4"
              >
                Ukázat návod
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/instalace"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-navy-900 px-6 text-lg font-black text-white shadow-sm transition-colors hover:bg-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 sm:w-auto"
          >
            <Smartphone className="mr-2 h-6 w-6" aria-hidden="true" />
            Přidat A Live do telefonu
          </Link>
        )}
      </div>
    </section>
  );
}
