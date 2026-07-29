function safeInstagramPermalink(value) {
  try {
    const url = new URL(String(value || ""));
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      (hostname !== "instagram.com" && !hostname.endsWith(".instagram.com"))
    ) {
      return null;
    }
    return url.toString();
  } catch (_) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (Object.keys(req.query || {}).length > 0) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ error: "Unexpected query parameters" });
  }

  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
  const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
  const API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION || "v19.0";

  try {
    if (
      !ACCESS_TOKEN ||
      ACCESS_TOKEN.length > 4096 ||
      !/^\d{5,30}$/.test(String(ACCOUNT_ID || "")) ||
      !/^v\d+\.\d+$/.test(API_VERSION)
    ) {
      throw new Error("Instagram configuration is invalid");
    }

    const url = new URL(
      `https://graph.facebook.com/${API_VERSION}/${ACCOUNT_ID}/media`
    );
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp"
    );
    url.searchParams.set("limit", "6");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    let response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`Instagram request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.data)) {
      throw new Error("No data from Instagram");
    }

    // vezmeme jen poslední 3 videa
    const videos = data.data
      .filter((item) => item.media_type === "VIDEO" || item.media_type === "REEL")
      .slice(0, 3)
      .map((item) => {
        const permalink = safeInstagramPermalink(item.permalink);
        if (!permalink) return null;
        return {
          type: "p",
          id: String(item.id || "").slice(0, 100),
          href: permalink,
          embed: new URL("embed/", permalink.endsWith("/") ? permalink : `${permalink}/`).toString(),
          title: "Pozvánka",
        };
      })
      .filter(Boolean);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json(videos);
  } catch (error) {
    console.error("instagram feed error:", error);
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json([]);
  }
}
