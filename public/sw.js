/* ARCHIMEDES Live service worker.
 * Authenticated pages and API responses are intentionally never cached here.
 */

const FALLBACK_URL = "/portal/novinky";
const ICON_URL = "/pwa-icon-192.png";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function safeNotificationUrl(value) {
  try {
    const url = new URL(String(value || FALLBACK_URL), self.location.origin);
    if (url.origin !== self.location.origin) return FALLBACK_URL;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (_error) {
    return FALLBACK_URL;
  }
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_error) {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = String(payload.title || "ARCHIMEDES Live").slice(0, 240);
  const body = String(payload.body || "Máte nové oznámení.").slice(0, 4000);
  const url = safeNotificationUrl(payload.url);
  const tag = String(payload.tag || "archimedes-live").slice(0, 200);

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: ICON_URL,
      badge: ICON_URL,
      tag,
      data: { url },
      renotify: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = safeNotificationUrl(event.notification.data?.url);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => {
        try {
          return new URL(client.url).pathname === new URL(targetUrl, self.location.origin).pathname;
        } catch (_error) {
          return false;
        }
      });

      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
