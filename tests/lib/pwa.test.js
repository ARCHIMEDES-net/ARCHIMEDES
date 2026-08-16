import { describe, expect, it } from "vitest";
import { pushSubscriptionRow, urlBase64ToUint8Array } from "../../lib/pwa";

describe("PWA helpers", () => {
  it("converts a URL-safe VAPID key to bytes", () => {
    expect(Array.from(urlBase64ToUint8Array("AQIDBA"))).toEqual([1, 2, 3, 4]);
  });

  it("serializes a valid browser push subscription", () => {
    const row = pushSubscriptionRow(
      {
        endpoint: "https://push.example.test/subscription",
        expirationTime: null,
        toJSON: () => ({ keys: { p256dh: "public-key", auth: "auth-key" } }),
      },
      "11111111-1111-4111-8111-111111111111",
      "Test Browser"
    );

    expect(row).toMatchObject({
      endpoint: "https://push.example.test/subscription",
      p256dh_key: "public-key",
      auth_key: "auth-key",
      expiration_time: null,
      user_agent: "Test Browser",
    });
  });

  it("rejects an unsafe push endpoint", () => {
    expect(() =>
      pushSubscriptionRow(
        {
          endpoint: "http://push.example.test/subscription",
          toJSON: () => ({ keys: { p256dh: "public-key", auth: "auth-key" } }),
        },
        "11111111-1111-4111-8111-111111111111"
      )
    ).toThrow("platné údaje");
  });
});
