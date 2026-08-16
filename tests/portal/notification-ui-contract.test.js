import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("notification UI contract", () => {
  it("offers an explicit reminder toggle on a future event", () => {
    const eventPage = source("pages/portal/udalost/[id].js");
    expect(eventPage).toContain('from("event_reminder_subscriptions")');
    expect(eventPage).toContain("Připomenout vysílání");
    expect(eventPage).toContain('onConflict: "event_id,profile_id"');
  });

  it("adds a notification center to portal navigation", () => {
    const header = source("components/PortalHeader.js");
    const newsPage = source("pages/portal/novinky.js");
    expect(header).toContain('href: "/portal/novinky"');
    expect(newsPage).toContain('from("user_notifications")');
    expect(newsPage).toContain("Označit vše jako přečtené");
    expect(header).toContain("publishUnreadNotificationCount");
    expect(newsPage).toContain("publishUnreadNotificationCount(unreadCount)");
  });

  it("keeps broadcast notifications explicit and in-app only in administration", () => {
    const adminPage = source("pages/portal/admin/vysilani/[eventId].js");
    expect(adminPage).toContain("Aktivovat oznámení v aplikaci");
    expect(adminPage).toContain('notification_delivery_policy: "in_app_only"');
    expect(adminPage).toContain("přístupový e-mail 30 minut");
    expect(adminPage).toContain("notifications_enabled: notificationsEnabled");
  });

  it("shows the nearest broadcast without creating another reminder channel", () => {
    const newsPage = source("pages/portal/novinky.js");
    expect(newsPage).toContain('from("events")');
    expect(newsPage).toContain('.eq("is_published", true)');
    expect(newsPage).toContain('.order("starts_at", { ascending: true })');
    expect(newsPage).toContain("Nejbližší vysílání");
    expect(newsPage).toContain(`href={\`/portal/udalost/\${nextEvent.id}\`}`);
    expect(newsPage).toContain("Samotné zobrazení této karty žádné upozornění ani e-mail neodesílá.");
    expect(newsPage).not.toContain('from("event_reminder_subscriptions")');
  });

  it("keeps push fail-closed until server configuration is available", () => {
    const profilePage = source("pages/portal/muj-profil.js");
    expect(profilePage).toContain("Push oznámení do telefonu");
    expect(profilePage).toContain("Zatím se nic do telefonu neposílá");
    expect(profilePage).toContain("!VAPID_PUBLIC_KEY");
    expect(profilePage).toContain("Notification.requestPermission()");
  });

  it("keeps in-app notification choices independent from e-mail opt-out", () => {
    const profilePage = source("pages/portal/muj-profil.js");
    expect(profilePage).toContain("vypnutí e-mailu interní novinky nezablokuje");
    expect(profilePage).not.toContain("disabled={!emailNotificationsEnabled}");
  });
});
