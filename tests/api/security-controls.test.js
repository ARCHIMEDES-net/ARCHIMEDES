import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function readApi(route) {
  return fs.readFileSync(
    path.join(repositoryRoot, "pages/api", `${route}.js`),
    "utf8"
  );
}

function filesBelow(relativeDirectory) {
  const root = path.join(repositoryRoot, relativeDirectory);
  const result = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      result.push(...filesBelow(relativePath));
    } else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
      result.push(relativePath);
    }
  }

  return result;
}

const retiredRoutes = [
  "admin/approve-demo-request",
  "admin/create-organization-from-request",
  "create-organization",
  "demo-approve-from-email",
  "demo-request",
  "pridat-se-k-organizaci",
  "start-demo",
];

const platformAdminRoutes = [
  "admin/activate-municipality",
  "admin/broadcast-recipients",
  "admin/group-counts",
  "admin/group-users",
  "admin/webmeeting/attendance",
  "admin/webmeeting/create-meeting",
  "admin/webmeeting/moderator-url",
  "admin/webmeeting/status",
  "admin/webmeeting/sync-results",
  "admin/webmeeting/update-meeting",
  "portal-posts-create",
  "portal-posts-delete",
  "portal-posts-update",
];

const publicRateLimitedRoutes = [
  "invite-user",
  "join-organization",
  "make-lead",
  "municipality/invite-context",
  "poptavka-ucebny",
  "poptavka",
  "registrace-skoly",
  "registrace-spolku",
  "zadost-o-pristup",
];

describe("cross-cutting API authentication and rate-limit controls", () => {
  it.each(platformAdminRoutes)(
    "%s requires a platform admin before consuming an authenticated limit",
    (route) => {
      const source = readApi(route);
      const authorization = source.indexOf("requirePlatformAdmin(");
      const limiter = source.indexOf("consumeAuthenticatedRateLimit(");

      expect(authorization).toBeGreaterThan(-1);
      expect(limiter).toBeGreaterThan(authorization);
      expect(source).toContain('res.setHeader("Cache-Control", "no-store")');
    }
  );

  it.each(publicRateLimitedRoutes)(
    "%s consumes the shared database-backed public limit",
    (route) => {
      const source = readApi(route);

      expect(source).toContain("consumePublicRateLimit(");
      expect(source).toContain('res.setHeader("Cache-Control", "no-store")');
      expect(source).toContain("Retry-After");
    }
  );

  it("binds municipality invitation management to a verified bearer user and resource-scoped limit", () => {
    const source = readApi("municipality/organization-invites");

    expect(source.indexOf("getBearerToken(req)")).toBeLessThan(
      source.indexOf("consumeAuthenticatedRateLimit(")
    );
    expect(source).toContain("supabaseAdmin.auth.getUser(token)");
    expect(source).toContain('membership?.role_in_org !== "organization_admin"');
    expect(source).toContain("resourceId: municipalityId");
  });

  it("authorizes broadcast viewers before issuing provider entry links", () => {
    const source = readApi("broadcasts/[eventId]/join");

    expect(source.indexOf("requireBroadcastViewer(")).toBeLessThan(
      source.indexOf("consumeAuthenticatedRateLimit(")
    );
    expect(source.indexOf("consumeAuthenticatedRateLimit(")).toBeLessThan(
      source.indexOf("webMeeting.importParticipantAndGetEnterURL(")
    );
    expect(source).toContain("resourceId: eventId");
    expect(source).toContain('"broadcast_participants"');
  });

  it("accepts the cron secret only from a Bearer header and compares fixed-size digests", () => {
    const source = readApi("cron/send-reminders");

    expect(source).toContain("req.headers?.authorization");
    expect(source).not.toMatch(/req\.(query|body).*CRON_SECRET/i);
    expect(source).toContain('createHash("sha256")');
    expect(source).toContain("crypto.timingSafeEqual");
    expect(source.indexOf("secretsMatch(token, CRON_SECRET)")).toBeLessThan(
      source.indexOf('createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    );
  });

  it.each(retiredRoutes)("%s remains an unconditional gone endpoint", (route) => {
    const source = readApi(route);

    expect(source).toContain('res.setHeader("Cache-Control", "no-store")');
    expect(source).toContain("res.status(410)");
    expect(source).not.toContain("createClient(");
  });
});

describe("API egress, email, and secret-exposure controls", () => {
  it("allows the Make webhook only from server configuration and requires HTTPS", () => {
    const source = readApi("make-lead");

    expect(source).toContain("process.env.MAKE_LEAD_WEBHOOK_URL");
    expect(source).toContain('parsedWebhookUrl.protocol !== "https:"');
    expect(source).not.toMatch(/new URL\(.*req\.(body|query)/);
    expect(source).toContain("Buffer.byteLength(serializedPayload");
    expect(source).toContain("controller.abort()");
  });

  it("keeps Instagram egress on the fixed Graph API host and filters returned permalinks", () => {
    const source = readApi("instagram");

    expect(source).toContain("https://graph.facebook.com/");
    expect(source).toContain('url.protocol !== "https:"');
    expect(source).toContain('hostname !== "instagram.com"');
    expect(source).toContain('!hostname.endsWith(".instagram.com")');
    expect(source).toContain("controller.abort()");
  });

  it.each([
    "admin/activate-municipality",
    "municipality/organization-invites",
    "poptavka-ucebny",
    "poptavka",
    "registrace-skoly",
    "registrace-spolku",
    "zadost-o-pristup",
  ])("%s validates SMTP server configuration rather than accepting it from input", (route) => {
    const source = readApi(route);

    expect(source).toContain("process.env.SMTP_HOST");
    expect(source).toContain("process.env.SMTP_USER");
    expect(source).toContain("process.env.SMTP_PASS");
    expect(source).toContain("process.env.MAIL_FROM");
    expect(source).not.toMatch(/host:\s*req\.(body|query)/);
  });

  it("never references the Supabase service-role key from browser-delivered modules", () => {
    const browserFiles = [
      ...filesBelow("components"),
      ...filesBelow("lib"),
      ...filesBelow("pages").filter((file) => !file.startsWith("pages/api/")),
    ];
    const offenders = browserFiles.filter((file) =>
      fs
        .readFileSync(path.join(repositoryRoot, file), "utf8")
        .includes("SUPABASE_SERVICE_ROLE_KEY")
    );

    expect(offenders).toEqual([]);
  });

  it("disables session persistence for every API service-role client", () => {
    const apiFiles = filesBelow("pages/api");
    const serviceRoleFiles = apiFiles.filter((file) =>
      fs
        .readFileSync(path.join(repositoryRoot, file), "utf8")
        .includes("SUPABASE_SERVICE_ROLE_KEY")
    );

    expect(serviceRoleFiles.length).toBeGreaterThan(0);
    for (const file of serviceRoleFiles) {
      const source = fs.readFileSync(path.join(repositoryRoot, file), "utf8");
      expect(source, file).toMatch(/persistSession:\s*false/);
    }
  });

  it("does not return raw caught error messages from API handlers", () => {
    const apiFiles = filesBelow("pages/api");
    const offenders = apiFiles.filter((file) => {
      const source = fs.readFileSync(path.join(repositoryRoot, file), "utf8");
      return /error\s*:\s*(?:err|error|e)\??\.message/.test(source);
    });

    expect(offenders).toEqual([]);
  });
});
