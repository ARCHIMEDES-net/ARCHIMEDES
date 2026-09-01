import { beforeEach, describe, expect, it, vi } from "vitest";

const dependencies = vi.hoisted(() => ({
  getEmailGroups: vi.fn(),
}));

vi.mock("../../lib/server/emailGroups", () => ({
  getEmailGroups: dependencies.getEmailGroups,
}));

import { resolveWebMeetingParticipants } from "../../lib/server/broadcastRecipientResolver";

const GROUP_PROFILE_ID = "11111111-1111-4111-8111-111111111111";
const MANUAL_PROFILE_ID = "22222222-2222-4222-8222-222222222222";

function supabaseWithManualProfiles(profiles = []) {
  const inMock = vi.fn(async () => ({ data: profiles, error: null }));
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ in: inMock })),
    })),
  };
}

beforeEach(() => {
  dependencies.getEmailGroups.mockReset();
  dependencies.getEmailGroups.mockResolvedValue([
    {
      slug: "teachers",
      users: [
        {
          id: GROUP_PROFILE_ID,
          full_name: "Jana Nováková",
          email: "Jana@example.com",
        },
      ],
    },
  ]);
});

describe("WebMeeting participant resolver", () => {
  it("combines groups and manual emails with names, stable numbers, sorting, and deduplication", async () => {
    const supabaseAdmin = supabaseWithManualProfiles([
      {
        id: MANUAL_PROFILE_ID,
        full_name: "Petr Svoboda",
        email: "petr@example.com",
      },
    ]);

    const participants = await resolveWebMeetingParticipants(supabaseAdmin, {
      groupCodes: ["teachers"],
      manualEmails: ["petr@example.com", "jana@EXAMPLE.com", "host@example.com"],
    });

    expect(participants).toHaveLength(3);
    expect(participants).toEqual([
      expect.objectContaining({
        firstname: "host",
        surname: "ARCHIMEDES",
        email: "host@example.com",
        number: "",
      }),
      expect.objectContaining({
        firstname: "Jana",
        surname: "Nováková",
        email: "jana@example.com",
        number: expect.any(Number),
        profileId: GROUP_PROFILE_ID,
      }),
      expect.objectContaining({
        firstname: "Petr",
        surname: "Svoboda",
        email: "petr@example.com",
        number: expect.any(Number),
        profileId: MANUAL_PROFILE_ID,
      }),
    ]);
  });

  it("accepts a manual-only list without loading email groups", async () => {
    const participants = await resolveWebMeetingParticipants(
      supabaseWithManualProfiles(),
      { manualEmails: ["solo@example.com"] }
    );

    expect(participants).toEqual([
      {
        number: "",
        surname: "ARCHIMEDES",
        firstname: "solo",
        email: "solo@example.com",
        profileId: null,
      },
    ]);
    expect(dependencies.getEmailGroups).not.toHaveBeenCalled();
  });

  it("rejects stale unknown group codes", async () => {
    await expect(
      resolveWebMeetingParticipants(supabaseWithManualProfiles(), {
        groupCodes: ["unknown"],
      })
    ).rejects.toThrow("neplatnou skupinu");
  });
});
