import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function readSource(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

describe("leaked-password protection portal contract", () => {
  it("keeps password setup usable after a rejected password", () => {
    const source = readSource("pages/nastavit-heslo.js");

    expect(source).toContain("PASSWORD_MIN_LENGTH");
    expect(source).toContain("getWeakPasswordMessage(err)");
    expect(source).toContain('setFormError("Zadaná hesla se neshodují.")');
    expect(source).not.toContain("alert(");
    expect(source).not.toContain("alespoň 6 znaků");
  });

  it("returns a localized client error when public account creation rejects a weak password", () => {
    const source = readSource("pages/api/join-organization.js");
    const mapping = source.indexOf(
      "getWeakPasswordMessage(createUserError)"
    );
    const serverError = source.indexOf(
      'res.status(500).json({ error: "Připojení ke škole se nepodařilo." })'
    );

    expect(mapping).toBeGreaterThan(-1);
    expect(serverError).toBeGreaterThan(mapping);
    expect(source).toContain("return res.status(400).json({ error: weakPasswordMessage })");
  });

  it("preserves a generic login error to avoid account discovery", () => {
    const source = readSource("pages/login.js");

    expect(source).toContain('setError("Neplatné přihlašovací údaje.")');
    expect(source).not.toContain("signInError.message");
  });

  it("does not force existing accounts to replace their current password", () => {
    const source = readSource("pages/login.js");

    expect(source).toContain("supabase.auth.signInWithPassword");
    expect(source).toContain("router.push(target)");
    expect(source).not.toContain("getWeakPasswordMessage");
    expect(source).not.toContain("supabase.auth.updateUser");
  });
});
