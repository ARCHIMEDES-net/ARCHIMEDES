import { describe, expect, it } from "vitest";
import { buildPasswordSetupUrl } from "../../lib/server/passwordSetupLink";

describe("buildPasswordSetupUrl", () => {
  it("vytvoří odkaz na naši stránku s token_hash místo přímého /verify", () => {
    const url = buildPasswordSetupUrl(
      { properties: { action_link: "https://x.supabase.co/auth/v1/verify?token=abc", hashed_token: "h123", verification_type: "recovery" } },
      "https://www.archimedeslive.com/nastavit-heslo"
    );
    expect(url).toBe("https://www.archimedeslive.com/nastavit-heslo?token_hash=h123&type=recovery");
  });

  it("použije typ invite pro pozvánky", () => {
    const url = buildPasswordSetupUrl(
      { properties: { hashed_token: "h1", verification_type: "invite" } },
      "https://www.archimedeslive.com/nastavit-heslo"
    );
    expect(url).toContain("type=invite");
  });

  it("bez hashed_token vrátí původní action_link", () => {
    expect(
      buildPasswordSetupUrl({ properties: { action_link: "https://a/verify" } }, "https://b/nastavit-heslo")
    ).toBe("https://a/verify");
  });

  it("bez dat vrátí prázdný řetězec", () => {
    expect(buildPasswordSetupUrl(null, "https://b/nastavit-heslo")).toBe("");
  });
});
