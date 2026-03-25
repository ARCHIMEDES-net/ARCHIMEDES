const FALLBACK_POSTS = [
  { type: "p", id: "DVyqPmiiLKF" },
  { type: "p", id: "DVvUBXDCMYC" },
  { type: "p", id: "DVqEttcjpu0" },
];

function normalizeTypeFromPermalink(permalink = "") {
  if (permalink.includes("/reel/")) return "reel";
  if (permalink.includes("/tv/")) return "tv";
  return "p";
}

function buildPostFromId(type = "p", id = "") {
  const cleanType = type === "reel" ? "reel" : type === "tv" ? "tv" : "p";
  const href = `https://www.instagram.com/${cleanType}/${id}/`;
  return {
    type: cleanType,
    id,
    href,
    embed: `${href}embed`,
    title: "Pozvánka",
  };
}

function toPublicPost(item = {}) {
  const permalink = item.permalink || "";
  const type = normalizeTypeFromPermalink(permalink);
  const id =
    item.shortcode ||
    (typeof permalink === "string"
      ? permalink.split("/").filter(Boolean).pop()
      : "") ||
    item.id ||
    "";

  if (!id) return null;

  const href =
    permalink || `https://www.instagram.com/${type === "reel" ? "reel" : "p"}/${id}/`;

  return {
    type,
    id,
    href,
    embed: `${href.endsWith("/") ? href : `${href}/`}embed`,
    title: "Pozvánka",
    timestamp: item.timestamp || null,
    media_type: item.media_type || null,
    media_product_type: item.media_product_type || null,
    caption: item.caption || "",
  };
}

function isVideoLike(item = {}) {
  const mediaType = String(item.media_type || "").toUpperCase();
  const mediaProductType = String(item.media_product_type || "").toUpperCase();

  return (
    mediaType === "VIDEO" ||
    mediaProductType === "REELS" ||
    mediaProductType === "CLIPS"
  );
}

export default async function handler(req, res) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_IG_USER_ID;
  const graphVersion = process.env.INSTAGRAM_GRAPH_VERSION || "v23.0";

  const fallback = FALLBACK_POSTS.map((post) => buildPostFromId(post.type, post.id));

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=1800, stale-while-revalidate=86400"
  );

  if (!accessToken || !igUserId) {
    return res.status(200).json({
      source: "fallback",
      items: fallback,
    });
  }

  try {
    const url = new URL(`https://graph.facebook.com/${graphVersion}/${igUserId}/media`);
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,media_url"
    );
    url.searchParams.set("limit", "12");
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Instagram API request failed.");
    }

    const items = Array.isArray(data?.data) ? data.data : [];

    const latestVideos = items
      .filter(isVideoLike)
      .map(toPublicPost)
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 3);

    if (!latestVideos.length) {
      return res.status(200).json({
        source: "fallback",
        items: fallback,
      });
    }

    return res.status(200).json({
      source: "instagram_api",
      items: latestVideos,
    });
  } catch (error) {
    console.error("Instagram API error:", error);

    return res.status(200).json({
      source: "fallback",
      items: fallback,
    });
  }
}
