import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";

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

      <main className="page">
        <div className="container">
          <div className="eyebrow">Pro obce</div>
          <h1>Program, který posiluje komunitní život vaší obce</h1>
          <p className="lead">
            Pro starosty a zastupitelstva, kteří chtějí propojit školy, spolky,
            seniory a národní organizace do jednoho celoročního programu — obec
            získává páteř komunitního života, která usnadňuje komunikaci a
            pomáhá budovat aktivní obec.
          </p>

          <div className="grid">
            {points.map((p) => (
              <div key={p.title} className="card">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>

          {featured ? (
            <section className="praxeSection">
              <div className="eyebrow">Dobrá praxe</div>
              <h2>Jak to dělají jinde</h2>

              <article className="praxeCard">
                {featuredPhoto ? (
                  <div className="praxePhotoWrap">
                    <img src={featuredPhoto} alt={featured.title} />
                  </div>
                ) : null}
                <div className="praxeBody">
                  <span className="praxeBadge">
                    {CATEGORY_LABELS[featured.category] || featured.category} ·{" "}
                    {featured.organizations?.name}
                  </span>
                  <h3>{featured.title}</h3>
                  <p>{featured.body}</p>
                </div>
              </article>
            </section>
          ) : null}

          <section id="cenik" className="pricingSection">
            <div className="eyebrow">Ceník</div>
            <h2>Jedna licence pro všechny spolky a organizace ve vaší obci</h2>

            <div className="priceCard">
              <div className="priceRow">
                <div className="priceValue">
                  1 990 Kč <span className="pricePeriod">/ měsíc</span>
                </div>
                <p className="priceDesc">
                  Jedna licence pro celou obec. V ceně je vše: škola, senioři i
                  všechny obecní spolky a organizace, bez příplatků.
                </p>
              </div>

              <ul className="priceList">
                {cenikItems.map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}</strong> — {item.text}
                  </li>
                ))}
              </ul>

              <div className="priceHighlight">
                Kolik spolků se zapojí, je jen na vás — všechny fungují pod
                jednou licencí obce, bez dalších plateb.
              </div>

              <Link href="/zadost" className="ctaBtnPrimary">
                Chci program pro naši obec
              </Link>
            </div>
          </section>

          <div className="cta">
            <div>
              <strong>Chcete program i ve vaší obci?</strong>
              <span>Vyplňte krátkou žádost a ozveme se vám s dalším postupem.</span>
            </div>
            <Link href="/zadost" className="ctaBtn">
              Chci program pro naši obec
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .page {
          background: #f8fafc;
          min-height: 100vh;
          padding: 40px 20px 80px;
        }

        .container {
          max-width: 980px;
          margin: 0 auto;
        }

        .eyebrow {
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
          font-size: 40px;
          letter-spacing: -0.04em;
          font-weight: 950;
          color: #0f172a;
          max-width: 760px;
        }

        .lead {
          margin: 16px 0 0;
          font-size: 17px;
          line-height: 1.65;
          color: #475569;
          max-width: 680px;
        }

        .grid {
          margin-top: 36px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 22px;
          padding: 22px;
        }

        .card h3 {
          margin: 0;
          font-size: 18px;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .card p {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.6;
          color: #5b6676;
        }

        .praxeSection {
          margin-top: 56px;
        }

        .praxeSection h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.03em;
          font-weight: 950;
          color: #0f172a;
        }

        .praxeCard {
          margin-top: 22px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 26px;
          overflow: hidden;
          display: flex;
          flex-wrap: wrap;
        }

        .praxePhotoWrap {
          flex: 1 1 280px;
          min-height: 220px;
        }

        .praxePhotoWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .praxeBody {
          flex: 1 1 320px;
          padding: 26px 28px;
        }

        .praxeBadge {
          display: inline-flex;
          padding: 5px 12px;
          border-radius: 999px;
          background: #eef4ff;
          color: #1e3a5f;
          font-size: 12px;
          font-weight: 800;
        }

        .praxeBody h3 {
          margin: 14px 0 0;
          font-size: 21px;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .praxeBody p {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.65;
          color: #475569;
          white-space: pre-wrap;
        }

        .pricingSection {
          margin-top: 56px;
          scroll-margin-top: 90px;
        }

        .pricingSection h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.03em;
          font-weight: 950;
          color: #0f172a;
          max-width: 640px;
        }

        .priceCard {
          margin-top: 22px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 26px;
          padding: 30px;
        }

        .priceRow {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 10px 20px;
        }

        .priceValue {
          font-size: 34px;
          font-weight: 950;
          letter-spacing: -0.02em;
          color: #0f172a;
          white-space: nowrap;
        }

        .pricePeriod {
          font-size: 16px;
          font-weight: 700;
          color: #64748b;
        }

        .priceDesc {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          max-width: 520px;
        }

        .priceList {
          margin: 26px 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 24px;
        }

        .priceList li {
          font-size: 15px;
          line-height: 1.6;
          color: #334155;
        }

        .priceList li strong {
          color: #0f172a;
        }

        .priceHighlight {
          margin-top: 24px;
          padding: 18px 20px;
          border-radius: 18px;
          background: #eef4ff;
          color: #1e3a5f;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.6;
        }

        .cta {
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

        .cta strong {
          display: block;
          font-size: 18px;
        }

        .cta span {
          display: block;
          margin-top: 6px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.78);
        }

        @media (max-width: 760px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .priceList {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <style jsx global>{`
        .ctaBtn {
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

        .ctaBtnPrimary {
          display: inline-flex;
          align-items: center;
          margin-top: 26px;
          padding: 13px 22px;
          border-radius: 999px;
          background: #1d4ed8;
          color: #ffffff;
          text-decoration: none;
          font-weight: 900;
          font-size: 14.5px;
          white-space: nowrap;
          box-shadow: 0 10px 22px rgba(29, 78, 216, 0.24);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .ctaBtnPrimary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(29, 78, 216, 0.3);
        }
      `}</style>
    </>
  );
}
