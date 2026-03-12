export default async function handler(req, res) {
  try {
    const url = "https://www.instagram.com/archimedes_net/?__a=1&__d=dis";

    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        accept: "application/json,text/html;q=0.9,*/*;q=0.8",
        "cache-control": "no-cache",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const finalUrl = response.url;
    const status = response.status;

    const raw = await response.text();

    let parsed = null;
    let parseError = null;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parseError = e?.message || "JSON parse failed";
    }

    const edges =
      parsed?.graphql?.user?.edge_owner_to_timeline_media?.edges ||
      parsed?.data?.user?.edge_owner_to_timeline_media?.edges ||
      [];

    const posts = edges.slice(0, 3).map((edge) => {
      const shortcode = edge?.node?.shortcode;
      const isVideo = !!edge?.node?.is_video;

      return {
        type: isVideo ? "reel" : "p",
        id: shortcode,
      };
    });

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    return res.status(200).json({
      ok: true,
      status,
      finalUrl,
      contentType,
      parseError,
      postsFound: posts.length,
      posts,
      preview: raw.slice(0, 800),
    });
  } catch (error) {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    return res.status(200).json({
      ok: false,
      error: error?.message || "Unknown error",
      stack: error?.stack || null,
    });
  }
}
