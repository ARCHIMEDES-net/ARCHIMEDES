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
      { source: "/kalendar", destination: "/program#vysilani", permanent: true },
      { source: "/vysilani", destination: "/program#archiv", permanent: true },
      { source: "/aktualni-pozvanky", destination: "/program#vysilani", permanent: true },
      { source: "/reference", destination: "/ucebna#oceneni", permanent: true },
      { source: "/portal/program", destination: "/portal/kalendar", permanent: true },
    ];
  },
};
module.exports = nextConfig;
