export default async function handler(req, res) {
  try {
    const rssUrl = `https://rsshub.app/instagram/user/archimedes_net?_=${Date.now()}`;

    const response = await fetch(rssUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "cache-control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`RSSHub failed: ${response.status}`);
    }

    const text = await response.text();

    const matches = [...text.matchAll(/instagram\.com\/(p|reel)\/([^/?"<]+)/g)];

    const unique = [];
    const seen = new Set();

    for (const m of matches) {
      const type = m[1];
      const id = m[2];

      const key = `${type}:${id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ type, id });
      }

      if (unique.length >= 3) break;
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return res.status(200).json(unique);
  } catch (error) {
    console.error("Instagram API error:", error);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return res.status(200).json([]);
  }
}
