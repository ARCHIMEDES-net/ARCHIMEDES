import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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
      weekday: "long",
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

function Pill({ children, strong }) {
  return <span className={`pill ${strong ? "pill-strong" : ""}`}>{children}</span>;
}

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState(null);

  const safeId = useMemo(() => {
    if (!id) return null;
    // UUID nebo string id – necháme tak jak je
    return String(id);
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!safeId) return;
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("events")
        .select("id,title,starts_at,category,audience_groups,audience,full_description,stream_url,worksheet_url,is_published")
        .eq("id", safeId)
        .single();

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setEvent(null);
      } else {
        setEvent(data);
      }

      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [safeId]);

  if (loading) {
    return (
      <div className="container">
        <div className="card card-pad">
          <div className="small">Načítám…</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container">
        <div className="topbar">
          <div>
            <h1 className="h1">Událost</h1>
            <div className="sub">Detail vysílání</div>
          </div>
          <div className="row">
            <Link href="/portal/kalendar">
              <a className="btn">← Zpět na program</a>
            </Link>
          </div>
        </div>

        <div className="bad">
          <b>Chyba:</b> {error || "Událost nebyla nalezena."}
        </div>
      </div>
    );
  }

  const cat = normalizeCategory(event);
  const groups = normalizeGroups(event);

  const hasStream = !!event.stream_url;
  const hasWorksheet = !!event.worksheet_url;

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 className="h1">{event.title}</h1>
          <div className="sub">{formatCz(event.starts_at)}</div>
        </div>

        <div className="row">
          <Link href="/portal/kalendar">
            <a className="btn">← Zpět na program</a>
          </Link>
          <Link href="/portal/admin/udalosti">
            <a className="btn">Admin</a>
          </Link>
        </div>
      </div>

      <div className="card card-pad">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <Pill strong>{cat}</Pill>
            {(Array.isArray(groups) ? groups : []).map((g) => (
              <Pill key={g}>{g}</Pill>
            ))}
            {!event.is_published ? <Pill>nepublikováno</Pill> : null}
          </div>

          <div className="small">ID: {event.id}</div>
        </div>

        <div className="hr" />

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Popis</div>
            <div style={{ color: "rgba(11,18,32,.88)", whiteSpace: "pre-wrap" }}>
              {event.full_description ? event.full_description : "—"}
            </div>
          </div>

          <div className="hr" />

          <div>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Odkazy</div>
            <div className="row">
              {hasStream ? (
                <a className="btn" href={event.stream_url} target="_blank" rel="noreferrer">
                  ▶ Vysílání
                </a>
              ) : (
                <span className="small">Vysílání zatím není nastaveno.</span>
              )}

              {hasWorksheet ? (
                <a className="btn" href={event.worksheet_url} target="_blank" rel="noreferrer">
                  📄 Pracovní list
                </a>
              ) : (
                <span className="small">Pracovní list zatím není nastaven.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
