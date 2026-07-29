function trustedSupabaseOrigins() {
  try {
    const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
    return [origin, origin.replace(/^https:/, "wss:")];
  } catch (_) {
    return ["https://*.supabase.co", "wss://*.supabase.co"];
  }
}

const isProduction = process.env.NODE_ENV === "production";
const [supabaseHttpOrigin, supabaseWsOrigin] = trustedSupabaseOrigins();
const enforcedCsp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");
const reportOnlyCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHttpOrigin} ${supabaseWsOrigin} https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`,
  "frame-src https://www.googletagmanager.com https://www.instagram.com https://*.instagram.com",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
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
