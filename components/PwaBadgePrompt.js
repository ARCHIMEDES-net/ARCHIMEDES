import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  appBadgePermissionState,
  publishUnreadNotificationCount,
  requestAppBadgePermission,
} from "../lib/appBadge";
import { isStandalonePwa } from "../lib/pwa";

const PWA_BADGE_PROMPT_STORAGE_KEY = "archimedes-pwa-badge-prompt-dismissed-v1";

export default function PwaBadgePrompt({ unreadCount = 0 }) {
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!isStandalonePwa() || appBadgePermissionState() !== "default") return;

    try {
      if (window.localStorage.getItem(PWA_BADGE_PROMPT_STORAGE_KEY) === "dismissed") {
        return;
      }
    } catch {
      // The prompt can still be shown when local storage is unavailable.
    }

    setVisible(true);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(PWA_BADGE_PROMPT_STORAGE_KEY, "dismissed");
    } catch {
      // Hide the prompt for the current page even if storage is unavailable.
    }
    setVisible(false);
  }

  async function enableBadge() {
    setRequesting(true);
    const permission = await requestAppBadgePermission();

    if (permission === "granted") {
      publishUnreadNotificationCount(unreadCount);
      setVisible(false);
    } else if (permission === "denied") {
      setVisible(false);
    }

    setRequesting(false);
  }

  if (!visible) return null;

  return (
    <section
      aria-label="Nastavení počtu novinek na ikoně"
      className="border-b border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50"
    >
      <div className="relative mx-auto flex max-w-[1160px] flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Nyní nezapínat"
          className="absolute right-2 top-2 flex min-h-10 min-w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 sm:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex max-w-2xl gap-3 pr-9 sm:pr-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.08em] text-blue-700">
              Novinky na první pohled
            </p>
            <h2 className="mt-0.5 text-lg font-black leading-tight text-navy-900">
              Zapnout počet novinek na ikoně?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Na ikoně A Live uvidíte počet nepřečtených novinek. Nezapne to e-maily ani automatické zprávy.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 pl-14 sm:pl-0">
          <button
            type="button"
            onClick={dismiss}
            className="hidden min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 font-bold text-navy-900 transition-colors hover:border-slate-400 sm:inline-flex"
          >
            Teď ne
          </button>
          <button
            type="button"
            onClick={enableBadge}
            disabled={requesting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy-900 px-4 font-black text-white transition-colors hover:bg-navy-800 disabled:cursor-wait disabled:opacity-70"
          >
            {requesting ? "Čekám na potvrzení…" : "Zapnout číslo"}
          </button>
        </div>
      </div>
    </section>
  );
}
