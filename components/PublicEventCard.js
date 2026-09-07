import { useEffect, useState } from "react";
import { safeDate, normalizeAudience, resolvePosterUrl } from "../lib/publicEvents";
import {
  formatPublicEventDate,
  getPublicEventLiveState,
} from "../lib/publicEventPresentation";

export default function PublicEventCard({ event, compact = false }) {
  const start = safeDate(event?.starts_at);
  const posterUrl = resolvePosterUrl(event);
  const audience = normalizeAudience(event?.audience_groups);
  const [liveState, setLiveState] = useState(null);
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  useEffect(() => {
    const updateLiveState = () => {
      setLiveState(getPublicEventLiveState(event?.starts_at));
    };

    updateLiveState();
    const timer = window.setInterval(updateLiveState, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [event?.starts_at]);

  useEffect(() => {
    if (!isPosterOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") setIsPosterOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPosterOpen]);

  return (
    <article className="pec-card">
      <div className="pec-meta">
        <span className="pec-date">
          {start ? formatPublicEventDate(start) : "Termín upřesníme"}
        </span>
        {liveState === "live" ? (
          <span className="pec-badge pec-badge-live">
            <span className="pec-dot" /> ŽIVĚ
          </span>
        ) : liveState === "today" ? (
          <span className="pec-badge pec-badge-today">DNES</span>
        ) : null}
      </div>

      {posterUrl ? (
        <button
          type="button"
          className="pec-photo pec-photo-button"
          onClick={() => setIsPosterOpen(true)}
          aria-label={`Zobrazit celý plakát: ${event?.title || "vysílání"}`}
          aria-haspopup="dialog"
        >
          <img src={posterUrl} alt={event?.title || "Plakát vysílání"} loading="lazy" />
          <span className="pec-zoom-hint" aria-hidden="true">Zvětšit</span>
        </button>
      ) : (
        <div className="pec-photo pec-photo-empty">
          <span>{(event?.category || "ARCHIMEDES Live").slice(0, 1)}</span>
        </div>
      )}

      <div className="pec-title">{event?.title || "Připravovaná událost"}</div>

      <div className="pec-tags">
        {event?.category ? <span className="pec-tag">{event.category}</span> : null}
        {audience.slice(0, compact ? 1 : 2).map((a) => (
          <span key={a} className="pec-tag pec-tag-muted">
            {a}
          </span>
        ))}
      </div>

      {isPosterOpen ? (
        <div
          className="pec-poster-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Celý plakát: ${event?.title || "vysílání"}`}
          onClick={() => setIsPosterOpen(false)}
        >
          <button
            type="button"
            className="pec-modal-close"
            onClick={() => setIsPosterOpen(false)}
            aria-label="Zavřít celý plakát"
            autoFocus
          >
            ×
          </button>
          <div className="pec-poster-full" onClick={(clickEvent) => clickEvent.stopPropagation()}>
            <img
              src={posterUrl}
              alt={`${event?.title || "Plakát vysílání"} – celý plakát`}
            />
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .pec-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 20px;
          padding: 14px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.045);
        }

        .pec-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          color: #526074;
        }

        .pec-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .pec-badge-live {
          background: #fee2e2;
          color: #dc2626;
        }

        .pec-badge-today {
          background: #e7eef9;
          color: #1e3a5f;
        }

        .pec-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #dc2626;
        }

        .pec-photo {
          margin-top: 10px;
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          background: #eef2f8;
        }

        .pec-photo-button {
          position: relative;
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          cursor: zoom-in;
          text-align: left;
        }

        .pec-photo-button:focus-visible {
          outline: 4px solid rgba(37, 99, 235, 0.35);
          outline-offset: 2px;
        }

        .pec-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pec-zoom-hint {
          position: absolute;
          right: 8px;
          bottom: 8px;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.86);
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          line-height: 1;
          opacity: 0;
          transform: translateY(3px);
          transition: opacity 160ms ease, transform 160ms ease;
        }

        .pec-photo-button:hover .pec-zoom-hint,
        .pec-photo-button:focus-visible .pec-zoom-hint {
          opacity: 1;
          transform: translateY(0);
        }

        .pec-photo-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 900;
          color: #7c8aa5;
        }

        .pec-title {
          margin-top: 10px;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.3;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .pec-tags {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .pec-tag {
          font-size: 12px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 999px;
          background: #eaf1ff;
          color: #1d4ed8;
        }

        .pec-tag-muted {
          background: #f1f5f9;
          color: #475569;
        }

        .pec-poster-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: rgba(2, 6, 23, 0.92);
          backdrop-filter: blur(4px);
        }

        .pec-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 1;
          display: inline-flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          padding: 0 0 3px;
          border: 0;
          border-radius: 999px;
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          font-size: 30px;
          line-height: 1;
        }

        .pec-modal-close:focus-visible {
          outline: 4px solid rgba(96, 165, 250, 0.7);
          outline-offset: 2px;
        }

        .pec-poster-full {
          display: flex;
          width: 100%;
          height: calc(100dvh - 24px);
          align-items: center;
          justify-content: center;
        }

        .pec-poster-full img {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          max-height: 100%;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.38);
        }

        @media (hover: none) {
          .pec-zoom-hint {
            opacity: 1;
            transform: none;
          }
        }

        @media (min-width: 640px) {
          .pec-poster-modal {
            padding: 24px;
          }

          .pec-modal-close {
            top: 24px;
            right: 24px;
          }

          .pec-poster-full {
            height: calc(100dvh - 48px);
          }
        }
      `}</style>
    </article>
  );
}
