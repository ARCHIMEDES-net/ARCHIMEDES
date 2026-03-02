import { createClient } from "@supabase/supabase-js";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function escapeHtml(s) {
  return String(s || "")
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

function buildEmailHtml(events, title) {
  const items = events
    .map((e) => {
      const when = e.starts_at ? formatCZ(new Date(e.starts_at)) : "";
      const t = escapeHtml(e.title);
      const aud = Array.isArray(e.audience) ? e.audience.join(", ") : (e.audience || "");
      const stream = e.stream_url ? `<a href="${escapeHtml(e.stream_url)}">▶ Vysílání</a>` : `<span style="opacity:.6">▶ Vysílání</span>`;
      const ws = e.worksheet_url ? `<a href="${escapeHtml(e.worksheet_url)}">📄 Pracovní list</a>` : `<span style="opacity:.6">📄 Pracovní list</span>`;
      return `
        <div style="padding:14px;border:1px solid #e5e5e5;border-radius:12px;margin:12px 0;">
          <div style="font-weight:800;font-size:16px">${t}</div>
          <div style="opacity:.85;margin-top:4px">${escapeHtml(when)}${aud ? ` • ${escapeHtml(aud)}` : ""}</div>
          <div style="margin-top:10;display:flex;gap:14px;font-weight:800">${stream} ${ws}</div>
        </div>
      `;
    })
    .join("");

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;max-width:720px;margin:0 auto;padding:18px">
    <h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>
    ${items || `<p>Žádné události.</p>`}
    <p style="opacity:.7;font-size:13px;margin-top:18px">
      ARCHIMEDES Live
    </p>
  </div>
  `;
}

// ---- Ecomail send (jednoduchá varianta) ----
// Pozn.: Ecomail má více způsobů odesílání (kampaně / transactional).
// Tady je nejbezpečnější MVP: poslat transactional email přes jejich API endpoint,
// který u vás používáte. Pokud používáte kampaně, přepneme to podle vašeho nastavení.

async function ecomailSendTransactional({ subject, html }) {
  const apiKey = mustEnv("ECOMAIL_API_KEY");
  const listId = mustEnv("ECOMAIL_LIST_ID");
  const fromName = mustEnv("ECOMAIL_FROM_NAME");
  const fromEmail = mustEnv("ECOMAIL_FROM_EMAIL");

  // ⚠️ Endpoint se může lišit podle Ecomail verze / produktu.
  // Pokud ti to vrátí 404, pošlu ti přesně správný endpoint podle jejich docs/účtu.
  const url = "https://api2.ecomailapp.cz/transactional/send-message";

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      key: apiKey,
    },
    body: JSON.stringify({
      // posíláme na list/segment (MVP). Pokud chceš na konkrétní emaily, upravíme.
      listId,
      message: {
        subject,
        from_name: fromName,
        from_email: fromEmail,
        html,
      },
    }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Ecomail error ${resp.status}: ${text}`);
  }
  return text;
}

export default async function handler(req, res) {
  try {
    // jednoduchá ochrana endpointu
    const token = process.env.CRON_TOKEN;
    if (token && req.headers.authorization !== `Bearer ${token}`) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const supabase = createClient(
      mustEnv("SUPABASE_URL"),
      mustEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    // okno pro reminder: 30–60 minut dopředu (Praha time neřešíme v DB, jedeme UTC window)
    const now = new Date();
    const from = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    const to = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("id,title,audience,starts_at,stream_url,worksheet_url,is_published")
      .eq("is_published", true)
      .gte("starts_at", from)
      .lte("starts_at", to)
      .order("starts_at", { ascending: true });

    if (error) throw error;

    const events = Array.isArray(data) ? data : [];

    if (events.length === 0) {
      return res.status(200).json({ ok: true, sent: false, reason: "no events in window" });
    }

    const subject = `ARCHIMEDES Live: začínáme za chvíli (${events.length}×)`;
    const html = buildEmailHtml(events, "Za chvíli vysíláme");

    const r = await ecomailSendTransactional({ subject, html });

    return res.status(200).json({ ok: true, sent: true, count: events.length, ecomail: r });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Server error" });
  }
}
