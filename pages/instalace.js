import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Bell, CircleHelp, ShieldCheck } from "lucide-react";
import PwaInstallGuide from "../components/PwaInstallGuide";

export default function InstalacePage() {
  return (
    <>
      <Head>
        <title>Přidat A Live do telefonu | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Jednoduchý návod, jak přidat ARCHIMEDES Live na plochu iPhonu, iPadu nebo telefonu s Androidem."
        />
      </Head>

      <main className="min-h-screen bg-[#f6f8fb] px-4 py-7 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-9 flex justify-center">
            <Link href="/" aria-label="ARCHIMEDES Live — domů">
              <Image
                src="/logo-archimedes-live.png"
                alt="ARCHIMEDES Live"
                width={842}
                height={130}
                priority
                className="h-auto w-[230px] sm:w-[280px]"
              />
            </Link>
          </div>
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">ARCHIMEDES Live</p>
            <h1 className="mt-2 text-[clamp(2.25rem,8vw,4rem)] font-black leading-[1.02] tracking-[-0.04em] text-navy-900">
              Přidat A Live do telefonu
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              Aplikaci pak otevřete jedním klepnutím. Nemusíte ji hledat v prohlížeči.
            </p>
          </div>

          <PwaInstallGuide />

          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <Bell className="mt-1 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-black text-navy-900">Číslo na ikoně</h2>
                  <p className="mt-1 leading-relaxed text-slate-600">
                    Po přihlášení může ikona ukázat počet nových oznámení. Povolení si aplikace vyžádá zvlášť.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-black text-navy-900">Bez nečekaných zpráv</h2>
                  <p className="mt-1 leading-relaxed text-slate-600">
                    Samotná instalace nezapne e-maily ani automatická upozornění.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <Link
              href="/portal/novinky"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-base font-black text-navy-900"
            >
              Přejít na Co je nového
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex min-h-14 items-center justify-center px-5 text-base font-black text-navy-900 underline decoration-slate-300 underline-offset-4"
            >
              <CircleHelp className="mr-2 h-5 w-5" aria-hidden="true" /> Potřebuji pomoc
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
