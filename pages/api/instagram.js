export default async function handler(req, res) {
  const posts = [
    { type: "p", id: "DVyqPmiiLKF" },
    { type: "p", id: "DVvUBXDCMYC" },
    { type: "p", id: "DVqEttcjpu0" }
  ];

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );

  return res.status(200).json(posts);
}
