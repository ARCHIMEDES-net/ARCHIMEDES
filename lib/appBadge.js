export const UNREAD_NOTIFICATION_COUNT_EVENT = "archimedes:unread-notification-count";

export function appBadgePermissionState() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "unsupported";
  }
  if (
    typeof navigator.setAppBadge !== "function" ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  return window.Notification.permission || "default";
}

export async function requestAppBadgePermission() {
  const current = appBadgePermissionState();
  if (current === "unsupported" || current === "denied" || current === "granted") {
    return current;
  }

  try {
    return await window.Notification.requestPermission();
  } catch (_error) {
    return "unsupported";
  }
}

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

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(UNREAD_NOTIFICATION_COUNT_EVENT, { detail: { count } })
    );
  }

  return count;
}
