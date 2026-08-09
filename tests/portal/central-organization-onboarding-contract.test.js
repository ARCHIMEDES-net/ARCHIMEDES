import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

describe("central organization onboarding contract", () => {
  it.each([
    ["pages/registrace-skoly.js", "/zadost?type=skola"],
    ["pages/registrace-spolku.js", "/zadost?type=spolek"],
    ["pages/create-school.js", "/zadost?type=skola"],
  ])("redirects %s to the centrally reviewed request", (file, destination) => {
    const source = read(file);

    expect(source).toContain(`destination: "${destination}"`);
    expect(source).not.toContain("fetch(");
  });

  it("keeps the municipality portal read-only except for revoking legacy invites", () => {
    const source = read("pages/portal/organizace-obce.js");

    expect(source).toContain("centrální tým ARCHIMEDES");
    expect(source).toContain('method: "PATCH"');
    expect(source).not.toContain('method: "POST"');
    expect(source).not.toContain("Vytvořit pozvánku");
    expect(source).not.toContain("inviteUrl");
  });

  it("does not expose a code path that creates municipality registration invites", () => {
    const source = read("pages/api/municipality/organization-invites.js");

    expect(source).toContain('req.method === "POST"');
    expect(source).toContain("res.status(410)");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain("randomBytes");
    expect(source).not.toContain("sendMail");
  });
});
