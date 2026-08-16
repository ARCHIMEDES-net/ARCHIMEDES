import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("senior-friendly PWA installation UI", () => {
  it("provides a public device-aware installation guide", () => {
    const page = source("pages/instalace.js");
    const guide = source("components/PwaInstallGuide.js");

    expect(page).toContain("Přidat A Live do telefonu");
    expect(guide).toContain("ios-safari");
    expect(guide).toContain("ios-other");
    expect(guide).toContain("android");
    expect(guide).toContain("PWA_INSTALLABLE_EVENT");
    expect(guide).toContain("Přidat na plochu");
    expect(page).toContain("Samotná instalace");
  });

  it("keeps the guide discoverable from the mobile menu and profile", () => {
    expect(source("components/PortalHeader.js")).toContain('href="/instalace"');
    expect(source("pages/portal/muj-profil.js")).toContain('href="/instalace"');
  });

  it("keeps the installation page free of unrelated calls to action", () => {
    const app = source("pages/_app.js");
    const floatingCta = source("components/FloatingJoinCta.js");

    expect(app).toContain('pathname === "/instalace"');
    expect(floatingCta).toContain('"/instalace"');
  });
});
