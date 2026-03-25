export default async function handler(req, res) {
  const posts = [
    { type: "p", id: "DVvUBXDCMYC" },
    { type: "p", id: "DVyqPmiiLKF" },
    { type: "p", id: "DVqEttcjpu0" },
  ];

  const items = posts.map((post) => {
    const kind = post.type === "reel" ? "reel" : "p";
    const href = `https://www.instagram.com/${kind}/${post.id}/`;

    return {
      type: kind,
      id: post.id,
      href,
      embed: `${href}embed`,
      title: "Pozvánka",
    };
  });

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );

  return res.status(200).json({
    source: "manual",
    items,
  });
}
