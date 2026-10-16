import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

const NAV_ITEMS = [
  { key: "program", href: "/program", label: "Program vysílání" },
  { key: "audience", label: "Komu je určeno" },
  { key: "samples", href: "/#ukazky-vysilani", label: "Ukázky vysílání" },
  { key: "ucebna", href: "/ucebna", label: "Učebna ARCHIMEDES" },
  { key: "o-nas", href: "/o-nas", label: "Naše vize" },
  { key: "kontakt", href: "/kontakt", label: "Kontakt" },
];

const AUDIENCE_ITEMS = [
  { key: "obec", href: "/obec", label: "Pro obce" },
  { key: "skoly", href: "/skoly", label: "Pro školy" },
  { key: "spolky", href: "/spolky", label: "Pro spolky" },
];

function LogoMark({ inverse = false }) {
  return (
    <span className="logoMark">
      <Image
        src={inverse ? "/logo-archimedes-live-negative.png" : "/logo-archimedes-live.png"}
        alt=""
        width={inverse ? 1618 : 842}
        height={inverse ? 195 : 130}
        priority
        className="logoImg"
      />

      <style jsx global>{`
        .logoMark {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
        }

        .logoImg {
          height: 36px;
          width: auto;
          display: block;
          max-width: 100%;
          object-fit: contain;
        }

        @media (max-width: 480px) {
          .logoImg {
            height: 30px;
          }
        }
      `}</style>
    </span>
  );
}

