import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import PublicMonthCalendar from "../components/PublicMonthCalendar";
import PublicEventCard from "../components/PublicEventCard";
import { fetchPublicUpcomingEvents } from "../lib/publicEvents";

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

      <main className="kal-page">
        <div className="kal-container">
          <div className="kal-eyebrow">Veřejný kalendář</div>
          <h1>Kalendář akcí</h1>
          <p className="kal-lead">
            Přehled nadcházejících živých přenosů a vzdělávacích pořadů. Vstup do
            samotného vysílání je dostupný po přihlášení zapojeným školám, obcím
            a organizacím.
          </p>

          <div className="kal-grid">
            <div className="kal-calendar">
              <PublicMonthCalendar events={events} />
            </div>

            <div className="kal-list">
              <div className="kal-list-title">Nadcházející akce</div>

              {loading ? <div className="kal-note">Načítám…</div> : null}
              {error ? <div className="kal-note kal-note-error">{error}</div> : null}

              {!loading && !error && events.length === 0 ? (
                <div className="kal-note">Žádné nadcházející akce.</div>
              ) : null}

              {!loading && !error ? (
                <div className="kal-cards">
                  {events.map((event) => (
                    <PublicEventCard key={event.id} event={event} compact />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="kal-cta">
            <div>
              <strong>Chcete se do vysílání zapojit?</strong>
              <span>Požádejte o program ARCHIMEDES Live pro vaši obec, školu nebo organizaci.</span>
            </div>
            <Link href="/zadost" className="kal-cta-btn">
              Chci program pro naši obec
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .kal-page {
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 20px 80px;
        }

        .kal-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .kal-eyebrow {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: #e7eef9;
          color: #1e3a5f;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        h1 {
          margin: 0;
          font-size: 42px;
          letter-spacing: -0.04em;
          font-weight: 950;
          color: #0f172a;
        }

        .kal-lead {
          margin: 14px 0 0;
          font-size: 17px;
          line-height: 1.65;
          color: #475569;
          max-width: 680px;
        }

        .kal-grid {
          margin-top: 32px;
          display: grid;
          grid-template-columns: minmax(0, 380px) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .kal-list-title {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 14px;
        }

        .kal-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .kal-note {
          color: #64748b;
          font-size: 15px;
        }

        .kal-note-error {
          color: #dc2626;
        }

        .kal-cta {
          margin-top: 40px;
          padding: 24px 26px;
          border-radius: 24px;
          background: #0f2344;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .kal-cta strong {
          display: block;
          font-size: 18px;
        }

        .kal-cta span {
          display: block;
          margin-top: 6px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.78);
        }

        @media (max-width: 900px) {
          .kal-grid {
            grid-template-columns: 1fr;
          }

          .kal-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <style jsx global>{`
        .kal-cta-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 20px;
          border-radius: 999px;
          background: #ffffff;
          color: #0f172a;
          text-decoration: none;
          font-weight: 900;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
