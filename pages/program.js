
// pages/program.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "posters";

const programBlocks = [
  {
    title: "Přírodověda & technologie",
    text: "Živé vstupy s odborníky, konkrétní témata z praxe a pracovní listy pro žáky.",
  },
  {
    title: "Wellbeing pro žáky",
    text: "Podpora duševní pohody, práce s emocemi, psychohygiena a bezpečné klima ve třídě.",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "Setkání s lidmi z praxe, inspirace pro budoucí volbu povolání a dovednosti pro život.",
  },
  {
    title: "Čtenářský klub",
    text: "Program pro děti i dospělé, kniha měsíce, inspirativní hosté a společné sdílení.",
  },
  {
    title: "Senior klub",
    text: "Pravidelný program pro seniory, prevence izolace, setkávání a aktivní zapojení.",
  },
  {
    title: "Smart Cities (deváťáci)",
    text: "Jak přemýšlet o městě, obci a veřejném prostoru očima mladé generace.",
  },
];

const audienceCards = [
  {
    title: "Pro školy",
    text: "Hotový program pro výuku, který učitel může hned využít ve třídě bez složité přípravy.",
  },
  {
    title: "Pro obce",
    text: "Pravidelný obsah pro komunitní život obce, seniory, mezigenerační setkávání i kulturní přesah.",
  },
  {
    title: "Pro seniory",
    text: "Bezpečný, srozumitelný a smysluplný program, který podporuje aktivitu i kontakt s ostatními.",
  },
];

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function normalizeAudienceValue(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProgramPublic() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [onlyFuture, setOnlyFuture] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,category,audience,full_description,worksheet_url,poster_path,is_published,created_at"
      )
      .eq("is_published", true)
      .order("starts_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (events || [])
      .filter((e) => {
        if (!e) return false;

        if (onlyFuture) {
          const d = safeDate(e.starts_at);
          if (!d) return false;
          if (d < new Date()) return false;
        }

        if (!query) return true;

        const aud = normalizeAudienceValue(e.audience).join(" ").toLowerCase();
        const hay = `${e.title || ""} ${e.category || ""} ${aud} ${e.full_description || ""}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0;
        const db = safeDate(b.starts_at)?.getTime() ?? 0;
        return da - db;
      });
  }, [events, q, onlyFuture]);

  const future = useMemo(() => {
    const t = Date.now();
    return filtered.filter((e) => (safeDate(e.starts_at)?.getTime() ?? 0) >= t);
  }, [filtered]);

  const past = useMemo(() => {
    const t = Date.now();
    return filtered
      .filter((e) => (safeDate(e.starts_at)?.getTime() ?? 0) < t)
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0;
        const db = safeDate(b.starts_at)?.getTime() ?? 0;
        return db - da;
      });
  }, [filtered]);

  return (
    <div className="page">
      <main>
        <section className="container heroWrap">
          <div className="heroCard">
            <div className="heroText">
              <div className="eyebrow eyebrowLight">Program ARCHIMEDES Live</div>
              <h1>
                Každý měsíc nový obsah
                <br />
                pro školy, obce
                <br />
                i seniory
              </h1>
              <p className="heroLead">
                Živé vstupy s hosty, pracovní listy, tematické bloky a pravidelný program,
                který může škola i obec okamžitě využít.
              </p>

              <div className="heroBullets">
                <span>živé vysílání</span>
                <span>pracovní listy</span>
                <span>program pro komunitu</span>
              </div>

              <div className="heroCtas">
                <Link href="/ukazka" className="btn btnPrimary">
                  Domluvit ukázku programu
                </Link>
                <Link href="/cenik" className="btn btnGhostDark">
                  Ceník a financování
                </Link>
              </div>
            </div>

            <div className="heroInfoCard">
              <div className="infoKicker">Jak program funguje</div>
              <div className="infoSteps">
                <div className="infoStep">
                  <div className="infoNo">1</div>
                  <div>
                    <strong>Živý vstup</strong>
                    <p>Odborník z praxe, konkrétní téma, zapojení publika.</p>
                  </div>
                </div>

                <div className="infoStep">
                  <div className="infoNo">2</div>
                  <div>
                    <strong>Pracovní list</strong>
                    <p>Podklady pro učitele a žáky, které lze hned použít.</p>
                  </div>
                </div>

                <div className="infoStep">
                  <div className="infoNo">3</div>
                  <div>
                    <strong>Navazující aktivita</strong>
                    <p>Program pokračuje ve třídě nebo v komunitě obce.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionAlt">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow">Pro koho je program</div>
              <h2>Jeden program. Více cílových skupin.</h2>
            </div>

            <div className="audienceGrid">
              {audienceCards.map((item) => (
                <div key={item.title} className="audienceCard">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sectionIntro">
              <div className="eyebrow">Tematické bloky</div>
              <h2>Ukázka programových oblastí</h2>
              <p className="sectionLead narrow">
                Program ARCHIMEDES Live je sestavený tak, aby pomáhal škole, obci i komunitě.
                Každý blok má jasné využití a konkrétní přínos.
              </p>
            </div>

            <div className="blocksGrid">
              {programBlocks.map((item) => (
                <div key={item.title} className="blockCard">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section sectionAlt">
          <div className="container">
            <div className="liveHeader">
              <div>
                <div className="eyebrow">Živý přehled programu</div>
                <h2>Nadcházející vysílání a události</h2>
                <p className="sectionLead narrow">
                  Veřejný přehled publikovaných událostí. Odkaz na samotné vysílání je dostupný
                  registrovaným uživatelům v portálu.
                </p>
              </div>

              <div className="toolbar">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Hledat v programu…"
                  className="searchInput"
                />

                <label className="checkWrap">
                  <input
                    type="checkbox"
                    checked={onlyFuture}
                    onChange={(e) => setOnlyFuture(e.target.checked)}
                  />
                  <span>Jen nadcházející</span>
                </label>
              </div>
            </div>

            {err ? (
              <div className="errorBox">Chyba: {err}</div>
            ) : null}

            {loading ? (
              <div className="stateBox">Načítám…</div>
            ) : future.length === 0 && past.length === 0 ? (
              <div className="stateBox">Zatím žádné publikované události.</div>
            ) : (
              <>
                <Section title="Nadcházející" count={future.length}>
                  {future.map((e) => (
                    <EventCard key={e.id} e={e} />
                  ))}
                </Section>

                {!onlyFuture ? (
                  <div style={{ marginTop: 18 }}>
                    <Section title="Proběhlo" count={past.length}>
                      {past.slice(0, 30).map((e) => (
                        <EventCard key={e.id} e={e} />
                      ))}
                    </Section>
                  </div>
                ) : null}
              </>
            )}

            <div className="noteLine">
              Pozn.: Zobrazuji jen položky, které mají v adminu nastaveno <b>Publikováno</b>.
            </div>
          </div>
        </section>

        <section className="container finalCtaWrap">
          <div className="finalCta">
            <div>
              <div className="eyebrow eyebrowLight">Další krok</div>
              <h2>Chcete vidět, jak může program fungovat u vás?</h2>
              <p>
                Během krátké online schůzky ukážeme strukturu jedné hodiny, typy programů
                i to, jak program využije škola nebo obec v praxi.
              </p>
            </div>

            <div className="finalCtaButtons">
              <Link href="/ukazka" className="btn btnWhite">
                Domluvit ukázku programu
              </Link>
              <Link href="/portal" className="btn btnOutlineLight">
                Vstoupit do portálu
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f6f7fb;
          color: #111827;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding-left: 16px;
          padding-right: 16px;
        }

        .section {
          padding: 84px 0;
        }

        .sectionAlt {
          background: #eef1f7;
        }

        .heroWrap {
          padding-top: 28px;
          padding-bottom: 28px;
        }

        .heroCard {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 22px;
          background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
        }

        .heroText {
          padding: 36px 34px;
          color: white;
        }

        .eyebrow {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .eyebrowLight {
          color: rgba(255, 255, 255, 0.72);
        }

        h1 {
          margin: 0 0 18px;
          font-size: 54px;
          line-height: 1.03;
          letter-spacing: -0.03em;
        }

        h2 {
          margin: 0;
          font-size: 42px;
          line-height: 1.12;
          letter-spacing: -0.02em;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.2;
        }

        p {
          margin: 0;
          font-size: 17px;
          line-height: 1.7;
          color: #4b5563;
        }

        .heroLead {
          color: rgba(255, 255, 255, 0.9);
          font-size: 20px;
          line-height: 1.75;
          max-width: 640px;
        }

        .heroBullets {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .heroBullets span {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.94);
          font-size: 14px;
        }

        .heroCtas,
        .finalCtaButtons,
        .inlineRow {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .heroInfoCard {
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          padding: 34px 28px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .infoKicker {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 18px;
          font-weight: 700;
        }

        .infoSteps {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .infoStep {
          display: grid;
          grid-template-columns: 46px 1fr;
          gap: 14px;
          align-items: start;
          padding: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
        }

        .infoStep p {
          color: rgba(255, 255, 255, 0.78);
          font-size: 15px;
          line-height: 1.6;
          margin-top: 4px;
        }

        .infoNo {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: white;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }

        .sectionIntro {
          margin-bottom: 30px;
        }

        .sectionLead {
          font-size: 19px;
          line-height: 1.75;
          color: #4b5563;
          margin-top: 14px;
        }

        .narrow {
          max-width: 760px;
        }

        .audienceGrid,
        .blocksGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .audienceCard,
        .blockCard,
        .sectionBox,
        .eventSection,
        .eventCard,
        .finalCta {
          background: white;
          border: 1px solid rgba(17, 24, 39, 0.08);
          border-radius: 22px;
        }

        .audienceCard,
        .blockCard {
          padding: 24px;
        }

        .liveHeader {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: end;
          margin-bottom: 22px;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .searchInput {
          min-width: 260px;
          padding: 11px 13px;
          border-radius: 14px;
          border: 1px solid rgba(17, 24, 39, 0.14);
          background: white;
          font-size: 15px;
          outline: none;
        }

        .checkWrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 13px;
          border-radius: 14px;
          border: 1px solid rgba(17, 24, 39, 0.14);
          background: white;
          cursor: pointer;
          user-select: none;
          font-size: 15px;
        }

        .errorBox,
        .stateBox {
          padding: 14px 16px;
          border-radius: 16px;
          margin-bottom: 14px;
          background: white;
          border: 1px solid rgba(17, 24, 39, 0.08);
        }

        .errorBox {
          background: #fff3f3;
          border-color: #ffd0d0;
          color: #8a1f1f;
        }

        .noteLine {
          margin-top: 16px;
          opacity: 0.7;
          font-size: 13px;
        }

        .eventSection {
          overflow: hidden;
          background: white;
        }

        .eventSectionHead {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .eventSectionTitle {
          font-weight: 800;
        }

        .eventSectionCount {
          margin-left: auto;
          opacity: 0.7;
          font-size: 14px;
        }

        .eventSectionBody {
          display: grid;
        }

        .eventCard {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 14px;
          padding: 16px;
          border-radius: 0;
          border: 0;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .posterWrap {
          width: 160px;
          height: 102px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .posterPlaceholder {
          opacity: 0.6;
          font-size: 12px;
        }

        .posterImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .eventMain {
          min-width: 0;
        }

        .eventTop {
          display: flex;
          gap: 10px;
          align-items: baseline;
          flex-wrap: wrap;
        }

        .eventTitle {
          font-weight: 800;
          font-size: 17px;
        }

        .eventDate {
          opacity: 0.75;
          font-size: 14px;
        }

        .chipSmall {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: white;
          opacity: 0.95;
        }

        .audienceRow {
          margin-top: 7px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .desc {
          margin-top: 8px;
          opacity: 0.88;
          line-height: 1.45;
          max-width: 760px;
          color: #374151;
          font-size: 15px;
        }

        .eventActions {
          margin-top: 12px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 14px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btnPrimary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 10px 24px rgba(16, 185, 129, 0.22);
          border: 1px solid rgba(16, 185, 129, 0.9);
        }

        .btnGhostDark {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .btnGhost {
          background: white;
          color: #111827;
          border: 1px solid rgba(17, 24, 39, 0.12);
        }

        .btnWhite {
          background: white;
          color: #111827;
        }

        .btnOutlineLight {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.26);
        }

        .actionLink {
          text-decoration: none;
          padding: 8px 11px;
          border-radius: 12px;
          border: 1px solid rgba(17, 24, 39, 0.16);
          background: white;
          color: #111827;
          font-size: 14px;
          font-weight: 600;
        }

        .actionLinkDark {
          background: #111827;
          color: white;
          font-weight: 700;
        }

        .finalCtaWrap {
          padding-top: 0;
          padding-bottom: 96px;
        }

        .finalCta {
          background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
          border-radius: 28px;
          padding: 36px;
          color: white;
          display: grid;
          grid-template-columns: 1.1fr auto;
          gap: 20px;
          align-items: center;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
        }

        .finalCta p {
          color: rgba(255, 255, 255, 0.82);
          margin-top: 12px;
        }

        @media (max-width: 1080px) {
          h1 {
            font-size: 46px;
          }

          h2 {
            font-size: 36px;
          }

          .heroCard,
          .liveHeader,
          .finalCta {
            grid-template-columns: 1fr;
          }

          .audienceGrid,
          .blocksGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            justify-content: flex-start;
          }
        }

        @media (max-width: 720px) {
          .heroWrap {
            padding-top: 20px;
          }

          .heroText,
          .heroInfoCard,
          .audienceCard,
          .blockCard,
          .finalCta,
          .eventSectionHead,
          .eventCard {
            padding-left: 20px;
            padding-right: 20px;
          }

          h1 {
            font-size: 36px;
          }

          h2 {
            font-size: 30px;
          }

          .heroLead,
          .sectionLead,
          p {
            font-size: 16px;
          }

          .audienceGrid,
          .blocksGrid {
            grid-template-columns: 1fr;
          }

          .eventCard {
            grid-template-columns: 1fr;
          }

          .posterWrap {
            width: 100%;
            height: 180px;
          }

          .searchInput {
            min-width: 0;
            width: 100%;
          }

          .toolbar {
            width: 100%;
          }

          .section {
            padding: 64px 0;
          }

          .finalCtaWrap {
            padding-bottom: 72px;
          }
        }
      `}</style>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div className="eventSection">
      <div className="eventSectionHead">
        <div className="eventSectionTitle">{title}</div>
        <div className="eventSectionCount">{count} položek</div>
      </div>
      <div className="eventSectionBody">{children}</div>
    </div>
  );
}

