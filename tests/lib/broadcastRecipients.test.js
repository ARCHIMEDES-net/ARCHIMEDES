import { describe, expect, it } from "vitest";
import { normalizeManualRecipientEmails } from "../../lib/broadcastRecipients";

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
