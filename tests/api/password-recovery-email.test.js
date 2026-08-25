import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { passwordRecoveryMessage } from "../../lib/server/passwordRecoveryEmail";

const repositoryRoot = process.cwd();

describe("password recovery email", () => {
  it("builds a recovery message with the one-time setup link", () => {
    const setupUrl =
      "https://example.supabase.co/auth/v1/verify?token=secret-token&type=recovery";
    const message = passwordRecoveryMessage({ setupUrl });

    expect(message.subject).toContain("Obnova hesla");
    expect(message.text).toContain(setupUrl);
    expect(message.html).toContain("secret-token");
  });

  it("routes password reset through generateLink and Resend instead of Supabase SMTP", () => {
    const route = fs.readFileSync(
      path.join(repositoryRoot, "pages/api/request-password-reset.js"),
      "utf8"
    );
    const page = fs.readFileSync(
      path.join(repositoryRoot, "pages/reset-hesla.js"),
      "utf8"
    );

    expect(route).toContain('type: "recovery"');
    expect(route).toContain("sendPasswordRecoveryEmail");
    expect(route).toContain("consumePublicRateLimit");
    expect(route).toContain("GENERIC_MESSAGE");
    expect(route).not.toContain("resetPasswordForEmail");
    expect(page).toContain('fetch("/api/request-password-reset"');
    expect(page).not.toContain("resetPasswordForEmail");
  });
});
