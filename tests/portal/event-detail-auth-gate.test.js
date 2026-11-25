import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { freeRegistrationUrlFor } from "../../lib/freeBroadcasts";

const source = fs.readFileSync(
  path.join(process.cwd(), "pages/portal/udalost/[id].js"),
  "utf8"
);

// Sloupce tabulky events, které smí číst role anon (viz migrace protect_public_event_urls).
const ANON_COLUMNS = new Set([
  "id",
  "title",
  "starts_at",
  "poster_url",
  "poster_path",
  "category",
  "audience_groups",
  "is_published",
]);

describe("detail vysílání z pozvánky", () => {
  const defaultExport = source.indexOf("export default function UdalostDetail()");
  const publicView = source.indexOf("function PublicEventInvite()");
  const content = source.indexOf("function UdalostDetailContent()");

  it("nepřihlášenému ukáže veřejnou pozvánku, přihlášeného pustí přes RequireAuth", () => {
    expect(defaultExport).toBeGreaterThan(-1);
    expect(publicView).toBeGreaterThan(defaultExport);
    expect(content).toBeGreaterThan(publicView);

    const wrapper = source.slice(defaultExport, publicView);
    expect(wrapper).toContain("<PublicEventInvite />");
    expect(wrapper).toContain("<RequireAuth>");
    expect(wrapper).toContain("<UdalostDetailContent />");
  });

  it("veřejná pozvánka čte jen sloupce povolené pro nepřihlášené", () => {
    const publicSource = source.slice(publicView, content);
    expect(publicSource).not.toContain('select("*")');
    const match = publicSource.match(/\.select\("([^"]+)"\)/);
    expect(match).not.toBeNull();
    for (const column of match[1].split(",").map((c) => c.trim())) {
      expect(ANON_COLUMNS.has(column)).toBe(true);
    }
    expect(publicSource).toContain("/login?next=");
  });

  it("plné načtení události je až uvnitř přihlášené části", () => {
    expect(source.indexOf('.select("*")')).toBeGreaterThan(content);
  });

  it("vysílání Miss World 26. 11. má veřejnou registraci zdarma", () => {
    expect(freeRegistrationUrlFor("432eb4fa-264f-4533-96fd-b981d168dfa2")).toContain(
      "admin.webmeeting.cz/enrol/enrol/20275"
    );
    expect(freeRegistrationUrlFor("jine-id")).toBe("");
  });
});
