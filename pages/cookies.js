import { useEffect, useState } from "react";
import Link from "next/link";
import LegalPageLayout from "../components/LegalPageLayout";
import {
  ANALYTICS_CONSENT_EVENT,
  deleteGoogleAnalyticsCookies,
  readAnalyticsConsent,
  setAnalyticsConsent,
} from "../lib/analyticsConsent";

const rowStyle = {
  borderTop: "1px solid #e2e8f0",
  padding: "12px 10px",
  textAlign: "left",
  verticalAlign: "top",
};

export default function CookiesPage() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    setConsent(readAnalyticsConsent());

    function handleConsentChange(event) {
      setConsent(event.detail?.value || null);
    }

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
    return () =>
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsentChange);
  }, []);

  function choose(value) {
    if (value === "denied") deleteGoogleAnalyticsCookies();
    setAnalyticsConsent(value);
    setConsent(value);
  }

  return (
    <LegalPageLayout
      title="Cookies a analytika"
      description="Přehled cookies a obdobných technologií používaných webem a platformou ARCHIMEDES Live včetně možnosti změnit analytický souhlas."
      eyebrow="Transparentní nastavení"
      updatedAt="Aktualizováno 25. září 2026 · verze 2026-09-25"
    >
      <h2>1. Co používáme</h2>
      <p>
        ARCHIMEDES Live používá cookies a obdobné technologie, zejména místní
        úložiště prohlížeče. Nezbytné technologie zajišťují přihlášení,
        zabezpečení, volby uživatele a fungování webové aplikace. K jejich použití
        není vyžadován souhlas, protože bez nich by požadovaná služba nemohla
        správně fungovat.
      </p>
      <p>
        Google Analytics používáme pouze po vašem dobrovolném souhlasu. Jeho
        skript se před souhlasem vůbec nenačítá. Odmítnutí nemá vliv na přístup k
        webu ani platformě.
      </p>

      <h2>2. Používané technologie</h2>
      <div style={{ overflowX: "auto", marginBottom: "24px" }}>
        <table style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {['Název', 'Poskytovatel', 'Účel a kategorie', 'Uložení'].map((heading) => (
                <th key={heading} style={{ ...rowStyle, borderTop: 0, background: "#f8fafc" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={rowStyle}><code>archimedes-analytics-consent</code><br /><code>archimedes-analytics-consent-at</code></td>
              <td style={rowStyle}>EduVision s.r.o.</td>
              <td style={rowStyle}>Uložení a čas vaší volby analytiky. Nezbytné místní úložiště.</td>
              <td style={rowStyle}>Nejvýše 12 měsíců, poté se na volbu zeptáme znovu.</td>
            </tr>
            <tr>
              <td style={rowStyle}><code>sb-gipikahmjlcynkqexxmz-auth-token</code></td>
              <td style={rowStyle}>Supabase</td>
              <td style={rowStyle}>Přihlášení, udržení a bezpečné obnovení uživatelské relace. Nezbytné místní úložiště pouze pro uživatele platformy.</td>
              <td style={rowStyle}>Po dobu relace a jejího obnovení; odstraní se při odhlášení nebo vymazání dat webu.</td>
            </tr>
            <tr>
              <td style={rowStyle}><code>archimedes-pwa-discovery-v1</code><br /><code>archimedes-pwa-badge-prompt-dismissed-v1</code></td>
              <td style={rowStyle}>EduVision s.r.o.</td>
              <td style={rowStyle}>Zapamatování zavření nabídky instalace aplikace a nastavení výzvy k odznaku. Nezbytné místní úložiště.</td>
              <td style={rowStyle}>Výzva k instalaci 30 dní; informace o instalaci nebo zavření výzvy k odznaku do vymazání dat webu.</td>
            </tr>
            <tr>
              <td style={rowStyle}><code>_ga</code><br /><code>_ga_ZVPRHEBVJ4</code></td>
              <td style={rowStyle}>Google Ireland Limited</td>
              <td style={rowStyle}>Rozlišení návštěv a měření používání webu. Analytické cookies – pouze po souhlasu.</td>
              <td style={rowStyle}>Standardně nejvýše 2 roky; analytická data v GA4 nejvýše 14 měsíců.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="muted">
        Názvy analytických cookies se mohou technicky změnit při aktualizaci
        služby Google. Přehled pravidelně kontrolujeme podle skutečného provozu.
      </p>

      <h2>3. Bezcookiesová analytika a PWA</h2>
      <p>
        Vercel Web Analytics používáme pro základní agregované měření webu bez
        ukládání cookies do vašeho prohlížeče. Pro instalovatelnou webovou aplikaci
        může prohlížeč používat Service Worker a Cache Storage k uložení technických
        souborů a zajištění rychlého načítání. Dobu uchování těchto dat spravuje
        prohlížeč a uživatel je může odstranit v nastavení webu nebo zařízení.
      </p>

      <h2>4. Vaše volba</h2>
      <div className="noteBox" aria-live="polite">
        Aktuální nastavení: <strong>{consent === "granted" ? "analytika povolena" : consent === "denied" ? "analytika odmítnuta" : "zatím bez volby"}</strong>.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "22px" }}>
        <button type="button" onClick={() => choose("denied")} style={{ minHeight: 46, padding: "10px 16px", border: "1px solid #0f172a", borderRadius: 10, background: "#fff", color: "#0f172a", fontWeight: 800, cursor: "pointer" }}>
          Odmítnout analytiku
        </button>
        <button type="button" onClick={() => choose("granted")} style={{ minHeight: 46, padding: "10px 16px", border: "1px solid #0f172a", borderRadius: 10, background: "#0f172a", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
          Povolit analytiku
        </button>
      </div>
      <p>
        Souhlas lze kdykoli změnit. Při odmítnutí odstraníme dostupné cookies
        Google Analytics z této domény a další analytické měření se zastaví.
      </p>

      <h2>5. Správce a další informace</h2>
      <p>
        Správcem je EduVision s.r.o., Purkyňova 649/127, Medlánky, 612 00 Brno,
        IČ: 17803039. Dotazy můžete poslat na{` `}
        <a href="mailto:zive@archimedeslive.com">zive@archimedeslive.com</a>.
        Podrobnosti o zpracování údajů, příjemcích a vašich právech jsou v{` `}
        <Link href="/ochrana-osobnich-udaju">informacích o zpracování osobních údajů</Link>.
      </p>
    </LegalPageLayout>
  );
}
