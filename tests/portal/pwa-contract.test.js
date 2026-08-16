import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("PWA contract", () => {
  it("provides an installable manifest with required icons", () => {
    const manifest = JSON.parse(source("public/manifest.webmanifest"));
    expect(manifest.name).toBe("ARCHIMEDES Live");
    expect(manifest.start_url).toBe("/portal");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(["192x192", "512x512"]);
    expect(fs.existsSync(path.join(process.cwd(), "public/pwa-icon-192.png"))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "public/pwa-icon-512.png"))).toBe(true);
  });

  it("does not cache authenticated pages or API responses", () => {
    const serviceWorker = source("public/sw.js");
    expect(serviceWorker).not.toContain('addEventListener("fetch"');
    expect(serviceWorker).not.toContain("caches.open");
  });

  it("accepts only same-origin notification destinations", () => {
    const serviceWorker = source("public/sw.js");
    expect(serviceWorker).toContain("url.origin !== self.location.origin");
    expect(serviceWorker).toContain('addEventListener("notificationclick"');
  });
});
