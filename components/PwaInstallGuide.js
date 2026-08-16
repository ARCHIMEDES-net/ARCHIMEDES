import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Share,
  Smartphone,
} from "lucide-react";
import {
  PWA_INSTALLABLE_EVENT,
  PWA_INSTALLED_EVENT,
} from "./PwaRegistration";
import { isStandalonePwa } from "../lib/pwa";
import { installPlatformFromNavigator } from "../lib/pwaInstall";

const STEP_ICON_CLASS =
  "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-navy-900 shadow-sm ring-1 ring-slate-900/10";
const INSTALL_URL = "https://www.archimedeslive.com/instalace";

function Step({ number, title, children, icon = null }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className={STEP_ICON_CLASS} aria-hidden="true">
        {icon || <span className="text-xl font-black">{number}</span>}
        {icon ? (
          <span className="absolute -left-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-navy-900 px-1 text-sm font-black text-white">
            {number}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 pt-1">
        <h3 className="text-lg font-black leading-snug text-navy-900">{title}</h3>
        <div className="mt-1.5 text-base leading-relaxed text-slate-600">{children}</div>
      </div>
    </li>
  );
}

function SafariSteps({ startAt = 1 }) {
  return (
    <ol className="mt-6 grid gap-3">
      <Step number={startAt} title="Klepněte na Sdílet" icon={<Share className="h-7 w-7" />}>
        Hledejte čtvereček se šipkou nahoru. Pokud ho nevidíte, otevřete nabídku{" "}
        <MoreHorizontal className="inline h-5 w-5" aria-label="tři tečky" /> a zvolte
        „Sdílet“.
      </Step>
      <Step number={startAt + 1} title="Zvolte Přidat na plochu">
        Možná bude potřeba nabídku posunout níže. Pokud položka chybí, klepněte na
        „Upravit akce“ a přidejte ji.
      </Step>
      <Step number={startAt + 2} title="Potvrďte Přidat">
        Nechte zapnutou volbu „Otevřít jako webovou aplikaci“. Na ploše se objeví
        červenobílá ikona A Live.
      </Step>
    </ol>
  );
}

export default function PwaInstallGuide() {
  const [platform, setPlatform] = useState("loading");
  const [installed, setInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    function refreshInstallState() {
      setInstalled(isStandalonePwa());
      setInstallPrompt(window.__archimedesPwaInstallPrompt || null);
    }

    function markAsInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    setPlatform(installPlatformFromNavigator(window.navigator));
    refreshInstallState();
    window.addEventListener(PWA_INSTALLABLE_EVENT, refreshInstallState);
    window.addEventListener(PWA_INSTALLED_EVENT, markAsInstalled);

    return () => {
      window.removeEventListener(PWA_INSTALLABLE_EVENT, refreshInstallState);
      window.removeEventListener(PWA_INSTALLED_EVENT, markAsInstalled);
    };
  }, []);

  async function installOnAndroid() {
    const prompt = installPrompt || window.__archimedesPwaInstallPrompt;
    if (!prompt) return;

    setInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      window.__archimedesPwaInstallPrompt = null;
      setInstallPrompt(null);
      if (choice?.outcome === "accepted") setInstalled(true);
    } finally {
      setInstalling(false);
    }
  }

  async function copyAddress() {
    setCopyError(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(INSTALL_URL);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = INSTALL_URL;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        const copySucceeded = document.execCommand("copy");
        temporaryInput.remove();
        if (!copySucceeded) throw new Error("Clipboard is unavailable.");
      }
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  if (platform === "loading") {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-lg font-bold text-slate-600 shadow-sm">
        Zjišťuji typ telefonu…
      </div>
    );
  }

  if (installed) {
    return (
      <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm sm:p-9">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-700" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-black text-navy-900">A Live už máte v telefonu</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-slate-600">
          Hotovo. Příště aplikaci otevřete klepnutím na její ikonu na ploše.
        </p>
        <Link
          href="/portal/novinky"
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-2xl bg-navy-900 px-6 text-lg font-black text-white"
        >
          Otevřít Co je nového <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  if (platform === "ios-other") {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLASS} aria-hidden="true">
            <Smartphone className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-red-600">iPhone nebo iPad</p>
            <h2 className="mt-1 text-2xl font-black text-navy-900">Dokončete instalaci v Safari</h2>
          </div>
        </div>
        <ol className="mt-6 grid gap-3">
          <Step number="1" title="Zkopírujte adresu této stránky" icon={<Copy className="h-7 w-7" />}>
            <button
              type="button"
              onClick={copyAddress}
              className="mt-2 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-navy-900 px-5 text-lg font-black text-white sm:w-auto"
            >
              {copied ? <Check className="mr-2 h-5 w-5" aria-hidden="true" /> : <Copy className="mr-2 h-5 w-5" aria-hidden="true" />}
              {copied ? "Adresa je zkopírovaná" : "Zkopírovat adresu"}
            </button>
            {copyError ? (
              <p role="alert" className="mt-3 font-bold text-red-700">
                Adresu se nepodařilo zkopírovat. V Safari napište archimedeslive.com/instalace.
              </p>
            ) : null}
          </Step>
          <Step number="2" title="Otevřete Safari">
            Je to modrá ikona s kompasem. Vložte do něj zkopírovanou adresu a otevřete ji.
          </Step>
        </ol>
        <SafariSteps startAt={3} />
      </section>
    );
  }

  if (platform === "ios-safari") {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-red-600">iPhone nebo iPad · Safari</p>
        <h2 className="mt-2 text-2xl font-black text-navy-900">Tři jednoduché kroky</h2>
        <SafariSteps />
      </section>
    );
  }

  if (platform === "android") {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-red-600">Telefon s Androidem</p>
        <h2 className="mt-2 text-2xl font-black text-navy-900">Přidejte A Live do telefonu</h2>
        {installPrompt ? (
          <>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Klepněte na tlačítko a potom potvrďte instalaci v nabídce telefonu.
            </p>
            <button
              type="button"
              onClick={installOnAndroid}
              disabled={installing}
              className="mt-6 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-navy-900 px-6 text-lg font-black text-white disabled:opacity-60 sm:w-auto"
            >
              <Smartphone className="mr-2 h-6 w-6" aria-hidden="true" />
              {installing ? "Otevírám instalaci…" : "Přidat A Live do telefonu"}
            </button>
          </>
        ) : (
          <ol className="mt-6 grid gap-3">
            <Step number="1" title="Otevřete nabídku Chrome" icon={<MoreHorizontal className="h-7 w-7" />}>
              Klepněte na tři tečky vpravo nahoře.
            </Step>
            <Step number="2" title="Zvolte Přidat na plochu">
              Položka se může jmenovat také „Nainstalovat aplikaci“.
            </Step>
            <Step number="3" title="Potvrďte Instalovat">
              Na ploše telefonu se objeví červenobílá ikona A Live.
            </Step>
          </ol>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-red-600">Počítač</p>
      <h2 className="mt-2 text-2xl font-black text-navy-900">Otevřete tuto stránku v telefonu</h2>
      <p className="mt-3 text-lg leading-relaxed text-slate-600">
        Na telefonu zadejte do prohlížeče adresu <strong>archimedeslive.com/instalace</strong>.
        Průvodce pak automaticky ukáže správný postup pro váš telefon.
      </p>
      {installPrompt ? (
        <button
          type="button"
          onClick={installOnAndroid}
          disabled={installing}
          className="mt-6 inline-flex min-h-14 items-center justify-center rounded-2xl bg-navy-900 px-6 text-lg font-black text-white disabled:opacity-60"
        >
          <ExternalLink className="mr-2 h-5 w-5" aria-hidden="true" />
          {installing ? "Otevírám instalaci…" : "Nainstalovat také do počítače"}
        </button>
      ) : null}
    </section>
  );
}
