import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const page = fs.readFileSync(
  path.join(process.cwd(), "pages/portal/admin/udalosti.js"),
  "utf8"
);

describe("admin event WebMeeting synchronization", () => {
  it("tracks whether the edited event has a broadcast session", () => {
    expect(page).toContain("broadcast_session_id: session?.id || \"\"");
    expect(page).toContain("setEditingHasBroadcastSession(Boolean(r.broadcast_session_id))");
  });

  it("does not call WebMeeting for an event without a broadcast session", () => {
    const guard = page.indexOf("if (editingHasBroadcastSession)");
    const providerUpdate = page.indexOf('/api/admin/webmeeting/update-meeting', guard);
    const localOnlyMessage = page.indexOf(
      "Událost byla upravena. Vysílání zatím není nastaveno.",
      providerUpdate
    );

    expect(guard).toBeGreaterThan(-1);
    expect(providerUpdate).toBeGreaterThan(guard);
    expect(localOnlyMessage).toBeGreaterThan(providerUpdate);
  });
});
