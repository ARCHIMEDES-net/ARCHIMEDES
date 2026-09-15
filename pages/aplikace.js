import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function AppEntry() {
  const router = useRouter();
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({data}) => {
      if (active && data?.session) router.replace("/portal");
    }).catch(() => {});
    return () => { active = false; };
  }, [router]);
  return <><Head><title>ARCHIMEDES Live – program a sledování</title></Head><main className="mx-auto max-w-[700px] px-5 py-12">
    <Link href="/" className="text-lg font-black text-navy-900">ARCHIMEDES <span className="text-red-600">Live</span></Link>
    <h1 className="mt-8 text-4xl font-black leading-tight text-navy-900">Živé zážitky. Nové poznání.</h1>
    <p className="mt-4 text-lg text-slate-600">Objevte vysílání pro školy i komunitu. Přihlaste se a sledujte dostupný program přímo na telefonu.</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-2"><Link href="/login?next=%2Fportal" className="flex min-h-12 items-center justify-center rounded-xl bg-navy-900 px-4 py-3 font-bold text-white">Přihlásit se ke sledování</Link><Link href="/program" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-bold">Prohlédnout program</Link></div>
    <p className="mt-6 text-slate-600">Ještě nemáte přístup? <Link href="/zadost-o-pristup" className="font-bold underline">Požádat o přístup</Link></p>
    <p className="mt-3 text-sm text-slate-600">Chráněná vysílání a záznamy jsou dostupné podle oprávnění vašeho účtu a licence.</p>
  </main></>;
}
