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
  });

  it("keeps push fail-closed until server configuration is available", () => {
    const profilePage = source("pages/portal/muj-profil.js");
    expect(profilePage).toContain("Push oznámení do telefonu");
    expect(profilePage).toContain("Zatím se nic do telefonu neposílá");
    expect(profilePage).toContain("!VAPID_PUBLIC_KEY");
    expect(profilePage).toContain("Notification.requestPermission()");
  });
});
