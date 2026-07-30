import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const attendeePages = [
  "pages/portal/kalendar.js",
  "pages/portal/archiv.js",
  "pages/portal/udalost/[id].js",
];

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("attendee portal broadcast-session access", () => {
  for (const page of attendeePages) {
    it(`${page} uses the narrow RPC loader`, () => {
      const source = read(page);

      expect(source).toContain("portalBroadcastSessions");
      expect(source).not.toMatch(/broadcast_sessions\s*\(/);
      expect(source).not.toContain("external_meeting_id");
      expect(source).not.toContain("notes_internal");
      expect(source).not.toContain("moderator_join_url");
      expect(source).not.toContain("host_join_url");
    });
  }

  it("the join button supports the safe boolean meeting flag", () => {
    const source = read("components/JoinBroadcastButton.js");

    expect(source).toContain("session?.has_external_meeting");
    expect(source).toContain("session?.external_meeting_id");
  });
});
