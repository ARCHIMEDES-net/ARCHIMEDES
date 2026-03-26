export default async function handler(req, res) {
  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
  const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=6&access_token=${ACCESS_TOKEN}`
    );

    const data = await response.json();

    if (!data.data) {
      throw new Error("No data from Instagram");
    }

    // vezmeme jen poslední 3 videa
    const videos = data.data
      .filter((item) => item.media_type === "VIDEO" || item.media_type === "REEL")
      .slice(0, 3)
      .map((item) => ({
        type: "p",
        id: item.id,
        href: item.permalink,
        embed: `${item.permalink}embed`,
        title: "Pozvánka",
      }));

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate"
    );

    return res.status(200).json(videos);
  } catch (error) {
    console.error(error);

    return res.status(200).json([]);
  }
}
