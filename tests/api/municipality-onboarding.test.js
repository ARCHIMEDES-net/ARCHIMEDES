import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const LOCAL_ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CENTRAL_ADMIN_ID = "22222222-2222-4222-8222-222222222222";
const SECOND_CENTRAL_ADMIN_ID = "99999999-9999-4999-8999-999999999999";
const ORGANIZATION_ID = "33333333-3333-4333-8333-333333333333";
const IDEMPOTENCY_KEY = "44444444-4444-4444-8444-444444444444";
const RUN_ID = "55555555-5555-4555-8555-555555555555";
const ATTEMPT_ID = "77777777-7777-4777-8777-777777777777";
const PREPARATION_ID = "88888888-8888-4888-8888-888888888888";

const dependencies = vi.hoisted(() => {
  const state = {
    organization: null,
    localProfiles: [],
    rpcResult: null,
    rpcCalls: [],
    authPreparation: null,
    authPreparationUpdates: [],
    emailAttempts: [],
    previousOnboarding: null,
    claimAllowed: true,
    auditUpdateError: false,
    staleTransitioned: false,
  };
  const sendMail = vi.fn(async (message) => ({
    messageId: "message-1",
    accepted: [message.to],
    rejected: [],
  }));
  const verifyMail = vi.fn(async () => true);
  const authAdmin = {
    getUserById: vi.fn(async (userId) => ({
      data: {
        user: {
          id: userId,
          email:
            userId === "22222222-2222-4222-8222-222222222222"
              ? "central@example.test"
              : "local@example.test",
          user_metadata:
            userId === "11111111-1111-4111-8111-111111111111"
              ? {
                  archimedes_onboarding_managed: true,
                  archimedes_onboarding_idempotency_key:
                    "44444444-4444-4444-8444-444444444444",
                  archimedes_onboarding_organization_id:
                    "33333333-3333-4333-8333-333333333333",
                }
              : {},
        },
      },
      error: null,
    })),
    listUsers: vi.fn(async () => ({ data: { users: [] }, error: null })),
    generateLink: vi.fn(async () => ({
      data: {
        user: { id: "11111111-1111-4111-8111-111111111111" },
        properties: { action_link: "https://example.test/setup" },
      },
      error: null,
    })),
    deleteUser: vi.fn(async () => ({ data: null, error: null })),
  };

  function builder(table) {
    const query = {
      table,
      filters: {},
      inFilters: {},
      mutation: null,
      insertion: null,
    };
    const resolve = () => {
      if (table === "organizations") {
        return {
          data: state.organization || {
            id: "33333333-3333-4333-8333-333333333333",
            name: "Obec Testov",
            org_type: "municipality",
            parent_organization_id: null,
            contact_name: "Kontaktní Osoba",
            contact_email: "kontakt@example.test",
            registration_number: "1001",
          },
          error: null,
        };
      }
      if (table === "platform_admins") {
        return {
          data: [
            {
              user_id: "22222222-2222-4222-8222-222222222222",
              role: "super_admin",
            },
          ],
          error: null,
        };
      }
      if (table === "profiles" && query.inFilters.id) {
        return {
          data: [
            {
              id: "22222222-2222-4222-8222-222222222222",
              email: "central@example.test",
              full_name: "Centrální správce",
              is_active: true,
            },
          ],
          error: null,
        };
      }
      if (table === "profiles") {
        return { data: state.localProfiles, error: null };
      }
      if (table === "organization_onboarding_runs") {
        return {
          data: state.previousOnboarding,
          error: null,
        };
      }
      if (table === "organization_onboarding_email_attempts") {
        return { data: state.emailAttempts, error: null };
      }
      if (table === "organization_onboarding_auth_preparations") {
        if (query.insertion) {
          if (state.authPreparation) {
            return { data: null, error: { code: "23505" } };
          }
          state.authPreparation = {
            id: PREPARATION_ID,
            preparation_attempt: 1,
            created_at: new Date().toISOString(),
            ...query.insertion,
          };
          return { data: state.authPreparation, error: null };
        }
        if (query.mutation) {
          state.authPreparationUpdates.push(query.mutation);
          state.authPreparation = {
            ...(state.authPreparation || { id: PREPARATION_ID }),
            ...query.mutation,
          };
          return { data: state.authPreparation, error: null };
        }
        return { data: state.authPreparation, error: null };
      }
      throw new Error(`Unexpected table ${table}`);
    };
    const api = {
      select: vi.fn(() => api),
      update: vi.fn((value) => {
        query.mutation = value;
        return api;
      }),
      insert: vi.fn((value) => {
        query.insertion = value;
        return api;
      }),
      eq: vi.fn((field, value) => {
        query.filters[field] = value;
        return api;
      }),
      ilike: vi.fn((field, value) => {
        query.filters[field] = value;
        return api;
      }),
      in: vi.fn((field, value) => {
        query.inFilters[field] = value;
        return api;
      }),
      limit: vi.fn(async () => resolve()),
      order: vi.fn(() => api),
      maybeSingle: vi.fn(async () => resolve()),
      then(resolvePromise, rejectPromise) {
        return Promise.resolve(resolve()).then(resolvePromise, rejectPromise);
      },
    };
    return api;
  }

  const supabaseAdmin = {
    auth: { admin: authAdmin },
    from: vi.fn(builder),
  };
  const authenticatedClient = {
    rpc: vi.fn(async (name, args) => {
      state.rpcCalls.push({ name, args });
      if (name === "onboard_customer_v3") return state.rpcResult;
      if (name === "claim_onboarding_email_attempt") {
        return {
          data: [
            {
              attempt_id: ATTEMPT_ID,
              attempt_number: 1,
              claimed: state.claimAllowed,
              email_status: "sending",
            },
          ],
          error: null,
        };
      }
      if (name === "complete_onboarding_email_attempt") {
        return state.auditUpdateError
          ? { data: null, error: { message: "audit update unavailable" } }
          : {
              data: [
                {
                  onboarding_run_id: RUN_ID,
                  attempt_number: 1,
                  email_status: args.p_outcome,
                  completed: true,
                },
              ],
              error: null,
            };
      }
      if (name === "mark_stale_onboarding_email_attempt") {
        if (state.staleTransitioned && state.previousOnboarding) {
          state.previousOnboarding.email_status = "delivery_unknown";
          state.previousOnboarding.email_error_code =
            "sending_timeout_manual_review";
        }
        return { data: [], error: null };
      }
      if (name === "resolve_onboarding_email_without_resend") {
        if (state.previousOnboarding) {
          state.previousOnboarding.email_resolution_action =
            "resolved_without_resend";
          state.previousOnboarding.email_resolution_reason = args.p_reason;
        }
        return { data: [{ resolved: true }], error: null };
      }
      throw new Error(`Unexpected RPC ${name}`);
    }),
  };

  return {
    state,
    sendMail,
    verifyMail,
    authAdmin,
    supabaseAdmin,
    authenticatedClient,
    createClient: vi.fn((_url, key) =>
      key === "test-anon-key" ? authenticatedClient : supabaseAdmin
    ),
    requirePlatformAdmin: vi.fn(),
    consumeAuthenticatedRateLimit: vi.fn(),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: dependencies.createClient,
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: dependencies.sendMail,
      verify: dependencies.verifyMail,
    })),
  },
}));

