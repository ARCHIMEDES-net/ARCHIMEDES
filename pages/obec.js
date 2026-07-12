import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import SectionEyebrow from "../components/home/SectionEyebrow";

const DOBRA_PRAXE_BUCKET = "dobra-praxe";

const CATEGORY_LABELS = {
  obec: "Obec",
  spolek: "Spolek",
  skola: "Škola",
  seniori: "Senioři",
};

const points = [
  {
    title: "Jedna komunikace pro celou obec",
    text: "Školy, spolky, senioři i rodiče najdou program, pozvánky a záznamy na jednom místě.",
  },
  {
    title: "Program bez starostí",
    text: "Živé přenosy a vzdělávací pořady připravuje ARCHIMEDES Live, obec jen zapojí zájemce.",
  },
  {
    title: "Viditelný přínos pro veřejnost",
    text: "Obec může ukázat aktivní komunitní život — akce, spolky i zapojení občany.",
  },
];

const cenikItems = [
  {
    label: "Škola",
    text: "živé vzdělávací programy a hotové podklady k hodinám",
  },
  {
    label: "Senioři",
    text: "pravidelná setkávání se společným programem",
  },
  {
    label: "Hasiči, spolky a kluby",
    text: "obsah od odborníků z celé ČR",
  },
  {
    label: "Společné akce obce",
    text: "vysílání i archiv záznamů pro všechny",
  },
];

export default function ObecPage() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadFeatured() {
      const { data } = await supabase
        .from("best_practice_posts")
        .select("title, body, photo_paths, category, organizations(name)")
        .eq("status", "approved")
        .eq("is_featured", true)
        .maybeSingle();

      if (!alive) return;
      setFeatured(data || null);
    }

    loadFeatured();
    return () => {
      alive = false;
    };
  }, []);

  const featuredPhoto = featured?.photo_paths?.[0]
    ? supabase.storage.from(DOBRA_PRAXE_BUCKET).getPublicUrl(featured.photo_paths[0]).data?.publicUrl
    : "";

  return (
    <>
      <Head>
        <title>Pro obce | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live pomáhá starostům a obcím propojit školy, spolky a občany do jednoho aktivního komunitního programu."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 pb-16 pt-10">
        <div className="mx-auto max-w-[980px] px-5">
          <SectionEyebrow>Pro obce</SectionEyebrow>
          <h1 className="max-w-[760px] text-[40px] font-[950] leading-[1.05] tracking-[-0.04em] text-navy-900">
            Program, který posiluje komunitní život vaší obce
          </h1>
          <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-muted">
            Pro starosty a zastupitelstva, kteří chtějí propojit školy, spolky,
            seniory a národní organizace do jednoho celoročního programu — obec
            získává páteř komunitního života, která usnadňuje komunikaci a
            pomáhá budovat aktivní obec.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {points.map((p) => (
              <Card key={p.title}>
                <CardContent>
                  <h3 className="text-[18px] font-bold tracking-tight text-navy-900">{p.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{p.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {featured ? (
            <section className="mt-12">
              <SectionEyebrow>Dobrá praxe</SectionEyebrow>
              <h2 className="text-[28px] font-[950] tracking-[-0.03em] text-navy-900">
                Jak to dělají jinde
              </h2>

              <Card className="mt-5 overflow-hidden p-0 sm:flex">
                {featuredPhoto ? (
                  <div className="min-h-[220px] flex-1 basis-[280px] bg-eyebrow">
                    <img src={featuredPhoto} alt={featured.title} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex-1 basis-[320px] p-7">
                  <span className="inline-flex rounded-full bg-eyebrow px-3 py-1 text-xs font-bold text-navy-600">
                    {CATEGORY_LABELS[featured.category] || featured.category} ·{" "}
                    {featured.organizations?.name}
                  </span>
                  <h3 className="mt-3.5 text-xl font-bold tracking-tight text-navy-900">
                    {featured.title}
                  </h3>
                  <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                    {featured.body}
                  </p>
                </div>
              </Card>
            </section>
          ) : null}

          <section id="cenik" className="mt-12 scroll-mt-24">
            <SectionEyebrow>Ceník</SectionEyebrow>
            <h2 className="max-w-[640px] text-[30px] font-[950] tracking-[-0.03em] text-navy-900">
              Jedna licence pro všechny spolky a organizace ve vaší obci
            </h2>

            <Card className="mt-5 rounded-card-lg p-8">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <div className="whitespace-nowrap text-[34px] font-[950] tracking-[-0.02em] text-navy-900">
                  1 990 Kč <span className="text-base font-bold text-slate-500">/ měsíc</span>
                </div>
                <p className="max-w-[520px] text-[15px] leading-relaxed text-muted">
                  Jedna licence pro celou obec. V ceně je vše: škola, senioři i
                  všechny obecní spolky a organizace, bez příplatků.
                </p>
              </div>

              <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {cenikItems.map((item) => (
                  <li key={item.label} className="text-[15px] leading-relaxed text-slate-700">
                    <strong className="text-navy-900">{item.label}</strong> — {item.text}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-[18px] bg-eyebrow p-5 text-[15px] font-bold leading-relaxed text-navy-600">
                Kolik spolků se zapojí, je jen na vás — všechny fungují pod
                jednou licencí obce, bez dalších plateb.
              </div>

              <Button href="/zadost" className="mt-6">
                Chci program pro naši obec
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Card>
          </section>

          <div className="mt-10 flex flex-col items-start gap-5 rounded-card-lg bg-navy-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="block text-lg font-bold">Chcete program i ve vaší obci?</strong>
              <span className="mt-1.5 block text-sm text-white/75">
                Vyplňte krátkou žádost a ozveme se vám s dalším postupem.
              </span>
            </div>
            <Link
              href="/zadost"
              className="inline-flex h-12 flex-none items-center justify-center whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-black text-navy-900"
            >
              Chci program pro naši obec
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
