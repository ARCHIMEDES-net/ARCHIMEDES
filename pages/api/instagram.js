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

    // vytáhneme všechny odkazy na posty
    const matches = [...text.matchAll(/instagram\.com\/(p|reel)\/([^/?"<]+)/g)];

    const posts = [];
    const seen = new Set();

    for (const m of matches) {
      const type = m[1];
      const id = m[2];
      const key = `${type}:${id}`;

      if (!seen.has(key)) {
        seen.add(key);
        posts.push({ type, id });
      }
    }

    // vezmeme poslední 3 (nejnovější)
    const latest = posts.slice(-3).reverse();

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    return res.status(200).json(latest);
  } catch (error) {
    console.error("Instagram API error:", error);

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    return res.status(200).json([]);
  }
}
