// pages/api/cron/send-reminders.js
import { createClient } from "@supabase/supabase-js";

function getBearer(req) {
  const h = req.headers?.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : "";
}

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function asDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function minutesBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 60000);
}

function pickStart(row) {
  // podporujeme obě varianty názvů sloupce
  return row.starts_at ?? row.start_at ?? null;
}

export default async function handler(req, res) {
  try {
    // --- AUTH ---
    const CRON_SECRET = mustEnv("CRON_SECRET");
    const token = getBearer(req) || String(req.query?.secret || "");
    if (token !== CRON_SECRET) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    // --- MODE ---
    const mode = String(req.query?.mode || "").toLowerCase();
    const preview = mode === "preview";

    // --- SUPABASE ---
    const SUPABASE_URL = mustEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = mustEnv("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // --- CONFIG (jednoduché a rozumné defaulty) ---
    // připomínky v minutách před startem
    const REMINDER_MINUTES = [60, 15]; // 60 min a 15 min předem
    // kolik minut tolerance okolo cílového času (aby cron nemusel běžet na vteřinu přesně)
    const WINDOW_MIN = 6; // ±6 minut

    const now = new Date();

    // --- LOAD EVENTS (pouze publikované, s budoucím startem) ---
    // bereme pár dní dopředu, ať je to rychlé a stabilní
    const from = new Date(now.getTime() - 24 * 60 * 60000); // včera (kvůli oknu)
    const to = new Date(now.getTime() + 14 * 24 * 60 * 60000); // 14 dní dopředu

    const { data: rows, error } = await supabase
      .from("events")
      .select("id,title,is_published,start_at,starts_at,stream_url,worksheet_url,audience")
      .eq("is_published", true)
      // filtrujeme podle jedné z variant; když DB má jen jednu, druhá se ignoruje
      .or(
        `start_at.gte.${from.toISOString()},starts_at.gte.${from.toISOString()}`
      )
      .order("start_at", { ascending: true });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    const events = Array.isArray(rows) ? rows : [];

    // --- BUILD REMINDER PLAN ---
    // Tady zatím neodesíláme emaily (nemáme ještě Ecomail/SMTP), jen vypíšeme “co by se posílalo”.
    const plan = [];

    for (const ev of events) {
      const startVal = pickStart(ev);
      const start = asDate(startVal);
      if (!start) continue;

      // mimo rozsah "to" (protože .or filtr nahoře není perfektní pro obě pole)
      if (start > to) continue;

      for (const mins of REMINDER_MINUTES) {
        const target = new Date(start.getTime() - mins * 60000);
        const diff = minutesBetween(now, target); // kladné = teprve přijde, záporné = už bylo

        // chceme trefit jen okno kolem target času
        if (Math.abs(diff) <= WINDOW_MIN) {
          plan.push({
            event_id: ev.id,
            title: ev.title || "(bez názvu)",
            starts_at: start.toISOString(),
            reminder_minutes_before: mins,
            target_at: target.toISOString(),
            now: now.toISOString(),
            window_min: WINDOW_MIN,
            stream_url: ev.stream_url || null,
            worksheet_url: ev.worksheet_url || null,
            audience: ev.audience || null,
          });
        }
      }
    }

    // --- RESPONSE ---
    // preview: pouze ukáže plán (bez side-effectů)
    // run: zatím také jen ukáže plán + info, že posílání není implementované
    return res.status(200).json({
      ok: true,
      preview,
      now: now.toISOString(),
      found_events: events.length,
      reminders_in_window: plan.length,
      plan,
      note: preview
        ? "PREVIEW mode: nic se neposílá."
        : "RUN mode: posílání emailů zatím není implementované (jen plán).",
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
