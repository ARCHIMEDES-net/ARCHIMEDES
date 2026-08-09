import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  extractPosterPathFromPublicUrl,
  insertEventWithPosterCleanup,
  isEventOwnedPosterPath,
  removeEventOwnedPosterIfUnreferenced,
} from "../lib/posterStorage";

function eventInsertClient(result) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const remove = vi.fn().mockResolvedValue({ error: null });

  return {
    client: {
      from: vi.fn(() => ({ insert })),
      storage: {
        from: vi.fn(() => ({ remove })),
      },
    },
    insert,
    remove,
  };
}

describe("poster storage cleanup", () => {
  it("removes a newly uploaded poster when event insertion fails", async () => {
    const insertError = new Error("event insert failed");
    const { client, insert, remove } = eventInsertClient({ data: null, error: insertError });
    const payload = { title: "Test", poster_path: "events/new-poster.webp" };

    const result = await insertEventWithPosterCleanup(
      client,
      payload,
      "events/new-poster.webp"
    );

    expect(insert).toHaveBeenCalledWith(payload);
    expect(remove).toHaveBeenCalledWith(["events/new-poster.webp"]);
    expect(result.error).toBe(insertError);
    expect(result.cleanupError).toBeNull();
  });

  it("keeps the poster after a successful event insertion", async () => {
    const { client, remove } = eventInsertClient({ data: { id: "event-1" }, error: null });

    const result = await insertEventWithPosterCleanup(
      client,
      { title: "Test", poster_path: "events/new-poster.webp" },
      "events/new-poster.webp"
    );

    expect(remove).not.toHaveBeenCalled();
    expect(result.data).toEqual({ id: "event-1" });
  });

  it("recognizes only event-owned poster paths as safe cleanup targets", () => {
    expect(isEventOwnedPosterPath("events/event-1/poster.webp", "event-1")).toBe(true);
    expect(isEventOwnedPosterPath("2026-08/poster.webp", "event-1")).toBe(false);
    expect(isEventOwnedPosterPath("events/event-2/poster.webp", "event-1")).toBe(false);
  });

  it("does not remove an event-owned poster while another event still references it", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockResolvedValue({ count: 1, error: null });
    const client = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          neq: vi.fn(() => ({ eq })),
        })),
      })),
      storage: {
        from: vi.fn(() => ({
          getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.invalid/poster" } })),
          remove,
        })),
      },
    };

    const result = await removeEventOwnedPosterIfUnreferenced(client, {
      eventId: "event-1",
      path: "events/event-1/poster.webp",
    });

    expect(eq).toHaveBeenCalledWith("poster_path", "events/event-1/poster.webp");
    expect(result.skipped).toBe("still_referenced");
    expect(remove).not.toHaveBeenCalled();
  });

  it("removes an event-owned poster only after both reference checks are clear", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockResolvedValue({ count: 0, error: null });
    const like = vi.fn().mockResolvedValue({ count: 0, error: null });
    const client = {
      from: vi
        .fn()
        .mockImplementationOnce(() => ({
          select: vi.fn(() => ({ neq: vi.fn(() => ({ eq })) })),
        }))
        .mockImplementationOnce(() => ({
          select: vi.fn(() => ({ neq: vi.fn(() => ({ like })) })),
        })),
      storage: {
        from: vi.fn(() => ({
          getPublicUrl: vi.fn(() => ({
            data: {
              publicUrl:
                "https://example.supabase.co/storage/v1/object/public/posters/events/event-1/poster.webp",
            },
          })),
          remove,
        })),
      },
    };

    const result = await removeEventOwnedPosterIfUnreferenced(client, {
      eventId: "event-1",
      path: "events/event-1/poster.webp",
    });

    expect(like).toHaveBeenCalledWith(
      "poster_url",
      "%/storage/v1/object/public/posters/events/event-1/poster.webp%"
    );
    expect(remove).toHaveBeenCalledWith(["events/event-1/poster.webp"]);
    expect(result.removed).toBe(true);
  });

  it("extracts poster paths only from the expected public bucket URL", () => {
    expect(
      extractPosterPathFromPublicUrl(
        "https://example.supabase.co/storage/v1/object/public/posters/events/event-1/a%20b.webp?x=1"
      )
    ).toBe("events/event-1/a b.webp");
    expect(extractPosterPathFromPublicUrl("https://example.com/poster.webp")).toBe("");
  });

  it("wires compensating cleanup into both event creation flows", () => {
    const root = process.cwd();
    const quickCreate = fs.readFileSync(
      path.join(root, "pages/portal/admin-udalosti/novy.js"),
      "utf8"
    );
    const eventAdmin = fs.readFileSync(
      path.join(root, "pages/portal/admin/udalosti.js"),
      "utf8"
    );
    const eventEdit = fs.readFileSync(
      path.join(root, "pages/portal/admin-udalosti/[id].js"),
      "utf8"
    );

    expect(quickCreate).toContain("insertEventWithPosterCleanup(");
    expect(eventAdmin).toContain("insertEventWithPosterCleanup(");
    expect(eventAdmin).toContain("removeEventOwnedPosterIfUnreferenced(");
    expect(eventAdmin).toContain("poster_path: posterPathForPayload");
    expect(eventEdit).toContain("removeEventOwnedPosterIfUnreferenced(");
    expect(eventEdit).toContain("removePosterObject(supabase, uploadedPosterPath)");
  });

  it("keeps the orphan inventory read-only and retention-gated", () => {
    const report = fs
      .readFileSync(
        path.join(
          process.cwd(),
          "supabase/preflight/poster_storage_orphan_candidates.sql"
        ),
        "utf8"
      )
      .replace(/\s+/g, " ")
      .toLowerCase();

    expect(report).toContain("last_accessed_at");
    expect(report).toContain("interval '90 days'");
    expect(report).toContain("manual_review_required");
    expect(report).not.toMatch(/delete\s+from/);
    expect(report).not.toMatch(/update\s+(storage|public)/);
  });
});
