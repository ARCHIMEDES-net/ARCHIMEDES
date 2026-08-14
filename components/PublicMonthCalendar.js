import { useEffect, useMemo, useState } from "react";
import { safeDate, normalizeAudience } from "../lib/publicEvents";
import {
  formatPublicEventTime,
  getPublicEventPragueCalendarDate,
  getPublicEventPragueDateKey,
} from "../lib/publicEventPresentation";

const CZ_MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

const CZ_WEEKDAYS = ["PO", "ÚT", "ST", "ČT", "PÁ", "SO", "NE"];

function gridDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(year, month, 1 - startWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

/**
 * Read-only public calendar: no login required, no join links — only
 * shows which days have events; selecting a day reveals title, time,
 * category and audience for that day's events.
 */
export default function PublicMonthCalendar({ events, lockedNote, onNavigate }) {
  const [calendarState, setCalendarState] = useState(null);

  useEffect(() => {
    const today = getPublicEventPragueCalendarDate();
    if (!today) return;

    setCalendarState({
      todayKey: today.key,
      cursor: new Date(today.year, today.month, 1),
      selectedKey: today.key,
    });
  }, []);

  const cursor = calendarState?.cursor || null;
  const selectedKey = calendarState?.selectedKey || "";

  const eventsByDay = useMemo(() => {
    const map = new Map();
    (events || []).forEach((event) => {
      const start = safeDate(event.starts_at);
      if (!start) return;
      const key = getPublicEventPragueDateKey(start);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    });
    return map;
  }, [events]);

  const grid = useMemo(
    () => (cursor ? buildMonthGrid(cursor.getFullYear(), cursor.getMonth()) : []),
    [cursor]
  );

  const selectedEvents = eventsByDay.get(selectedKey) || [];

  function changeMonth(delta) {
    setCalendarState((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        cursor: new Date(
          previous.cursor.getFullYear(),
          previous.cursor.getMonth() + delta,
          1
        ),
      };
    });
  }

  return (
    <div className="pmc">
      <div className="pmc-head">
        <div className="pmc-title">{lockedNote ? (
          <>
            <span>Kalendář akcí</span>
            <span className="pmc-lock" title={lockedNote}>
              🔒 {lockedNote}
            </span>
          </>
        ) : (
          <span>Kalendář akcí</span>
        )}</div>
      </div>

      <div className="pmc-monthbar">
        <span className="pmc-month">
          {cursor ? `${CZ_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}` : "Načítám…"}
        </span>
        <div className="pmc-nav">
          <button type="button" aria-label="Předchozí měsíc" onClick={() => changeMonth(-1)}>
            ‹
          </button>
          <button type="button" aria-label="Další měsíc" onClick={() => changeMonth(1)}>
            ›
          </button>
        </div>
      </div>

      <div className="pmc-weekdays">
        {CZ_WEEKDAYS.map((wd) => (
          <span key={wd}>{wd}</span>
        ))}
      </div>

      <div className="pmc-grid">
        {grid.map((date) => {
          const key = gridDateKey(date);
          const inMonth = date.getMonth() === cursor.getMonth();
          const isToday = key === calendarState.todayKey;
          const isSelected = key === selectedKey;
          const hasEvents = eventsByDay.has(key);

          return (
            <button
              key={key}
              type="button"
              className={[
                "pmc-day",
                inMonth ? "" : "pmc-day-out",
                isSelected ? "pmc-day-selected" : "",
                isToday && !isSelected ? "pmc-day-today" : "",
              ].join(" ").trim()}
              onClick={() => {
                setCalendarState((previous) =>
                  previous ? { ...previous, selectedKey: key } : previous
                );
              }}
            >
              {date.getDate()}
              {hasEvents ? <span className="pmc-day-dot" /> : null}
            </button>
          );
        })}
      </div>

      <div className="pmc-selected">
        {!calendarState ? (
          <div className="pmc-empty">Načítám kalendář…</div>
        ) : selectedEvents.length ? (
          selectedEvents.map((event) => {
            const start = safeDate(event.starts_at);
            const audience = normalizeAudience(event.audience_groups);
            return (
              <div key={event.id} className="pmc-event">
                <div className="pmc-event-time">
                  {start ? formatPublicEventTime(start) : ""}
                </div>
                <div className="pmc-event-body">
                  <div className="pmc-event-title">{event.title}</div>
                  <div className="pmc-event-tags">
                    {event.category ? <span>{event.category}</span> : null}
                    {audience.map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="pmc-empty">Žádné akce v tento den.</div>
        )}
      </div>

      {onNavigate ? (
        <button type="button" className="pmc-cta" onClick={onNavigate}>
          Přejít do kalendáře <span aria-hidden="true">→</span>
        </button>
      ) : null}

      <style jsx>{`
        .pmc {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
        }

        .pmc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pmc-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          font-size: 17px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .pmc-lock {
          font-size: 12px;
          font-weight: 800;
          color: #7c8aa5;
        }

        .pmc-monthbar {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pmc-month {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
        }

        .pmc-nav {
          display: flex;
          gap: 6px;
        }

        .pmc-nav button {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: #f8fafc;
          font-size: 16px;
          cursor: pointer;
          color: #334155;
        }

        .pmc-nav button:hover {
          background: #eef2f8;
        }

        .pmc-weekdays {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-align: center;
        }

        .pmc-grid {
          margin-top: 4px;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 2px;
        }

        .pmc-day {
          position: relative;
          height: 34px;
          border: 0;
          background: transparent;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          cursor: pointer;
        }

        .pmc-day:hover {
          background: #f1f5f9;
        }

        .pmc-day-out {
          color: #cbd5e1;
        }

        .pmc-day-today {
          background: #eef2f8;
        }

        .pmc-day-selected {
          background: #1d4ed8;
          color: #ffffff;
        }

        .pmc-day-dot {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #f59e0b;
        }

        .pmc-day-selected .pmc-day-dot {
          background: #ffffff;
        }

        .pmc-selected {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          display: grid;
          gap: 10px;
          max-height: 180px;
          overflow-y: auto;
        }

        .pmc-event {
          display: flex;
          gap: 10px;
        }

        .pmc-event-time {
          flex: 0 0 44px;
          font-size: 12px;
          font-weight: 800;
          color: #526074;
        }

        .pmc-event-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .pmc-event-tags {
          margin-top: 3px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .pmc-event-tags span {
          font-size: 11px;
          font-weight: 800;
          color: #1d4ed8;
          background: #eaf1ff;
          padding: 2px 7px;
          border-radius: 999px;
        }

        .pmc-empty {
          font-size: 13px;
          color: #94a3b8;
        }

        .pmc-cta {
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: transparent;
          padding: 0;
          font-size: 14px;
          font-weight: 900;
          color: #1d4ed8;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
