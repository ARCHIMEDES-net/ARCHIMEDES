// pages/api/instagram.js

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({
      error: "Chybí INSTAGRAM_ACCESS_TOKEN",
      items: [],
    });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Instagram API error:", data);
      return res.status(500).json({
        error: data,
        items: [],
      });
    }

    const items = (data.data || [])
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        href: item.permalink,
        embed: item.permalink.endsWith("/")
          ? `${item.permalink}embed`
          : `${item.permalink}/embed`,
        title:
          item.caption?.split("\n")[0]?.slice(0, 80) || "Pozvánka",
      }));

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      source: "instagram_live",
      items,
    });
  } catch (err) {
    console.error("Server error:", err);

    return res.status(500).json({
      error: err.message,
      items: [],
    });
  }
}