vi.mock("../../lib/server/platformAdminApi", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    requirePlatformAdmin: dependencies.requirePlatformAdmin,
  };
});

vi.mock("../../lib/server/authenticatedRateLimit", () => ({
  consumeAuthenticatedRateLimit: dependencies.consumeAuthenticatedRateLimit,
}));

import handler from "../../pages/api/admin/activate-municipality";
import { parseCentralAdminUserIds } from "../../lib/server/customerOnboarding";

const validBody = {
  organizationId: ORGANIZATION_ID,
  idempotencyKey: IDEMPOTENCY_KEY,
  licensePlan: "paid_annual",
  licenseStartedAt: "2026-08-13",
  licenseValidUntil: "2027-08-12",
  contractStatus: "accepted",
  billingStatus: "paid",
  classroomEligibilityVerified: false,
  localAdminFullName: "Lokální Správce",
  localAdminEmail: "local@example.test",
};

const originalEnvironment = {
  centralAdmins: process.env.MUNICIPALITY_CENTRAL_ADMIN_USER_IDS,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  mailFrom: process.env.MAIL_FROM,
  nodeEnvironment: process.env.NODE_ENV,
  vercelEnvironment: process.env.VERCEL_ENV,
  vercelTargetEnvironment: process.env.VERCEL_TARGET_ENV,
  vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
  vercelUrl: process.env.VERCEL_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

beforeEach(() => {
  dependencies.sendMail.mockReset();
  dependencies.sendMail.mockImplementation(async (message) => ({
    messageId: "message-1",
    accepted: [message.to],
    rejected: [],
  }));
  dependencies.verifyMail.mockReset();
  dependencies.verifyMail.mockResolvedValue(true);
  dependencies.authAdmin.deleteUser.mockClear();
  dependencies.authAdmin.generateLink.mockClear();
  dependencies.authAdmin.listUsers.mockReset();
  dependencies.authAdmin.listUsers.mockResolvedValue({
    data: { users: [] },
    error: null,
  });
  dependencies.authenticatedClient.rpc.mockClear();
  dependencies.state.localProfiles = [];
  dependencies.state.organization = null;
  dependencies.state.rpcCalls = [];
  dependencies.state.authPreparation = null;
  dependencies.state.authPreparationUpdates = [];
  dependencies.state.emailAttempts = [];
  dependencies.state.previousOnboarding = null;
  dependencies.state.claimAllowed = true;
  dependencies.state.auditUpdateError = false;
  dependencies.state.staleTransitioned = false;
  dependencies.state.rpcResult = {
    data: [
      {
        onboarding_run_id: RUN_ID,
        organization_id: ORGANIZATION_ID,
        registration_number: "1001",
        replayed: false,
        email_status: "pending",
      },
    ],
    error: null,
  };
  dependencies.requirePlatformAdmin.mockResolvedValue({ id: "platform-admin-1" });
  dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(true);
  process.env.MUNICIPALITY_CENTRAL_ADMIN_USER_IDS = CENTRAL_ADMIN_ID;
  process.env.SMTP_HOST = "smtp.example.test";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_USER = "smtp-user";
  process.env.SMTP_PASS = "smtp-password";
  process.env.MAIL_FROM = "ARCHIMEDES Live <noreply@example.test>";
  process.env.VERCEL_ENV = "development";
  delete process.env.VERCEL_TARGET_ENV;
  delete process.env.VERCEL_BRANCH_URL;
  delete process.env.VERCEL_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
});

afterEach(() => {
  for (const [key, value] of Object.entries({
    MUNICIPALITY_CENTRAL_ADMIN_USER_IDS: originalEnvironment.centralAdmins,
    SMTP_HOST: originalEnvironment.smtpHost,
    SMTP_PORT: originalEnvironment.smtpPort,
    SMTP_USER: originalEnvironment.smtpUser,
    SMTP_PASS: originalEnvironment.smtpPass,
    MAIL_FROM: originalEnvironment.mailFrom,
    NODE_ENV: originalEnvironment.nodeEnvironment,
    VERCEL_ENV: originalEnvironment.vercelEnvironment,
    VERCEL_TARGET_ENV: originalEnvironment.vercelTargetEnvironment,
    VERCEL_BRANCH_URL: originalEnvironment.vercelBranchUrl,
    VERCEL_URL: originalEnvironment.vercelUrl,
    NEXT_PUBLIC_SITE_URL: originalEnvironment.siteUrl,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("audited municipality onboarding API", () => {
  it("canonicalizes configured central administrators independently of order", () => {
    expect(
      parseCentralAdminUserIds(
        `${SECOND_CENTRAL_ADMIN_ID}, ${CENTRAL_ADMIN_ID}, ${SECOND_CENTRAL_ADMIN_ID}`
      )
    ).toEqual(
      parseCentralAdminUserIds(
        `${CENTRAL_ADMIN_ID},${SECOND_CENTRAL_ADMIN_ID}`
      )
    );
  });

  it("completes one transaction and sends one combined setup/onboarding email", async () => {
    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      localAdminAccountCreated: true,
      centralAdminCount: 1,
      onboardingEmailSent: true,
      emailRetryRequired: false,
    });
    expect(dependencies.authenticatedClient.rpc).toHaveBeenCalledWith(
      "onboard_customer_v3",
      expect.objectContaining({
        p_idempotency_key: IDEMPOTENCY_KEY,
        p_local_admin_email: "local@example.test",
        p_central_admin_user_ids: [CENTRAL_ADMIN_ID],
      })
    );
    expect(dependencies.sendMail).toHaveBeenCalledTimes(2);
    expect(dependencies.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "local@example.test",
        subject: "ARCHIMEDES Live – přístup správce pro Obec Testov",
        text: expect.stringContaining("https://example.test/setup"),
        html: expect.stringContaining(
          'href="https://example.test/setup"'
        ),
      })
    );
    expect(dependencies.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "zuzana.novotna@archimedeslive.com",
        subject: expect.stringContaining("kopie registrace správce"),
        text: expect.not.stringContaining("https://example.test/setup"),
      })
    );
    expect(dependencies.state.rpcCalls).toContainEqual(
      expect.objectContaining({
        name: "complete_onboarding_email_attempt",
        args: expect.objectContaining({ p_outcome: "sent" }),
      })
    );
  });

  it("escapes every dynamic HTML value while preserving the text alternative", async () => {
    const dangerousName = `Anna <script>alert("x")</script> & 'Správce'`;
    const dangerousOrganization = `Obec <img src=x onerror='x'> & "Test"`;
    dependencies.state.organization = {
      id: ORGANIZATION_ID,
      name: dangerousOrganization,
      org_type: "municipality",
      parent_organization_id: null,
      contact_name: "Kontaktní Osoba",
      contact_email: "kontakt@example.test",
      registration_number: `10<01>&"'`,
    };
    dependencies.state.rpcResult = {
      data: [
        {
          onboarding_run_id: RUN_ID,
          organization_id: ORGANIZATION_ID,
          registration_number: `10<01>&"'`,
          replayed: false,
          email_status: "pending",
        },
      ],
      error: null,
    };

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: { ...validBody, localAdminFullName: dangerousName },
    });

    expect(res.statusCode).toBe(200);
    const message = dependencies.sendMail.mock.calls[0][0];
    expect(message.text).toContain(dangerousName);
    expect(message.text).toContain(dangerousOrganization);
    expect(message.html).toContain(
      `Anna &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;Správce&#39;`
    );
    expect(message.html).toContain(
      `Obec &lt;img src=x onerror=&#39;x&#39;&gt; &amp; &quot;Test&quot;`
    );
    expect(message.html).toContain(`10&lt;01&gt;&amp;&quot;&#39;`);
    expect(message.html).not.toContain("<script>");
    expect(message.html).not.toContain("<img");
    expect(message.html).not.toMatch(/<(?:img|script|link|iframe)\b/i);
  });

  it("rejects an unsafe application origin before generating an Auth link", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(500);
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.authenticatedClient.rpc).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("preserves and reuses a consistent existing user", async () => {
    dependencies.state.localProfiles = [
      {
        id: LOCAL_ADMIN_ID,
        email: "local@example.test",
        full_name: "Původní jméno",
        must_set_password: false,
      },
    ];

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.localAdminAccountCreated).toBe(false);
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.authenticatedClient.rpc).toHaveBeenCalledWith(
      "onboard_customer_v3",
      expect.objectContaining({ p_local_admin_user_id: LOCAL_ADMIN_ID })
    );
  });

  it("stops on duplicate profiles before membership or email side effects", async () => {
    dependencies.state.localProfiles = [
      { id: LOCAL_ADMIN_ID, email: "local@example.test" },
      {
        id: "66666666-6666-4666-8666-666666666666",
        email: "local@example.test",
      },
    ];

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(409);
    expect(dependencies.authenticatedClient.rpc).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("stops before Auth and database onboarding when SMTP preflight fails", async () => {
    const smtpError = new Error("SMTP credentials rejected");
    smtpError.code = "EAUTH";
    smtpError.responseCode = 535;
    dependencies.verifyMail.mockRejectedValueOnce(smtpError);

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(503);
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.authenticatedClient.rpc).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("keeps the committed transaction and marks SMTP uncertainty for manual review", async () => {
    dependencies.sendMail.mockRejectedValueOnce(new Error("SMTP unavailable"));

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      onboardingEmailSent: false,
      emailRetryRequired: false,
      emailManualReviewRequired: true,
    });
    expect(dependencies.authAdmin.deleteUser).not.toHaveBeenCalled();
    expect(dependencies.state.rpcCalls).toContainEqual(
      expect.objectContaining({
        name: "complete_onboarding_email_attempt",
        args: expect.objectContaining({
          p_outcome: "delivery_unknown",
          p_error_code: "smtp_delivery_unknown",
        }),
      })
    );
  });

  it("keeps confirmed client delivery sent when only Zuzana's safe copy fails", async () => {
    dependencies.sendMail
      .mockImplementationOnce(async (message) => ({
        messageId: "client-message",
        accepted: [message.to],
        rejected: [],
      }))
      .mockRejectedValueOnce(Object.assign(new Error("copy unavailable"), {
        code: "ETIMEDOUT",
      }));

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      onboardingEmailSent: true,
      auditCopySent: false,
      emailManualReviewRequired: true,
      emailRetryRequired: false,
    });
    expect(dependencies.state.rpcCalls).toContainEqual(
      expect.objectContaining({
        name: "complete_onboarding_email_attempt",
        args: expect.objectContaining({
          p_outcome: "sent",
          p_error_code: "audit_copy_smtp_failed",
        }),
      })
    );
  });

  it("rolls back only the new Auth user and can safely retry the same request", async () => {
    dependencies.state.rpcResult = {
      data: null,
      error: { code: "23505", message: "Duplicate legal identifier exists" },
    };

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(409);
    expect(dependencies.authAdmin.deleteUser).toHaveBeenCalledWith(LOCAL_ADMIN_ID);
    expect(dependencies.sendMail).not.toHaveBeenCalled();

    dependencies.state.rpcResult = {
      data: [
        {
          onboarding_run_id: RUN_ID,
          organization_id: ORGANIZATION_ID,
          registration_number: "1001",
          replayed: false,
          email_status: "pending",
        },
      ],
      error: null,
    };
    const { res: retryResponse } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(retryResponse.statusCode).toBe(200);
    expect(dependencies.authAdmin.generateLink).toHaveBeenCalledTimes(2);
    expect(dependencies.authAdmin.deleteUser).toHaveBeenCalledTimes(1);
    expect(dependencies.sendMail).toHaveBeenCalledTimes(2);
    expect(dependencies.state.authPreparationUpdates).toContainEqual(
      expect.objectContaining({
        status: "preparing",
        recovery_reason: "retry_after_safe_auth_rollback",
      })
    );
  });

  it("does not resend an already audited email on an idempotent replay", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      email_status: "sent",
    };
    dependencies.state.localProfiles = [
      {
        id: LOCAL_ADMIN_ID,
        email: "local@example.test",
        full_name: "Lokální Správce",
        must_set_password: false,
      },
    ];
    dependencies.state.rpcResult = {
      data: [
        {
          onboarding_run_id: RUN_ID,
          organization_id: ORGANIZATION_ID,
          registration_number: "1001",
          replayed: true,
          email_status: "sent",
        },
      ],
      error: null,
    };

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ onboardingEmailSent: true });
    expect(res.body).not.toHaveProperty("replayed");
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("does not send when another concurrent request already claimed delivery", async () => {
    dependencies.state.claimAllowed = false;

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      onboardingEmailSent: false,
      emailDeliveryInProgress: true,
      emailRetryRequired: false,
    });
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("stops before Auth and database onboarding when SMTP configuration is missing", async () => {
    delete process.env.SMTP_HOST;

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(500);
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.authenticatedClient.rpc).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("does not automatically retry a delivery with an unknown outcome", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      email_status: "delivery_unknown",
    };
    dependencies.state.localProfiles = [
      {
        id: LOCAL_ADMIN_ID,
        email: "local@example.test",
        full_name: "Lokální Správce",
        must_set_password: true,
      },
    ];
    dependencies.state.rpcResult = {
      data: [
        {
          onboarding_run_id: RUN_ID,
          organization_id: ORGANIZATION_ID,
          registration_number: "1001",
          replayed: true,
          email_status: "delivery_unknown",
        },
      ],
      error: null,
    };

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      onboardingEmailSent: false,
      emailRetryRequired: false,
      emailManualReviewRequired: true,
    });
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("requires manual review when the email was sent but its audit update fails", async () => {
    dependencies.state.auditUpdateError = true;

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      onboardingEmailSent: true,
      emailRetryRequired: false,
      emailManualReviewRequired: true,
    });
    expect(dependencies.sendMail).toHaveBeenCalledTimes(2);
  });

  it("loads a failed email state after a page reload without sending", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      organization_id: ORGANIZATION_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      license_plan: "paid_annual",
      license_valid_until: "2027-08-12T23:59:59.999Z",
      email_status: "failed",
      email_attempt_count: 1,
      email_error_code: "smtp_configuration_missing",
      email_resolved_by: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    };
    dependencies.state.emailAttempts = [
      {
        id: ATTEMPT_ID,
        attempt_number: 1,
        previous_attempt_id: null,
        status: "failed",
        initiation_reason: "První pokus",
        initiated_by: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        claimed_at: "2026-08-13T10:00:00.000Z",
        completed_at: "2026-08-13T10:00:01.000Z",
        completed_by: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        error_code: "smtp_configuration_missing",
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        attempt_number: 2,
        previous_attempt_id: ATTEMPT_ID,
        status: "failed",
        initiation_reason: "Navazující pokus",
        initiated_by: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        claimed_at: "2026-08-13T11:00:00.000Z",
        error_code: "internal-only-code",
      },
    ];

    const { res } = await invoke(handler, {
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: { organizationId: ORGANIZATION_ID },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.emailState).toMatchObject({
      email_status: "failed",
      email_attempt_count: 1,
      attempts: [
        expect.objectContaining({
          attempt_number: 1,
          previous_attempt_number: null,
        }),
        expect.objectContaining({
          attempt_number: 2,
          previous_attempt_number: 1,
        }),
      ],
    });
    expect(res.body.emailState).not.toHaveProperty("id");
    expect(res.body.emailState).not.toHaveProperty("organization_id");
    expect(res.body.emailState).not.toHaveProperty("local_admin_user_id");
    expect(res.body.emailState).not.toHaveProperty("license_plan");
    expect(res.body.emailState).not.toHaveProperty("email_error_code");
    expect(res.body.emailState).not.toHaveProperty("email_resolved_by");
    for (const attempt of res.body.emailState.attempts) {
      expect(attempt).not.toHaveProperty("id");
      expect(attempt).not.toHaveProperty("previous_attempt_id");
      expect(attempt).not.toHaveProperty("initiated_by");
      expect(attempt).not.toHaveProperty("completed_by");
      expect(attempt).not.toHaveProperty("resolved_by");
      expect(attempt).not.toHaveProperty("error_code");
    }
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("retries a failed delivery after reload through an atomic claim", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      organization_id: ORGANIZATION_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      license_plan: "paid_annual",
      license_valid_until: "2027-08-12T23:59:59.999Z",
      email_status: "failed",
      email_attempt_count: 1,
    };
    dependencies.state.localProfiles = [
      {
        id: LOCAL_ADMIN_ID,
        email: "local@example.test",
        full_name: "Lokální Správce",
        must_set_password: true,
      },
    ];

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        organizationId: ORGANIZATION_ID,
        action: "retry_failed",
        reason: "SMTP konfigurace byla ověřena",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(dependencies.state.rpcCalls).toContainEqual(
      expect.objectContaining({
        name: "claim_onboarding_email_attempt",
        args: expect.objectContaining({ p_action: "retry_failed" }),
      })
    );
    expect(dependencies.sendMail).toHaveBeenCalledTimes(2);
  });

  it("does not send on a manual retry double click that loses the DB claim", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      organization_id: ORGANIZATION_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      license_plan: "paid_annual",
      license_valid_until: "2027-08-12T23:59:59.999Z",
      email_status: "failed",
      email_attempt_count: 1,
    };
    dependencies.state.localProfiles = [
      {
        id: LOCAL_ADMIN_ID,
        email: "local@example.test",
        full_name: "Lokální Správce",
        must_set_password: false,
      },
    ];
    dependencies.state.claimAllowed = false;

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        organizationId: ORGANIZATION_ID,
        action: "retry_failed",
        reason: "Druhý souběžný požadavek",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.emailDeliveryInProgress).toBe(true);
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("moves stale sending to manual delivery_unknown without resending", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      organization_id: ORGANIZATION_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      license_plan: "paid_annual",
      email_status: "sending",
      email_attempt_count: 1,
    };
    dependencies.state.staleTransitioned = true;

    const { res } = await invoke(handler, {
      method: "GET",
      headers: { authorization: "Bearer admin-token" },
      query: { organizationId: ORGANIZATION_ID },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.emailState.email_status).toBe("delivery_unknown");
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("audits delivery_unknown resolution without another send", async () => {
    dependencies.state.previousOnboarding = {
      id: RUN_ID,
      organization_id: ORGANIZATION_ID,
      local_admin_user_id: LOCAL_ADMIN_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      license_plan: "paid_annual",
      email_status: "delivery_unknown",
      email_attempt_count: 1,
    };

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: {
        organizationId: ORGANIZATION_ID,
        action: "resolve_without_resend",
        reason: "Příjemce potvrdil doručení telefonicky",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.emailState.email_resolution_action).toBe(
      "resolved_without_resend"
    );
    expect(dependencies.sendMail).not.toHaveBeenCalled();
  });

  it("recovers only an Auth orphan owned by the same onboarding key", async () => {
    dependencies.state.authPreparation = {
      id: PREPARATION_ID,
      idempotency_key: IDEMPOTENCY_KEY,
      organization_id: ORGANIZATION_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      status: "preparing",
      preparation_attempt: 1,
      updated_at: new Date(Date.now() - 6 * 60_000).toISOString(),
    };
    dependencies.authAdmin.listUsers.mockResolvedValueOnce({
      data: {
        users: [
          {
            id: LOCAL_ADMIN_ID,
            email: "local@example.test",
            user_metadata: {
              archimedes_onboarding_managed: true,
              archimedes_onboarding_idempotency_key: IDEMPOTENCY_KEY,
              archimedes_onboarding_organization_id: ORGANIZATION_ID,
            },
          },
        ],
      },
      error: null,
    });

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(200);
    expect(dependencies.authAdmin.generateLink).toHaveBeenCalledWith(
      expect.objectContaining({ type: "recovery" })
    );
    expect(dependencies.state.authPreparationUpdates).toContainEqual(
      expect.objectContaining({ status: "recovered" })
    );
    expect(dependencies.authAdmin.deleteUser).not.toHaveBeenCalled();
  });

  it("does not take over a newly-created Auth account from an active request", async () => {
    dependencies.state.authPreparation = {
      id: PREPARATION_ID,
      idempotency_key: IDEMPOTENCY_KEY,
      organization_id: ORGANIZATION_ID,
      local_admin_email: "local@example.test",
      local_admin_full_name: "Lokální Správce",
      status: "auth_created",
      preparation_attempt: 1,
      updated_at: new Date().toISOString(),
    };
    dependencies.authAdmin.listUsers.mockResolvedValueOnce({
      data: {
        users: [
          {
            id: LOCAL_ADMIN_ID,
            email: "local@example.test",
            user_metadata: {
              archimedes_onboarding_managed: true,
              archimedes_onboarding_idempotency_key: IDEMPOTENCY_KEY,
              archimedes_onboarding_organization_id: ORGANIZATION_ID,
            },
          },
        ],
      },
      error: null,
    });

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(409);
    expect(dependencies.authAdmin.generateLink).not.toHaveBeenCalled();
    expect(dependencies.authAdmin.deleteUser).not.toHaveBeenCalled();
    expect(dependencies.authenticatedClient.rpc).not.toHaveBeenCalled();
  });

  it("never adopts or deletes an unrelated pre-existing Auth orphan", async () => {
    dependencies.authAdmin.listUsers.mockResolvedValueOnce({
      data: {
        users: [
          {
            id: LOCAL_ADMIN_ID,
            email: "local@example.test",
            user_metadata: {},
          },
        ],
      },
      error: null,
    });

    const { res } = await invoke(handler, {
      method: "POST",
      headers: { authorization: "Bearer admin-token" },
      body: validBody,
    });

    expect(res.statusCode).toBe(409);
    expect(dependencies.authAdmin.deleteUser).not.toHaveBeenCalled();
    expect(dependencies.authenticatedClient.rpc).not.toHaveBeenCalled();
  });
});