export default function PublicHeader({ active = "" }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const asPath = stripQuery(router?.asPath || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const audienceRef = useRef(null);
  const audienceButtonRef = useRef(null);
  const isHome = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
    setAudienceOpen(false);
  }, [asPath]);

  useEffect(() => {
    function closeOutside(event) {
      if (!audienceRef.current?.contains(event.target)) setAudienceOpen(false);
    }
    function closeEscape(event) {
      if (event.key === "Escape") {
        if (audienceOpen) audienceButtonRef.current?.focus();
        setAudienceOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [audienceOpen]);

  if (pathname.startsWith("/portal")) {
    return null;
  }

  const isActive = (item) => {
    if (item.key === "audience") return AUDIENCE_ITEMS.some(isActive);
    if (active) return active === item.key;
    if (item.href.startsWith("/#")) return false;
    return asPath === item.href || pathname === item.href;
  };

  return (
    <header className={`ph-header${isHome ? " ph-headerHome" : ""}`}>
      <div className="ph-bar">
        <Link href="/" className="ph-logoLink" aria-label="ARCHIMEDES Live — domů">
          <LogoMark inverse={isHome} />
        </Link>

        <nav className="ph-nav" aria-label="Hlavní navigace">
          {NAV_ITEMS.map((item) => item.key === "audience" ? (
            <div key={item.key} className="ph-dropdown" ref={audienceRef}
              onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setAudienceOpen(false); }}>
              <button type="button" ref={audienceButtonRef}
                className={`ph-navLink ph-audienceToggle${isActive(item) ? " ph-navLinkActive" : ""}`}
                aria-expanded={audienceOpen} aria-controls="ph-audience-options"
                onClick={() => setAudienceOpen((value) => !value)}>
                {item.label} <span aria-hidden="true">▾</span>
              </button>
              {audienceOpen && <div id="ph-audience-options" className="ph-dropdownPanel">
                {AUDIENCE_ITEMS.map((child) => <Link key={child.key} href={child.href}
                  onClick={() => setAudienceOpen(false)} aria-current={isActive(child) ? "page" : undefined}
                  className={`ph-mobileLink${isActive(child) ? " ph-mobileLinkActive" : ""}`}>{child.label}</Link>)}
              </div>}
            </div>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className={`ph-navLink${isActive(item) ? " ph-navLinkActive" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ph-actions">
          <Link href="/instalace" className="ph-login pwa-install-promotion">Aplikace do telefonu</Link>
          <Link href="/login" className="ph-login">
            <span aria-hidden="true">👤</span>
            <span className="ph-loginLabel">Přihlášení</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
          aria-expanded={mobileOpen}
          className="ph-toggle"
        >
          <span aria-hidden="true">{mobileOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="ph-mobile">
          {NAV_ITEMS.map((item) => item.key === "audience" ? (
            <details key={item.key} className="ph-mobileAudience">
              <summary className={`ph-mobileLink${isActive(item) ? " ph-mobileLinkActive" : ""}`}>{item.label}</summary>
              <div className="ph-mobileAudienceOptions">
                {AUDIENCE_ITEMS.map((child) => <Link key={child.key} href={child.href}
                  onClick={() => setMobileOpen(false)} aria-current={isActive(child) ? "page" : undefined}
                  className={`ph-mobileLink${isActive(child) ? " ph-mobileLinkActive" : ""}`}>{child.label}</Link>)}
              </div>
            </details>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`ph-mobileLink${isActive(item) ? " ph-mobileLinkActive" : ""}`}
            >
              {item.label}
            </Link>
          ))}

          <Link href="/instalace" className="ph-mobileLink pwa-install-promotion">Aplikace do telefonu</Link>
          <Link href="/login" className="ph-mobileLogin">
            👤 Přihlášení
          </Link>
        </div>
      ) : null}

      <style jsx global>{`
        @media (display-mode: standalone) { .pwa-install-promotion { display: none !important; } }
        .ph-dropdown { position: relative; }
        .ph-audienceToggle { border: 0; background: transparent; cursor: pointer; font-family: inherit; gap: 6px; }
        .ph-dropdownPanel { position: absolute; top: calc(100% + 8px); left: 0; min-width: 200px; display: grid; gap: 4px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 16px; background: white; box-shadow: 0 16px 36px rgba(15,23,42,.16); }
        .ph-dropdownPanel a:hover { background: #eff6ff; color: #1d4ed8; }
        .ph-mobileAudience summary { cursor: pointer; }
        .ph-mobileAudienceOptions { display: grid; gap: 4px; padding: 6px 0 0 16px; }
        .ph-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .ph-headerHome {
          position: relative;
          left: 0;
          right: 0;
          color: #ffffff;
          background: #153a63;
          border-bottom-color: transparent;
          backdrop-filter: none;
        }

        .ph-headerHome .ph-navLink,
        .ph-headerHome .ph-login {
          color: rgba(255, 255, 255, 0.9);
        }

        .ph-headerHome .ph-navLink:hover,
        .ph-headerHome .ph-navLinkActive {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        .ph-headerHome .ph-cta {
          color: #111827;
          background: #efbd58;
          box-shadow: 0 10px 24px rgba(239, 189, 88, 0.22);
        }

        .ph-headerHome .ph-toggle {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .ph-bar {
          max-width: 1440px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
          row-gap: 10px;
        }

        .ph-logoLink {
          display: inline-flex;
          text-decoration: none;
          flex: 0 0 auto;
          max-width: calc(100% - 64px);
        }

        .ph-logoLink:focus-visible,
        .ph-navLink:focus-visible,
        .ph-login:focus-visible,
        .ph-toggle:focus-visible,
        .ph-mobileLink:focus-visible,
        .ph-mobileLogin:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 3px;
        }

        .ph-headerHome .ph-logoLink:focus-visible,
        .ph-headerHome .ph-navLink:focus-visible,
        .ph-headerHome .ph-login:focus-visible,
        .ph-headerHome .ph-toggle:focus-visible {
          outline-color: #efbd58;
        }

        .ph-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1 1 auto;
          min-width: 0;
        }

        .ph-navLink {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          text-decoration: none;
          padding: 9px 12px;
          border-radius: 999px;
          font-size: 14.5px;
          font-weight: 700;
          color: #334155;
          white-space: nowrap;
          transition: all 0.16s ease;
        }

        .ph-navLink:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .ph-navLinkActive {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 900;
        }

        .ph-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 0 0 auto;
        }

        .ph-cta {
          text-decoration: none;
          padding: 11px 18px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 14px;
          color: #ffffff;
          background: #1d4ed8;
          box-shadow: 0 10px 22px rgba(29, 78, 216, 0.24);
          white-space: nowrap;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .ph-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(29, 78, 216, 0.3);
        }

        .ph-login {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          gap: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          color: #334155;
          white-space: nowrap;
          min-width: 0;
        }

        .ph-login:hover {
          color: #0f172a;
        }

        .ph-loginLabel {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 120px;
        }

        .ph-toggle {
          display: none;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #0f172a;
          border-radius: 12px;
          width: 42px;
          height: 42px;
          font-size: 20px;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .ph-mobile {
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          padding: 12px 20px 18px;
          display: grid;
          gap: 8px;
        }

        .ph-mobileLink,
        .ph-mobileCta,
        .ph-mobileLogin {
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
        }

        .ph-mobileLink {
          color: #334155;
          background: #f8fafc;
        }

        .ph-mobileLinkActive {
          color: #1d4ed8;
          background: #eff6ff;
        }

        .ph-mobileCta {
          color: #ffffff;
          background: #1d4ed8;
          text-align: center;
        }

        .ph-mobileLogin {
          color: #334155;
          background: #f8fafc;
          text-align: center;
        }

        @media (max-width: 1240px) {
          .ph-nav {
            display: none;
          }

          .ph-actions .ph-login {
            display: none;
          }

          .ph-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            order: 1;
            margin-left: auto;
          }

          .ph-actions {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
