import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

describe("central organization onboarding contract", () => {
  it("keeps the municipality contact separate from an explicitly confirmed local administrator", () => {
    const source = read("pages/portal/admin/obce.js");
    const additionalAdminSource = read(
      "pages/portal/admin/obce/[id]/spravci.js"
    );

    expect(source).toContain("contactIsLocalAdmin");
    expect(source).toContain("localAdminFullName");
    expect(source).toContain("localAdminEmail");
    expect(source).toContain("Kontaktní osoba obce není automaticky uživatelem ani správcem");
    expect(additionalAdminSource).toContain(
      'setForm({ fullName: "", email: "" })'
    );
    expect(additionalAdminSource).not.toContain(
      "fullName: data.contact_name"
    );
  });

  it("loads central administrators from server configuration without hardcoded people", () => {
    const route = read("pages/api/admin/activate-municipality.js");

    expect(route).toContain("MUNICIPALITY_CENTRAL_ADMIN_USER_IDS");
  });

  it("keeps email recovery available after reload with both audited unknown-delivery decisions", () => {
    const source = read("pages/portal/admin/obce.js");

    expect(source).toContain("openEmailManagement");
    expect(source).toContain("Onboardingový e-mail");
    expect(source).toContain("retry_failed");
    expect(source).toContain("resolve_without_resend");
    expect(source).toContain("confirm_not_delivered_and_retry");
    expect(source).toContain("email_attempt_count");
    expect(source).toContain("previous_attempt_number");
  });

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

  it("shows school users to the verified municipality administrator without counting platform admins", () => {
    const page = read("pages/portal/organizace-obce.js");
    const route = read("pages/api/municipality/organization-invites.js");

    expect(page).toContain("Učitelé a správci školy");
    expect(page).toContain("Čeká na nastavení hesla");
    expect(page).toContain("Profil není dokončený");
    expect(page).toContain("Zobrazit učitele a správce");
    expect(route).toContain('.from("organization_members")');
    expect(route).toContain('.from("profiles")');
    expect(route).toContain('.from("platform_admins")');
    expect(route).toContain("platformAdminIds.has(membership.user_id)");
    const childMembershipRead = route.indexOf(
      '.from("organization_members")',
      route.indexOf("if (schoolIds.length > 0)")
    );
    expect(route.indexOf("requireMunicipalityAdmin(req, res, municipalityId)")).toBeLessThan(
      childMembershipRead
    );
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
