import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const dependencies = vi.hoisted(() => {
  const state = {
    inserts: [],
    updates: [],
  };
  const sendRegistrationEmail = vi.fn(async ({ to }) => ({
    provider: "resend",
    messageId: `resend-${to}`,
  }));

  const supabase = {
    rpc: vi.fn(async (name) => {
      if (name === "find_conflicting_customer") {
        return { data: [], error: null };
      }
      if (name === "create_pending_customer") {
        return { data: [{ id: "organization-1" }], error: null };
      }
      return { data: null, error: new Error(`Unexpected RPC: ${name}`) };
    }),
    from: vi.fn((table) => {
      if (table === "leads") {
        return {
          insert: vi.fn((rows) => {
            state.inserts.push({ table, rows });
            return {
              select: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: { id: "lead-1" },
                  error: null,
                })),
              })),
            };
          }),
          delete: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === "organizations") {
        return {
          update: vi.fn((values) => {
            state.updates.push({ table, values });
            return {
              eq: vi.fn(async () => ({ error: null })),
            };
          }),
          delete: vi.fn(() => ({
            eq: vi.fn(async () => ({ error: null })),
          })),
        };
      }

      if (table === "access_requests") {
        return {
          insert: vi.fn(async (rows) => {
            state.inserts.push({ table, rows });
            return { error: null };
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return {
    state,
    sendRegistrationEmail,
    supabase,
    createClient: vi.fn(() => supabase),
    consumePublicRateLimit: vi.fn(async () => true),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: dependencies.createClient,
}));

vi.mock("../../lib/server/registrationEmailProvider", () => ({
  sendRegistrationEmail: dependencies.sendRegistrationEmail,
}));

vi.mock("../../lib/server/publicRateLimit", () => ({
  consumePublicRateLimit: dependencies.consumePublicRateLimit,
}));

import classroomInquiryHandler from "../../pages/api/poptavka-ucebny";
import legacyInquiryHandler from "../../pages/api/poptavka";
import accessRequestHandler from "../../pages/api/zadost-o-pristup";

const environmentKeys = ["MAIL_TO"];
const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]])
);

beforeEach(() => {
  dependencies.state.inserts.length = 0;
  dependencies.state.updates.length = 0;
  dependencies.supabase.rpc.mockClear();
  dependencies.supabase.from.mockClear();
  dependencies.sendRegistrationEmail.mockReset();
  dependencies.sendRegistrationEmail.mockImplementation(async ({ to }) => ({
    provider: "resend",
    messageId: `resend-${to}`,
  }));
  dependencies.consumePublicRateLimit.mockClear();

  process.env.MAIL_TO = "team@example.test";

  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnvironment[key];
    }
  }
});

