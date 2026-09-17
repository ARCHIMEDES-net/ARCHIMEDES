export const PRIZE_PLAN = "competition_prize_12m";
export const PRIZE_LABEL = "12 měsíců zdarma – výhra v soutěži";

export function prizeEndDate(start) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || "")) return "";
  const date = new Date(`${start}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== start) return "";
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function activePrize(org, now = new Date()) {
  return org?.license_plan === PRIZE_PLAN && org.status === "active" && org.license_status === "active"
    && new Date(org.license_started_at) <= now && new Date(org.license_valid_until) >= now;
}

export function prizeDateInput(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "Europe/Prague" });
}
