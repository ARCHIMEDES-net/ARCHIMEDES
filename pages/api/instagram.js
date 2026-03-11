export default async function handler(req, res) {

  const response = await fetch(
    "https://rsshub.app/instagram/user/archimedes_net"
  );

  const text = await response.text();

  const matches = [...text.matchAll(/instagram\.com\/(p|reel)\/([^/]+)/g)];

  const posts = matches.slice(0,3).map(m => ({
    type: m[1],
    id: m[2]
  }));

  res.status(200).json(posts);
}
