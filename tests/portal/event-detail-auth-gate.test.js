import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.join(process.cwd(), "pages/portal/udalost/[id].js"),
  "utf8"
);

describe("detail vysílání z pozvánky", () => {
  it("ověří přihlášení dřív, než načte tabulku events", () => {
    const defaultExport = source.indexOf("export default function UdalostDetail()");
    const content = source.indexOf("function UdalostDetailContent()");
    const eventsQuery = source.indexOf('.from("events")');

    expect(defaultExport).toBeGreaterThan(-1);
    expect(content).toBeGreaterThan(defaultExport);
    expect(eventsQuery).toBeGreaterThan(content);

    const wrapper = source.slice(defaultExport, content);
    expect(wrapper).toContain("<RequireAuth>");
    expect(wrapper).toContain("<UdalostDetailContent />");
  });
});
