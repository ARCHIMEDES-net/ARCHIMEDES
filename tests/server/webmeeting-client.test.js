import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  callWebMeeting,
  formatWebMeetingStart,
  formatWebMeetingTimestamp,
  getWebMeetingConfiguration,
  WebMeetingApiError,
  webMeeting,
} from "../../lib/server/webmeetingClient";

const environmentKeys = [
  "WEBMEETING_API_URL",
  "WEBMEETING_API_LOGIN",
  "WEBMEETING_API_CLIENT",
  "WEBMEETING_API_REQUEST_SECRET",
  "WEBMEETING_API_RESPONSE_SECRET",
  "WEBMEETING_API_TIMEOUT_MS",
];
const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]])
);
const fixedNow = new Date("2026-07-29T12:00:00.000Z");

function hmac(secret, value) {
  return crypto.createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

function configureWebMeeting(overrides = {}) {
  Object.assign(process.env, {
    WEBMEETING_API_URL: "https://provider.example/api",
    WEBMEETING_API_LOGIN: "api-login",
    WEBMEETING_API_CLIENT: "archimedes-client",
    WEBMEETING_API_REQUEST_SECRET: "request-secret",
    WEBMEETING_API_RESPONSE_SECRET: "response-secret",
    WEBMEETING_API_TIMEOUT_MS: "2500",
    ...overrides,
  });
}

function providerResponse({
  body = {
    server_timestamp: "2026-07-29 14:00:00",
    response: { meetingId: 42 },
  },
  status = 200,
  responseSecret = "response-secret",
  authorization,
} = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const signature = hmac(responseSecret, text);

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({
      authorization:
        authorization === undefined
          ? `SaltedChecksum ${signature}`
          : authorization,
    }),
    text: vi.fn(async () => text),
  };
}

beforeEach(() => {
  configureWebMeeting();
  vi.useFakeTimers();
  vi.setSystemTime(fixedNow);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnvironment[key];
    }
  }
});

