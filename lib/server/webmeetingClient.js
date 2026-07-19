import crypto from "crypto";

const DEFAULT_API_URL = "https://admin.webmeeting.cz/api";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_SERVER_CLOCK_SKEW_MS = 5 * 60 * 1000;

function env(name) {
  return String(process.env[name] || "").trim();
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function partsInPrague(date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}

export function formatWebMeetingTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Neplatný čas požadavku WebMeetingu.");
  const p = partsInPrague(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

export function formatWebMeetingStart(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Událost nemá platný čas začátku.");
  const p = partsInPrague(date);
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`;
}

export function getWebMeetingConfiguration() {
  const login = env("WEBMEETING_API_LOGIN");
  const requestSecret = env("WEBMEETING_API_REQUEST_SECRET");
  const responseSecret = env("WEBMEETING_API_RESPONSE_SECRET");

  return {
    apiUrl: env("WEBMEETING_API_URL") || DEFAULT_API_URL,
    login,
    client: env("WEBMEETING_API_CLIENT") || login,
    requestSecret,
    responseSecret,
    timeoutMs: positiveInteger(env("WEBMEETING_API_TIMEOUT_MS"), DEFAULT_TIMEOUT_MS),
    configured: Boolean(login && requestSecret && responseSecret),
  };
}

function signature(secret, body) {
  return crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

function pragueWallClockMilliseconds(value = new Date()) {
  const p = partsInPrague(value);
  return Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second)
  );
}

function assertFreshServerTimestamp(value, now = new Date()) {
  const match = String(value || "").match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
  );
  if (!match) {
    throw new WebMeetingApiError("Odpověď WebMeetingu nemá platné časové razítko.", {
      status: 502,
    });
  }

  const serverWallClock = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6])
  );
  const skew = Math.abs(serverWallClock - pragueWallClockMilliseconds(now));
  if (!Number.isFinite(serverWallClock) || skew > MAX_SERVER_CLOCK_SKEW_MS) {
    throw new WebMeetingApiError("Časové razítko odpovědi WebMeetingu je neaktuální.", {
      status: 502,
    });
  }
}

function responseSignature(headers) {
  const authorization = String(headers.get("authorization") || "").trim();
  const matches = Array.from(
    authorization.matchAll(/(?:^|,\s*)SaltedChecksum(?::\s*|\s+)([a-f0-9]{64})(?=\s*,|$)/gi)
  );
  const signatures = [...new Set(matches.map((match) => match[1].toLowerCase()))];
  return signatures.length === 1 ? signatures[0] : "";
}

export class WebMeetingApiError extends Error {
  constructor(message, { status = 500, providerCode = null, action = "" } = {}) {
    super(message);
    this.name = "WebMeetingApiError";
    this.status = status;
    this.providerCode = providerCode;
    this.action = action;
  }
}

export async function callWebMeeting(action, parameters = {}) {
  const config = getWebMeetingConfiguration();
  if (!config.configured) {
    throw new WebMeetingApiError("WebMeeting API zatím není nakonfigurováno na serveru.", {
      status: 503,
      action,
    });
  }

  const payload = {
    action,
    login: config.login,
    ...parameters,
    timestamp: formatWebMeetingTimestamp(),
    client: config.client,
  };
  const body = JSON.stringify(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  let response;
  let responseBody = "";

  try {
    response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `SaltedChecksum ${signature(config.requestSecret, body)}`,
      },
      body,
      signal: controller.signal,
    });
    responseBody = await response.text();
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    throw new WebMeetingApiError(
      timedOut ? "WebMeeting API neodpovědělo v časovém limitu." : "WebMeeting API není dostupné.",
      { status: 502, action }
    );
  } finally {
    clearTimeout(timeout);
  }

  const receivedSignature = responseSignature(response.headers);
  const expectedSignature = signature(config.responseSecret, responseBody);

  if (!receivedSignature || receivedSignature.length !== expectedSignature.length) {
    const authorizationLength = String(response.headers.get("authorization") || "").trim().length;
    throw new WebMeetingApiError(
      `Odpověď WebMeetingu nemá platný bezpečnostní podpis (hlavička authorization: ${
        authorizationLength ? `přítomná, ${authorizationLength} znaků` : "chybí"
      }).`,
      {
        status: 502,
        action,
      }
    );
  }

  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(receivedSignature, "utf8"),
    Buffer.from(expectedSignature, "utf8")
  );
  if (!signaturesMatch) {
    throw new WebMeetingApiError("Bezpečnostní podpis odpovědi WebMeetingu nesouhlasí.", {
      status: 502,
      action,
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(responseBody);
  } catch (_error) {
    throw new WebMeetingApiError("WebMeeting API vrátilo neplatnou odpověď.", {
      status: 502,
      action,
    });
  }

  if (!response.ok) {
    throw new WebMeetingApiError(parsed?.error || `WebMeeting API vrátilo chybu ${response.status}.`, {
      status: response.status >= 500 ? 502 : 400,
      providerCode: parsed?.code ?? null,
      action,
    });
  }

  assertFreshServerTimestamp(parsed?.server_timestamp);

  return parsed?.response;
}

export const webMeeting = {
  getMeetings(meetingId = null) {
    return callWebMeeting("getMeetings", { meetingId });
  },
  createMeeting({ name, startsAt, speakerName = "", description = "", type }) {
    if (!Number.isInteger(type) || type <= 0) {
      throw new WebMeetingApiError("Chybí potvrzený číselný typ místnosti WebMeetingu.", {
        status: 503,
        action: "createMeeting",
      });
    }
    return callWebMeeting("createMeeting", {
      name,
      time_begin: formatWebMeetingStart(startsAt),
      speaker_name: speakerName,
      description,
      type,
    });
  },
  updateMeeting({ meetingId, name, startsAt, speakerName = "", description = "", type }) {
    if (!Number.isInteger(type) || type <= 0) {
      throw new WebMeetingApiError("Chybí potvrzený číselný typ místnosti WebMeetingu.", {
        status: 503,
        action: "updateMeeting",
      });
    }
    return callWebMeeting("updateMeeting", {
      meetingId,
      name,
      time_begin: formatWebMeetingStart(startsAt),
      speaker_name: speakerName,
      description,
      type,
    });
  },
  configureMeeting(meetingId, options) {
    return callWebMeeting("configureMeeting", { meetingId, options });
  },
  deleteMeeting(meetingId) {
    return callWebMeeting("deleteMeeting", { meetingId });
  },
  getModeratorEnterURL(meetingId, moderatorName) {
    return callWebMeeting("getModeratorEnterURL", {
      meetingId,
      moderatorName,
      html5client: true,
    });
  },
  importParticipantAndGetEnterURL(meetingId, participant, accessLevel = 1) {
    return callWebMeeting("importParticipantAndGetEnterURL", {
      meetingId,
      participants: [participant],
      access_level: accessLevel,
      html5client: true,
    });
  },
  importParticipants(meetingId, participants, accessLevel = 1) {
    return callWebMeeting("importParticipants", {
      meetingId,
      participants,
      access_level: accessLevel,
    });
  },
  getParticipantEnterURL(meetingId, participantId) {
    return callWebMeeting("getParticipantEnterURL", {
      meetingId,
      participantId,
      html5client: true,
    });
  },
  getRecordings(meetingId) {
    return callWebMeeting("getRecordings", { meetingId });
  },
  getPresence(meetingId, participantId = null) {
    return callWebMeeting("getPresence", { meetingId, participantId });
  },
};
