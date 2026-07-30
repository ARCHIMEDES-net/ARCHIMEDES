import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sqlPath = path.join(
  process.cwd(),
  "supabase/pending/0073_portal_broadcast_sessions_view.sql"
);
const sql = fs.readFileSync(sqlPath, "utf8").toLowerCase();

describe("get_portal_broadcast_sessions security contract", () => {
  it("uses a narrowly scoped security-definer RPC", () => {
    expect(sql).toContain("create or replace function public.get_portal_broadcast_sessions");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("where auth.uid() is not null");
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
    expect(sql).toContain("session.is_published = true");
    expect(sql).toContain("event.is_published = true");
  });

  it("grants execution only to authenticated callers and service role", () => {
    expect(sql).toContain(
      "grant execute on function public.get_portal_broadcast_sessions(uuid[]) to authenticated"
    );
    expect(sql).toContain(
      "revoke all on function public.get_portal_broadcast_sessions(uuid[]) from anon"
    );
  });
});
