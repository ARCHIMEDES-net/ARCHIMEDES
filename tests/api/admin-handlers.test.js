import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const dependencies = vi.hoisted(() => ({
  supabaseAdmin: {},
  requirePlatformAdmin: vi.fn(),
  consumeAuthenticatedRateLimit: vi.fn(),
  getEmailGroups: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => dependencies.supabaseAdmin),
}));

vi.mock("../../lib/server/platformAdminApi", () => ({
  requirePlatformAdmin: dependencies.requirePlatformAdmin,
}));

vi.mock("../../lib/server/authenticatedRateLimit", () => ({
  consumeAuthenticatedRateLimit: dependencies.consumeAuthenticatedRateLimit,
}));

vi.mock("../../lib/server/emailGroups", () => ({
  getEmailGroups: dependencies.getEmailGroups,
}));

import broadcastRecipients from "../../pages/api/admin/broadcast-recipients";
import groupCounts from "../../pages/api/admin/group-counts";
import groupUsers from "../../pages/api/admin/group-users";

const groups = [
  {
    slug: "teachers",
    label: "Učitelé",
    section: "school",
    sort_order: 1,
    count: 2,
    users: [
      { id: "user-1", email: "Alpha@example.com" },
      { id: "user-2", email: "shared@example.com" },
    ],
  },
  {
    slug: "wellbeing",
    label: "Wellbeing",
    section: "topic",
    sort_order: 2,
    count: 2,
    users: [
      { id: "user-3", email: " SHARED@EXAMPLE.COM " },
      { id: "user-4", email: "zebra@example.com" },
    ],
  },
];

beforeEach(() => {
  dependencies.requirePlatformAdmin.mockReset();
  dependencies.consumeAuthenticatedRateLimit.mockReset();
  dependencies.getEmailGroups.mockReset();
  dependencies.requirePlatformAdmin.mockResolvedValue({ id: "admin-1" });
  dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(true);
  dependencies.getEmailGroups.mockResolvedValue(groups);
});

describe("admin email-group handlers", () => {
  it.each([
    [groupCounts, { method: "GET" }],
    [groupUsers, { method: "GET", query: { group: "teachers" } }],
    [broadcastRecipients, { method: "POST", body: { groups: ["teachers"] } }],
  ])("stops before data access when platform-admin authorization fails", async (handler, request) => {
    dependencies.requirePlatformAdmin.mockResolvedValueOnce(null);

    await invoke(handler, request);

    expect(dependencies.consumeAuthenticatedRateLimit).not.toHaveBeenCalled();
    expect(dependencies.getEmailGroups).not.toHaveBeenCalled();
  });

  it.each([
    [groupCounts, { method: "GET" }, "600"],
    [groupUsers, { method: "GET", query: { group: "teachers" } }, "600"],
    [
      broadcastRecipients,
      { method: "POST", body: { groups: ["teachers"] } },
      "600",
    ],
  ])("returns 429 and Retry-After when the authenticated limit is exhausted", async (handler, request, retryAfter) => {
    dependencies.consumeAuthenticatedRateLimit.mockResolvedValueOnce(false);

    const { res } = await invoke(handler, request);

    expect(res.statusCode).toBe(429);
    expect(res.getHeader("retry-after")).toBe(retryAfter);
    expect(dependencies.getEmailGroups).not.toHaveBeenCalled();
  });

  it.each([
    [{}, 400],
    [{ group: ["teachers"] }, 400],
    [{ group: "x".repeat(101) }, 400],
    [{ group: "unknown" }, 404],
  ])("validates requested group names", async (query, expectedStatus) => {
    const { res } = await invoke(groupUsers, { method: "GET", query });

    expect(res.statusCode).toBe(expectedStatus);
  });

  it("returns counts without exposing recipient records", async () => {
    const { res } = await invoke(groupCounts, { method: "GET" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        slug: "teachers",
        label: "Učitelé",
        section: "school",
        sort_order: 1,
        count: 2,
      },
      {
        slug: "wellbeing",
        label: "Wellbeing",
        section: "topic",
        sort_order: 2,
        count: 2,
      },
    ]);
    expect(JSON.stringify(res.body)).not.toContain("example.com");
  });

  it.each([
    [undefined],
    [[]],
    [[...Array.from({ length: 51 }, (_, index) => `group-${index}`)]],
    [["x".repeat(101)]],
  ])("rejects empty or excessive broadcast group selections", async (selectedGroups) => {
    const { res } = await invoke(broadcastRecipients, {
      method: "POST",
      body: selectedGroups === undefined ? {} : { groups: selectedGroups },
    });

    expect(res.statusCode).toBe(400);
    expect(dependencies.getEmailGroups).not.toHaveBeenCalled();
  });

  it("rejects unknown broadcast groups", async () => {
    const { res } = await invoke(broadcastRecipients, {
      method: "POST",
      body: { groups: ["unknown"] },
    });

    expect(res.statusCode).toBe(400);
  });

  it("deduplicates selected groups and normalized recipient emails", async () => {
    const { res } = await invoke(broadcastRecipients, {
      method: "POST",
      body: { groups: [" teachers ", "wellbeing", "teachers", ""] },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      groups: ["teachers", "wellbeing"],
      count: 3,
      users: [
        { email: "Alpha@example.com" },
        { email: "shared@example.com" },
        { email: "zebra@example.com" },
      ],
    });
    expect(dependencies.consumeAuthenticatedRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        route: "admin-broadcast-recipients",
        userId: "admin-1",
        resourceId: "teachers,wellbeing",
      })
    );
  });
});
