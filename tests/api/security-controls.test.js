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
  "municipality/invite-context",
  "pridat-se-k-organizaci",
  "registrace-skoly",
  "registrace-spolku",
  "start-demo",
];

const platformAdminRoutes = [
  "admin/activate-municipality",
  "admin/onboarding-test-runs",
  "admin/create-municipality-organization",
  "admin/invite-municipality-admin",
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
  "poptavka-ucebny",
  "poptavka",
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

  it("keeps municipality admin invitations separate from licence and activation writes", () => {
    const source = readApi("admin/invite-municipality-admin");

    expect(source).toContain("resolveLocalAdministrator");
    expect(source).toContain("sendCustomerOnboardingEmail");
    expect(source).toContain("sendCustomerOnboardingAuditCopy");
    expect(source.indexOf("verifyCustomerOnboardingEmailTransport()"))
      .toBeLessThan(source.indexOf("claimAttempt({"));
    expect(source).toContain('from("municipality_admin_invitation_attempts")');
    expect(source).not.toContain("inviteUserByEmail");
    expect(source).toContain('role_in_org: "organization_admin"');
    expect(source).toContain('user_type: "organization"');
    expect(source).toContain(".upsert(");
    expect(source).toContain('{ onConflict: "id" }');
    expect(source).toContain("idempotencyKey");
    expect(source).not.toContain("license_started_at");
    expect(source).not.toContain("contract_status");
    expect(source).not.toContain("billing_status");
    expect(source).not.toContain("activated_at");
    expect(source).not.toContain("activate_customer_with_admin");
  });

  it("binds municipality invitation management to a verified bearer user and resource-scoped limit", () => {
    const source = readApi("municipality/organization-invites");

    expect(source.indexOf("getBearerToken(req)")).toBeLessThan(
      source.indexOf("consumeAuthenticatedRateLimit(")
    );
    expect(source).toContain("supabaseAdmin.auth.getUser(token)");
    expect(source).toContain('membership?.role_in_org !== "organization_admin"');
    expect(source).toContain("resourceId: municipalityId");
    expect(source).toContain('req.method === "POST"');
    expect(source).toContain("res.status(410)");
    expect(source).not.toContain("randomBytes");
    expect(source).not.toContain("sendMail");
    expect(source).not.toContain(".insert(");
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
    expect(source.indexOf("secretsMatch(bearerToken(req), cronSecret)")).toBeLessThan(
      source.indexOf("createClient(supabaseUrl, serviceRoleKey")
    );
  });

  it("protects profile completion reminders with the same server-only cron contract", () => {
    const source = readApi("cron/profile-completion-reminders");
    const helper = fs.readFileSync(
      path.join(repositoryRoot, "lib/server/profileCompletionReminders.js"),
      "utf8"
    );

    expect(source).toContain("req.headers?.authorization");
    expect(source).not.toMatch(/req\.(query|body).*CRON_SECRET/i);
    expect(source).toContain('createHash("sha256")');
    expect(source).toContain("crypto.timingSafeEqual");
    expect(source.indexOf("secretsMatch(bearerToken(req), cronSecret)")).toBeLessThan(
      source.indexOf("createClient(")
    );
    expect(source).toContain("PROFILE_COMPLETION_REMINDERS_ENABLED");
    expect(helper).toContain('.from("platform_admins")');
    expect(helper).toContain('.from("organization_members")');
    expect(helper).toContain('.or("is_test.eq.false,is_test.is.null")');
    expect(helper).toContain('.eq("status", "active")');
    expect(helper.indexOf("verifySmtpTransport(mailer)"))
      .toBeLessThan(helper.indexOf("for (const candidate of candidates)"));
  });

  it.each(retiredRoutes)("%s remains an unconditional gone endpoint", (route) => {
    const source = readApi(route);

    expect(source).toContain('res.setHeader("Cache-Control", "no-store")');
    expect(source).toContain("res.status(410)");
    expect(source).not.toContain("createClient(");
  });
});

describe("API egress, email, and secret-exposure controls", () => {
  it("keeps Instagram egress on the fixed Graph API host and filters returned permalinks", () => {
    const source = readApi("instagram");

    expect(source).toContain("https://graph.facebook.com/");
    expect(source).toContain('url.protocol !== "https:"');
    expect(source).toContain('hostname !== "instagram.com"');
    expect(source).toContain('!hostname.endsWith(".instagram.com")');
    expect(source).toContain("controller.abort()");
  });

  it.each(["poptavka-ucebny", "poptavka", "zadost-o-pristup"])(
    "%s validates SMTP server configuration rather than accepting it from input",
    (route) => {
      const source = readApi(route);

      expect(source).toContain("process.env.SMTP_HOST");
    expect(source).toContain("process.env.SMTP_USER");
    expect(source).toContain("process.env.SMTP_PASS");
    expect(source).toContain("process.env.MAIL_FROM");
      expect(source).not.toMatch(/host:\s*req\.(body|query)/);
    }
  );

  it("keeps onboarding SMTP configuration in a server-only helper", () => {
    const route = readApi("admin/activate-municipality");
    const helper = fs.readFileSync(
      path.join(repositoryRoot, "lib/server/customerOnboarding.js"),
      "utf8"
    );

    expect(route).toContain("sendCustomerOnboardingEmail");
    expect(route).toContain("sendCustomerOnboardingAuditCopy");
    expect(helper).toContain("process.env.SMTP_HOST");
    expect(helper).toContain("process.env.SMTP_USER");
    expect(helper).toContain("process.env.SMTP_PASS");
    expect(helper).toContain("process.env.MAIL_FROM");
    expect(helper).not.toMatch(/host:\s*req\.(body|query)/);
    expect(helper).toContain("sendSmtpMessage");
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
