import Link from "next/link";
import { footerContent } from "../content/homepage";
import { partners } from "../content/partners";

const SOCIAL_ICON = {
  facebook: "f",
  youtube: "▶",
  linkedin: "in",
};

export default function Footer() {
  const { legalName, tagline, columns, social, legalLinks } = footerContent;
  const visibleSocial = (social || []).filter((s) => s.visible !== false);
  // Footer shows a limited logo selection, not the full partner network —
  // only entries with a real logo asset render here (see content/partners.js
  // for organizations shown via icon instead of logo).
  const footerPartners = partners.filter((p) => p.logo);

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

          {visibleSocial.length ? (
            <div className="footer-col">
              <div className="footer-col-title">Sledujte nás</div>
              <div className="footer-social">
                {visibleSocial.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="footer-social-icon"
                  >
                    {SOCIAL_ICON[s.icon] || s.label[0]}
                  </a>
                ))}
              </div>
              <Link href="/login" className="footer-link">
                Přihlášení
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {footerPartners.length ? (
        <div className="footer-partners">
          <div className="footer-partners-inner">
            <span className="footer-partners-label">Partnerské organizace</span>
            <div className="footer-partners-logos">
              {footerPartners.map((p) => (
                <a
                  key={p.slug}
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-partner-logo"
                  title={p.name}
                >
                  <img src={p.logo} alt={p.name} />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

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
          margin-top: 60px;
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
          margin-bottom: 14px;
        }

        .footer-social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .footer-social-icon:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .footer-partners {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-partners-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 20px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px 20px;
        }

        .footer-partners-label {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          flex: none;
        }

        .footer-partners-logos {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .footer-partner-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 6px 10px;
          border-radius: 10px;
          background: #ffffff;
        }

        .footer-partner-logo img {
          height: 100%;
          width: auto;
          max-width: 90px;
          object-fit: contain;
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
