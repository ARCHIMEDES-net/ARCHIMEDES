import crypto from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { consumeAuthenticatedRateLimit } from "../../lib/server/authenticatedRateLimit";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";

const originalSalt = process.env.RATE_LIMIT_SALT;

afterEach(() => {
  process.env.RATE_LIMIT_SALT = originalSalt;
  vi.restoreAllMocks();
});

function expectedHash(value, salt = "test-rate-limit-salt") {
  return crypto.createHmac("sha256", salt).update(value).digest("hex");
}

describe("public API rate limiting", () => {
  it("uses the first forwarded address and sends only its keyed hash to the database", async () => {
    process.env.RATE_LIMIT_SALT = "test-rate-limit-salt";
    const rpc = vi.fn(async () => ({ data: true, error: null }));
    const supabaseAdmin = { rpc };

    const allowed = await consumePublicRateLimit({
      supabaseAdmin,
      req: {
        headers: {
          "x-forwarded-for": "198.51.100.20, 10.0.0.1",
          "x-real-ip": "198.51.100.21",
        },
        socket: { remoteAddress: "198.51.100.22" },
      },
      route: "public-form",
      limit: 5,
      windowSeconds: 60,
    });

    expect(allowed).toBe(true);
    expect(rpc).toHaveBeenCalledWith("consume_api_rate_limit", {
      p_route: "public-form",
      p_key_hash: expectedHash("198.51.100.20"),
      p_limit: 5,
      p_window_seconds: 60,
    });
    expect(JSON.stringify(rpc.mock.calls)).not.toContain("198.51.100.20");
  });

  it.each([
    [{ "x-real-ip": "198.51.100.30" }, "203.0.113.1", "198.51.100.30"],
    [{}, "203.0.113.2", "203.0.113.2"],
    [{}, "", "unknown"],
  ])("uses the documented address fallback order", async (headers, remoteAddress, address) => {
    const rpc = vi.fn(async () => ({ data: false, error: null }));

    const allowed = await consumePublicRateLimit({
      supabaseAdmin: { rpc },
      req: { headers, socket: { remoteAddress } },
      route: "public-form",
      limit: 1,
      windowSeconds: 30,
    });

    expect(allowed).toBe(false);
    expect(rpc.mock.calls[0][1].p_key_hash).toBe(expectedHash(address));
  });
});

describe("authenticated API rate limiting", () => {
  it("scopes the rate-limit key by user, resource, and client address", async () => {
    const rpc = vi.fn(async () => ({ data: true, error: null }));

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin: { rpc },
      req: {
        headers: { "x-forwarded-for": "198.51.100.40" },
        socket: { remoteAddress: "203.0.113.5" },
      },
      route: "broadcast-join",
      userId: "user-1",
      resourceId: "event-1",
      limit: 10,
      windowSeconds: 120,
    });

    expect(allowed).toBe(true);
    expect(rpc).toHaveBeenCalledWith("consume_api_rate_limit", {
      p_route: "broadcast-join",
      p_key_hash: expectedHash("user-1:event-1:198.51.100.40"),
      p_limit: 10,
      p_window_seconds: 120,
    });
  });

  it.each([
    [consumePublicRateLimit, "public rate limit error:"],
    [consumeAuthenticatedRateLimit, "authenticated rate limit error:"],
  ])("fails closed when the shared database limiter fails", async (consume, logPrefix) => {
    const databaseError = new Error("database unavailable");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const common = {
      supabaseAdmin: {
        rpc: vi.fn(async () => ({ data: null, error: databaseError })),
      },
      req: { headers: {}, socket: { remoteAddress: "203.0.113.6" } },
      route: "protected-route",
      limit: 2,
      windowSeconds: 60,
    };

    await expect(
      consume === consumeAuthenticatedRateLimit
        ? consume({ ...common, userId: "user-1" })
        : consume(common)
    ).rejects.toThrow("Nepodařilo se ověřit bezpečnost požadavku.");

    expect(consoleError).toHaveBeenCalledWith(logPrefix, databaseError);
  });
});
