import { describe, expect, it } from "vitest";
import {
  getWeakPasswordMessage,
  LEAKED_PASSWORD_MESSAGE,
} from "../../lib/authPasswordErrors";

describe("Supabase weak-password messages", () => {
  it("translates a leaked-password rejection without exposing provider text", () => {
    const error = {
      name: "AuthWeakPasswordError",
      code: "weak_password",
      message: "Password is known to be weak and easy to guess",
      reasons: ["pwned"],
    };

    expect(getWeakPasswordMessage(error)).toBe(LEAKED_PASSWORD_MESSAGE);
    expect(getWeakPasswordMessage(error)).not.toContain(error.message);
  });

  it("recognizes the successful-login weakPassword response shape", () => {
    expect(
      getWeakPasswordMessage({
        weakPassword: { reasons: ["pwned"], message: "Provider warning" },
      })
    ).toBe(LEAKED_PASSWORD_MESSAGE);
  });

  it.each([
    [["length"], "Heslo musí mít alespoň 8 znaků."],
    [
      ["characters"],
      "Heslo nesplňuje požadovanou kombinaci znaků. Zvolte jiné heslo.",
    ],
    [[], "Heslo nesplňuje bezpečnostní požadavky. Zvolte jiné heslo."],
  ])("maps weak-password reasons %j", (reasons, expected) => {
    expect(
      getWeakPasswordMessage({ code: "weak_password", reasons })
    ).toBe(expected);
  });

  it("does not relabel unrelated authentication errors", () => {
    expect(
      getWeakPasswordMessage({
        code: "invalid_credentials",
        message: "Invalid login credentials",
      })
    ).toBeNull();
  });
});
