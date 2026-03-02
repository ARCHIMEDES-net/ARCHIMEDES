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

function Card({ children }) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 16,
        background: "white",
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, strong }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        border: "1px solid #eee",
        borderRadius: 999,
        fontWeight: strong ? 700 : 500,
        fontSize: 13,
        background: "white",
      }}
    >
      {children}
    </span>
  );
}

function BtnLink({ href, children }) {
  return (
    <Link href={href}>
      <a
        style={{
          padding: "10px 12px",
          border: "1px solid #ddd",
          borderRadius: 12,
          textDecoration: "none",
          fontWeight: 700,
          background: "white",
        }}
      >
        {children}
      </a>
    </Link>
  );
}

function Btn({ onClick, children, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: active ? "#f3f3f3" : "white",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

export default function Kalendar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [upcomingRaw, setUpcomingRaw] = useState([]);
  const [pastRaw, setPastRaw] = useState([]);

  // Filters
  const [filterCategory, setFilterCategory] = useState("Vše");
  const [filterGroups, setFilterGroups] = useState([]);

  const nowIso = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");

      const selectCols =
        "id,title,starts_at,category,audience_groups,audience,stream_url,worksheet_url,is_published";

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
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>Program</div>
          <div style={{ opacity: 0.72, marginTop: 4 }}>
            Přehled vysílání. Řazeno podle <b>starts_at</b>.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <BtnLink href="/portal">← Zpět do portálu</BtnLink>
          <BtnLink href="/portal/admin/udalosti">Admin – události</BtnLink>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Filtry</div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1.2fr" }}>
            <div>
              <label style={{ fontWeight: 800 }}>Rubrika</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  marginTop: 6,
                  background: "white",
                }}
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
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
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

          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
            Zobrazuji jen publikované události (is_published = true).
          </div>
        </Card>
      </div>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Card>
            <b>Chyba:</b> {error}
          </Card>
        </div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 18, opacity: 0.7 }}>Načítám…</div>
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
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>
        {title}{" "}
        <span style={{ opacity: 0.6, fontWeight: 700 }}>
          ({items?.length || 0})
        </span>
      </div>

      {!items || items.length === 0 ? (
        <Card>
          <div style={{ opacity: 0.75 }}>Zatím prázdné.</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((e) => {
            const cat = normalizeCategory(e);
            const groups = normalizeGroups(e);

            return (
              <Card key={e.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{e.title}</div>
                  <div style={{ opacity: 0.75, fontSize: 14 }}>{formatCz(e.starts_at)}</div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Pill strong>{cat}</Pill>
                  {(Array.isArray(groups) ? groups : []).map((g) => (
                    <Pill key={g}>{g}</Pill>
                  ))}
                  {e.stream_url ? <Pill>▶ vysílání</Pill> : null}
                  {e.worksheet_url ? <Pill>📄 pracovní list</Pill> : null}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href={`/portal/udalost/${e.id}`}>
                    <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 12, textDecoration: "none", fontWeight: 800 }}>
                      Detail
                    </a>
                  </Link>

                  {e.stream_url ? (
                    <a
                      href={e.stream_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 12, textDecoration: "none", fontWeight: 800 }}
                    >
                      ▶ Vysílání
                    </a>
                  ) : null}

                  {e.worksheet_url ? (
                    <a
                      href={e.worksheet_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 12, textDecoration: "none", fontWeight: 800 }}
                    >
                      📄 Pracovní list
                    </a>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