describe("authoritative lead processing", () => {
  it("stores /zadost, creates the pending customer and archive, and sends both emails through Resend", async () => {
    const { res } = await invoke(accessRequestHandler, {
      method: "POST",
      body: {
        name: "Jan Novák",
        role: "starosta",
        licensePlan: "paid_annual",
        termsAccepted: true,
        email: "jan.novak@example.test",
        phone: "+420 777 123 456",
        organization: "Obec Testov",
        address: "Náměstí 1, Testov",
        population: "1250",
        legalIdentifier: "12345678",
        type: "obec",
        message: "Prosím o založení přístupu.",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, emailSent: true });
    expect(dependencies.consumePublicRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ route: "order-request", limit: 5 })
    );

    const leadInsert = dependencies.state.inserts.find(
      (entry) => entry.table === "leads"
    );
    expect(leadInsert?.rows[0]).toMatchObject({
      type: "obec",
      contact_name: "Jan Novák",
      email: "jan.novak@example.test",
      organization: "Obec Testov",
      status: "new",
    });

    expect(dependencies.supabase.rpc).toHaveBeenCalledWith(
      "find_conflicting_customer",
      expect.objectContaining({
        p_org_type: "municipality",
        p_email: "jan.novak@example.test",
      })
    );
    expect(dependencies.supabase.rpc).toHaveBeenCalledWith(
      "create_pending_customer",
      expect.objectContaining({
        p_name: "Obec Testov",
        p_org_type: "municipality",
      })
    );
    expect(dependencies.state.updates).toContainEqual({
      table: "organizations",
      values: expect.objectContaining({
        requested_license_plan: "paid_annual",
        terms_version: "2026-08-11",
      }),
    });

    const archiveInsert = dependencies.state.inserts.find(
      (entry) => entry.table === "access_requests"
    );
    expect(archiveInsert?.rows[0]).toMatchObject({
      license_type: "obec",
      email: "jan.novak@example.test",
      organization_id: "organization-1",
      status: "new",
    });

    expect(dependencies.sendRegistrationEmail).toHaveBeenCalledTimes(2);
    expect(dependencies.sendRegistrationEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "team@example.test",
        replyTo: "jan.novak@example.test",
        idempotencyKey: "order-request:lead-1:team",
      })
    );
    expect(dependencies.sendRegistrationEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "jan.novak@example.test",
        replyTo: "team@example.test",
        idempotencyKey: "order-request:lead-1:applicant",
        subject: "ARCHIMEDES Live – potvrzení o doručení objednávky",
        text: expect.stringContaining("Smlouva zatím nevznikla"),
        html: expect.stringContaining("23 880 Kč bez DPH za 12 měsíců"),
      })
    );
    expect(leadInsert?.rows[0].note).toContain(
      "DPA přijata: ano (verze 2026-08-11"
    );
    expect(leadInsert?.rows[0].note).toContain(
      "Smlouva vzniká až písemným přijetím objednávky poskytovatelem."
    );
  });

  it("keeps the saved request and returns 200 when the Resend provider fails", async () => {
    dependencies.sendRegistrationEmail.mockRejectedValueOnce(
      new Error("provider unavailable")
    );

    const { res } = await invoke(accessRequestHandler, {
      method: "POST",
      body: {
        name: "Jan Novák",
        role: "starosta",
        licensePlan: "paid_annual",
        termsAccepted: true,
        email: "jan.novak@example.test",
        phone: "+420 777 123 456",
        organization: "Obec Testov",
        address: "Náměstí 1, Testov",
        population: "1250",
        legalIdentifier: "12345678",
        type: "obec",
        message: "Prosím o založení přístupu.",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, emailSent: false });
    expect(res.body.message).toContain("potvrzovací e-mail dorazí později");
    expect(
      dependencies.state.inserts.find((entry) => entry.table === "leads")
    ).toBeTruthy();
    expect(
      dependencies.state.inserts.find((entry) => entry.table === "access_requests")
    ).toBeTruthy();
    expect(dependencies.state.updates).toContainEqual({
      table: "organizations",
      values: expect.objectContaining({ requested_license_plan: "paid_annual" }),
    });
    expect(dependencies.sendRegistrationEmail).toHaveBeenCalledTimes(1);
  });

  it("stores a classroom inquiry and sends internal and applicant messages through Resend", async () => {
    const { res } = await invoke(classroomInquiryHandler, {
      method: "POST",
      body: {
        organizationType: "school",
        organization: "ZŠ Testov",
        place: "Testov",
        name: "Eva Nováková",
        email: "eva@example.test",
        phone: "+420 777 555 444",
        variant: "optimal",
        timeframe: "next-year",
        message: "Máme zájem o učebnu.",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      emailSent: true,
      confirmationSent: true,
    });
    expect(dependencies.state.inserts[0]).toMatchObject({
      table: "leads",
      rows: [
        expect.objectContaining({
          type: "classroom",
          organization: "ZŠ Testov",
          email: "eva@example.test",
          status: "new",
        }),
      ],
    });
    expect(dependencies.sendRegistrationEmail).toHaveBeenCalledTimes(2);
    expect(dependencies.sendRegistrationEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "antonin.koplik@archimedeslive.com",
        replyTo: "eva@example.test",
        idempotencyKey: "classroom-inquiry:lead-1:team",
      })
    );
    expect(dependencies.sendRegistrationEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "eva@example.test",
        replyTo: "antonin.koplik@archimedeslive.com",
        idempotencyKey: "classroom-inquiry:lead-1:applicant",
      })
    );
  });

  it("preserves the legacy inquiry endpoint and sends its internal notification through Resend", async () => {
    const { res } = await invoke(legacyInquiryHandler, {
      method: "POST",
      body: {
        selectedOption: "obec",
        selectedLabel: "Obec",
        name: "Petr Svoboda",
        place: "Testov",
        email: "petr@example.test",
        phone: "+420 777 111 222",
        message: "Prosím o informace.",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, emailSent: true });
    expect(dependencies.state.inserts[0]).toMatchObject({
      table: "leads",
      rows: [
        expect.objectContaining({
          type: "obec",
          organization: "Testov",
          email: "petr@example.test",
          status: "new",
        }),
      ],
    });
    expect(dependencies.sendRegistrationEmail).toHaveBeenCalledTimes(1);
    expect(dependencies.sendRegistrationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "team@example.test",
        replyTo: "petr@example.test",
        idempotencyKey: "public-inquiry:lead-1:team",
      })
    );
  });

  it("keeps the frontend and admin lead-processing contracts intact", async () => {
    const [requestPage, classroomPage, adminPage] = await Promise.all([
      readFile("pages/zadost.js", "utf8"),
      readFile("pages/poptavka-ucebny.js", "utf8"),
      readFile("pages/portal/admin-poptavky.js", "utf8"),
    ]);

    expect(requestPage).toContain('fetch("/api/zadost-o-pristup"');
    expect(classroomPage).toContain('fetch("/api/poptavka-ucebny"');
    expect(adminPage).toContain('.from("leads")');
    expect(adminPage).toContain(".update({ status })");
  });
});
