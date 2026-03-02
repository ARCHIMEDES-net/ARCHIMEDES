import { createClient } from "@supabase/supabase-js";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCZ(dt) {
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Prague",
  }).format(dt);
}

function normalizeAudience(aud) {
  if (!aud) return "";
  if (Array.isArray(aud)) return aud.filter(Boolean).join(", ");
  return String(aud);
}

function buildEmailHtml(events, heading) {
  const items = events
    .map((e) => {
      const when = e.starts_at ? formatCZ(new Date(e.starts_at)) : "";
      const aud = normalizeAudience(e.audience);
      const title = escapeHtml(e.title || "(bez názvu)");

      const stream = e.stream_url
        ? `<a href="${escapeHtml(e.stream_url)}" style="font-weight:800;text-decoration:none">▶ Vysílání</a>`
        : `<span style="opacity:.6;font-weight:800">▶ Vysílání</span>`;

      const ws = e.worksheet_url
        ? `<a href="${escapeHtml(e.worksheet_url)}" style="font-weight:800;text-decoration:none">📄 Pracovní list</a>`
        : `<span style="opacity:.6;font-weight:800">📄 Pracovní list</span>`;

      return `
        <div style="padding:14px;border:1px solid #e5e5e5;border-radius:14px;margin:12px 0;">
          <div style="font-size:16px;font-weight:900">${title}</div>
          <div style="margin-top:6px;opacity:.85">
            ${escapeHtml(when)}${aud ? ` • ${escapeHtml(aud)}` : ""}
          </div>
          <div style="margin-top:12px;display:flex;gap:18px;flex-wrap:wrap">
            ${stream}
            ${ws}
          </div>
        </div>
      `;
    })
    .join("");

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;max-width:720px;margin:0 auto;padding:18px">
    <h2 style="margin:0 0 12px">${escapeHtml(heading)}</h2>
    ${items || `<p>Žádné události.</p>`}
    <p style="opacity:.7;font-size:13px;margin-top:18px">
      ARCHIMEDES Live
    </p>
  </div>
  `;
}

/**
 * Ecomail Campaigns API:
 * - Create campaign: POST https://api2.ecomailapp.cz/campaigns
 * - Send campaign:   GET  https://api2.ecomailapp.cz/campaign/{id}/send
 */
async function ecomailCreateCampaign({ title, subject, htmlText, recipientLists }) {
  const apiKey = mustEnv("ECOMAIL_API_KEY");

  const resp = await fetch("https://api2.ecomailapp.cz/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      key: apiKey,
    },
    body: JSON.stringify({
      title,
      from_name: mustEnv("ECOMAIL_FROM_NAME"),
      from_email: mustEnv("ECOMAIL_FROM_EMAIL"),
      reply_to: mustEnv("ECOMAIL_REPLY_TO"),
      subject,
      html_text: htmlText,
      recepient_lists: recipientLists,
    }),
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(`Ecomail create campaign failed ${resp.status}: ${text}`);

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Ecomail create campaign returned non-JSON: ${text}`);
  }
  if (!json?.id) throw new Error(`Ecomail create campaign missing id: ${text}`);
  return json;
}

async function ecomailSendCampaign(campaignId) {
  const apiKey = mustEnv("ECOMAIL_API_KEY");

  const resp = await fetch(`https://api2.ecomailapp.cz/campaign/${campaignId}/send`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      key: apiKey,
    },
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(`Ecomail send campaign failed ${resp.status}: ${text}`);
  return text;
}

function getRecipientListsFromEnv() {
  // 1) Preferuj JSON (umožní i segmenty)
  // Podle Ecomail docs lze použít:
  // - [1,2,3]  (list IDs)
  // - {"segments":[{"id":"segment_id","list":14}]}
  // viz doc pro recepient_lists.
  const json = process.env.ECOMAIL_RECIPIENT_LISTS_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error(`ECOMAIL_RECIPIENT_LISTS_JSON is not valid JSON: ${e.message}`);
    }
  }

  // 2) Fallback na jeden list ID
  const listId = process.env.ECOMAIL_LIST_ID;
  if (listId) {
    const n = Number(listId);
    if (!Number.isFinite(n)) throw new Error("ECOMAIL_LIST_ID must be a number");
    return [n];
  }

  throw new Error("Missing ECOMAIL_RECIPIENT_LISTS_JSON or ECOMAIL_LIST_ID");
}

export default async function handler(req, res) {
  try {
    // ---- Auth pro cron endpoint
    const token = process.env.CRON_TOKEN;
    if (token) {
      const auth = req.headers.authorization || "";
      if (auth !== `Bearer ${token}`) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }
    }

    // ---- Params
    // mode=preview -> jen vrátí HTML a nic neposílá
    // mode=send    -> vytvoří a odešle kampaň
    const mode = (req.query.mode || "preview").toString();
    const shouldSend = mode === "send";

    // okno reminderu (minuty)
    const minFrom = Number(req.query.from_min ?? 30); // za 30 minut
    const minTo = Number(req.query.to_min ?? 60);     // až za 60 minut
    if (!Number.isFinite(minFrom) || !Number.isFinite(minTo) || minFrom < 0 || minTo < 0) {
      return res.status(400).json({ ok: false, error: "Invalid from_min/to_min" });
    }

    // ---- Supabase (server)
    const supabase = createClient(
      mustEnv("SUPABASE_URL"),
      mustEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    // ---- Vyber události v okně
    const now = new Date();
    const fromIso = new Date(now.getTime() + minFrom * 60 * 1000).toISOString();
    const toIso = new Date(now.getTime() + minTo * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("id,title,audience,starts_at,stream_url,worksheet_url,is_published")
      .eq("is_published", true)
      .gte("starts_at", fromIso)
      .lte("starts_at", toIso)
      .order("starts_at", { ascending: true });

    if (error) throw error;

    const events = Array.isArray(data) ? data : [];

    if (events.length === 0) {
      return res.status(200).json({
        ok: true,
        sent: false,
        reason: "no events in time window",
        window: { fromIso, toIso, from_min: minFrom, to_min: minTo },
      });
    }

    // ---- Email content
    const subject = `ARCHIMEDES Live: začínáme za chvíli (${events.length}×)`;
    const html = buildEmailHtml(events, "Za chvíli vysíláme");

    if (!shouldSend) {
      // Preview mode
      return res.status(200).json({
        ok: true,
        mode: "preview",
        would_send: true,
        subject,
        count: events.length,
        window: { fromIso, toIso, from_min: minFrom, to_min: minTo },
        html,
      });
    }

    // ---- Create campaign + send
    const recipientLists = getRecipientListsFromEnv();
    const title = `ARCHIMEDES reminder ${formatCZ(now)}`;

    const created = await ecomailCreateCampaign({
      title,
      subject,
      htmlText: html,
      recipientLists,
    });

    const sendResult = await ecomailSendCampaign(created.id);

    return res.status(200).json({
      ok: true,
      mode: "send",
      sent: true,
      campaign_id: created.id,
      campaign_title: created.title,
      count: events.length,
      window: { fromIso, toIso, from_min: minFrom, to_min: minTo },
      ecomail_send_response: sendResult,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
