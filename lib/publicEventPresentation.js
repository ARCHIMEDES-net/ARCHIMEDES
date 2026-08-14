const PRAGUE_TIME_ZONE = "Europe/Prague";

const CZ_MONTHS_GENITIVE = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];

const PRAGUE_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: PRAGUE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function toValidDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getPragueParts(value) {
  const date = toValidDate(value);
  if (!date) return null;

  return Object.fromEntries(
    PRAGUE_DATE_TIME_FORMATTER.formatToParts(date).map(({ type, value: part }) => [
      type,
      part,
    ])
  );
}

function getPragueDateKey(value) {
  const parts = getPragueParts(value);
  if (!parts) return "";
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatPublicEventDate(value) {
  const parts = getPragueParts(value);
  if (!parts) return "";

  const monthName = CZ_MONTHS_GENITIVE[Number(parts.month) - 1];
  return `${Number(parts.day)}. ${monthName} ${parts.hour}:${parts.minute}`;
}

export function getPublicEventLiveState(startValue, nowValue = new Date()) {
  const start = toValidDate(startValue);
  const now = toValidDate(nowValue);
  if (!start || !now) return null;

  const liveUntil = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  if (now >= start && now <= liveUntil) return "live";
  if (getPragueDateKey(start) === getPragueDateKey(now)) return "today";
  return null;
}
