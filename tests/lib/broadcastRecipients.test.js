import { describe, expect, it } from "vitest";
import {
  getInitialRecipientGroups,
  normalizeManualRecipientEmails,
  normalizeRecipientGroupCodes,
} from "../../lib/broadcastRecipients";

describe("manual broadcast recipients", () => {
  it("accepts common separators, normalizes case and removes duplicates", () => {
    expect(
      normalizeManualRecipientEmails(
        " Host@Example.cz,partner@example.cz; HOST@example.cz\nthird@example.cz "
      )
    ).toEqual({
      emails: ["host@example.cz", "partner@example.cz", "third@example.cz"],
      invalid: [],
      inputCount: 4,
    });
  });

  it("reports malformed addresses", () => {
    expect(normalizeManualRecipientEmails(["valid@example.cz", "broken-address"])).toEqual({
      emails: ["valid@example.cz"],
      invalid: ["broken-address"],
      inputCount: 2,
    });
  });
});

describe("broadcast recipient groups", () => {
  const groups = [{ slug: "seniori" }, { slug: "ucitele" }, { slug: "komunita" }];

  it("keeps a persisted admin selection and removes stale or duplicate codes", () => {
    expect(normalizeRecipientGroupCodes(["seniori", "missing", "seniori"], groups)).toEqual([
      "seniori",
    ]);
  });

  it("uses persisted groups once the selection was configured", () => {
    expect(
      getInitialRecipientGroups({
        event: { audience_groups: ["Senioři"] },
        availableGroups: groups,
        persistedCodes: ["ucitele"],
        configured: true,
      })
    ).toEqual(["ucitele"]);
  });

  it("suggests groups from the event only for legacy unconfigured sessions", () => {
    expect(
      getInitialRecipientGroups({
        event: { audience_groups: ["Senioři", "Komunita"] },
        availableGroups: groups,
        persistedCodes: [],
        configured: false,
      })
    ).toEqual(["seniori", "komunita"]);
  });
});
