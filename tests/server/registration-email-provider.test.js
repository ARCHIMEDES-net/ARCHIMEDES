import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RegistrationEmailProviderError,
  registrationEmailWasDefinitelyNotSent,
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
          "User-Agent": "ARCHIMEDES-Live/1.0",
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

  it("allows a validated caller to override Reply-To for a specific message", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn(async () => ({ id: "resend-message-override" })),
    });

    await sendRegistrationEmail({
      to: "team@example.test",
      replyTo: "applicant@example.test",
      subject: "Nová žádost",
      text: "Text",
      html: "<p>Text</p>",
      idempotencyKey: "order-request:lead-1:team",
    });

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.reply_to).toBe("applicant@example.test");
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

  it("distinguishes a definitive API rejection from an ambiguous provider outcome", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: vi.fn(async () => ({ name: "validation_error" })),
    });

    const rejected = await sendRegistrationEmail({
      to: "client@example.test",
      subject: "Registrace",
      text: "Text",
      html: "<p>Text</p>",
      idempotencyKey: "municipality-onboarding:attempt-2:client",
    }).catch((error) => error);
    expect(registrationEmailWasDefinitelyNotSent(rejected)).toBe(true);
    expect(rejected).toMatchObject({
      code: "REGISTRATION_EMAIL_PROVIDER_REJECTED",
      deliveryOutcome: "not_sent",
      httpStatus: 422,
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: vi.fn(async () => ({ name: "concurrent_idempotent_requests" })),
    });
    const ambiguous = await sendRegistrationEmail({
      to: "client@example.test",
      subject: "Registrace",
      text: "Text",
      html: "<p>Text</p>",
      idempotencyKey: "municipality-onboarding:attempt-2:client",
    }).catch((error) => error);
    expect(registrationEmailWasDefinitelyNotSent(ambiguous)).toBe(false);
    expect(ambiguous).toMatchObject({
      deliveryOutcome: "unknown",
      httpStatus: 409,
    });
  });
});
