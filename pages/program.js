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

  return (
    <div className="page">
      <main>

        {/* HERO */}

        <section className="container heroWrap">
          <div className="heroCard">

            <div className="heroText">

              <div className="eyebrow eyebrowLight">
                Program ARCHIMEDES Live
              </div>

              <h1>
                Každý měsíc nový obsah
                <br />
                pro školy, obce
                <br />
                i seniory
              </h1>

              <p className="heroLead">
                Živé vstupy s hosty, pracovní listy, tematické bloky a
                pravidelný program, který může škola i obec okamžitě využít.
              </p>

              <div className="heroBullets">
                <span>živé vysílání</span>
                <span>pracovní listy</span>
                <span>program pro komunitu</span>
              </div>

              <div style={{display:"flex",gap:"12px",marginTop:"24px",flexWrap:"wrap"}}>

                <Link
                  href="/poptavka"
                  style={{
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    minHeight:"48px",
                    padding:"0 18px",
                    borderRadius:"14px",
                    textDecoration:"none",
                    fontWeight:700,
                    color:"#ffffff",
                    background:"linear-gradient(135deg,#10b981,#059669)",
                    boxShadow:"0 10px 24px rgba(16,185,129,0.22)",
                    border:"1px solid rgba(16,185,129,0.9)"
                  }}
                >
                  Domluvit ukázku programu
                </Link>

                <Link
                  href="/cenik"
                  style={{
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    minHeight:"48px",
                    padding:"0 18px",
                    borderRadius:"14px",
                    textDecoration:"none",
                    fontWeight:600,
                    color:"#ffffff",
                    background:"rgba(255,255,255,0.10)",
                    border:"1px solid rgba(255,255,255,0.18)"
                  }}
                >
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

      </main>
    </div>
  );
}
