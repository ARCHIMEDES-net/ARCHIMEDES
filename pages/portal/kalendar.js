import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const AUDIENCE_GROUPS = ["1. stupeň", "2. stupeň", "Dospělí", "Senioři", "Komunita"];

const CATEGORIES = [
  "Kariérní poradenství",
  "Wellbeing",
  "Wellbeing story",
  "Čtenářský klub ZŠ",
  "Senior klub",
  "Čtenářský klub dospělí",
  "Vzdělávání",
  "Filmový klub",
  "Speciál",
];

const POSTERS_BUCKET = "posters";

function formatCz(dt) {
  try {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

function normalizeGroups(e) {
  const groups =
    Array.isArray(e?.audience_groups) && e.audience_groups.length
      ? e.audience_groups
      : Array.isArray(e?.audience) && e.audience.length
      ? e.audience.filter((x) => AUDIENCE_GROUPS.includes(x))
      : [];
  return groups;
}

function normalizeCategory(e) {
  const cat =
    typeof e?.category === "string" && e.category
      ? e.category
      : Array.isArray(e?.audience) && e.audience.length
      ? (e.audience.find((x) => CATEGORIES.includes(x)) || "Speciál")
      : "Speciál";
  return cat;
}

function intersects(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const setB = new Set(b);
  for (const x of a) if (setB.has(x)) return true;
  return false;
}

function posterUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(POSTERS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function Card({ children }) {
  return <div className="card card-pad">{children}</div>;
}

function BtnLink({ href, children }) {
  return (
    <Link href={href}>
      <a className="btn">{children}</a>
    </Link>
  );
}

function Btn({ active, onClick, children }) {
  return (
    <button
      type="button"
      className="btn"
      onClick={onClick}
      style={{ background: active ? "rgba(11,18,32,.04)" : "white" }}
    >
      {children}
    </button>
  );
}

function Pill({ children, strong }) {
  return <span className={`pill ${strong ? "pill-strong" : ""}`}>{children}</span>;
}

export default function Kalendar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [upcomingRaw, setUpcomingRaw] = useState([]);
  const [pastRaw, setPastRaw] = useState([]);

  const [filterCategory, setFilterCategory] = useState("Vše");
  const [filterGroups, setFilterGroups] = useState([]);

  const nowIso = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");

      const selectCols =
        "id,title,starts_at,category,audience_groups,audience,stream_url,worksheet_url,is_published,poster_path,poster_caption";

      const upcomingRes = await supabase
        .from("events")
        .select(selectCols)
        .eq("is_published", true)
        .gte("starts_at", nowIso)
        .order("starts_at", { ascending: true })
        .limit(300);

      const pastRes = await supabase
        .from("events")
        .select(selectCols)
        .eq("is_published", true)
        .lt("starts_at", nowIso)
        .order("starts_at", { ascending: false })
        .limit(300);

      if (!isMounted) return;

      const errs = [];
      if (upcomingRes.error) errs.push(upcomingRes.error.message);
      if (pastRes.error) errs.push(pastRes.error.message);

      if (errs.length) {
        setError(errs.join(" | "));
        setUpcomingRaw([]);
        setPastRaw([]);
      } else {
        setUpcomingRaw(upcomingRes.data || []);
        setPastRaw(pastRes.data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [nowIso]);

  const upcoming = useMemo(() => {
    return (upcomingRaw || []).filter((e) => {
      const cat = normalizeCategory(e);
      const groups = normalizeGroups(e);

      if (filterCategory !== "Vše" && cat !== filterCategory) return false;
      if (filterGroups.length > 0 && !intersects(groups, filterGroups)) return false;
      return true;
    });
  }, [upcomingRaw, filterCategory, filterGroups]);

  const past = useMemo(() => {
    return (pastRaw || []).filter((e) => {
      const cat = normalizeCategory(e);
      const groups = normalizeGroups(e);

      if (filterCategory !== "Vše" && cat !== filterCategory) return false;
      if (filterGroups.length > 0 && !intersects(groups, filterGroups)) return false;
      return true;
    });
  }, [pastRaw, filterCategory, filterGroups]);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 className="h1">Program</h1>
          <div className="sub">
            Přehled vysílání. Řazeno podle <b>starts_at</b>.
          </div>
        </div>

        <div className="row">
          <BtnLink href="/portal">← Zpět do portálu</BtnLink>
          <BtnLink href="/portal/admin/udalosti">Admin – události</BtnLink>
        </div>
      </div>

      <Card>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Filtry</div>

        <div className="grid-2">
          <div>
            <label style={{ fontWeight: 800 }}>Rubrika</label>
            <select
              className="select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ marginTop: 6 }}
            >
              <option value="Vše">Vše</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 800 }}>Pro koho</label>
            <div className="row" style={{ marginTop: 8 }}>
              {AUDIENCE_GROUPS.map((g) => {
                const active = filterGroups.includes(g);
                return (
                  <Btn
                    key={g}
                    active={active}
                    onClick={() => {
                      if (active) setFilterGroups((prev) => prev.filter((x) => x !== g));
                      else setFilterGroups((prev) => [...prev, g]);
                    }}
                  >
                    {g}
                  </Btn>
                );
              })}
              <Btn active={false} onClick={() => setFilterGroups([])}>
                Reset
              </Btn>
            </div>
          </div>
        </div>

        <div className="small" style={{ marginTop: 10 }}>
          Zobrazuji jen publikované události (is_published = true).
        </div>
      </Card>

      {error ? (
        <div style={{ marginTop: 16 }} className="bad">
          <b>Chyba:</b> {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 18 }} className="small">
          Načítám…
        </div>
      ) : (
        <>
          <Section title="Nadcházející" items={upcoming} />
          <Section title="Archiv" items={past} />
        </>
      )}
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
        {title} <span style={{ opacity: 0.6, fontWeight: 800 }}>({items?.length || 0})</span>
      </div>

      {!items || items.length === 0 ? (
        <div className="card card-pad">
          <div className="small">Zatím prázdné.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((e) => {
            const cat = normalizeCategory(e);
            const groups = normalizeGroups(e);
            const pUrl = posterUrl(e.poster_path);

            return (
              <div key={e.id} className="card card-pad">
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 96, flex: "0 0 96px" }}>
                    {pUrl ? (
                      <img
                        src={pUrl}
                        alt="Plakát"
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: "cover",
                          borderRadius: 14,
                          border: "1px solid rgba(11,18,32,.10)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 96,
                          height: 96,
                          borderRadius: 14,
                          border: "1px solid rgba(11,18,32,.10)",
                          background: "rgba(11,18,32,.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "rgba(11,18,32,.55)",
                          fontWeight: 700,
                        }}
                      >
                        bez plakátu
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{e.title}</div>
                      <div className="small">{formatCz(e.starts_at)}</div>
                    </div>

                    {e.poster_caption ? (
                      <div className="small" style={{ marginTop: 6 }}>
                        {e.poster_caption}
                      </div>
                    ) : null}

                    <div className="row" style={{ marginTop: 10 }}>
                      <Pill strong>{cat}</Pill>
                      {(Array.isArray(groups) ? groups : []).map((g) => (
                        <Pill key={g}>{g}</Pill>
                      ))}
                      {e.stream_url ? <Pill>▶ vysílání</Pill> : null}
                      {e.worksheet_url ? <Pill>📄 pracovní list</Pill> : null}
                    </div>

                    <div className="row" style={{ marginTop: 12 }}>
                      <Link href={`/portal/udalost/${e.id}`}>
                        <a className="btn">Detail</a>
                      </Link>

                      {e.stream_url ? (
                        <a className="btn" href={e.stream_url} target="_blank" rel="noreferrer">
                          ▶ Vysílání
                        </a>
                      ) : null}

                      {e.worksheet_url ? (
                        <a className="btn" href={e.worksheet_url} target="_blank" rel="noreferrer">
                          📄 Pracovní list
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
