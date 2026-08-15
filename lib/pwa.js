export function urlBase64ToUint8Array(value) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error("Chybí veřejný VAPID klíč.");

  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = globalThis.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.navigator?.standalone === true
  );
}

export function canUsePushNotifications() {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushSubscriptionRow(subscription, profileId, userAgent = "") {
  const json = subscription?.toJSON?.() || {};
  const endpoint = String(subscription?.endpoint || json.endpoint || "").trim();
  const p256dhKey = String(json.keys?.p256dh || "").trim();
  const authKey = String(json.keys?.auth || "").trim();

  if (!profileId || !endpoint.startsWith("https://") || !p256dhKey || !authKey) {
    throw new Error("Prohlížeč nevrátil platné údaje pro push oznámení.");
  }

  return {
    profile_id: profileId,
    endpoint,
    p256dh_key: p256dhKey,
    auth_key: authKey,
    expiration_time: subscription.expirationTime
      ? new Date(subscription.expirationTime).toISOString()
      : null,
    user_agent: String(userAgent || "").slice(0, 1000) || null,
  };
}
