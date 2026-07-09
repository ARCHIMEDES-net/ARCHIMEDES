import { safeDate, normalizeAudience, resolvePosterUrl } from "../lib/publicEvents";

const CZ_MONTHS_GENITIVE = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

function formatDateCS(date) {
  return `${date.getDate()}. ${CZ_MONTHS_GENITIVE[date.getMonth()]} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getLiveState(start, now = new Date()) {
  if (!start) return null;
  const liveUntil = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  if (now >= start && now <= liveUntil) return "live";
  if (start.toDateString() === now.toDateString()) return "today";
  return null;
}

export default function PublicEventCard({ event, compact = false }) {
  const start = safeDate(event?.starts_at);
  const posterUrl = resolvePosterUrl(event);
  const audience = normalizeAudience(event?.audience_groups);
  const liveState = getLiveState(start);

  return (
    <article className="pec-card">
      <div className="pec-meta">
        <span className="pec-date">{start ? formatDateCS(start) : "Termín upřesníme"}</span>
        {liveState === "live" ? (
          <span className="pec-badge pec-badge-live">
            <span className="pec-dot" /> ŽIVĚ
          </span>
        ) : liveState === "today" ? (
          <span className="pec-badge pec-badge-today">DNES</span>
        ) : null}
      </div>

      <div className={`pec-photo${posterUrl ? "" : " pec-photo-empty"}`}>
        {posterUrl ? (
          <img src={posterUrl} alt={event?.title || "Plakát vysílání"} loading="lazy" />
        ) : (
          <span>{(event?.category || "ARCHIMEDES Live").slice(0, 1)}</span>
        )}
      </div>

      <div className="pec-title">{event?.title || "Připravovaná událost"}</div>

      <div className="pec-tags">
        {event?.category ? <span className="pec-tag">{event.category}</span> : null}
        {audience.slice(0, compact ? 1 : 2).map((a) => (
          <span key={a} className="pec-tag pec-tag-muted">
            {a}
          </span>
        ))}
      </div>

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

        .pec-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
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
      `}</style>
    </article>
  );
}
