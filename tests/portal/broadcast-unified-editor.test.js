import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const page = fs.readFileSync(
  path.join(process.cwd(), "pages/portal/admin/vysilani/[eventId].js"),
  "utf8"
);

describe("unified broadcast editor contract", () => {
  it("edits visitor-facing event content on the broadcast page", () => {
    expect(page).toContain("Obsah události");
    expect(page).toContain("Název události *");
    expect(page).toContain("Cílovka *");
    expect(page).toContain("Popis události");
    expect(page).toContain("Plakát / cover");
    expect(page).toContain("eventIsPublished");
  });

  it("persists event content before synchronizing WebMeeting", () => {
    expect(page).toContain("title: eventTitle.trim()");
    expect(page).toContain("full_description: eventDescription.trim()");
    expect(page).toContain("audience_groups: normalizeAudienceGroups(eventAudienceGroups)");
    expect(page).toContain("poster_path: posterPath");
    expect(page).toContain("is_published: eventIsPublished");

    const eventUpdate = page.indexOf('.from("events")', page.indexOf("async function handleSave"));
    const providerUpdate = page.indexOf('/api/admin/webmeeting/update-meeting', eventUpdate);
    expect(eventUpdate).toBeGreaterThan(-1);
    expect(providerUpdate).toBeGreaterThan(eventUpdate);
  });

  it("locks event content after the broadcast starts and safely manages posters", () => {
    expect(page).toContain("disabled={operationalLocked}");
    expect(page).toContain("removeEventOwnedPosterIfUnreferenced");
    expect(page).toContain("removePosterObject");
    expect(page).toContain("max 7 MB");
  });
});
