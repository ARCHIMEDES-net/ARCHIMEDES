import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sqlPath = path.join(
  process.cwd(),
  "supabase/pending/0073_portal_broadcast_sessions_view.sql"
);
const sql = fs.readFileSync(sqlPath, "utf8").toLowerCase();

describe("portal_broadcast_sessions security contract", () => {
  it("uses a security-invoker view", () => {
    expect(sql).toContain("with (security_invoker = true)");
  });

  it("does not expose privileged or diagnostic columns", () => {
    const forbiddenSelections = [
      "session.host_join_url",
      "session.moderator_join_url",
      "session.notes_internal",
      "session.provider_status",
      "session.last_provider_error",
      "session.last_synced_at",
    ];

    for (const column of forbiddenSelections) {
      expect(sql).not.toContain(column);
    }
  });

  it("does not expose the external meeting identifier", () => {
    expect(sql).toContain(
      "(session.external_meeting_id is not null) as has_external_meeting"
    );
    expect(sql).not.toMatch(/session\.external_meeting_id\s*(,|\n)/);
  });

  it("only exposes published recordings", () => {
    expect(sql).toContain("when session.recording_status = 'published'");
    expect(sql).toContain("then session.recording_url");
  });

  it("requires both the session and event to be published", () => {
    expect(sql).toContain("where session.is_published = true");
    expect(sql).toContain("event.is_published = true");
  });

  it("grants attendee access only to authenticated users", () => {
    expect(sql).toContain(
      "grant select on public.portal_broadcast_sessions to authenticated"
    );
    expect(sql).toContain(
      "revoke all on public.portal_broadcast_sessions from anon"
    );
  });
});