describe("WebMeeting date formatting and configuration", () => {
  it.each([
    ["2026-07-29T12:00:00.000Z", "2026-07-29 14:00:00"],
    ["2026-01-29T12:00:00.000Z", "2026-01-29 13:00:00"],
  ])("formats request timestamps in the Europe/Prague timezone", (value, expected) => {
    expect(formatWebMeetingTimestamp(value)).toBe(expected);
  });

  it.each([
    ["2026-07-29T12:00:00.000Z", "29.07.2026 14:00"],
    ["2026-01-29T12:00:00.000Z", "29.01.2026 13:00"],
  ])("formats meeting starts in the provider format", (value, expected) => {
    expect(formatWebMeetingStart(value)).toBe(expected);
  });

  it("rejects invalid request and meeting timestamps", () => {
    expect(() => formatWebMeetingTimestamp("invalid")).toThrow(
      "Neplatný čas požadavku WebMeetingu."
    );
    expect(() => formatWebMeetingStart("invalid")).toThrow(
      "Událost nemá platný čas začátku."
    );
  });

  it("normalizes configuration and accepts only positive timeouts", () => {
    configureWebMeeting({
      WEBMEETING_API_LOGIN: " api-login ",
      WEBMEETING_API_CLIENT: "",
      WEBMEETING_API_TIMEOUT_MS: "-10",
    });

    expect(getWebMeetingConfiguration()).toEqual({
      apiUrl: "https://provider.example/api",
      login: "api-login",
      client: "api-login",
      requestSecret: "request-secret",
      responseSecret: "response-secret",
      timeoutMs: 10_000,
      configured: true,
    });
  });

  it("reports incomplete credentials without making a provider request", async () => {
    delete process.env.WEBMEETING_API_RESPONSE_SECRET;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(callWebMeeting("getMeetings")).rejects.toMatchObject({
      name: "WebMeetingApiError",
      status: 503,
      action: "getMeetings",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("signed WebMeeting API calls", () => {
  it("signs the exact request body and verifies a fresh signed response", async () => {
    const response = providerResponse();
    const fetchMock = vi.fn(async () => response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      callWebMeeting("getMeetings", { meetingId: 42 })
    ).resolves.toEqual({ meetingId: 42 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(url).toBe("https://provider.example/api");
    expect(options).toMatchObject({
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: expect.any(AbortSignal),
    });
    expect(body).toEqual({
      action: "getMeetings",
      login: "api-login",
      meetingId: 42,
      timestamp: "2026-07-29 14:00:00",
      client: "archimedes-client",
    });
    expect(options.headers.Authorization).toBe(
      `SaltedChecksum ${hmac("request-secret", options.body)}`
    );
  });

  it.each([
    ["", "nemá platný bezpečnostní podpis"],
    [`SaltedChecksum ${"0".repeat(64)}`, "Bezpečnostní podpis odpovědi WebMeetingu nesouhlasí."],
    [
      `SaltedChecksum ${"a".repeat(64)}, SaltedChecksum ${"b".repeat(64)}`,
      "nemá platný bezpečnostní podpis",
    ],
  ])("rejects missing, incorrect, or ambiguous response signatures", async (authorization, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => providerResponse({ authorization }))
    );

    await expect(callWebMeeting("getMeetings")).rejects.toThrow(message);
  });

  it("rejects malformed JSON even when its signature is valid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => providerResponse({ body: "not-json" }))
    );

    await expect(callWebMeeting("getMeetings")).rejects.toMatchObject({
      message: "WebMeeting API vrátilo neplatnou odpověď.",
      status: 502,
    });
  });

  it.each([
    [400, 400],
    [401, 400],
    [500, 502],
    [503, 502],
  ])("maps signed provider HTTP %s responses to status %s", async (providerStatus, expectedStatus) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        providerResponse({
          status: providerStatus,
          body: {
            error: "Provider rejected request",
            code: "WM-42",
          },
        })
      )
    );

    await expect(callWebMeeting("createMeeting")).rejects.toMatchObject({
      message: "Provider rejected request",
      status: expectedStatus,
      providerCode: "WM-42",
      action: "createMeeting",
    });
  });

  it.each([
    ["invalid", "Odpověď WebMeetingu nemá platné časové razítko."],
    ["2026-07-29 13:54:59", "Časové razítko odpovědi WebMeetingu je neaktuální."],
    ["2026-07-29 14:05:01", "Časové razítko odpovědi WebMeetingu je neaktuální."],
  ])("rejects invalid or stale signed server timestamps", async (serverTimestamp, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        providerResponse({
          body: { server_timestamp: serverTimestamp, response: {} },
        })
      )
    );

    await expect(callWebMeeting("getMeetings")).rejects.toThrow(message);
  });

  it.each([
    [new Error("network down"), "WebMeeting API není dostupné."],
    [
      Object.assign(new Error("aborted"), { name: "AbortError" }),
      "WebMeeting API neodpovědělo v časovém limitu.",
    ],
  ])("maps network failures without leaking provider details", async (providerError, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw providerError;
      })
    );

    await expect(callWebMeeting("getMeetings")).rejects.toMatchObject({
      message,
      status: 502,
      action: "getMeetings",
    });
  });
});

describe("WebMeeting operation payloads", () => {
  it.each([
    [undefined],
    [null],
    [0],
    [-1],
    [1.5],
  ])("rejects an unconfirmed numeric meeting type", (type) => {
    expect(() =>
      webMeeting.createMeeting({
        name: "Test",
        startsAt: fixedNow,
        type,
      })
    ).toThrow(WebMeetingApiError);
  });

  it("maps meeting creation fields to the provider contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        providerResponse({
          body: {
            server_timestamp: "2026-07-29 14:00:00",
            response: 42,
          },
        })
      )
    );

    await expect(
      webMeeting.createMeeting({
        name: "Bezpečné vysílání",
        startsAt: fixedNow,
        speakerName: "Moderátor",
        description: "Popis",
        type: 7,
      })
    ).resolves.toBe(42);

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      action: "createMeeting",
      name: "Bezpečné vysílání",
      time_begin: "29.07.2026 14:00",
      speaker_name: "Moderátor",
      description: "Popis",
      type: 7,
    });
  });

  it("forces HTML5 entry links and wraps a single participant", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        providerResponse({
          body: {
            server_timestamp: "2026-07-29 14:00:00",
            response: "https://provider.example/join",
          },
        })
      )
    );
    const participant = {
      number: 123,
      firstname: "Jana",
      surname: "Nováková",
      email: "jana@example.com",
    };

    await webMeeting.importParticipantAndGetEnterURL(42, participant, 1);

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      action: "importParticipantAndGetEnterURL",
      meetingId: 42,
      participants: [participant],
      access_level: 1,
      html5client: true,
    });
  });
});
