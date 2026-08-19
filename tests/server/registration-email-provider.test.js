import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RegistrationEmailProviderError,
  sendRegistrationEmail,
} from "../../lib/server/registrationEmailProvider";

const originalEnvironment = {
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.REGISTRATION_EMAIL_FROM,
  replyTo: process.env.REGISTRATION_EMAIL_REPLY_TO,
};

beforeEach(() => {
  process.env.RESEND_API_KEY = "re_private_test_key";
  process.env.REGISTRATION_EMAIL_FROM =
    "ARCHIMEDES Live <registrace@example.test>";
  process.env.REGISTRATION_EMAIL_REPLY_TO = "podpora@example.test";
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const [key, value] of Object.entries({
    RESEND_API_KEY: originalEnvironment.apiKey,
    REGISTRATION_EMAIL_FROM: originalEnvironment.from,
    REGISTRATION_EMAIL_REPLY_TO: originalEnvironment.replyTo,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("registration email provider", () => {
  it("uses the fixed Resend API, a deterministic key, and returns the provider receipt", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn(async () => ({ id: "resend-message-123" })),
    });

    const result = await sendRegistrationEmail({
      to: "client@example.test",
      subject: "Registrace",
      text: "Text",
      html: "<p>Text</p>",
      idempotencyKey: "municipality-onboarding:attempt-1:client",
    });

    expect(result).toEqual({
      provider: "resend",
      messageId: "resend-message-123",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_private_test_key",
          "Idempotency-Key": "municipality-onboarding:attempt-1:client",
        }),
      })
    );
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({
      from: "ARCHIMEDES Live <registrace@example.test>",
      to: ["client@example.test"],
      reply_to: "podpora@example.test",
    });
    expect(body).not.toHaveProperty("apiKey");
  });

  it("rejects missing configuration and invalid idempotency keys before delivery", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(
      sendRegistrationEmail({
        to: "client@example.test",
        subject: "Registrace",
        text: "Text",
        html: "<p>Text</p>",
        idempotencyKey: "valid-key",
      })
    ).rejects.toMatchObject({ code: "REGISTRATION_EMAIL_CONFIG_MISSING" });
    expect(fetch).not.toHaveBeenCalled();

    process.env.RESEND_API_KEY = "re_private_test_key";
    await expect(
      sendRegistrationEmail({
        to: "client@example.test",
        subject: "Registrace",
        text: "Text",
        html: "<p>Text</p>",
        idempotencyKey: "invalid key with spaces",
      })
    ).rejects.toBeInstanceOf(RegistrationEmailProviderError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
