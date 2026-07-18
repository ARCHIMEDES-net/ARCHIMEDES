import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import PublicMonthCalendar from "../components/PublicMonthCalendar";
import PublicEventCard from "../components/PublicEventCard";
import { fetchPublicUpcomingEvents } from "../lib/publicEvents";
import SectionEyebrow from "../components/home/SectionEyebrow";

export default function KalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchPublicUpcomingEvents().then((res) => {
      if (cancelled) return;
      setEvents(res.events);
      setError(res.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Kalendář akcí | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Veřejný kalendář živých přenosů a akcí ARCHIMEDES Live pro školy, obce a spolky."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 px-5 pb-16 pt-10">
        <div className="mx-auto max-w-[1100px]">
          <SectionEyebrow>Veřejný kalendář</SectionEyebrow>
          <h1 className="text-[42px] font-[950] tracking-[-0.04em] text-navy-900">Kalendář akcí</h1>
          <p className="mt-3.5 max-w-[680px] text-[17px] leading-relaxed text-muted">
            Přehled nadcházejících živých přenosů a vzdělávacích pořadů. Vstup do
            samotného vysílání je dostupný po přihlášení zapojeným školám, obcím
            a organizacím.
          </p>

          <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <div>
              <PublicMonthCalendar events={events} />
            </div>

            <div>
              <div className="mb-3.5 text-[15px] font-black text-navy-900">Nadcházející akce</div>

              {loading ? <div className="text-[15px] text-slate-500">Načítám…</div> : null}
              {error ? <div className="text-[15px] text-red-600">{error}</div> : null}

              {!loading && !error && events.length === 0 ? (
                <div className="text-[15px] text-slate-500">Žádné nadcházející akce.</div>
              ) : null}

              {!loading && !error ? (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {events.map((event) => (
                    <PublicEventCard key={event.id} event={event} compact />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start gap-5 rounded-card-lg bg-navy-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="block text-lg font-bold">Chcete se do vysílání zapojit?</strong>
              <span className="mt-1.5 block text-sm text-white/78">
                Požádejte o program ARCHIMEDES Live pro vaši obec, školu nebo organizaci.
              </span>
            </div>
            <Link
              href="/zadost"
              className="inline-flex h-12 flex-none items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-black text-navy-900"
            >
              Chci zapojit obec, školu nebo spolek
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
