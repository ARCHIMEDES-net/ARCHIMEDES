export default async function handler(req, res) {
  try {
    const page = await fetch(
      "https://www.instagram.com/archimedes_net/?__a=1&__d=dis",
      {
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      }
    );

    if (!page.ok) throw new Error("Instagram fetch failed");

    const data = await page.json();

    const edges =
      data?.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

    const posts = edges.slice(0, 3).map((edge) => {
      const shortcode = edge.node.shortcode;
      const isVideo = edge.node.is_video;

      return {
        type: isVideo ? "reel" : "p",
        id: shortcode,
      };
    });

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    return res.status(200).json(posts);
  } catch (err) {
    console.error("Instagram API error", err);

    return res.status(200).json([]);
  }
}