function EventCard({ e }) {
  const posterUrl = publicUrlFromPath(e.poster_path);
  const aud = normalizeAudienceValue(e.audience);

  return (
    <div className="eventCard">
      <div className="posterWrap">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Plakát" src={posterUrl} className="posterImg" />
        ) : (
          <span className="posterPlaceholder">Bez plakátu</span>
        )}
      </div>

      <div className="eventMain">
        <div className="eventTop">
          <div className="eventTitle">{e.title || "—"}</div>
          <div className="eventDate">{formatDateTimeCS(e.starts_at)}</div>

          {e.category ? <span className="chipSmall">{e.category}</span> : null}
        </div>

        {aud.length ? (
          <div className="audienceRow">
            {aud.slice(0, 8).map((t) => (
              <span key={`${e.id}-${t}`} className="chipSmall">
                {t}
              </span>
            ))}
            {aud.length > 8 ? <span className="chipSmall">+{aud.length - 8}</span> : null}
          </div>
        ) : null}

        {e.full_description ? (
          <div className="desc">
            {String(e.full_description).slice(0, 220)}
            {String(e.full_description).length > 220 ? "…" : ""}
          </div>
        ) : null}

        <div className="eventActions">
          {e.worksheet_url ? (
            <a href={e.worksheet_url} target="_blank" rel="noreferrer" className="actionLink">
              📄 Pracovní list
            </a>
          ) : null}

          <Link href="/portal" className="actionLink actionLinkDark">
            Přihlásit se do portálu
          </Link>
        </div>
      </div>
    </div>
  );
}
