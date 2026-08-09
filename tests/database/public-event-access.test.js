import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260809110727_protect_public_event_urls_20260809105645.sql"
  ),
  "utf8"
);
const normalizedMigration = migration.replace(/\s+/g, " ").toLowerCase();
const publicEvents = fs.readFileSync(
  path.join(process.cwd(), "lib/publicEvents.js"),
  "utf8"
);

describe("public event access", () => {
  it("returns only the explicit public event fields", () => {
    const returnsClause = normalizedMigration.match(
      /returns table \((.*?)\) language plpgsql/
    )?.[1];

    expect(returnsClause).toBeTruthy();
    expect(returnsClause).toContain("id uuid");
    expect(returnsClause).toContain("title text");
    expect(returnsClause).toContain("starts_at timestamp with time zone");
    expect(returnsClause).not.toContain("stream_url");
    expect(returnsClause).not.toContain("meeting_url");
    expect(returnsClause).not.toContain("archive_url");
    expect(returnsClause).not.toContain("worksheet_url");
  });

  it("publishes only rows explicitly marked as published", () => {
    expect(normalizedMigration).toContain("where event.is_published = true");
    expect(normalizedMigration).toContain("p_direction = 'upcoming'");
    expect(normalizedMigration).toContain("p_direction = 'previous'");
    expect(normalizedMigration).toContain("p_limit > 100");
  });

  it("uses an RLS-preserving RPC with deliberate public execution grants", () => {
    expect(normalizedMigration).toContain("security invoker");
    expect(normalizedMigration).not.toContain("security definer");
    expect(normalizedMigration).toContain("set search_path = ''");
    expect(normalizedMigration).toContain(
      "from public, anon, authenticated, service_role"
    );
    expect(normalizedMigration).toContain("to anon, authenticated;");
    expect(normalizedMigration).not.toContain("to anon, authenticated, service_role");
  });

  it("removes anonymous table-wide access and preserves only safe columns", () => {
    expect(normalizedMigration).toContain(
      "revoke all on table public.events from anon"
    );

    const anonymousGrant = normalizedMigration.match(
      /grant select \((.*?)\) on table public\.events to anon;/
    )?.[1];

    expect(anonymousGrant).toBeTruthy();
    expect(anonymousGrant).toContain("id");
    expect(anonymousGrant).toContain("starts_at");
    expect(anonymousGrant).not.toContain("stream_url");
    expect(anonymousGrant).not.toContain("meeting_url");
    expect(anonymousGrant).not.toContain("archive_url");
    expect(anonymousGrant).not.toContain("worksheet_url");
  });

  it("routes public programme reads through the safe RPC", () => {
    expect(publicEvents).toContain('.rpc("get_public_events"');
    expect(publicEvents).toContain('fetchPublicEventRows("upcoming"');
    expect(publicEvents).toContain('fetchPublicEventRows("previous"');
    expect(publicEvents).not.toContain('.from("events")');
    expect(publicEvents).not.toContain("stream_url");
    expect(publicEvents).not.toContain("meeting_url");
  });
});
