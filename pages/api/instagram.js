
const USERNAME = "archimedes_net";

const FALLBACK_POSTS = [
  { type: "p", id: "DVyqPmiiLKF" },
  { type: "p", id: "DVvUBXDCMYC" },
  { type: "p", id: "DVqEttcjpu0" },
];

function buildPost(type = "p", id = "") {
  const cleanType = type === "reel" ? "reel" : "p";
  const href = `https://www.instagram.com/${cleanType}/${id}/`;

  return {
    type: cleanType,
    id,
    href,
    embed: `${href}embed`,
    title: "Pozvánka",
  };
}

function fallbackItems() {
  return FALLBACK_POSTS.map((item) => buildPost(item.type, item.id));
}

function normalizeNodeToPost(node = {}) {
  const shortcode = node.shortcode || node.code || "";
  if (!shortcode) return null;

  const isVideo =
    Boolean(node.is_video) ||
    String(node.media_type || "").toUpperCase() === "VIDEO" ||
    String(node.product_type || "").toUpperCase() === "REELS";

  const type =
    String(node.product_type || "").toUpperCase() === "REELS" || isVideo
      ? "reel"
      : "p";

  return {
    type,
    id: shortcode,
    href: `https://www.instagram.com/${type}/${shortcode}/`,
    embed: `https://www.instagram.com/${type}/${shortcode}/embed`,
    title: "Pozvánka",
    timestamp: node.taken_at_timestamp || node.timestamp || null,
    isVideo,
  };
}

function uniqueByHref(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.href || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

async function fetchProfileInfoFromWebApi(username) {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
    username
  )}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "X-IG-App-ID": "936619743392459",
      Referer: `https://www.instagram.com/${username}/`,
    },
  });

  if (!response.ok) {
    throw new Error(`Instagram web API failed with status ${response.status}`);
  }

  return response.json();
}

function extractFromWebApiPayload(payload) {
  const user = payload?.data?.user;
  const edges =
    user?.edge_owner_to_timeline_media?.edges ||
    user?.edge_felix_video_timeline?.edges ||
    [];

  const items = edges
    .map((edge) => normalizeNodeToPost(edge?.node || {}))
    .filter(Boolean)
    .filter((item) => item.isVideo)
    .sort((a, b) => {
      const aTime = a?.timestamp || 0;
      const bTime = b?.timestamp || 0;
      return bTime - aTime;
    })
    .slice(0, 3)
    .map(({ isVideo, timestamp, ...rest }) => rest);

  return uniqueByHref(items);
}

async function fetchProfileHtml(username) {
  const url = `https://www.instagram.com/${encodeURIComponent(username)}/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Instagram HTML failed with status ${response.status}`);
  }

  return response.text();
}

function extractShortcodesFromHtml(html = "") {
  const results = [];

  const reelRegex = /href="\/reel\/([A-Za-z0-9_-]+)\//g;
  const postRegex = /href="\/p\/([A-Za-z0-9_-]+)\//g;

  let match;

  while ((match = reelRegex.exec(html)) !== null) {
    results.push({ type: "reel", id: match[1] });
  }

  while ((match = postRegex.exec(html)) !== null) {
    results.push({ type: "p", id: match[1] });
  }

  return results;
}

function extractJsonCandidatesFromHtml(html = "") {
  const items = [];

  const directShortcodeRegex =
    /"shortcode":"([A-Za-z0-9_-]+)".{0,250}?"is_video":(true|false)/g;

  let match;
  while ((match = directShortcodeRegex.exec(html)) !== null) {
    items.push({
      type: match[2] === "true" ? "reel" : "p",
      id: match[1],
      isVideo: match[2] === "true",
    });
  }

  return items;
}

function extractFromHtml(html = "") {
  const linkItems = extractShortcodesFromHtml(html);
  const jsonItems = extractJsonCandidatesFromHtml(html);

  const combined = [
    ...jsonItems.filter((item) => item.isVideo),
    ...linkItems.filter((item) => item.type === "reel"),
    ...linkItems,
  ];

  const unique = uniqueByHref(
    combined.map((item) => buildPost(item.type, item.id))
  );

  return unique.slice(0, 3);
}

export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=1800, stale-while-revalidate=86400"
  );

  try {
    const payload = await fetchProfileInfoFromWebApi(USERNAME);
    const items = extractFromWebApiPayload(payload);

    if (items.length >= 3) {
      return res.status(200).json({
        source: "instagram_public_web_api",
        items,
      });
    }
  } catch (error) {
    console.error("Instagram public web API error:", error?.message || error);
  }

  try {
    const html = await fetchProfileHtml(USERNAME);
    const items = extractFromHtml(html);

    if (items.length > 0) {
      return res.status(200).json({
        source: "instagram_public_html",
        items,
      });
    }
  } catch (error) {
    console.error("Instagram HTML scrape error:", error?.message || error);
  }

  return res.status(200).json({
    source: "fallback",
    items: fallbackItems(),
  });
}
