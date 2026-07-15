/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      // Žádný webfont — archimedeslive.com nepoužívá žádný @font-face,
      // jen systémový sans-serif stack. Sedí i s tím, co už bylo v
      // styles/globals.css před redesignem.
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
      },
      // Hodnoty ověřené computed styles na živém archimedeslive.com
      // (12. 7. 2026) — ne odhad, ne Tailwind default paleta.
      colors: {
        navy: {
          600: "#1e3a5f", // eyebrow text
          900: "#0f172a", // primární text, nadpisy
        },
        muted: "#5b6676", // sekundární text (perex, lead)
        brand: "#1d4ed8", // primární CTA/accent (odpovídá stávající .cta-primary v repu)
        eyebrow: "#e7eef9", // pozadí eyebrow badge
      },
      borderRadius: {
        "card-lg": "26px",
        "card-md": "22px",
        "card-sm": "20px",
      },
      boxShadow: {
        // Karty na živém webu mají typicky JEN border, bez stínu —
        // shadow-card je pro výjimky (foto wrapy, hero karty).
        card: "0 14px 32px rgba(15,23,42,0.06), 0 2px 8px rgba(15,23,42,0.024)",
        cta: "0 14px 30px rgba(29,78,216,0.24)",
      },
    },
  },
  plugins: [],
};
