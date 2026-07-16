import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function stripQuery(asPath) {
  return (asPath || "").split("?")[0];
}

const NAV_ITEMS = [
  { key: "program", href: "/program", label: "Program" },
  { key: "obec", href: "/obec", label: "Pro obce" },
  { key: "pro-organizace", href: "/pro-organizace", label: "Pro svazy" },
  { key: "ucebna", href: "/ucebna", label: "Učebna ARCHIMEDES" },
  { key: "o-nas", href: "/o-nas", label: "Naše vize" },
  { key: "kontakt", href: "/kontakt", label: "Kontakt" },
];

function LogoMark({ inverse = false }) {
  return (
    <span className="logoMark">
      <img
        src={inverse ? "/logo-archimedes-live-negative.png" : "/logo-archimedes-live.png"}
        alt=""
        className="logoImg"
      />

      <style jsx>{`
        .logoMark {
          display: inline-flex;
          align-items: center;
        }

        .logoImg {
          height: 36px;
          width: auto;
          display: block;
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
  const isHome = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [asPath]);

  if (pathname.startsWith("/portal")) {
    return null;
  }

  const isActive = (item) => {
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
          {NAV_ITEMS.map((item) => (
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
          <Link href="/login" className="ph-login">
            <span aria-hidden="true">👤</span>
            <span className="ph-loginLabel">Přihlášení</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Otevřít menu"
          aria-expanded={mobileOpen}
          className="ph-toggle"
        >
          ☰
        </button>
      </div>

      {mobileOpen ? (
        <div className="ph-mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`ph-mobileLink${isActive(item) ? " ph-mobileLinkActive" : ""}`}
            >
              {item.label}
            </Link>
          ))}

          <Link href="/login" className="ph-mobileLogin">
            👤 Přihlášení
          </Link>
        </div>
      ) : null}

      <style jsx global>{`
        .ph-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .ph-headerHome {
          position: absolute;
          left: 0;
          right: 0;
          color: #ffffff;
          background: linear-gradient(180deg, rgba(12, 49, 87, 0.54), rgba(12, 49, 87, 0));
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
        }

        .ph-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1 1 auto;
          min-width: 0;
        }

        .ph-navLink {
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

        @media (max-width: 1439px) {
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
            order: 2;
            flex-basis: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
