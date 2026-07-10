/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/start", destination: "/zadost", permanent: true },
      { source: "/start2", destination: "/zadost", permanent: true },
      { source: "/poptavka", destination: "/zadost", permanent: true },
      { source: "/zadost-o-pristup", destination: "/zadost", permanent: true },
      { source: "/demo", destination: "/zadost", permanent: true },
      { source: "/ukazka", destination: "/zadost", permanent: true },
      { source: "/financovani-skoly", destination: "/zadost", permanent: true },
    ];
  },
};
module.exports = nextConfig;
