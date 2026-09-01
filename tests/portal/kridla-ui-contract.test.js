import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const page = fs.readFileSync(
  path.join(process.cwd(), "pages/portal/kridla.js"),
  "utf8"
);
const header = fs.readFileSync(
  path.join(process.cwd(), "components/PortalHeader.js"),
  "utf8"
);

describe("Křídla portal UI", () => {
  it("shows the section to everyone while gating the actual materials", () => {
    expect(header).toContain('href: "/portal/kridla"');
    expect(page).toContain("Chráněná knihovna");
    expect(page).toContain("!loading && !hasAccess");
    expect(page).toContain("!loading && hasAccess");
  });

  it("downloads from private storage instead of generating a public URL", () => {
    expect(page).toContain('.from(MATERIALS_BUCKET)');
    expect(page).toContain(".download(material.storage_path)");
    expect(page).not.toContain("getPublicUrl");
  });

  it("allows project administrators to upload only supported material types", () => {
    expect(page).toContain("can_administer_access_program");
    expect(page).toContain("ALLOWED_MIME_TYPES");
    expect(page).toContain("MAX_FILE_SIZE");
  });
});
