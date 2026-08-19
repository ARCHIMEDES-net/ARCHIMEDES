import { describe, expect, it, vi } from "vitest";
import {
  safeSmtpDiagnostics,
  sendSmtpMessage,
  verifySmtpTransport,
} from "../../lib/server/smtpDelivery";

describe("SMTP delivery safeguards", () => {
  it("keeps diagnostics to a non-sensitive allowlist", () => {
    const diagnostics = safeSmtpDiagnostics({
      code: "EAUTH",
      command: "AUTH PLAIN",
      responseCode: 535,
      message: "Login failed for secret@example.test with password hidden",
      response: "535 secret@example.test rejected",
    });

    expect(diagnostics).toEqual({
      code: "EAUTH",
      command: "AUTH PLAIN",
      responseCode: 535,
    });
    expect(JSON.stringify(diagnostics)).not.toContain("secret@example.test");
    expect(JSON.stringify(diagnostics)).not.toContain("password");
  });

  it("requires the SMTP server to confirm the intended recipient", async () => {
    const transporter = {
      sendMail: vi.fn(async () => ({
        messageId: "message-1",
        accepted: ["recipient@example.test"],
        rejected: [],
      })),
    };

    await expect(
      sendSmtpMessage(transporter, {
        to: "recipient@example.test",
        subject: "Test",
      })
    ).resolves.toMatchObject({ messageId: "message-1" });
  });

  it("treats a missing recipient acknowledgement as unconfirmed", async () => {
    const transporter = {
      sendMail: vi.fn(async () => ({
        messageId: "message-1",
        accepted: [],
        rejected: ["recipient@example.test"],
      })),
    };

    await expect(
      sendSmtpMessage(transporter, { to: "recipient@example.test" })
    ).rejects.toMatchObject({ code: "SMTP_RECIPIENT_NOT_ACCEPTED" });
  });

  it("wraps preflight failures without retaining the raw message", async () => {
    const transporter = {
      verify: vi.fn(async () => {
        const error = new Error("password=do-not-log");
        error.code = "EAUTH";
        error.responseCode = 535;
        throw error;
      }),
    };

    await expect(verifySmtpTransport(transporter)).rejects.toMatchObject({
      code: "SMTP_PREFLIGHT_FAILED",
      smtpDiagnostics: { code: "EAUTH", responseCode: 535 },
    });
  });
});
