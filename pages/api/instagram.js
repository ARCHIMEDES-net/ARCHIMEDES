const posts = [
  { type: "p", id: "SEM_DEJ_NEJNOVĚJŠÍ_ID_1" },
  { type: "p", id: "SEM_DEJ_NEJNOVĚJŠÍ_ID_2" },
  { type: "reel", id: "SEM_DEJ_NEJNOVĚJŠÍ_ID_3" },
];

export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  return res.status(200).json(posts);
}
