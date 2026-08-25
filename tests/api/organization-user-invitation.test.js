import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_USER_INVITATION_AUDIT_EMAIL,
  organizationUserInvitationAuditCopyMessage,
  organizationUserInvitationMessage,
} from "../../lib/server/organizationUserInvitation";

const repositoryRoot = process.cwd();

describe("organization user invitation", () => {
  it("builds a client message with the one-time setup link", () => {
    const setupUrl = "https://example.supabase.co/auth/v1/verify?token=secret-token&type=invite";
    const message = organizationUserInvitationMessage({
      fullName: "Natálie Štěpančíková",
      organizationName: "Testovací škola ARCHIMEDES",
      roleLabel: "Člen organizace",
      setupUrl,
    });

    expect(message.subject).toContain("Testovací škola ARCHIMEDES");
    expect(message.text).toContain(setupUrl);
    expect(message.html).toContain("secret-token");
  });

  it("keeps Zuzana's audit copy free of the setup secret", () => {
    const setupUrl = "https://example.supabase.co/auth/v1/verify?token=secret-token&type=invite";
    const message = organizationUserInvitationAuditCopyMessage({
      recipientEmail: "n.stepancikova@email.cz",
      fullName: "Natálie Štěpančíková",
      organizationName: "Testovací škola ARCHIMEDES",
      roleLabel: "Člen organizace",
      setupUrl,
    });

    expect(ORGANIZATION_USER_INVITATION_AUDIT_EMAIL).toBe(
      "zuzana.novotna@archimedeslive.com"
    );
    expect(message.text).toContain("n.stepancikova@email.cz");
    expect(message.text).not.toContain(setupUrl);
    expect(message.html).not.toContain("secret-token");
  });

  it("routes invites through the audited provider instead of Supabase SMTP", () => {
    const source = fs.readFileSync(
      path.join(repositoryRoot, "pages/api/invite-user.js"),
      "utf8"
    );

    expect(source).toContain('type: "invite"');
    expect(source).toContain("sendOrganizationUserInvitation");
    expect(source).not.toContain("inviteUserByEmail");
  });
});
