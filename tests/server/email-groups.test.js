import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
import {
  getEmailGroups,
  LEGACY_INTEREST_MAP,
} from "../../lib/server/emailGroups";

const categories = [
  {
    code: "skola_1_stupen",
    label: "Škola – 1. stupeň",
    section: "school",
    sort_order: 10,
  },
  {
    code: "wellbeing",
    label: "Wellbeing",
    section: "topic",
    sort_order: 20,
  },
];

function emailGroupDatabase({
  categoryRows = categories,
  preferences = [],
  legacyInterests = [],
  profiles = [],
} = {}) {
  return createSupabaseMock({
    tableResults: {
      activity_categories: { data: categoryRows, error: null },
      notification_preferences: { data: preferences, error: null },
      user_interests: { data: legacyInterests, error: null },
      profiles: { data: profiles, error: null },
    },
  });
}

describe("email recipient groups", () => {
  it("combines explicit preferences and mapped legacy interests", async () => {
    const { supabase } = emailGroupDatabase({
      preferences: [
        { profile_id: "user-1", activity_code: "wellbeing", enabled: true },
      ],
      legacyInterests: [
        { user_id: "user-2", interest_slug: "prvni-stupen" },
        { user_id: "user-3", interest_slug: "zajmove-skupiny" },
      ],
      profiles: [
        { id: "user-1", email: "wellbeing@example.com" },
        { id: "user-2", email: "school@example.com" },
        { id: "user-3", email: "legacy@example.com" },
      ],
    });

    const groups = await getEmailGroups(supabase);

    expect(LEGACY_INTEREST_MAP["prvni-stupen"]).toBe("skola_1_stupen");
    expect(groups).toEqual([
      {
        slug: "skola_1_stupen",
        label: "Škola – 1. stupeň",
        section: "school",
        sort_order: 10,
        count: 1,
        users: [{ id: "user-2", email: "school@example.com" }],
      },
      {
        slug: "wellbeing",
        label: "Wellbeing",
        section: "topic",
        sort_order: 20,
        count: 1,
        users: [{ id: "user-1", email: "wellbeing@example.com" }],
      },
      {
        slug: "zajmove-skupiny",
        label: "Zájmové skupiny (původní)",
        section: "legacy",
        sort_order: 999,
        count: 1,
        users: [{ id: "user-3", email: "legacy@example.com" }],
      },
    ]);
  });

  it("lets an explicit opt-out override a historical interest", async () => {
    const { supabase } = emailGroupDatabase({
      preferences: [
        {
          profile_id: "user-1",
          activity_code: "skola_1_stupen",
          enabled: false,
        },
      ],
      legacyInterests: [
        { user_id: "user-1", interest_slug: "prvni-stupen" },
      ],
      profiles: [{ id: "user-1", email: "opted-out@example.com" }],
    });

    const groups = await getEmailGroups(supabase);

    expect(groups.find((group) => group.slug === "skola_1_stupen")).toMatchObject({
      count: 0,
      users: [],
    });
    expect(supabase.from).not.toHaveBeenCalledWith("profiles");
  });

  it("ignores preferences and legacy values outside the active category catalogue", async () => {
    const { supabase } = emailGroupDatabase({
      preferences: [
        { profile_id: "user-1", activity_code: "removed-category", enabled: true },
      ],
      legacyInterests: [
        { user_id: "user-2", interest_slug: "unknown-interest" },
      ],
      profiles: [
        { id: "user-1", email: "one@example.com" },
        { id: "user-2", email: "two@example.com" },
      ],
    });

    const groups = await getEmailGroups(supabase);

    expect(groups.every((group) => group.count === 0)).toBe(true);
    expect(supabase.from).not.toHaveBeenCalledWith("profiles");
  });

  it("deduplicates normalized addresses and sorts the returned recipients", async () => {
    const { supabase } = emailGroupDatabase({
      preferences: [
        { profile_id: "user-1", activity_code: "wellbeing", enabled: true },
        { profile_id: "user-2", activity_code: "wellbeing", enabled: true },
        { profile_id: "user-3", activity_code: "wellbeing", enabled: true },
        { profile_id: "missing-profile", activity_code: "wellbeing", enabled: true },
      ],
      profiles: [
        { id: "user-1", email: "Zebra@example.com" },
        { id: "user-2", email: "zebra@EXAMPLE.com" },
        { id: "user-3", email: "alpha@example.com" },
      ],
    });

    const groups = await getEmailGroups(supabase);
    const group = groups.find((item) => item.slug === "wellbeing");

    expect(group.count).toBe(2);
    expect(group.users.map((profile) => profile.id)).toEqual(["user-3", "user-1"]);
  });

  it("constrains profile queries to active recipients who allow notifications", async () => {
    const { supabase, queries } = emailGroupDatabase({
      preferences: [
        { profile_id: "user-1", activity_code: "wellbeing", enabled: true },
      ],
      profiles: [{ id: "user-1", email: "user@example.com" }],
    });

    await getEmailGroups(supabase);

    const profileQuery = queries.find((query) => query.table === "profiles");
    expect(profileQuery.filters).toEqual({ id: ["user-1"] });
    expect(profileQuery.orFilters).toEqual([
      "email_notifications_enabled.is.null,email_notifications_enabled.eq.true",
      "is_active.is.null,is_active.eq.true",
    ]);
  });

  it("batches large profile lookups to stay within database request limits", async () => {
    const preferences = Array.from({ length: 501 }, (_, index) => ({
      profile_id: `user-${index}`,
      activity_code: "wellbeing",
      enabled: true,
    }));
    const { supabase, queries } = createSupabaseMock({
      tableResults: {
        activity_categories: { data: categories, error: null },
        notification_preferences: { data: preferences, error: null },
        user_interests: { data: [], error: null },
        profiles: (query) => ({
          data: query.filters.id.map((id) => ({
            id,
            email: `${id}@example.com`,
          })),
          error: null,
        }),
      },
    });

    const groups = await getEmailGroups(supabase);

    const profileQueries = queries.filter((query) => query.table === "profiles");
    expect(profileQueries).toHaveLength(2);
    expect(profileQueries[0].filters.id).toHaveLength(500);
    expect(profileQueries[1].filters.id).toHaveLength(1);
    expect(groups.find((group) => group.slug === "wellbeing").count).toBe(501);
  });

  it.each([
    ["activity_categories", "categories failed"],
    ["notification_preferences", "preferences failed"],
    ["user_interests", "legacy failed"],
  ])("fails closed when %s cannot be loaded", async (failedTable, message) => {
    const tableResults = {
      activity_categories: { data: categories, error: null },
      notification_preferences: { data: [], error: null },
      user_interests: { data: [], error: null },
    };
    const databaseError = new Error(message);
    tableResults[failedTable] = { data: null, error: databaseError };
    const { supabase } = createSupabaseMock({ tableResults });

    await expect(getEmailGroups(supabase)).rejects.toBe(databaseError);
  });

  it("fails closed when recipient profiles cannot be loaded", async () => {
    const databaseError = new Error("profiles failed");
    const { supabase } = createSupabaseMock({
      tableResults: {
        activity_categories: { data: categories, error: null },
        notification_preferences: {
          data: [
            { profile_id: "user-1", activity_code: "wellbeing", enabled: true },
          ],
          error: null,
        },
        user_interests: { data: [], error: null },
        profiles: { data: null, error: databaseError },
      },
    });

    await expect(getEmailGroups(supabase)).rejects.toBe(databaseError);
  });
});
