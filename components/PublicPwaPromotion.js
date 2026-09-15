import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { PWA_INSTALLED_EVENT } from "./PwaRegistration";
import { isStandalonePwa } from "../lib/pwa";
import { installPlatformFromNavigator } from "../lib/pwaInstall";
import {
  PWA_DISCOVERY_STORAGE_KEY,
  pwaDiscoveryDismissalValue,
  pwaDiscoveryInstalledValue,
  readPwaDiscoveryState,
  shouldShowPwaDiscovery,
} from "../lib/pwaDiscovery";

const DISMISSED_EVENT = "archimedes:pwa-discovery-dismissed";

export default function PublicPwaPromotion({ compact = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    let stopped = false;
    function stored() {
      try { return window.localStorage.getItem(PWA_DISCOVERY_STORAGE_KEY) || ""; }
      catch { return ""; }
    }
    function hide() {
      stopped = true;
      window.clearTimeout(timer);
      setVisible(false);
    }
    function installed() {
      try { window.localStorage.setItem(PWA_DISCOVERY_STORAGE_KEY, pwaDiscoveryInstalledValue()); }
      catch { /* Standalone detection still works without storage. */ }
      hide();
    }
    function displayChanged(event) { if (event.matches) installed(); }
    function storageChanged(event) {
      if (event.key !== PWA_DISCOVERY_STORAGE_KEY) return;
      if (readPwaDiscoveryState(event.newValue).installed || (compact && !shouldShowPwaDiscovery({ storedValue: event.newValue }))) hide();
    }
    const displayMode = window.matchMedia?.("(display-mode: standalone)");
    if (isStandalonePwa()) {
      installed();
    } else if (!readPwaDiscoveryState(stored()).installed) {
      if (!compact) setVisible(true);
      else if (installPlatformFromNavigator(window.navigator) !== "desktop") {
        timer = window.setTimeout(() => {
          if (!stopped && document.visibilityState === "visible" && shouldShowPwaDiscovery({ standalone: isStandalonePwa(), storedValue: stored() })) setVisible(true);
        }, 20000);
      }
    }
    window.addEventListener(PWA_INSTALLED_EVENT, installed);
    window.addEventListener("storage", storageChanged);
    if (compact) window.addEventListener(DISMISSED_EVENT, hide);
    displayMode?.addEventListener?.("change", displayChanged);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(PWA_INSTALLED_EVENT, installed);
      window.removeEventListener("storage", storageChanged);
      window.removeEventListener(DISMISSED_EVENT, hide);
      displayMode?.removeEventListener?.("change", displayChanged);
    };
  }, [compact]);

  function dismiss() {
    try { window.localStorage.setItem(PWA_DISCOVERY_STORAGE_KEY, pwaDiscoveryDismissalValue()); }
    catch { /* Closing remains available when storage is blocked. */ }
    setVisible(false);
    window.dispatchEvent(new Event(DISMISSED_EVENT));
  }

  if (!visible) return null;

  if (compact) return <aside aria-label="Tip: program v telefonu" className="relative mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 pr-14 md:hidden">
    <p className="font-bold text-navy-900">Mějte program po ruce</p>
    <Link href="/instalace" className="inline-flex min-h-11 items-center gap-2 font-bold text-navy-900 underline underline-offset-4"><Smartphone className="h-4 w-4" aria-hidden="true" /> Přidat do telefonu</Link>
    <button type="button" onClick={dismiss} aria-label="Zavřít nabídku na 30 dní" className="absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-600 hover:bg-white"><X className="h-5 w-5" aria-hidden="true" /></button>
  </aside>;

  return <section aria-labelledby="public-pwa-title" className="mt-10 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#eef5fb] via-white to-emerald-50 p-6 sm:p-8">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex max-w-2xl items-start gap-4">
        <Image src="/pwa-icon-192.png" alt="" width={64} height={64} className="h-14 w-14 shrink-0 rounded-2xl shadow-sm sm:h-16 sm:w-16" />
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-red-600">Program vždy po ruce</p>
          <h2 id="public-pwa-title" className="mt-2 text-2xl font-black leading-tight tracking-tight text-navy-900 sm:text-3xl">ARCHIMEDES Live ve vašem telefonu</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">Mějte program po ruce. S přístupem k platformě sledujte vysílání i na mobilu.</p>
        </div>
      </div>
      <div className="shrink-0 sm:max-w-[240px]">
        <Link href="/instalace" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 font-bold text-white hover:bg-navy-800"><Smartphone className="h-5 w-5" aria-hidden="true" /> Přidat do telefonu</Link>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">Přidání je zdarma. Přístup k vysílání se řídí vaším účtem a licencí.</p>
      </div>
    </div>
  </section>;
}
