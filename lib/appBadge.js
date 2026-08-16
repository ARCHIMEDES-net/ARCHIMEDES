export const UNREAD_NOTIFICATION_COUNT_EVENT = "archimedes:unread-notification-count";

export function normalizeBadgeCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.min(99, Math.floor(numeric));
}

export async function syncAppBadge(value) {
  if (typeof navigator === "undefined") return false;

  const count = normalizeBadgeCount(value);
  try {
    if (count === 0 && typeof navigator.clearAppBadge === "function") {
      await navigator.clearAppBadge();
      return true;
    }
    if (count > 0 && typeof navigator.setAppBadge === "function") {
      await navigator.setAppBadge(count);
      return true;
    }
  } catch (_error) {
    // Některé prohlížeče vyžadují oprávnění k oznámením. Odznak je doplněk,
    // proto jeho nedostupnost nesmí rozbít portál ani centrum novinek.
  }
  return false;
}

export function publishUnreadNotificationCount(value) {
  const count = normalizeBadgeCount(value);
  void syncAppBadge(count);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(UNREAD_NOTIFICATION_COUNT_EVENT, { detail: { count } })
    );
  }

  return count;
}
