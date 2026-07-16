import Link from "next/link";
import { footerContent } from "../content/homepage";

function SocialIcon({ name }) {
  const paths = {
    facebook:
      "M13.8 8.5V6.6c0-.9.6-1.1 1-1.1H17V2h-3c-3.4 0-4.2 2.5-4.2 4.2v2.3H7V12h2.8v10h4V12h3l.4-3.5h-3.4Z",
    instagram:
      "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z",
    linkedin:
      "M6.5 8.2H2.4V21h4.1V8.2ZM4.5 2A2.4 2.4 0 1 0 4.5 6.8 2.4 2.4 0 0 0 4.5 2ZM21.6 13.7c0-3.9-2.1-5.8-4.9-5.8-2.3 0-3.3 1.3-3.9 2.1V8.2H8.7V21h4.1v-6.4c0-1.7.3-3.3 2.4-3.3 2.1 0 2.2 2 2.2 3.5V21h4.1l.1-7.3Z",
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name] || paths.facebook} fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  const { legalName, tagline, columns, social, legalLinks } = footerContent;
  const visibleSocial = (social || []).filter((s) => s.visible !== false);

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <img
              src="/logo-archimedes-live-negative.png"
              alt="ARCHIMEDES Live"
              className="footer-logo-img"
            />
          </div>
          <p className="footer-tagline">{tagline}</p>
          {visibleSocial.length ? (
            <div className="footer-brand-social">
              <span className="footer-social-label">Sledujte nás</span>
              <div className="footer-social">
                {visibleSocial.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    title={s.label}
                    className="footer-social-icon"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="footer-columns">
          {(columns || []).map((col) => (
            <div key={col.title} className="footer-col">
              <div className="footer-col-title">{col.title}</div>
              {(col.links || []).map((link) => (
                <Link key={link.label} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          {(legalLinks || []).map((link) => (
            <Link key={link.label} href={link.href} className="footer-legal-link">
              {link.label}
            </Link>
          ))}
          <span className="footer-copyright">
            © {new Date().getFullYear()} ARCHIMEDES Live · {legalName} Všechna práva vyhrazena.
          </span>
        </div>
      </div>

      <style jsx global>{`
        .site-footer {
          margin-top: 0;
          background: #0b1832;
          color: rgba(255, 255, 255, 0.86);
        }

        .footer-main {
          max-width: 1180px;
          margin: 0 auto;
          padding: 48px 20px 32px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 2fr;
          gap: 36px;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
        }

        .footer-logo-img {
          height: 28px;
          width: auto;
          display: block;
        }

        .footer-tagline {
          margin: 14px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
          max-width: 280px;
        }

        .footer-columns {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .footer-col-title {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 14px;
        }

        .footer-link {
          display: block;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.82);
          font-size: 14.5px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .footer-link:hover {
          color: #ffffff;
        }

        .footer-social {
          display: flex;
          gap: 8px;
        }

        .footer-brand-social {
          margin-top: 22px;
        }

        .footer-social-label {
          display: block;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.52);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .footer-social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .footer-social-icon:hover {
          background: rgba(255, 255, 255, 0.16);
          transform: translateY(-1px);
        }

        .footer-social-icon svg {
          width: 16px;
          height: 16px;
          display: block;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-bottom-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 18px 20px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px 24px;
          font-size: 13px;
        }

        .footer-legal-link {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 700;
        }

        .footer-legal-link:hover {
          color: #ffffff;
        }

        .footer-copyright {
          margin-left: auto;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 860px) {
          .footer-main {
            grid-template-columns: 1fr;
          }

          .footer-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .footer-copyright {
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .footer-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
